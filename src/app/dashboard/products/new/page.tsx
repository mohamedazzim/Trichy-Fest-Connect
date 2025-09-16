import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProductForm } from '@/components/products/product-form'

export default async function NewProductPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.userType !== 'producer') {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-gray-600 mt-2">
            List your fresh produce to connect with local consumers
          </p>
        </div>
        
        <ProductForm mode="create" />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Add New Product - Trichy Fresh Connect',
  description: 'Add a new product to your producer profile',
}