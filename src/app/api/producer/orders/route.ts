import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems, products, users } from '@/lib/schema'
import { eq, and, desc, inArray } from 'drizzle-orm'

// GET /api/producer/orders - List orders for producer's products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only producers can access this endpoint
    if (session.user.userType !== 'producer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    // First, get all products owned by this producer
    const producerProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.producerId, session.user.id))

    const productIds = producerProducts.map(p => p.id)

    if (productIds.length === 0) {
      return NextResponse.json({
        orders: [],
        total: 0
      })
    }

    // Get order items for producer's products
    const orderItemsQuery = db
      .select({
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        pricePerUnit: orderItems.pricePerUnit,
        total: orderItems.total,
        productName: products.name,
        productImages: products.images,
        productIsOrganic: products.isOrganic,
        productUnit: products.unit
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.productId, productIds))

    const producerOrderItems = await orderItemsQuery

    // Get unique order IDs
    const orderIds = [...new Set(producerOrderItems.map(item => item.orderId))]

    if (orderIds.length === 0) {
      return NextResponse.json({
        orders: [],
        total: 0
      })
    }

    // Build order conditions
    const orderConditions = [inArray(orders.id, orderIds)]
    if (status && ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      orderConditions.push(eq(orders.status, status as any))
    }

    // Get orders with customer details
    const ordersQuery = db
      .select({
        id: orders.id,
        status: orders.status,
        total: orders.total,
        subtotal: orders.subtotal,
        deliveryCharge: orders.deliveryCharge,
        deliveryDate: orders.deliveryDate,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        contactName: orders.contactName,
        email: orders.email,
        phone: orders.phone,
        address: orders.address,
        city: orders.city,
        pincode: orders.pincode,
        deliveryNotes: orders.deliveryNotes,
        customerId: orders.customerId,
        customerName: users.name,
        customerEmail: users.email
      })
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .where(orderConditions.length > 1 ? and(...orderConditions) : orderConditions[0])
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset)

    const producerOrders = await ordersQuery

    // Combine orders with their items
    const ordersWithItems = producerOrders.map(order => {
      const orderItemsForThisOrder = producerOrderItems.filter(item => item.orderId === order.id)
      
      return {
        id: order.id,
        status: order.status,
        total: order.total,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        deliveryDate: order.deliveryDate,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        contactName: order.contactName,
        email: order.email,
        phone: order.phone,
        address: order.address,
        city: order.city,
        pincode: order.pincode,
        deliveryNotes: order.deliveryNotes,
        customer: {
          name: order.customerName || order.contactName,
          email: order.customerEmail || order.email
        },
        orderItems: orderItemsForThisOrder.map(item => ({
          id: `${item.orderId}-${item.productId}`,
          productId: item.productId,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          total: item.total,
          product: {
            name: item.productName,
            images: item.productImages,
            isOrganic: item.productIsOrganic,
            unit: item.productUnit
          }
        }))
      }
    })

    return NextResponse.json({
      orders: ordersWithItems,
      total: ordersWithItems.length,
      pagination: {
        limit,
        offset,
        hasMore: ordersWithItems.length === limit
      }
    })

  } catch (error) {
    console.error('Error fetching producer orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// PUT /api/producer/orders - Update order status (for producers)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only producers can access this endpoint
    if (session.user.userType !== 'producer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Verify this order contains products from this producer
    const orderContainsProducerProducts = await db
      .select({ orderId: orderItems.orderId })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          eq(orderItems.orderId, orderId),
          eq(products.producerId, session.user.id)
        )
      )
      .limit(1)

    if (orderContainsProducerProducts.length === 0) {
      return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 })
    }

    // Update order status
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning()

    return NextResponse.json({
      order: updatedOrder,
      message: `Order status updated to ${status}`
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}