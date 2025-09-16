import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, categories, users } from '@/lib/schema'
import { normalizeProduct } from '@/lib/product-mappers'
import { eq, desc, and } from 'drizzle-orm'

// GET /api/producer/products - Get products for logged-in producer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only producers can access this endpoint
    if (session.user.userType !== 'producer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query conditions
    const conditions = [eq(products.producerId, session.user.id)]
    
    if (status && ['active', 'inactive', 'out_of_stock'].includes(status)) {
      conditions.push(eq(products.status, status as 'active' | 'inactive' | 'out_of_stock'))
    }

    // Get producer's products with category and producer info
    const producerProducts = await db
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
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(products.updatedAt))
      .limit(limit)
      .offset(offset)

    // Normalize products using consistent mapper
    const normalizedProducts = producerProducts.map(normalizeProduct)

    return NextResponse.json({
      products: normalizedProducts,
      pagination: {
        limit,
        offset,
        hasMore: producerProducts.length === limit
      }
    })

  } catch (error) {
    console.error('Error fetching producer products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}