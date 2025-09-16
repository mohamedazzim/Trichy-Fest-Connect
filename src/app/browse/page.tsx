import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProductBrowsing } from '@/components/consumer/product-browsing'
import { Navigation } from '@/components/navigation'

export default async function BrowsePage() {
  const session = await getServerSession(authOptions)

  return (
    <>
      <Navigation />
      <ProductBrowsing />
    </>
  )
}

export const metadata = {
  title: 'Browse Fresh Produce - Trichy Fresh Connect',
  description: 'Browse fresh, local produce from farmers in Trichy. Filter by category, price, and location to find exactly what you need.',
}