import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems, products, users, categories } from '@/lib/schema'
import { eq, and, desc, sql, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { validateCSRF, createCSRFError } from '@/lib/csrf'

// SECURE Order creation schema - NO CLIENT PRICING OR FEES!
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive()
    // NO pricePerUnit - server fetches real prices
  })),
  customerDetails: z.object({
    contactName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    pincode: z.string(),
    deliveryNotes: z.string().optional(),
    deliveryDate: z.string()
  }),
  // NO deliveryCharge - server calculates this based on city/pincode
  paymentMethod: z.enum(['cod']) // Only COD for now - no payment gateway
})

// GET /api/orders - List user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get orders for the current user
    const userOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        total: orders.total,
        deliveryDate: orders.deliveryDate,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        contactName: orders.contactName,
        address: orders.address,
        city: orders.city
      })
      .from(orders)
      .where(eq(orders.customerId, session.user.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      orders: userOrders,
      total: userOrders.length
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST /api/orders - Create new order with SECURITY
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // PRODUCTION-GRADE CSRF Protection - Environment-driven validation
    const csrfResult = validateCSRF(request)
    if (!csrfResult.isValid) {
      const error = createCSRFError(csrfResult)
      return NextResponse.json({ 
        error: error.error,
        details: error.details 
      }, { status: error.status })
    }

    const body = await request.json()
    const validation = createOrderSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid order data',
        details: validation.error.issues 
      }, { status: 400 })
    }

    const { items, customerDetails, paymentMethod } = validation.data
    
    // SERVER-SIDE delivery charge calculation based on location
    const deliveryCharge = calculateDeliveryCharge(customerDetails.city, customerDetails.pincode)
    
    function calculateDeliveryCharge(city: string, pincode: string): number {
      // Secure server-side delivery calculation
      if (city.toLowerCase().includes('trichy') || city.toLowerCase().includes('tiruchirappalli')) {
        return 30 // Local delivery within Trichy
      }
      // For other cities in Tamil Nadu
      return 50
    }

    // SECURITY: Fetch REAL product prices from database
    const productIds = items.map(item => item.productId)
    
    if (productIds.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    const dbProducts = await db
      .select({
        id: products.id,
        pricePerUnit: products.pricePerUnit,
        availableQuantity: products.availableQuantity,
        name: products.name,
        status: products.status
      })
      .from(products)
      .where(inArray(products.id, productIds))

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 400 })
    }

    // SECURITY: Validate stock and compute SERVER-SIDE totals
    let subtotal = 0
    const validatedItems: Array<{
      productId: string
      name: string
      quantity: number
      pricePerUnit: number
      total: number
    }> = []
    
    for (const item of items) {
      const product = dbProducts.find(p => p.id === item.productId)
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
      }
      
      if (product.status !== 'active') {
        return NextResponse.json({ 
          error: `Product ${product.name} is not available for purchase` 
        }, { status: 400 })
      }
      
      const availableQty = parseFloat(product.availableQuantity)
      if (availableQty < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.name}. Available: ${availableQty}, Requested: ${item.quantity}` 
        }, { status: 400 })
      }
      
      const realPrice = parseFloat(product.pricePerUnit)
      const itemTotal = realPrice * item.quantity
      subtotal += itemTotal
      
      validatedItems.push({
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        pricePerUnit: realPrice,
        total: itemTotal
      })
    }
    
    const total = subtotal + deliveryCharge

    // Create order with transaction (atomic operation)
    const result = await db.transaction(async (tx) => {
      // Create order record
      const [newOrder] = await tx.insert(orders).values({
        customerId: session.user.id,
        status: 'pending',
        subtotal: subtotal.toString(),
        deliveryCharge: deliveryCharge.toString(),
        total: total.toString(),
        paymentMethod,
        deliveryDate: customerDetails.deliveryDate,
        contactName: customerDetails.contactName,
        email: customerDetails.email,
        phone: customerDetails.phone,
        address: customerDetails.address,
        city: customerDetails.city,
        pincode: customerDetails.pincode,
        deliveryNotes: customerDetails.deliveryNotes || ''
      }).returning()

      // Create order items
      const orderItemsData = validatedItems.map(item => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity.toString(),
        pricePerUnit: item.pricePerUnit.toString(),
        total: item.total.toString()
      }))

      await tx.insert(orderItems).values(orderItemsData)
      
      // CRITICAL: Atomic inventory decrement with concurrency safety
      for (const item of validatedItems) {
        const updateResult = await tx
          .update(products)
          .set({
            availableQuantity: sql`${products.availableQuantity} - ${item.quantity}`,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(products.id, item.productId),
              sql`${products.availableQuantity} >= ${item.quantity}` // Ensure sufficient stock
            )
          )
          .returning({ id: products.id })
          
        if (updateResult.length === 0) {
          // Race condition detected - insufficient stock now
          throw new Error(`Race condition: insufficient stock for ${item.name}`)
        }
      }

      return newOrder
    })

    return NextResponse.json({
      order: result,
      orderId: result.id,
      total: total,
      message: 'Order placed successfully! Your fresh produce will be delivered soon.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating order:', error)
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('insufficient')) {
        return NextResponse.json({ error: 'Insufficient stock for one or more items' }, { status: 400 })
      }
      if (error.message.includes('transaction')) {
        return NextResponse.json({ error: 'Order could not be processed. Please try again.' }, { status: 500 })
      }
    }
    
    return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 })
  }
}