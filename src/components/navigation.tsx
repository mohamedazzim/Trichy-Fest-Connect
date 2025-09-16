'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/components/cart/cart-button'

export function Navigation() {
  const { data: session, status } = useSession()

  if (status === 'loading') return null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-gray-900">
                Trichy Fresh Connect
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {session && <CartButton />}
            {session ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" className="text-gray-700">
                    Profile
                  </Button>
                </Link>
                <span className="text-gray-700">
                  Welcome, {session.user.name}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {session.user.userType}
                </span>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}