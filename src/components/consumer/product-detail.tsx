'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  MapPin, 
  Clock, 
  Leaf, 
  Star,
  Plus,
  Minus,
  Calendar,
  Package,
  User,
  Phone,
  Mail,
  Store,
  ArrowLeft,
  Shield,
  Truck
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { useFavorites } from '@/contexts/favorites-context'

interface ProductDetailProps {
  product: {
    id: string
    name: string
    description: string | null
    pricePerUnit: number
    unit: string
    availableQuantity: number
    minOrderQuantity: number | null
    isOrganic: boolean
    images: string[]
    harvestDate: string | null
    expiryDate: string | null
    status: string
    createdAt: string
    updatedAt: string
    categoryId: string
    categoryName: string | null
    categoryDescription: string | null
    producerId: string
    producerName: string | null
    producerEmail: string | null
    producerPhone: string | null
    producerAddress: string | null
    producerBusinessName: string | null
    producerBio: string | null
  }
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(product.minOrderQuantity || 1)
  
  const isLiked = isFavorite(product.id)

  const handleToggleFavorite = () => {
    toggleFavorite({
      productId: product.id,
      name: product.name,
      image: product.images[0] || '',
      pricePerUnit: product.pricePerUnit,
      unit: product.unit,
      producerName: product.producerName || 'Unknown Producer',
      isOrganic: product.isOrganic
    })
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0] || '',
      pricePerUnit: product.pricePerUnit,
      unit: product.unit,
      maxQuantity: product.availableQuantity,
      producerName: product.producerName || 'Unknown Producer',
      isOrganic: product.isOrganic,
      quantity: quantity
    })
    // Optional: Show a success message or visual feedback
    console.log('Added to cart:', { productId: product.id, quantity })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this fresh ${product.name} from ${product.producerName}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.availableQuantity) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    const minQty = product.minOrderQuantity || 1
    if (quantity > minQty) {
      setQuantity(quantity - 1)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Image Gallery */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="aspect-square bg-gray-100 relative">
                {product.images.length > 0 ? (
                  <motion.img
                    key={selectedImageIndex}
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <span className="text-6xl">🥕</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {product.isOrganic && (
                    <Badge className="bg-green-500 text-white">
                      <Leaf className="h-3 w-3 mr-1" />
                      Organic
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Fresh
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <motion.button
                    onClick={handleToggleFavorite}
                    className={`p-3 rounded-full shadow-lg backdrop-blur-sm transition-colors ${
                      isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    onClick={handleShare}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === index ? 'border-green-500' : 'border-gray-200'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Product Information */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600">{product.categoryName}</p>
            </div>

            {/* Price */}
            <div className="bg-white rounded-lg p-6 border shadow-sm">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-green-600">
                  ₹{product.pricePerUnit.toFixed(2)}
                </span>
                <span className="text-lg text-gray-600">per {product.unit}</span>
              </div>
              <p className="text-sm text-gray-600">
                {product.availableQuantity} units available
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="bg-white rounded-lg p-6 border shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={quantity <= (product.minOrderQuantity || 1)}
                    className="px-3"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (value >= (product.minOrderQuantity || 1) && value <= product.availableQuantity) {
                        setQuantity(value)
                      }
                    }}
                    className="w-20 text-center border-0 focus:ring-0"
                    min={product.minOrderQuantity || 1}
                    max={product.availableQuantity}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.availableQuantity}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  {product.minOrderQuantity && product.minOrderQuantity > 1 && (
                    <span>Min order: {product.minOrderQuantity} {product.unit}s</span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-green-600">
                    ₹{(product.pricePerUnit * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </motion.div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="py-4">
                  <Heart className="h-4 w-4 mr-2" />
                  Save for Later
                </Button>
                <Button variant="outline" size="lg" className="py-4">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span>Fresh Delivery</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Product Details & Producer Info */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Product Description */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Details</h2>
                
                {product.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{product.categoryName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit:</span>
                        <span className="font-medium">{product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-medium">{product.availableQuantity} units</span>
                      </div>
                      {product.minOrderQuantity && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min Order:</span>
                          <span className="font-medium">{product.minOrderQuantity} units</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Freshness Info</h3>
                    <div className="space-y-2 text-sm">
                      {product.harvestDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Harvested:</span>
                          <span className="font-medium">{formatDate(product.harvestDate)}</span>
                        </div>
                      )}
                      {product.expiryDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Best Before:</span>
                          <span className="font-medium">{formatDate(product.expiryDate)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Listed:</span>
                        <span className="font-medium">{formatDate(product.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Producer Info */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About the Producer</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {product.producerBusinessName || product.producerName}
                      </h3>
                      {product.producerBusinessName && product.producerName && (
                        <p className="text-sm text-gray-600">{product.producerName}</p>
                      )}
                    </div>
                  </div>

                  {product.producerBio && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {product.producerBio}
                    </p>
                  )}

                  <div className="space-y-2">
                    {product.producerAddress && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{product.producerAddress}</span>
                      </div>
                    )}
                    {product.producerPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{product.producerPhone}</span>
                      </div>
                    )}
                    {product.producerEmail && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{product.producerEmail}</span>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    <Store className="h-4 w-4 mr-2" />
                    View Producer Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}