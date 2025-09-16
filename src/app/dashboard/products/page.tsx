import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProductsManagement } from '@/components/products/products-management'
import { Navigation } from '@/components/navigation'

export default async function ProductsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.userType !== 'producer') {
    redirect('/dashboard')
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <ProductsManagement />
        </div>
      </div>
    </>
  )
}

export const metadata = {
  title: 'Manage Products - Trichy Fresh Connect',
  description: 'Manage your product listings and inventory',
}