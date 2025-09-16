'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌱 Trichy Fresh Connect
          </h1>
          <p className="text-xl text-gray-700">
            Connecting local producers with consumers for fresh, local produce
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              For Producers
            </h2>
            <p className="text-gray-600 mb-4">
              List your fresh produce and connect directly with local consumers
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              Start Selling
            </Button>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              For Consumers
            </h2>
            <p className="text-gray-600 mb-4">
              Browse and purchase fresh, local produce from nearby farmers
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Browse Produce
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  )
}