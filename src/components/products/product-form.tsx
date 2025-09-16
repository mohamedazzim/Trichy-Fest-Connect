'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, ImageIcon, Loader2, Plus, X, Upload, AlertCircle } from 'lucide-react'

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(255, 'Product name too long'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  unit: z.string().min(1, 'Unit is required'),
  pricePerUnit: z.number().positive('Price must be positive'),
  availableQuantity: z.number().nonnegative('Quantity must be non-negative'),
  minOrderQuantity: z.number().positive('Minimum quantity must be positive').optional().default(1),
  isOrganic: z.boolean().optional().default(false),
  harvestDate: z.string().optional(),
  expiryDate: z.string().optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock']).optional().default('active'),
})

type ProductFormData = z.infer<typeof productFormSchema>

interface Category {
  id: string
  name: string
  description: string
}

interface ProductFormProps {
  mode: 'create' | 'edit'
  productId?: string
  initialData?: any
}

export function ProductForm({ mode, productId, initialData }: ProductFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [imageInput, setImageInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUploading, setImageUploading] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<{[key: string]: string}>({})

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      categoryId: initialData?.categoryId || '',
      unit: initialData?.unit || '',
      pricePerUnit: initialData ? parseFloat(initialData.pricePerUnit) : 0,
      availableQuantity: initialData ? parseFloat(initialData.availableQuantity) : 0,
      minOrderQuantity: initialData ? parseFloat(initialData.minOrderQuantity) : 1,
      isOrganic: initialData?.isOrganic || false,
      harvestDate: initialData?.harvestDate ? new Date(initialData.harvestDate).toISOString().split('T')[0] : '',
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
      status: initialData?.status || 'active',
    }
  })

  const isOrganic = watch('isOrganic')

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Categories loaded successfully:', data.categories?.length || 0, 'categories')
          setCategories(data.categories || [])
        } else {
          console.error('Failed to load categories. Status:', response.status, 'Text:', await response.text())
          // Set empty array as fallback
          setCategories([])
        }
      } catch (error) {
        console.error('Error loading categories:', error)
        // Set empty array as fallback
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  // Initialize images for edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData?.images) {
      try {
        const parsedImages = typeof initialData.images === 'string' 
          ? JSON.parse(initialData.images) 
          : initialData.images
        setImages(Array.isArray(parsedImages) ? parsedImages : [])
      } catch (error) {
        console.error('Error parsing images:', error)
        setImages([])
      }
    }
  }, [mode, initialData])

  const addImage = () => {
    if (imageInput.trim() && !images.includes(imageInput.trim())) {
      setImages([...images, imageInput.trim()])
      setImageInput('')
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // File upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const validFiles: File[] = []
    const errors: {[key: string]: string} = {}

    Array.from(files).forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors[`file_${index}`] = `${file.name}: Only image files are allowed`
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors[`file_${index}`] = `${file.name}: File size must be less than 5MB`
        return
      }

      // Check if we already have too many images
      if (images.length + validFiles.length >= 10) {
        errors[`file_${index}`] = `Maximum 10 images allowed`
        return
      }

      validFiles.push(file)
    })

    setUploadErrors(errors)
    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles])
      uploadImages(validFiles)
    }

    // Reset input
    event.target.value = ''
  }

  const uploadImages = async (files: File[]) => {
    setImageUploading(true)
    const uploadErrors: {[key: string]: string} = {}
    const uploadedUrls: string[] = []

    for (const file of files) {
      try {
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'ml_default') // Default Cloudinary preset

        // Upload to Cloudinary (or your preferred service)
        const response = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          uploadedUrls.push(data.secure_url)
        } else {
          uploadErrors[file.name] = 'Upload failed'
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        uploadErrors[file.name] = 'Upload failed'
      }
    }

    if (uploadedUrls.length > 0) {
      setImages(prev => [...prev, ...uploadedUrls])
    }

    if (Object.keys(uploadErrors).length > 0) {
      setUploadErrors(prev => ({ ...prev, ...uploadErrors }))
    }

    setImageUploading(false)
    // Remove uploaded files from pending list
    setImageFiles(prev => prev.filter(f => !uploadedUrls.length))
  }

  const removeImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearUploadErrors = () => {
    setUploadErrors({})
  }

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const productData = {
        ...data,
        images: images,
        harvestDate: data.harvestDate ? new Date(data.harvestDate).toISOString() : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : undefined,
      }

      const url = mode === 'create' ? '/api/products' : `/api/products/${productId}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        const result = await response.json()
        router.push('/dashboard/products')
        router.refresh()
      } else {
        const error = await response.json()
        console.error('Error saving product:', error)
        alert(error.error || `Failed to ${mode} product`)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert(`Failed to ${mode} product`)
    } finally {
      setLoading(false)
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name *
            </label>
            <Input
              {...register('name')}
              placeholder="e.g., Fresh Organic Tomatoes"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              {...register('description')}
              placeholder="Describe your product, growing methods, taste, etc."
              rows={4}
              className="resize-y"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category *
              </label>
              <select
                {...register('categoryId')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Unit *
              </label>
              <select
                {...register('unit')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="lbs">Pounds (lbs)</option>
                <option value="pieces">Pieces</option>
                <option value="bunches">Bunches</option>
                <option value="dozen">Dozen</option>
                <option value="liters">Liters</option>
                <option value="packets">Packets</option>
              </select>
              {errors.unit && (
                <p className="text-sm text-red-600 mt-1">{errors.unit.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Price per Unit (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                {...register('pricePerUnit', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.pricePerUnit && (
                <p className="text-sm text-red-600 mt-1">{errors.pricePerUnit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Available Quantity *
              </label>
              <Input
                type="number"
                step="0.01"
                {...register('availableQuantity', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.availableQuantity && (
                <p className="text-sm text-red-600 mt-1">{errors.availableQuantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Order Quantity
              </label>
              <Input
                type="number"
                step="0.01"
                {...register('minOrderQuantity', { valueAsNumber: true })}
                placeholder="1"
              />
              {errors.minOrderQuantity && (
                <p className="text-sm text-red-600 mt-1">{errors.minOrderQuantity.message}</p>
              )}
            </div>
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('isOrganic')}
              id="isOrganic"
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="isOrganic" className="text-sm font-medium">
              Organic Product
            </label>
            {isOrganic && (
              <Badge className="bg-green-100 text-green-800">
                Organic
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Harvest Date
              </label>
              <Input
                type="date"
                {...register('harvestDate')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Expiry Date
              </label>
              <Input
                type="date"
                {...register('expiryDate')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            Product Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Section */}
          <label 
            htmlFor="image-upload"
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-colors cursor-pointer block"
            aria-label="Upload product images by clicking or dragging files here"
          >
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
              <div className="mt-4">
                <div className="focus:outline-none">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload product images
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Drag and drop files here, or click to select files
                  </span>
                </div>
                <input
                  id="image-upload"
                  name="image-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={imageUploading}
                  aria-describedby="upload-constraints"
                />
              </div>
              <p id="upload-constraints" className="mt-2 text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB each. Maximum 10 images.
              </p>
            </div>
          </label>

          {/* Upload Progress */}
          {imageUploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                <span className="text-sm text-blue-700">Uploading images...</span>
              </div>
            </div>
          )}

          {/* Upload Errors */}
          {uploadErrors && Object.keys(uploadErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Upload Errors:</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="space-y-1">
                      {Object.entries(uploadErrors || {}).map(([key, error]) => (
                        <li key={key}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearUploadErrors}
                    className="mt-2 text-xs"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Manual URL Input (fallback option) */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Or add image URL manually:</p>
            <div className="flex space-x-2">
              <Input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Enter image URL"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
              />
              <Button type="button" onClick={addImage} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Product Images ({images.length}/10):</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-image.png' // Fallback image
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded truncate">
                        Image {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Files */}
          {imageFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Preparing to upload:</p>
              <div className="space-y-2">
                {imageFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImageFile(index)}
                      disabled={imageUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length === 0 && (
            <p className="text-sm text-gray-500">
              Upload high-quality images of your product. Good images help customers make purchasing decisions.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          disabled={loading || isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === 'create' ? 'Create Product' : 'Update Product'}
        </Button>
      </div>
    </form>
  )
}