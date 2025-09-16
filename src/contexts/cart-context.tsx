'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { useToast } from '@/components/ui/toast'

export interface CartItem {
  id: string
  productId: string
  name: string
  image: string
  pricePerUnit: number
  unit: string
  quantity: number
  maxQuantity: number
  producerName: string
  isOrganic: boolean
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId
      )

      let newItems: CartItem[]
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        newItems = state.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = Math.min(
              item.quantity + (action.payload.quantity || 1),
              item.maxQuantity
            )
            return { ...item, quantity: newQuantity }
          }
          return item
        })
      } else {
        // New item
        const newItem: CartItem = {
          ...action.payload,
          quantity: action.payload.quantity || 1,
          id: `cart-${action.payload.productId}-${Date.now()}`
        }
        newItems = [...state.items, newItem]
      }

      const total = newItems.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.productId !== action.payload.productId)
      const total = newItems.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item => {
        if (item.productId === action.payload.productId) {
          const newQuantity = Math.max(1, Math.min(action.payload.quantity, item.maxQuantity))
          return { ...item, quantity: newQuantity }
        }
        return item
      })

      const total = newItems.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 }

    case 'LOAD_CART': {
      const total = action.payload.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0)
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      return { items: action.payload, total, itemCount }
    }

    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getCartItem: (productId: string) => CartItem | undefined
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 })
  const { addToast } = useToast()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('trichy-fresh-cart')
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: cartItems })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('trichy-fresh-cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    const existingItem = state.items.find(cartItem => cartItem.productId === item.productId)
    const quantityToAdd = item.quantity || 1
    
    dispatch({ type: 'ADD_ITEM', payload: item })
    
    if (existingItem) {
      addToast({
        type: 'success',
        title: 'Cart Updated',
        description: `${item.name} quantity updated in cart`,
        duration: 2000
      })
    } else {
      addToast({
        type: 'success',
        title: 'Added to Cart',
        description: `${item.name} ${quantityToAdd > 1 ? `(${quantityToAdd})` : ''} added to cart`,
        duration: 2000
      })
    }
  }

  const removeItem = (productId: string) => {
    const item = state.items.find(cartItem => cartItem.productId === productId)
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } })
    
    if (item) {
      addToast({
        type: 'info',
        title: 'Item Removed',
        description: `${item.name} removed from cart`,
        duration: 2000
      })
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const item = state.items.find(cartItem => cartItem.productId === productId)
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
    
    if (item) {
      addToast({
        type: 'success',
        title: 'Quantity Updated',
        description: `${item.name} quantity updated to ${quantity}`,
        duration: 1500
      })
    }
  }

  const clearCart = () => {
    if (state.items.length > 0) {
      dispatch({ type: 'CLEAR_CART' })
      addToast({
        type: 'info',
        title: 'Cart Cleared',
        description: 'All items removed from cart',
        duration: 2000
      })
    }
  }

  const isInCart = (productId: string) => {
    return state.items.some(item => item.productId === productId)
  }

  const getCartItem = (productId: string) => {
    return state.items.find(item => item.productId === productId)
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
      getCartItem
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}