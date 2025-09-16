import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, categories, users } from '@/lib/schema'
import { createProductSchema, productQuerySchema } from '@/lib/validations/product'
import { normalizeProduct } from '@/lib/product-mappers'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { ZodError } from 'zod'
import { validateCSRF, createCSRFError } from '@/lib/csrf'

// GET /api/products - List products with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = productQuerySchema.parse(queryParams)
    const { category, producer, status, isOrganic, minPrice, maxPrice, limit, offset } = validatedQuery

    // Build query conditions
    const conditions = []
    
    if (category) {
      conditions.push(eq(products.categoryId, category))
    }
    
    if (producer) {
      conditions.push(eq(products.producerId, producer))
    }
    
    if (status) {
      conditions.push(eq(products.status, status))
    } else {
      // Default to active products only
      conditions.push(eq(products.status, 'active'))
    }
    
    if (isOrganic !== undefined) {
      conditions.push(eq(products.isOrganic, isOrganic))
    }
    
    if (minPrice !== undefined) {
      conditions.push(gte(products.pricePerUnit, minPrice.toString()))
    }
    
    if (maxPrice !== undefined) {
      conditions.push(lte(products.pricePerUnit, maxPrice.toString()))
    }

    // Execute query with joins for category and producer info
    const productList = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        categoryName: categories.name,
        producerId: products.producerId,
        producerName: users.name,
        producerLocation: users.location,
        images: products.images,
        unit: products.unit,
        pricePerUnit: products.pricePerUnit,
        availableQuantity: products.availableQuantity,
        minOrderQuantity: products.minOrderQuantity,
        isOrganic: products.isOrganic,
        harvestDate: products.harvestDate,
        expiryDate: products.expiryDate,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.producerId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset)

    // Normalize products using consistent mapper
    const normalizedProducts = productList.map(normalizeProduct)

    return NextResponse.json({
      products: normalizedProducts,
      pagination: {
        limit,
        offset,
        hasMore: productList.length === limit
      }
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only producers can create products
    if (session.user.userType !== 'producer') {
      return NextResponse.json({ error: 'Only producers can create products' }, { status: 403 })
    }

    // CSRF protection - Environment-driven validation
    const csrfResult = validateCSRF(request)
    if (!csrfResult.isValid) {
      const error = createCSRFError(csrfResult)
      return NextResponse.json({ 
        error: error.error,
        details: error.details 
      }, { status: error.status })
    }

    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    // Verify category exists
    const category = await db.select().from(categories).where(eq(categories.id, validatedData.categoryId)).limit(1)
    if (category.length === 0) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Create product
    const productId = nanoid()
    const newProduct = await db
      .insert(products)
      .values({
        id: productId,
        name: validatedData.name,
        description: validatedData.description,
        categoryId: validatedData.categoryId,
        producerId: session.user.id,
        images: JSON.stringify(validatedData.images || []),
        unit: validatedData.unit,
        pricePerUnit: validatedData.pricePerUnit.toString(),
        availableQuantity: validatedData.availableQuantity.toString(),
        minOrderQuantity: (validatedData.minOrderQuantity || 1).toString(),
        isOrganic: validatedData.isOrganic || false,
        harvestDate: validatedData.harvestDate ? new Date(validatedData.harvestDate) : null,
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
        updatedAt: new Date(),
      })
      .returning()

    // Get the created product with joins for full response
    const createdProduct = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        categoryName: categories.name,
        producerId: products.producerId,
        producerName: users.name,
        producerLocation: users.location,
        images: products.images,
        unit: products.unit,
        pricePerUnit: products.pricePerUnit,
        availableQuantity: products.availableQuantity,
        minOrderQuantity: products.minOrderQuantity,
        isOrganic: products.isOrganic,
        harvestDate: products.harvestDate,
        expiryDate: products.expiryDate,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(users, eq(products.producerId, users.id))
      .where(eq(products.id, productId))
      .limit(1)

    return NextResponse.json({
      message: 'Product created successfully',
      product: normalizeProduct(createdProduct[0])
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}