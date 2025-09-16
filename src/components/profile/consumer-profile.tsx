'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { User } from 'next-auth'

interface ConsumerProfileProps {
  user: User
}

interface ProfileData {
  name: string
  email: string
  bio: string
  location: string
  phone: string
}

export function ConsumerProfile({ user }: ConsumerProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user.name || '',
    email: user.email || '',
    bio: '',
    location: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || '',
          location: data.location || '',
          phone: data.phone || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        setMessage('Profile updated successfully!')
        setIsEditing(false)
      } else {
        setMessage('Failed to update profile')
      }
    } catch (error) {
      setMessage('An error occurred while updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consumer Profile</h1>
            <p className="text-gray-600 mt-2">Manage your preferences and purchase history</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
              Consumer
            </span>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('success') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-md">{profileData.name || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-gray-600 p-3 bg-gray-50 rounded-md">{profileData.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              {isEditing ? (
                <Input
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  placeholder="Enter your location (e.g., Trichy, Tamil Nadu)"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-md">{profileData.location || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-md">{profileData.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About You
              </label>
              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about your preferences, dietary requirements, or anything else..."
                  rows={6}
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-md min-h-[120px]">
                  {profileData.bio || 'Tell us about your preferences and dietary requirements...'}
                </p>
              )}
            </div>

            <div className="bg-emerald-50 p-4 rounded-md">
              <h3 className="font-medium text-emerald-800 mb-2">Consumer Benefits</h3>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>• Access to fresh, local produce</li>
                <li>• Direct communication with farmers</li>
                <li>• Support local agriculture</li>
                <li>• Track your purchases</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false)
                  fetchProfile() // Reset to original data
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>

      {/* Shopping Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Orders Made</h3>
          <p className="text-3xl font-bold text-emerald-600">0</p>
          <p className="text-sm text-gray-500 mt-1">Total orders</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Amount Spent</h3>
          <p className="text-3xl font-bold text-emerald-600">₹0</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Favorite Producers</h3>
          <p className="text-3xl font-bold text-emerald-600">0</p>
          <p className="text-sm text-gray-500 mt-1">Following</p>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 bg-white rounded-lg shadow-lg p-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-2">Start browsing fresh produce to see your activity here</p>
        </div>
      </motion.div>
    </div>
  )
}