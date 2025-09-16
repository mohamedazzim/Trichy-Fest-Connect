'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ShoppingBag,
  ArrowLeft,
  Calendar,
  Phone,
  MapPin,
  Mail,
  RefreshCw,
  CreditCard,
  Eye,
  Leaf
} from 'lucide-react'

interface OrderItem {
  id: string
  productId: string
  quantity: string
  pricePerUnit: string
  total: string
  product?: {
    name: string
    images?: string
    isOrganic?: boolean
    unit?: string
    producer?: {
      name: string
    }
  }
}

interface Order {
  id: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: string
  deliveryDate: string
  paymentMethod: string
  createdAt: string
  contactName: string
  address: string
  city: string
  phone: string
  email: string
  orderItems?: OrderItem[]
}

const statusConfig = {
  pending: { 
    label: 'Order Placed', 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: Clock 
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-blue-500', 
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: CheckCircle 
  },
  processing: { 
    label: 'Processing', 
    color: 'bg-purple-500', 
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    icon: Package 
  },
  shipped: { 
    label: 'Shipped', 
    color: 'bg-indigo-500', 
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    icon: Truck 
  },
  delivered: { 
    label: 'Delivered', 
    color: 'bg-green-500', 
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: CheckCircle 
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-500', 
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: XCircle 
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchOrders()
      
      // Set up auto-refresh every 30 seconds to check for order status updates
      const refreshInterval = setInterval(() => {
        fetchOrders(true) // Silent refresh to avoid loading spinner
      }, 30000)
      
      return () => clearInterval(refreshInterval)
    }
  }, [status, router])

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])
      setError(null) // Clear any previous errors on successful fetch
    } catch (err) {
      console.error('Error fetching orders:', err)
      if (!silent) setError('Failed to load orders. Please try again.')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: string) => {
    return `₹${parseFloat(amount).toFixed(2)}`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchOrders()} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button variant="outline" asChild className="mb-4">
            <Link href="/browse">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shopping
            </Link>
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                My Orders
              </h1>
              <p className="text-lg text-gray-600">
                Track your orders and delivery status
              </p>
            </div>
            <Button 
              onClick={() => fetchOrders()}
              variant="outline"
              className="self-start md:self-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Orders
            </Button>
          </div>
        </motion.div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping for fresh, local produce!
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/browse">Start Shopping</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {orders.map((order) => {
              const status = statusConfig[order.status]
              const StatusIcon = status.icon

              return (
                <motion.div key={order.id} variants={itemVariants}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge 
                            className={`${status.color} ${status.textColor} ${status.bgColor} border-0`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          <div className="text-right">
                            <div className="font-bold text-green-600 text-lg">
                              {formatCurrency(order.total)}
                            </div>
                            <div className="text-xs text-gray-600 capitalize">
                              {order.paymentMethod}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Delivery: {order.deliveryDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{order.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{order.phone}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Contact: {order.contactName}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div 
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Details
                  </h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Order Status */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                    <div className={`w-3 h-3 rounded-full ${statusConfig[selectedOrder.status].color}`} />
                    <span className="font-medium">
                      {statusConfig[selectedOrder.status].label}
                    </span>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedOrder.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedOrder.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{selectedOrder.address}, {selectedOrder.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-green-600">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                      <span>Payment Method:</span>
                      <span className="capitalize">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}