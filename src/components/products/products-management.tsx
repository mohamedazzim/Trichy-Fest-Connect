'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Eye, Filter, MoreVertical, CheckSquare, Square, AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  categoryName: string
  pricePerUnit: number
  availableQuantity: number
  status: 'active' | 'inactive' | 'out_of_stock'
  images: string[]
  isOrganic: boolean
  updatedAt: string
}

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkErrors, setBulkErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const filterProducts = useCallback(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter)
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, statusFilter])

  useEffect(() => {
    filterProducts()
  }, [filterProducts])

  useEffect(() => {
    // Clear selection when products change
    setSelectedProducts(new Set())
    setBulkErrors({})
  }, [filteredProducts])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/producer/products?limit=100')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const toggleProductStatus = async (productId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setProducts(products.map(p => 
          p.id === productId ? { ...p, status: newStatus as any } : p
        ))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update product status')
      }
    } catch (error) {
      console.error('Error updating product status:', error)
      alert('Failed to update product status')
    }
  }

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

  const getStatusOptions = (currentStatus: string) => {
    const options = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'out_of_stock', label: 'Out of Stock' }
    ]
    return options.filter(option => option.value !== currentStatus)
  }

  // Bulk selection functions
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)))
    }
  }

  const isAllSelected = selectedProducts.size === filteredProducts.length && filteredProducts.length > 0
  const isPartiallySelected = selectedProducts.size > 0 && selectedProducts.size < filteredProducts.length

  // Bulk operations
  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedProducts.size === 0) return

    setBulkLoading(true)
    setBulkErrors({})
    const errors: {[key: string]: string} = {}

    const updatePromises = Array.from(selectedProducts).map(async (productId) => {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })

        if (!response.ok) {
          const error = await response.json()
          errors[productId] = error.error || 'Failed to update'
          return false
        }
        return true
      } catch (error) {
        console.error(`Error updating product ${productId}:`, error)
        errors[productId] = 'Network error'
        return false
      }
    })

    const results = await Promise.allSettled(updatePromises)
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length

    if (successCount > 0) {
      // Update local state for successful updates
      setProducts(products.map(p => 
        selectedProducts.has(p.id) && !errors[p.id] 
          ? { ...p, status: newStatus as any } 
          : p
      ))
    }

    if (Object.keys(errors).length > 0) {
      setBulkErrors(errors)
    } else {
      setSelectedProducts(new Set())
    }

    setBulkLoading(false)

    if (successCount > 0) {
      alert(`Successfully updated ${successCount} products to ${formatStatus(newStatus)}`)
    }
  }

  const bulkDeleteProducts = async () => {
    if (selectedProducts.size === 0) return

    const confirmMessage = `Are you sure you want to delete ${selectedProducts.size} selected product(s)? This action cannot be undone.`
    if (!confirm(confirmMessage)) {
      return
    }

    setBulkLoading(true)
    setBulkErrors({})
    const errors: {[key: string]: string} = {}
    const successfulDeletes: string[] = []

    const deletePromises = Array.from(selectedProducts).map(async (productId) => {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const error = await response.json()
          errors[productId] = error.error || 'Failed to delete'
          return false
        }
        successfulDeletes.push(productId)
        return true
      } catch (error) {
        console.error(`Error deleting product ${productId}:`, error)
        errors[productId] = 'Network error'
        return false
      }
    })

    await Promise.allSettled(deletePromises)

    if (successfulDeletes.length > 0) {
      // Remove successfully deleted products from state
      setProducts(products.filter(p => !successfulDeletes.includes(p.id)))
    }

    if (Object.keys(errors).length > 0) {
      setBulkErrors(errors)
    } else {
      setSelectedProducts(new Set())
    }

    setBulkLoading(false)

    if (successfulDeletes.length > 0) {
      alert(`Successfully deleted ${successfulDeletes.length} products`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Products</h1>
          <p className="text-gray-600 mt-2">
            View, edit, and manage your product listings
          </p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          {filteredProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  disabled={bulkLoading}
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : isPartiallySelected ? (
                    <CheckSquare className="h-4 w-4 opacity-50" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {isAllSelected ? 'Deselect All' : 'Select All'}
                    {selectedProducts.size > 0 && ` (${selectedProducts.size})`}
                  </span>
                </Button>
              </div>

              {selectedProducts.size > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedProducts.size} selected
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkUpdateStatus('active')}
                    disabled={bulkLoading}
                  >
                    {bulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Mark Active
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkUpdateStatus('inactive')}
                    disabled={bulkLoading}
                  >
                    {bulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Mark Inactive
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bulkUpdateStatus('out_of_stock')}
                    disabled={bulkLoading}
                  >
                    {bulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Mark Out of Stock
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={bulkDeleteProducts}
                    disabled={bulkLoading}
                  >
                    {bulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Bulk Errors Display */}
          {Object.keys(bulkErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Some operations failed:</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="space-y-1">
                      {Object.entries(bulkErrors || {}).map(([productId, error]) => {
                        const product = products.find(p => p.id === productId)
                        return (
                          <li key={productId}>
                            <strong>{product?.name || productId}:</strong> {error}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkErrors({})}
                    className="mt-2 text-xs"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {products.length === 0 ? 'No products yet' : 'No products found'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {products.length === 0 
                ? 'Get started by adding your first product to the marketplace'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {products.length === 0 && (
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/dashboard/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`hover:shadow-lg transition-shadow ${
              selectedProducts.has(product.id) ? 'ring-2 ring-green-500' : ''
            }`}>
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 rounded-t-lg relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProductSelection(product.id)}
                      disabled={bulkLoading}
                      className={`p-1 h-8 w-8 ${
                        selectedProducts.has(product.id) 
                          ? 'bg-green-600 text-white border-green-600' 
                          : 'bg-white/80 backdrop-blur-sm'
                      }`}
                    >
                      {selectedProducts.has(product.id) ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-4xl text-gray-400">📦</div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-14">
                    <Badge className={getStatusColor(product.status)}>
                      {formatStatus(product.status)}
                    </Badge>
                    {bulkErrors[product.id] && (
                      <Badge className="ml-1 bg-red-100 text-red-800">
                        Error
                      </Badge>
                    )}
                  </div>

                  {/* Organic Badge */}
                  {product.isOrganic && (
                    <Badge className="absolute top-3 right-3 bg-green-100 text-green-800">
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
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Updated:</span>
                      <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${product.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    
                    {/* Status Actions */}
                    <div className="flex space-x-2">
                      {getStatusOptions(product.status).map((option) => (
                        <Button
                          key={option.value}
                          variant="outline"
                          size="sm"
                          onClick={() => toggleProductStatus(product.id, option.value)}
                          className="flex-1 text-xs"
                        >
                          Mark {option.label}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Delete Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Product
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {products.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.status === 'out_of_stock').length}
                </div>
                <div className="text-sm text-gray-600">Out of Stock</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {products.filter(p => p.status === 'inactive').length}
                </div>
                <div className="text-sm text-gray-600">Inactive</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}