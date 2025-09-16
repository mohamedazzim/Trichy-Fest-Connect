import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProducerDashboard } from '@/components/dashboard/producer-dashboard'
import { ConsumerDashboard } from '@/components/dashboard/consumer-dashboard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Render appropriate dashboard based on user type
  if (session.user.userType === 'producer') {
    return <ProducerDashboard user={session.user} />
  } else {
    return <ConsumerDashboard user={session.user} />
  }
}

export const metadata = {
  title: 'Dashboard - Trichy Fresh Connect',
  description: 'Manage your marketplace activity and products',
}