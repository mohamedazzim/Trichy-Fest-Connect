'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List, 
  MapPin, 
  Star, 
  Heart, 
  ShoppingCart, 
  Leaf, 
  Clock,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { useFavorites } from '@/contexts/favorites-context'

interface Category {
  id: string
  name: string
  description: string
  image: string | null
}

interface Product {
  id: string
  name: string
  categoryId: string
  categoryName: string
  pricePerUnit: number
  availableQuantity: number
  status: string
  images: string[]
  isOrganic: boolean
  producerName: string
  unit: string
  description: string
  harvestDate: string | null
  expiryDate: string | null
  updatedAt: string
}

type SortOption = 'name' | 'price-low' | 'price-high' | 'newest' | 'rating'
type ViewMode = 'grid' | 'list'

export function ProductBrowsing() {
  const searchParams = useSearchParams()
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || '')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [organicOnly, setOrganicOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    Promise.all([
      fetchProducts(),
      fetchCategories()
    ]).finally(() => setLoading(false))
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100&status=active')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const addToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0] || '',
      pricePerUnit: product.pricePerUnit,
      unit: product.unit,
      maxQuantity: product.availableQuantity,
      producerName: product.producerName || 'Unknown Producer',
      isOrganic: product.isOrganic,
      quantity: 1
    })
  }

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.producerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(product => product.pricePerUnit >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.pricePerUnit <= parseFloat(priceRange.max))
    }

    // Organic filter
    if (organicOnly) {
      filtered = filtered.filter(product => product.isOrganic)
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price-low':
          return a.pricePerUnit - b.pricePerUnit
        case 'price-high':
          return b.pricePerUnit - a.pricePerUnit
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [products, searchQuery, selectedCategory, priceRange, organicOnly, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setOrganicOnly(false)
    setSortBy('newest')
  }

  const getCategoryEmoji = (categoryId: string) => {
    const emojiMap = {
      'vegetables': '🥬',
      'fruits': '🍎',
      'herbs-spices': '🌿',
      'dairy-eggs': '🥛',
      'grains-pulses': '🌾',
      'organic': '🌱',
      'flowers': '🌺',
      'seasonal-specials': '⭐'
    }
    return emojiMap[categoryId as keyof typeof emojiMap] || '🥕'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Browse Fresh Produce
          </h1>
          <p className="text-lg text-gray-600">
            Discover fresh, local produce from farmers in your area
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for products, categories, or producers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="h-12"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="h-12"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === '' ? "default" : "outline"}
                onClick={() => setSelectedCategory('')}
                className="h-10"
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="h-10"
                >
                  <span className="mr-2">{getCategoryEmoji(category.id)}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t pt-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (₹)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="h-10"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full h-10 rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="name">Name A-Z</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Options
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={organicOnly}
                          onChange={(e) => setOrganicOnly(e.target.checked)}
                          className="rounded text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm">Organic Only</span>
                        <Leaf className="h-4 w-4 ml-1 text-green-600" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {filteredAndSortedProducts.length} products found
                  </span>
                  <Button variant="outline" onClick={clearFilters} className="h-8">
                    <X className="h-3 w-3 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results */}
        <motion.div 
          className="mb-4 flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-600">
            Showing {filteredAndSortedProducts.length} of {products.length} products
          </p>
        </motion.div>

        {/* Products Grid */}
        {filteredAndSortedProducts.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredAndSortedProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <Link href={`/products/${product.id}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden">
                    <div className={`${viewMode === 'list' ? 'flex' : ''}`}>
                      {/* Product Image */}
                      <div className={`relative overflow-hidden bg-gray-100 ${
                        viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'
                      }`}>
                        {product.images.length > 0 ? (
                          <motion.img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            whileHover={{ scale: 1.05 }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <span className="text-4xl">🥕</span>
                          </div>
                        )}
                        
                        <div className="absolute top-3 left-3 flex gap-2">
                          {product.isOrganic && (
                            <Badge className="bg-green-500 text-white">
                              <Leaf className="h-3 w-3 mr-1" />
                              Organic
                            </Badge>
                          )}
                          {product.harvestDate && (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Fresh
                            </Badge>
                          )}
                        </div>

                        <motion.button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite({
                              productId: product.id,
                              name: product.name,
                              image: product.images[0] || '',
                              pricePerUnit: product.pricePerUnit,
                              unit: product.unit,
                              producerName: product.producerName,
                              isOrganic: product.isOrganic
                            })
                          }}
                          className={`absolute top-3 right-3 p-2 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                            isFavorite(product.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                        </motion.button>
                      </div>
                      
                      {/* Product Info */}
                      <CardContent className={`p-4 space-y-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600">{product.categoryName}</p>
                        </div>
                        
                        {viewMode === 'list' && product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-2xl font-bold text-green-600">
                              ₹{product.pricePerUnit.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              per {product.unit}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {product.availableQuantity} available
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{product.producerName}</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              addToCart(product)
                            }}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}