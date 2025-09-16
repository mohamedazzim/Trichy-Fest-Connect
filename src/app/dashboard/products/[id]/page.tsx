import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProductForm } from '@/components/products/product-form'
import { Navigation } from '@/components/navigation'
import { db } from '@/lib/db'
import { products } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.userType !== 'producer') {
    redirect('/dashboard')
  }

  const { id } = await params

  // Fetch the product and verify ownership
  const product = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.producerId, session.user.id)))
    .limit(1)
    .then(rows => rows[0])

  if (!product) {
    notFound()
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Edit Product</h1>
              <p className="text-gray-600 mt-2">
                Update your product information and availability
              </p>
            </div>
            
            <ProductForm mode="edit" productId={id} initialData={product} />
          </div>
        </div>
      </div>
    </>
  )
}

export const metadata = {
  title: 'Edit Product - Trichy Fresh Connect',
  description: 'Edit your product information',
}