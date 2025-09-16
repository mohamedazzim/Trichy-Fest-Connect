import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Navigation } from '@/components/navigation'
import { CartPage } from '@/components/cart/cart-page'
import { redirect } from 'next/navigation'

export default async function Cart() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/cart')
  }

  return (
    <>
      <Navigation />
      <CartPage />
    </>
  )
}

export const metadata = {
  title: 'Shopping Cart - Trichy Fresh Connect',
  description: 'Review your selected fresh produce and proceed to checkout',
}