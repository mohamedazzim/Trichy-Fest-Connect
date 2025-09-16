import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProductDetail } from '@/components/consumer/product-detail'
import { Navigation } from '@/components/navigation'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { products, users, categories } from '@/lib/schema'
import { eq } from 'drizzle-orm'

async function getProduct(id: string) {
  try {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        pricePerUnit: products.pricePerUnit,
        unit: products.unit,
        availableQuantity: products.availableQuantity,
        minOrderQuantity: products.minOrderQuantity,
        isOrganic: products.isOrganic,
        images: products.images,
        harvestDate: products.harvestDate,
        expiryDate: products.expiryDate,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categoryDescription: categories.description,
        producerId: products.producerId,
        producerName: users.name,
        producerEmail: users.email,
        producerPhone: users.phone,
        producerAddress: users.address,
        producerBusinessName: users.businessName,
        producerBio: users.bio
      })
      .from(products)
      .leftJoin(users, eq(products.producerId, users.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id))
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedParams = await params
  const product = await getProduct(resolvedParams.id)

  if (!product || product.status !== 'active') {
    notFound()
  }

  return (
    <>
      <Navigation />
      <ProductDetail product={product} />
    </>
  )
}

export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params
  const product = await getProduct(resolvedParams.id)
  
  if (!product) {
    return {
      title: 'Product Not Found - Trichy Fresh Connect'
    }
  }

  return {
    title: `${product.name} - ${product.producerName} | Trichy Fresh Connect`,
    description: product.description || `Fresh ${product.name} from ${product.producerName}. ₹${product.pricePerUnit} per ${product.unit}. Available now.`,
  }
}