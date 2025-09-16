import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProducerDashboard } from '@/components/dashboard/producer-dashboard'
import { ConsumerDashboard } from '@/components/dashboard/consumer-dashboard'
import { Navigation } from '@/components/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Render appropriate dashboard based on user type
  if (session.user.userType === 'producer') {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50">
          <ProducerDashboard user={session.user} />
        </div>
      </>
    )
  } else {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50">
          <ConsumerDashboard user={session.user} />
        </div>
      </>
    )
  }
}

export const metadata = {
  title: 'Dashboard - Trichy Fresh Connect',
  description: 'Manage your marketplace activity and products',
}