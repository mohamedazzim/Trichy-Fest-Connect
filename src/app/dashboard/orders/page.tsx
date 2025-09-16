'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Search,
  ArrowLeft,
  Calendar,
  Phone,
  MapPin,
  Mail,
  User,
  Filter,
  ShoppingBag,
  Eye,
  Edit,
  DollarSign,
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
  customer?: {
    name: string
    email: string
  }
}

const statusConfig = {
  pending: { 
    label: 'New Order', 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: Clock,
    priority: 1
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-blue-500', 
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: CheckCircle,
    priority: 2
  },
  processing: { 
    label: 'Processing', 
    color: 'bg-purple-500', 
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    icon: Package,
    priority: 3
  },
  shipped: { 
    label: 'Shipped', 
    color: 'bg-indigo-500', 
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    icon: Truck,
    priority: 4
  },
  delivered: { 
    label: 'Delivered', 
    color: 'bg-green-500', 
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: CheckCircle,
    priority: 5
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-500', 
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: XCircle,
    priority: 0
  }
}

export default function ProducerOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      if (session?.user?.userType !== 'producer') {
        router.push('/dashboard')
        return
      }
      fetchOrders()
    }
  }, [status, router, session])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      // In a real app, this would be a specific endpoint for producer orders
      const response = await fetch('/api/producer/orders')
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      // For demo purposes, show mock data
      setOrders([
        {
          id: 'order_1',
          status: 'pending',
          total: '125.50',
          deliveryDate: '2024-09-18',
          paymentMethod: 'cod',
          createdAt: '2024-09-16T10:30:00Z',
          contactName: 'John Doe',
          address: '123 Main St, Apartment 4B',
          city: 'Trichy',
          phone: '+91 9876543210',
          email: 'john@example.com',
          orderItems: [
            {
              id: 'item_1',
              productId: 'prod_1',
              quantity: '2.5',
              pricePerUnit: '45.00',
              total: '112.50',
              product: {
                name: 'Organic Tomatoes',
                isOrganic: true,
                unit: 'kg'
              }
            }
          ]
        },
        {
          id: 'order_2',
          status: 'confirmed',
          total: '89.00',
          deliveryDate: '2024-09-19',
          paymentMethod: 'online',
          createdAt: '2024-09-15T14:20:00Z',
          contactName: 'Sarah Smith',
          address: '456 Oak Avenue',
          city: 'Trichy',
          phone: '+91 9876543211',
          email: 'sarah@example.com',
          orderItems: [
            {
              id: 'item_2',
              productId: 'prod_2',
              quantity: '1.0',
              pricePerUnit: '89.00',
              total: '89.00',
              product: {
                name: 'Fresh Carrots',
                isOrganic: false,
                unit: 'kg'
              }
            }
          ]
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(orderId)
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any }
          : order
      ))
      
      setSelectedOrder(null)
    } catch (err) {
      console.error('Error updating order status:', err)
    } finally {
      setIsUpdating(null)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: string) => {
    return `₹${parseFloat(amount).toFixed(2)}`
  }

  const getOrderItemsTotal = (order: Order) => {
    return order.orderItems?.reduce((sum, item) => sum + parseFloat(item.total), 0) || 0
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
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchOrders} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button variant="outline" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Order Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage and track orders for your products
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Delivered</p>
                  <p className="text-2xl font-bold text-green-900">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Revenue</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(orders.reduce((sum, order) => sum + parseFloat(order.total), 0).toString())}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search orders by ID, customer name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Status</option>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No Orders Found' : 'No Orders Yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'When customers order your products, they\'ll appear here.'
              }
            </p>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredOrders
              .sort((a, b) => {
                // Sort by status priority first, then by date
                const priorityDiff = statusConfig[b.status].priority - statusConfig[a.status].priority
                if (priorityDiff !== 0) return priorityDiff
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              })
              .map((order) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon

                return (
                  <motion.div key={order.id} variants={itemVariants}>
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-lg font-semibold text-gray-900">
                                Order #{order.id.slice(-8).toUpperCase()}
                              </CardTitle>
                              <Badge 
                                className={`${status.color} ${status.textColor} ${status.bgColor} border-0`}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-green-600 text-xl">
                                {formatCurrency(order.total)}
                              </div>
                              <div className="text-xs text-gray-600 capitalize">
                                {order.paymentMethod} payment
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{order.contactName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Deliver: {order.deliveryDate}</span>
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
                            {order.orderItems?.length || 0} item(s) • {order.email}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <Button 
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Update Status
                              </Button>
                            )}
                          </div>
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
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order #{selectedOrder.id.slice(-8).toUpperCase()}
                  </h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Order Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Order Status</h3>
                      <div className="space-y-3">
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <motion.button
                            key={key}
                            onClick={() => updateOrderStatus(selectedOrder.id, key)}
                            disabled={isUpdating === selectedOrder.id}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                              selectedOrder.status === key
                                ? `${config.bgColor} ${config.textColor} border-current`
                                : 'border-gray-200 hover:border-gray-300'
                            } ${isUpdating === selectedOrder.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            whileHover={{ scale: isUpdating === selectedOrder.id ? 1 : 1.02 }}
                            whileTap={{ scale: isUpdating === selectedOrder.id ? 1 : 0.98 }}
                          >
                            <config.icon className="h-5 w-5" />
                            <span className="font-medium">{config.label}</span>
                            {selectedOrder.status === key && (
                              <CheckCircle className="h-5 w-5 ml-auto" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                      <div className="space-y-3">
                        {selectedOrder.orderItems?.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🥕</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                                {item.product?.isOrganic && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Leaf className="h-2 w-2 mr-1" />
                                    Organic
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {item.quantity} {item.product?.unit} × ₹{parseFloat(item.pricePerUnit).toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-green-600">
                                ₹{parseFloat(item.total).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium">{selectedOrder.contactName}</div>
                            <div className="text-gray-600">{selectedOrder.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <span>{selectedOrder.phone}</span>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <div>{selectedOrder.address}</div>
                            <div className="text-gray-600">{selectedOrder.city}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span>Delivery: {selectedOrder.deliveryDate}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span>Subtotal:</span>
                          <span>₹{(parseFloat(selectedOrder.total) - 50).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Delivery Charge:</span>
                          <span>₹50.00</span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center font-semibold text-lg">
                            <span>Total:</span>
                            <span className="text-green-600">₹{parseFloat(selectedOrder.total).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                            <span>Payment Method:</span>
                            <span className="capitalize">{selectedOrder.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
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