import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ConsumerHomepage } from '@/components/consumer/homepage'
import { Navigation } from '@/components/navigation'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  // Redirect producers to their dashboard
  if (session?.user?.userType === 'producer') {
    redirect('/dashboard')
  }

  return (
    <>
      <Navigation />
      <ConsumerHomepage />
    </>
  )
}

export const metadata = {
  title: 'Trichy Fresh Connect - Fresh Local Produce',
  description: 'Discover fresh, locally grown produce directly from farmers in Trichy. Support local agriculture and enjoy the freshest fruits, vegetables, and more.',
}