'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { useToast } from '@/components/ui/toast'

export interface FavoriteItem {
  id: string
  productId: string
  name: string
  image: string
  pricePerUnit: number
  unit: string
  producerName: string
  isOrganic: boolean
  addedAt: string
}

interface FavoritesState {
  items: FavoriteItem[]
  count: number
}

type FavoritesAction =
  | { type: 'ADD_FAVORITE'; payload: Omit<FavoriteItem, 'id' | 'addedAt'> }
  | { type: 'REMOVE_FAVORITE'; payload: { productId: string } }
  | { type: 'CLEAR_FAVORITES' }
  | { type: 'LOAD_FAVORITES'; payload: FavoriteItem[] }

const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'ADD_FAVORITE': {
      // Check if item already exists
      const existingIndex = state.items.findIndex(
        item => item.productId === action.payload.productId
      )

      if (existingIndex >= 0) {
        return state // Already in favorites
      }

      const newItem: FavoriteItem = {
        ...action.payload,
        id: `favorite-${action.payload.productId}-${Date.now()}`,
        addedAt: new Date().toISOString()
      }

      const newItems = [...state.items, newItem]
      return { items: newItems, count: newItems.length }
    }

    case 'REMOVE_FAVORITE': {
      const newItems = state.items.filter(item => item.productId !== action.payload.productId)
      return { items: newItems, count: newItems.length }
    }

    case 'CLEAR_FAVORITES':
      return { items: [], count: 0 }

    case 'LOAD_FAVORITES': {
      return { items: action.payload, count: action.payload.length }
    }

    default:
      return state
  }
}

interface FavoritesContextType {
  state: FavoritesState
  addFavorite: (item: Omit<FavoriteItem, 'id' | 'addedAt'>) => void
  removeFavorite: (productId: string) => void
  clearFavorites: () => void
  isFavorite: (productId: string) => boolean
  toggleFavorite: (item: Omit<FavoriteItem, 'id' | 'addedAt'>) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, { items: [], count: 0 })
  const { addToast } = useToast()

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('trichy-fresh-favorites')
    if (savedFavorites) {
      try {
        const favoriteItems = JSON.parse(savedFavorites)
        dispatch({ type: 'LOAD_FAVORITES', payload: favoriteItems })
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error)
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('trichy-fresh-favorites', JSON.stringify(state.items))
  }, [state.items])

  const addFavorite = (item: Omit<FavoriteItem, 'id' | 'addedAt'>) => {
    dispatch({ type: 'ADD_FAVORITE', payload: item })
    addToast({
      type: 'success',
      title: 'Added to Favorites',
      description: `${item.name} saved to your favorites`,
      duration: 2000
    })
  }

  const removeFavorite = (productId: string) => {
    const item = state.items.find(favoriteItem => favoriteItem.productId === productId)
    dispatch({ type: 'REMOVE_FAVORITE', payload: { productId } })
    
    if (item) {
      addToast({
        type: 'info',
        title: 'Removed from Favorites',
        description: `${item.name} removed from favorites`,
        duration: 2000
      })
    }
  }

  const clearFavorites = () => {
    if (state.items.length > 0) {
      dispatch({ type: 'CLEAR_FAVORITES' })
      addToast({
        type: 'info',
        title: 'Favorites Cleared',
        description: 'All favorites removed',
        duration: 2000
      })
    }
  }

  const isFavorite = (productId: string) => {
    return state.items.some(item => item.productId === productId)
  }

  const toggleFavorite = (item: Omit<FavoriteItem, 'id' | 'addedAt'>) => {
    if (isFavorite(item.productId)) {
      removeFavorite(item.productId)
    } else {
      addFavorite(item)
    }
  }

  return (
    <FavoritesContext.Provider value={{
      state,
      addFavorite,
      removeFavorite,
      clearFavorites,
      isFavorite,
      toggleFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}