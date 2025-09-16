'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { ProducerProfile } from '@/components/profile/producer-profile'
import { ConsumerProfile } from '@/components/profile/consumer-profile'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </>
    )
  }

  if (!session) {
    return null
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        {session.user.userType === 'producer' ? (
          <ProducerProfile user={session.user} />
        ) : (
          <ConsumerProfile user={session.user} />
        )}
      </div>
    </>
  )
}