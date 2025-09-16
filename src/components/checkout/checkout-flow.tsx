'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  CreditCard, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Leaf,
  Calendar,
  Truck
} from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type CheckoutStep = 'review' | 'details' | 'payment' | 'confirmation'

interface OrderDetails {
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  pincode: string
  deliveryNotes: string
  paymentMethod: 'cod' | 'online'
  deliveryDate: string
}

export function CheckoutFlow() {
  const { data: session } = useSession()
  const { state, clearCart } = useCart()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string>('')
  const [confirmedOrderTotal, setConfirmedOrderTotal] = useState<number>(0)

  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    contactName: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: 'Trichy',
    pincode: '',
    deliveryNotes: '',
    paymentMethod: 'cod',
    deliveryDate: ''
  })

  // Redirect if cart is empty
  if (state.items.length === 0 && currentStep !== 'confirmation') {
    router.replace('/browse')
    return null
  }

  const deliveryCharge = 50
  const grandTotal = state.total + deliveryCharge

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep('payment')
  }

  const handleOrderSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Create order object
      const orderData = {
        items: state.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit
        })),
        customerDetails: orderDetails,
        subtotal: state.total,
        deliveryCharge,
        total: grandTotal,
        paymentMethod: orderDetails.paymentMethod
      }

      // Submit order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to place order')
      }

      const result = await response.json()
      setOrderId(result.order.id)
      setConfirmedOrderTotal(parseFloat(result.order.total))
      
      // Clear cart and show confirmation
      clearCart()
      setCurrentStep('confirmation')
      
    } catch (error) {
      console.error('Error placing order:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
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

  const stepVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.5
      }
    },
    exit: { 
      x: -20, 
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  }

  const getMinDeliveryDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const steps = [
    { id: 'review', title: 'Review Order', icon: ShoppingBag },
    { id: 'details', title: 'Contact Details', icon: User },
    { id: 'payment', title: 'Payment', icon: CreditCard },
    { id: 'confirmation', title: 'Confirmation', icon: CheckCircle }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-lg text-gray-600">
            Complete your order of fresh, local produce
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              const isAccessible = index <= currentStepIndex
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-colors
                      ${isCompleted ? 'bg-green-600 text-white' : 
                        isActive ? 'bg-green-100 text-green-600 border-2 border-green-600' : 
                        'bg-gray-100 text-gray-400'}
                    `}>
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-3 hidden md:block">
                      <div className={`text-sm font-medium ${isActive ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'review' && (
            <motion.div
              key="review"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Order Items */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Order Summary ({state.itemCount} items)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {state.items.map((item) => (
                        <motion.div key={item.id} variants={itemVariants}>
                          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                  <span className="text-xl">🥕</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  <p className="text-sm text-gray-600">{item.producerName}</p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-600">
                                    ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.quantity} × ₹{item.pricePerUnit.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              {item.isOrganic && (
                                <Badge variant="secondary" className="text-xs">
                                  <Leaf className="h-2 w-2 mr-1" />
                                  Organic
                                </Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Total */}
              <div>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Order Total</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{state.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charges:</span>
                        <span>₹{deliveryCharge.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span className="text-green-600">₹{grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setCurrentStep('details')} 
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      Continue to Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {currentStep === 'details' && (
            <motion.div
              key="details"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact & Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDetailsSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <Input
                            required
                            value={orderDetails.contactName}
                            onChange={(e) => setOrderDetails({...orderDetails, contactName: e.target.value})}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <Input
                            type="email"
                            required
                            value={orderDetails.email}
                            onChange={(e) => setOrderDetails({...orderDetails, email: e.target.value})}
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <Input
                          type="tel"
                          required
                          value={orderDetails.phone}
                          onChange={(e) => setOrderDetails({...orderDetails, phone: e.target.value})}
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Address *
                        </label>
                        <Input
                          required
                          value={orderDetails.address}
                          onChange={(e) => setOrderDetails({...orderDetails, address: e.target.value})}
                          placeholder="Enter your complete address"
                          className="mb-3"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            required
                            value={orderDetails.city}
                            onChange={(e) => setOrderDetails({...orderDetails, city: e.target.value})}
                            placeholder="City"
                          />
                          <Input
                            required
                            value={orderDetails.pincode}
                            onChange={(e) => setOrderDetails({...orderDetails, pincode: e.target.value})}
                            placeholder="Pincode"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Delivery Date *
                        </label>
                        <Input
                          type="date"
                          required
                          min={getMinDeliveryDate()}
                          value={orderDetails.deliveryDate}
                          onChange={(e) => setOrderDetails({...orderDetails, deliveryDate: e.target.value})}
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          Orders are delivered between 6 AM - 10 AM
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Notes (Optional)
                        </label>
                        <textarea
                          value={orderDetails.deliveryNotes}
                          onChange={(e) => setOrderDetails({...orderDetails, deliveryNotes: e.target.value})}
                          placeholder="Any special instructions for delivery..."
                          className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setCurrentStep('review')}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back
                        </Button>
                        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                          Continue to Payment
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      {state.itemCount} items from local farmers
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{state.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span>₹{deliveryCharge.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span className="text-green-600">₹{grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {currentStep === 'payment' && (
            <motion.div
              key="payment"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Payment Options */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        orderDetails.paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`} onClick={() => setOrderDetails({...orderDetails, paymentMethod: 'cod'})}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            checked={orderDetails.paymentMethod === 'cod'} 
                            onChange={() => setOrderDetails({...orderDetails, paymentMethod: 'cod'})}
                            className="text-green-600"
                          />
                          <div>
                            <h4 className="font-medium">Cash on Delivery</h4>
                            <p className="text-sm text-gray-600">Pay when you receive your order</p>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        orderDetails.paymentMethod === 'online' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`} onClick={() => setOrderDetails({...orderDetails, paymentMethod: 'online'})}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            checked={orderDetails.paymentMethod === 'online'} 
                            onChange={() => setOrderDetails({...orderDetails, paymentMethod: 'online'})}
                            className="text-green-600"
                          />
                          <div>
                            <h4 className="font-medium">Online Payment</h4>
                            <p className="text-sm text-gray-600">Pay securely with UPI, Cards, or Net Banking</p>
                            <Badge variant="secondary" className="mt-1">Coming Soon</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Delivery Information</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Your order will be delivered between 6 AM - 10 AM on {orderDetails.deliveryDate ? new Date(orderDetails.deliveryDate).toLocaleDateString() : 'your selected date'}. 
                            Fresh produce packed with care by local farmers.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep('details')}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        onClick={handleOrderSubmit}
                        disabled={isSubmitting || orderDetails.paymentMethod === 'online'}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div 
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Placing Order...
                          </>
                        ) : (
                          <>
                            Place Order
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Final Total</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Items ({state.itemCount}):</span>
                        <span>₹{state.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span>₹{deliveryCharge.toFixed(2)}</span>
                      </div>
                      {orderDetails.paymentMethod === 'cod' && (
                        <div className="flex justify-between text-green-600">
                          <span>COD Convenience:</span>
                          <span>Free</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-xl">
                        <span>Total:</span>
                        <span className="text-green-600">₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      By placing your order, you agree to our Terms of Service and Privacy Policy.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {currentStep === 'confirmation' && (
            <motion.div
              key="confirmation"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center"
            >
              <Card className="border-0 shadow-lg max-w-2xl mx-auto">
                <CardContent className="p-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Order Placed Successfully!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for supporting local farmers. Your fresh produce is on its way!
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium ml-2">{orderId}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold text-green-600 ml-2">₹{confirmedOrderTotal.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Delivery Date:</span>
                        <span className="font-medium ml-2">
                          {new Date(orderDetails.deliveryDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment:</span>
                        <span className="font-medium ml-2">
                          {orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700" size="lg">
                      <Link href="/browse">
                        Continue Shopping
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/">
                        Back to Home
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}