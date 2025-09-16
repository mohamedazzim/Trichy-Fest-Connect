import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CheckoutFlow } from '@/components/checkout/checkout-flow'
import { Navigation } from '@/components/navigation'
import { redirect } from 'next/navigation'

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/checkout')
  }

  return (
    <>
      <Navigation />
      <CheckoutFlow />
    </>
  )
}

export const metadata = {
  title: 'Checkout - Trichy Fresh Connect',
  description: 'Complete your order of fresh, local produce from farmers in Trichy.',
}