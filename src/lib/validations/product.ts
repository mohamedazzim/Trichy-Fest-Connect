import { z } from 'zod'

// Product creation schema
export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(255, 'Product name too long'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.array(z.string().url()).optional().default([]),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit too long'),
  pricePerUnit: z.coerce.number().positive('Price must be positive'),
  availableQuantity: z.coerce.number().nonnegative('Quantity must be non-negative'),
  minOrderQuantity: z.coerce.number().positive('Minimum quantity must be positive').optional().default(1),
  isOrganic: z.coerce.boolean().optional().default(false),
  harvestDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
})

// Product update schema (all fields optional except restrictions)
export const updateProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(255, 'Product name too long').optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required').optional(),
  images: z.array(z.string().url()).optional(),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit too long').optional(),
  pricePerUnit: z.coerce.number().positive('Price must be positive').optional(),
  availableQuantity: z.coerce.number().nonnegative('Quantity must be non-negative').optional(),
  minOrderQuantity: z.coerce.number().positive('Minimum quantity must be positive').optional(),
  isOrganic: z.coerce.boolean().optional(),
  harvestDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock']).optional(),
})

// Product query/filter schema
export const productQuerySchema = z.object({
  category: z.string().optional(),
  producer: z.string().optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock']).optional(),
  isOrganic: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>