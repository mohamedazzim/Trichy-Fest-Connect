'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/components/cart/cart-button'
import { Menu, X, User, LogOut, ShoppingBag, BarChart3, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Navigation() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (status === 'loading') return null

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-lg border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
              onClick={closeMobileMenu}
            >
              <span className="text-2xl sm:text-3xl">🌱</span>
              <span className="text-lg sm:text-xl font-bold text-green-800 tracking-tight hidden sm:block">
                Trichy Fresh Connect
              </span>
              <span className="text-base font-bold text-green-800 tracking-tight sm:hidden">
                TFC
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {session && <CartButton />}
            {session ? (
              <>
                <Link href="/browse">
                  <Button variant="ghost" className="text-gray-700 text-sm lg:text-base">
                    Browse
                  </Button>
                </Link>
                {session.user.userType === 'consumer' && (
                  <Link href="/orders">
                    <Button variant="ghost" className="text-gray-700 text-sm lg:text-base">
                      My Orders
                    </Button>
                  </Link>
                )}
                {session.user.userType === 'producer' && (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="text-gray-700 text-sm lg:text-base">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/dashboard/orders">
                      <Button variant="ghost" className="text-gray-700 text-sm lg:text-base">
                        Orders
                      </Button>
                    </Link>
                  </>
                )}
                <Link href="/profile">
                  <Button variant="ghost" className="text-gray-700 text-sm lg:text-base">
                    Profile
                  </Button>
                </Link>
                <div className="hidden lg:flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    Welcome, {session.user.name}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {session.user.userType}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: '/browse' })}
                  className="text-sm"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="outline" className="text-sm">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-green-600 hover:bg-green-700 text-sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {session && <CartButton />}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div id="mobile-navigation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-100"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {session ? (
                  <>
                    {/* User info on mobile */}
                    <div className="px-3 py-2 border-b border-gray-100 mb-2">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{session.user.userType}</p>
                        </div>
                      </div>
                    </div>

                    <Link href="/browse" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700">
                        <ShoppingBag className="h-4 w-4 mr-3" />
                        Browse Products
                      </Button>
                    </Link>
                    
                    {session.user.userType === 'consumer' && (
                      <Link href="/orders" onClick={closeMobileMenu}>
                        <Button variant="ghost" className="w-full justify-start text-gray-700">
                          <Package className="h-4 w-4 mr-3" />
                          My Orders
                        </Button>
                      </Link>
                    )}
                    
                    {session.user.userType === 'producer' && (
                      <>
                        <Link href="/dashboard" onClick={closeMobileMenu}>
                          <Button variant="ghost" className="w-full justify-start text-gray-700">
                            <BarChart3 className="h-4 w-4 mr-3" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/dashboard/orders" onClick={closeMobileMenu}>
                          <Button variant="ghost" className="w-full justify-start text-gray-700">
                            <Package className="h-4 w-4 mr-3" />
                            Orders
                          </Button>
                        </Link>
                      </>
                    )}
                    
                    <Link href="/profile" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700">
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Button>
                    </Link>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          closeMobileMenu()
                          signOut({ callbackUrl: '/browse' })
                        }}
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={closeMobileMenu}>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}