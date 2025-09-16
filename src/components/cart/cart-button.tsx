'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { ShoppingCart } from './shopping-cart'

export function CartButton() {
  const { state } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  const handleCartClick = () => {
    setIsCartOpen(true)
  }

  const handleCartClose = () => {
    setIsCartOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleCartClick}
        className="relative"
      >
        <ShoppingBag className="h-5 w-5" />
        {state.itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2"
          >
            <Badge 
              variant="destructive" 
              className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {state.itemCount > 99 ? '99+' : state.itemCount}
            </Badge>
          </motion.div>
        )}
        <span className="ml-2 hidden sm:inline">Cart</span>
      </Button>
      
      <ShoppingCart isOpen={isCartOpen} onClose={handleCartClose} />
    </>
  )
}