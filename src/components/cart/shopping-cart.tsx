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
  X, 
  Leaf, 
  ArrowRight,
  ShoppingBag,
  Heart
} from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import Link from 'next/link'

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
}

export function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { state, updateQuantity, removeItem, clearCart } = useCart()

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQuantity)
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
    hidden: { x: 20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: {
      x: 20,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      x: '100%',
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 300
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Cart Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                {state.itemCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {state.itemCount} items
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {state.items.length === 0 ? (
                <motion.div 
                  className="flex flex-col items-center justify-center h-full p-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ShoppingCartIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-6">
                    Discover fresh produce from local farmers
                  </p>
                  <Button asChild onClick={onClose} className="bg-green-600 hover:bg-green-700">
                    <Link href="/browse">
                      Start Shopping
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  className="p-4 space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence mode="popLayout">
                    {state.items.map((item) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="group"
                      >
                        <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              {/* Product Image */}
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                                    <p className="text-sm text-gray-600">{item.producerName}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.productId)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>

                                {/* Badges */}
                                <div className="flex gap-1 mb-2">
                                  {item.isOrganic && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Leaf className="h-2 w-2 mr-1" />
                                      Organic
                                    </Badge>
                                  )}
                                </div>

                                {/* Quantity & Price */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                      disabled={item.quantity >= item.maxQuantity}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-green-600">
                                      ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ₹{item.pricePerUnit.toFixed(2)}/{item.unit}
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
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <motion.div 
                className="border-t bg-white p-6 space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* Clear Cart */}
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" onClick={clearCart}>
                    <Trash2 className="h-3 w-3 mr-2" />
                    Clear Cart
                  </Button>
                  <div className="text-sm text-gray-600">
                    {state.itemCount} items
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Subtotal:</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{state.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Delivery charges will be calculated at checkout
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700" size="lg">
                    <Link href="/checkout" onClick={onClose}>
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={onClose} className="w-full">
                    Continue Shopping
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Cart Button Component
export function CartButton() {
  const { state } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <>
      <motion.button
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 rounded-full bg-white shadow-lg border hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
        <AnimatePresence>
          {state.itemCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
            >
              {state.itemCount > 99 ? '99+' : state.itemCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}