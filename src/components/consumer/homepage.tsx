'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, ShoppingCart, Star, MapPin, Clock, Leaf, Users, TrendingUp, ArrowRight, Heart } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Category {
  id: string
  name: string
  description: string
  image: string | null
}

interface Product {
  id: string
  name: string
  categoryName: string
  pricePerUnit: number
  availableQuantity: number
  status: string
  images: string[]
  isOrganic: boolean
  producerName: string
  unit: string
}

export function ConsumerHomepage() {
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchFeaturedProducts()
    ]).finally(() => setLoading(false))
  }, [])

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

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=8&status=active')
      if (response.ok) {
        const data = await response.json()
        setFeaturedProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery.trim())}`
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
        duration: 0.6
      }
    }
  }

  const cardHoverVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3
      }
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-12">
            <div className="text-center space-y-4">
              <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="white" fill-opacity="0.1"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '40px 40px'
          }}
        ></motion.div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <motion.div 
            className="text-center text-white space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block">Fresh. Local.</span>
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Direct.
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-90 px-4 sm:px-0">
                Connect directly with local farmers in Trichy. 
                <br className="hidden md:block" />
                Get the freshest produce, support your community.
              </p>
            </motion.div>

            <motion.form 
              variants={itemVariants}
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto px-4 sm:px-0"
            >
              <div className="flex flex-col sm:flex-row sm:relative gap-3 sm:gap-0">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for fresh produce..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 sm:pr-32 py-4 text-base sm:text-lg rounded-2xl border-0 bg-white/95 backdrop-blur-sm shadow-xl focus:ring-4 focus:ring-yellow-300/50 w-full"
                  />
                </div>
                <Button 
                  type="submit"
                  className="sm:absolute sm:right-2 sm:top-1/2 sm:transform sm:-translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-4 sm:px-8 sm:py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
                >
                  Search
                </Button>
              </div>
            </motion.form>

            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-2 sm:gap-4 pt-4 px-4 sm:px-0"
            >
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">50+ Local Farmers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
                <Leaf className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">100% Fresh</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">Trichy Region</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section 
        className="py-16 md:py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our diverse range of fresh, locally-sourced produce
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {categories.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <Link href={`/browse?category=${category.id}`}>
                  <motion.div
                    variants={cardHoverVariants}
                    whileHover="hover"
                    className="group"
                  >
                    <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                      <CardContent className="p-6 text-center space-y-4">
                        <motion.div 
                          className="text-4xl mb-3"
                          whileHover={{ 
                            scale: 1.2,
                            rotate: 5,
                            transition: { duration: 0.3 }
                          }}
                        >
                          {getCategoryEmoji(category.id)}
                        </motion.div>
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-700 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {category.description}
                        </p>
                        <motion.div
                          className="flex items-center justify-center gap-1 text-green-600 font-medium text-sm"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span>Explore</span>
                          <ArrowRight className="h-3 w-3" />
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Products Section */}
      <motion.section 
        className="py-16 md:py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex justify-between items-center mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Fresh Picks
              </h2>
              <p className="text-lg text-gray-600">
                Handpicked fresh produce from our local farmers
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button asChild variant="outline" className="hidden md:flex">
                <Link href="/browse">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {featuredProducts.slice(0, 8).map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <Link href={`/products/${product.id}`}>
                  <motion.div
                    variants={cardHoverVariants}
                    whileHover="hover"
                    className="group"
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                      <div className="relative aspect-square overflow-hidden">
                        {product.images.length > 0 ? (
                          <motion.img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            whileHover={{ scale: 1.1 }}
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
                        </div>

                        <motion.button
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Heart className="h-4 w-4 text-gray-600" />
                        </motion.button>
                      </div>
                      
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600">{product.categoryName}</p>
                        </div>
                        
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
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{product.producerName}</span>
                          </div>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12 md:hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button asChild variant="outline" size="lg">
              <Link href="/browse">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-16 md:py-20 bg-gradient-to-r from-green-600 to-green-700"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <motion.div 
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              >
                50+
              </motion.div>
              <p className="text-lg opacity-90">Local Farmers</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <motion.div 
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              >
                500+
              </motion.div>
              <p className="text-lg opacity-90">Fresh Products</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <motion.div 
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              >
                1000+
              </motion.div>
              <p className="text-lg opacity-90">Happy Customers</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <motion.div 
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              >
                100%
              </motion.div>
              <p className="text-lg opacity-90">Fresh Guarantee</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-16 md:py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div 
            className="max-w-3xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-gray-900">
              Ready to taste the difference?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-600">
              Join thousands of customers who choose fresh, local produce. 
              Support your community while enjoying the best quality ingredients.
            </motion.p>
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 px-8">
                <Link href="/browse">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Start Shopping
                </Link>
              </Button>
              {!session && (
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link href="/auth/signin">
                    Join Our Community
                  </Link>
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}