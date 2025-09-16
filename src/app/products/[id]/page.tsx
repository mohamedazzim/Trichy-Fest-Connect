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
    // Fetch product data first (avoid complex joins that cause Object.entries error)
    const productResult = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)

    if (productResult.length === 0) {
      return null
    }

    const product = productResult[0]

    // Fetch related data separately to avoid Drizzle ORM join issues
    const [categoryResult, userResult] = await Promise.all([
      product.categoryId ? db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1) : [],
      product.producerId ? db.select().from(users).where(eq(users.id, product.producerId)).limit(1) : []
    ])

    // Combine the data manually
    const category = categoryResult[0] || null
    const user = userResult[0] || null

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      pricePerUnit: parseFloat(product.pricePerUnit || '0'),
      unit: product.unit,
      availableQuantity: parseFloat(product.availableQuantity || '0'),
      minOrderQuantity: parseFloat(product.minOrderQuantity || '1'),
      isOrganic: product.isOrganic,
      images: product.images ? JSON.parse(product.images) : [],
      harvestDate: product.harvestDate,
      expiryDate: product.expiryDate,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryId: product.categoryId,
      producerId: product.producerId,
      categoryName: category?.name || null,
      categoryDescription: category?.description || null,
      producerName: user?.name || null,
      producerEmail: user?.email || null,
      producerPhone: user?.phone || null,
      producerAddress: user?.location || null,
      producerBio: user?.bio || null
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    console.error('Error stack:', error.stack)
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