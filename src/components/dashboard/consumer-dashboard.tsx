'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Heart, ShoppingCart, MapPin, Leaf } from 'lucide-react'
import Link from 'next/link'
import { Package } from 'lucide-react'

// Simple user interface for dashboard
interface DashboardUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  userType: 'producer' | 'consumer'
}

interface ConsumerDashboardProps {
  user: DashboardUser
}

interface Product {
  id: string
  name: string
  categoryName: string
  producerName: string
  producerLocation: string
  pricePerUnit: number
  availableQuantity: number
  isOrganic: boolean
  images: string[]
}

export function ConsumerDashboard({ user }: ConsumerDashboardProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch('/api/products?limit=6')
        if (response.ok) {
          const data = await response.json()
          setFeaturedProducts(data.products)
        }
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Trichy Fresh Connect, {user.name}!</h1>
        <p className="text-xl text-gray-600">Discover fresh, local produce from nearby farmers</p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for fresh produce..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🥬</div>
            <h3 className="font-semibold">Vegetables</h3>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🍎</div>
            <h3 className="font-semibold">Fruits</h3>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🌿</div>
            <h3 className="font-semibold">Herbs</h3>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Leaf className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <h3 className="font-semibold">Organic</h3>
          </CardContent>
        </Card>
      </div>

      {/* Featured Products */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Fresh Today</h2>
          <Button variant="outline" asChild>
            <Link href="/browse">Browse All Products</Link>
          </Button>
        </div>

        {featuredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-600 text-center mb-6">
                Check back soon for fresh produce from local farmers
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 rounded-t-lg relative">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    {product.isOrganic && (
                      <Badge className="absolute top-3 left-3 bg-green-100 text-green-800">
                        <Leaf className="h-3 w-3 mr-1" />
                        Organic
                      </Badge>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.categoryName}</p>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{product.producerName}</span>
                        {product.producerLocation && (
                          <span className="ml-1">• {product.producerLocation}</span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{product.pricePerUnit.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-600 ml-1">per unit</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {product.availableQuantity} available
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Leaf className="h-8 w-8 mx-auto text-green-600 mb-3" />
            <h3 className="font-semibold mb-2">Fresh & Local</h3>
            <p className="text-sm text-gray-600">
              All products are sourced directly from local farmers in the Trichy region
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 mx-auto text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Know Your Farmer</h3>
            <p className="text-sm text-gray-600">
              Connect directly with producers and learn about their farming practices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6 text-center">
            <ShoppingCart className="h-8 w-8 mx-auto text-orange-600 mb-3" />
            <h3 className="font-semibold mb-2">Easy Ordering</h3>
            <p className="text-sm text-gray-600">
              Simple ordering process with flexible pickup and delivery options
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}