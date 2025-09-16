'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, TrendingUp, Eye, AlertCircle } from 'lucide-react'
import Link from 'next/link'
// Simple user interface for dashboard
interface DashboardUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  userType: 'producer' | 'consumer'
}

interface ProducerDashboardProps {
  user: DashboardUser
}

interface ProductStats {
  totalProducts: number
  activeProducts: number
  outOfStock: number
  recentViews: number
}

interface Product {
  id: string
  name: string
  categoryName: string
  pricePerUnit: number
  availableQuantity: number
  status: 'active' | 'inactive' | 'out_of_stock'
  images: string[]
  updatedAt: string
}

export function ProducerDashboard({ user }: ProducerDashboardProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    recentViews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch producer's products
        const response = await fetch('/api/producer/products?limit=10')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products)
          
          // Calculate stats
          const stats = data.products.reduce((acc: ProductStats, product: Product) => {
            acc.totalProducts++
            if (product.status === 'active') acc.activeProducts++
            if (product.status === 'out_of_stock') acc.outOfStock++
            return acc
          }, { totalProducts: 0, activeProducts: 0, outOfStock: 0, recentViews: 0 })
          
          setStats(stats)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      case 'out_of_stock': return 'bg-red-100 text-red-800 hover:bg-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'inactive': return 'Inactive'
      case 'out_of_stock': return 'Out of Stock'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Manage your products and track your marketplace performance</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              All your listed products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              Currently available for sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentViews}</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Recent Products</h2>
          <Button variant="outline" asChild>
            <Link href="/dashboard/products">View All Products</Link>
          </Button>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 text-center mb-6">
                Get started by adding your first product to the marketplace
              </p>
              <Button asChild>
                <Link href="/dashboard/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{product.categoryName}</p>
                    </div>
                    <Badge className={getStatusColor(product.status)}>
                      {formatStatus(product.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">₹{product.pricePerUnit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className={product.availableQuantity === 0 ? 'text-red-600 font-medium' : ''}>
                        {product.availableQuantity} units
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/dashboard/products/${product.id}`}>Edit</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/products/${product.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 mx-auto text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Manage Products</h3>
            <p className="text-sm text-gray-600 mb-4">View, edit, and organize all your products</p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/products">Go to Products</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-3" />
            <h3 className="font-semibold mb-2">Performance</h3>
            <p className="text-sm text-gray-600 mb-4">Track views, sales, and customer engagement</p>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 mx-auto text-purple-600 mb-3" />
            <h3 className="font-semibold mb-2">Public Profile</h3>
            <p className="text-sm text-gray-600 mb-4">Manage your producer profile and information</p>
            <Button variant="outline" asChild>
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}