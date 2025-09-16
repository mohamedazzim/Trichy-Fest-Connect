import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, categories, users } from '@/lib/schema'
import { updateProductSchema } from '@/lib/validations/product'
import { normalizeProduct } from '@/lib/product-mappers'
import { eq, and } from 'drizzle-orm'
import { ZodError } from 'zod'

// GET /api/products/[id] - Get specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get product with category and producer info
    const product = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        categoryName: categories.name,
        producerId: products.producerId,
        producerName: users.name,
        producerBio: users.bio,
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
      .where(eq(products.id, id))
      .limit(1)

    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Normalize product using consistent mapper
    const normalizedProduct = normalizeProduct(product[0])

    return NextResponse.json({ product: normalizedProduct })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT /api/products/[id] - Update specific product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only producers can update products
    if (session.user.userType !== 'producer') {
      return NextResponse.json({ error: 'Only producers can update products' }, { status: 403 })
    }

    // CSRF protection
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const host = request.headers.get('host')
    
    if (origin) {
      try {
        const originUrl = new URL(origin)
        if (originUrl.host !== host) {
          return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid origin format' }, { status: 403 })
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer)
        if (refererUrl.host !== host) {
          return NextResponse.json({ error: 'Invalid referer' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid referer format' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Missing origin or referer header' }, { status: 403 })
    }

    const { id } = params

    // Check if product exists and belongs to the producer
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.producerId, session.user.id)))
      .limit(1)

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    // Verify category exists if provided
    if (validatedData.categoryId) {
      const category = await db.select().from(categories).where(eq(categories.id, validatedData.categoryId)).limit(1)
      if (category.length === 0) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId
    if (validatedData.images !== undefined) updateData.images = JSON.stringify(validatedData.images)
    if (validatedData.unit !== undefined) updateData.unit = validatedData.unit
    if (validatedData.pricePerUnit !== undefined) updateData.pricePerUnit = validatedData.pricePerUnit.toString()
    if (validatedData.availableQuantity !== undefined) updateData.availableQuantity = validatedData.availableQuantity.toString()
    if (validatedData.minOrderQuantity !== undefined) updateData.minOrderQuantity = validatedData.minOrderQuantity.toString()
    if (validatedData.isOrganic !== undefined) updateData.isOrganic = validatedData.isOrganic
    if (validatedData.harvestDate !== undefined) updateData.harvestDate = new Date(validatedData.harvestDate)
    if (validatedData.expiryDate !== undefined) updateData.expiryDate = new Date(validatedData.expiryDate)
    if (validatedData.status !== undefined) updateData.status = validatedData.status

    // Update product
    const updatedProduct = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning()

    // Get the updated product with joins for full response
    const updatedProductWithJoins = await db
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
      .where(eq(products.id, id))
      .limit(1)

    return NextResponse.json({
      message: 'Product updated successfully',
      product: normalizeProduct(updatedProductWithJoins[0])
    })

  } catch (error) {
    console.error('Error updating product:', error)
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete specific product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only producers can delete products
    if (session.user.userType !== 'producer') {
      return NextResponse.json({ error: 'Only producers can delete products' }, { status: 403 })
    }

    // CSRF protection
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const host = request.headers.get('host')
    
    if (origin) {
      try {
        const originUrl = new URL(origin)
        if (originUrl.host !== host) {
          return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid origin format' }, { status: 403 })
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer)
        if (refererUrl.host !== host) {
          return NextResponse.json({ error: 'Invalid referer' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid referer format' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Missing origin or referer header' }, { status: 403 })
    }

    const { id } = params

    // Check if product exists and belongs to the producer
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.producerId, session.user.id)))
      .limit(1)

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 })
    }

    // Delete product
    await db.delete(products).where(eq(products.id, id))

    return NextResponse.json({ message: 'Product deleted successfully' })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}