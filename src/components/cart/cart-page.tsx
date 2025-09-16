'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart as ShoppingCartIcon, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  ArrowRight,
  Leaf,
  ShoppingBag,
  Heart,
  Truck,
  Shield
} from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export function CartPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart()
  const router = useRouter()

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const deliveryCharge = 50
  const grandTotal = state.total + (state.items.length > 0 ? deliveryCharge : 0)

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
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" asChild>
              <Link href="/browse">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            {state.items.length > 0 && (
              <Button variant="outline" onClick={clearCart} className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-lg text-gray-600">
            {state.items.length === 0 
              ? "Your cart is empty" 
              : `${state.itemCount} item${state.itemCount !== 1 ? 's' : ''} in your cart`
            }
          </p>
        </motion.div>

        {/* Empty Cart */}
        {state.items.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any fresh produce to your cart yet. 
              Start shopping to fill it up!
            </p>
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/browse">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Start Shopping
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {state.items.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      layout
                      exit="exit"
                    >
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden relative">
                                {item.image ? (
                                  <Image 
                                    src={item.image} 
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                                    <Leaf className="h-8 w-8 text-green-600" />
                                  </div>
                                )}
                                {item.isOrganic && (
                                  <Badge className="absolute top-1 right-1 bg-green-600 text-white text-xs">
                                    Organic
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {item.name}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    by {item.producerName}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>₹{item.pricePerUnit.toFixed(2)} per {item.unit}</span>
                                    {item.isOrganic && (
                                      <span className="flex items-center gap-1 text-green-600">
                                        <Leaf className="h-3 w-3" />
                                        Organic
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeItem(item.productId)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                  <div className="flex items-center border rounded-lg">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                      className="px-3"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const newQuantity = Math.max(1, Math.min(item.maxQuantity, parseInt(e.target.value) || 1))
                                        handleQuantityChange(item.productId, newQuantity)
                                      }}
                                      className="w-16 text-center border-0 focus:ring-0"
                                      min="1"
                                      max={item.maxQuantity}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                      disabled={item.quantity >= item.maxQuantity}
                                      className="px-3"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    Max: {item.maxQuantity}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-green-600">
                                    ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div 
                className="sticky top-24"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items Summary */}
                    <div className="space-y-2">
                      {state.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{state.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery:</span>
                        <span className="font-medium">₹{deliveryCharge.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{grandTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Guarantees */}
                    <div className="bg-green-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Shield className="h-4 w-4" />
                        <span>Quality Guaranteed</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Truck className="h-4 w-4" />
                        <span>Fresh Delivery</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700" size="lg">
                      <Link href="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>

                    <Button variant="outline" asChild className="w-full">
                      <Link href="/browse">
                        Continue Shopping
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}