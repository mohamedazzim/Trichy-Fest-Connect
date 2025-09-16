import { NextResponse } from 'next/response'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems, products, users, categories } from '@/lib/schema'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'

// Order creation schema
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    pricePerUnit: z.number().positive()
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
  subtotal: z.number().positive(),
  deliveryCharge: z.number().nonnegative(),
  total: z.number().positive(),
  paymentMethod: z.enum(['cod', 'online'])
})

// GET /api/orders - List user's orders
export async function GET(request: Request) {
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

// POST /api/orders - Create new order
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createOrderSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid order data',
        details: validation.error.issues 
      }, { status: 400 })
    }

    const { items, customerDetails, subtotal, deliveryCharge, total, paymentMethod } = validation.data

    // Create order in database
    const [newOrder] = await db.insert(orders).values({
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
    const orderItemsData = items.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity.toString(),
      pricePerUnit: item.pricePerUnit.toString(),
      total: (item.quantity * item.pricePerUnit).toString()
    }))

    await db.insert(orderItems).values(orderItemsData)

    return NextResponse.json({
      order: newOrder,
      message: 'Order created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}