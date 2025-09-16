/**
 * Product response mapping utilities for consistent API contracts
 * Handles conversion between database string representations and API number types
 */

export interface ProductResponse {
  id: string
  name: string
  description: string | null
  categoryId: string
  categoryName: string | null
  producerId: string
  producerName: string | null
  producerBio?: string | null
  producerLocation: string | null
  images: string[]
  unit: string
  pricePerUnit: number
  availableQuantity: number
  minOrderQuantity: number
  isOrganic: boolean
  harvestDate: Date | null
  expiryDate: Date | null
  status: 'active' | 'inactive' | 'out_of_stock'
  createdAt: Date
  updatedAt: Date
}

export interface ProductListResponse {
  products: ProductResponse[]
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Normalizes a product from database format to API response format
 * Converts string decimals to numbers and parses JSON fields
 */
export function normalizeProduct(dbProduct: any): ProductResponse {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    categoryId: dbProduct.categoryId,
    categoryName: dbProduct.categoryName,
    producerId: dbProduct.producerId,
    producerName: dbProduct.producerName,
    producerBio: dbProduct.producerBio,
    producerLocation: dbProduct.producerLocation,
    images: parseImages(dbProduct.images),
    unit: dbProduct.unit,
    pricePerUnit: parseDecimal(dbProduct.pricePerUnit),
    availableQuantity: parseDecimal(dbProduct.availableQuantity),
    minOrderQuantity: parseDecimal(dbProduct.minOrderQuantity),
    isOrganic: Boolean(dbProduct.isOrganic),
    harvestDate: dbProduct.harvestDate,
    expiryDate: dbProduct.expiryDate,
    status: dbProduct.status,
    createdAt: dbProduct.createdAt,
    updatedAt: dbProduct.updatedAt,
  }
}

/**
 * Safely parses decimal string to number
 * Handles edge cases where the value might already be a number or null/undefined
 */
function parseDecimal(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/**
 * Safely parses images JSON string to array
 * Returns empty array if parsing fails or value is invalid
 */
function parseImages(images: string | null | undefined): string[] {
  if (!images) return []
  
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}