import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { PlantCard } from '@/components/plant-card'
import { AddPlantButton } from '@/components/add-plant-button'
import { PlantFamilyGroup } from '@/components/plant-family-group'
import { UserButton } from '@clerk/nextjs'
import { MessageSquare } from 'lucide-react'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  // Get user and their plants
  let user
  try {
    user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        plants: {
          include: {
            species: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        subscription: true,
      },
    })

    if (!user) {
      // Create user if doesn't exist
      try {
        user = await db.user.create({
          data: {
            clerkId: userId,
            email: `user-${userId}@temp.com`, // Temporary email until we get it from Clerk
          },
          include: {
            plants: {
              include: {
                species: true,
              },
              orderBy: { createdAt: 'desc' },
            },
            subscription: true,
          },
        })
      } catch (error) {
        console.error('Error creating user:', error)
        // If user creation fails, redirect to sign-in
        redirect('/sign-in')
      }
    }
  } catch (error) {
    console.error('Database connection error:', error)
    // Return a simple page without database dependency
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Database Setup Required</h1>
          <p className="text-gray-600 mb-4">
            The application needs a cloud database to function properly.
          </p>
          <p className="text-sm text-gray-500">
            Please set up a PostgreSQL database and update the DATABASE_URL environment variable.
          </p>
        </div>
      </div>
    )
  }
  
  const plantCount = user.plants.length
  const maxPlants = user.subscription?.plan === 'FREE' ? 1 : 
                   user.subscription?.plan === 'PRO' ? 10 : 25
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌱</span>
            </div>
            <span className="font-bold text-xl">Text From Your Plants</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-sm text-gray-600">
                {plantCount}/{maxPlants} plants
              </span>
              <p className="text-xs text-gray-500">
                {user.subscription?.plan === 'FREE' ? 'Free Plan' : 
                 user.subscription?.plan === 'PRO' ? 'Pro Plan' : 'Pro Plus Plan'}
              </p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Plant Family</h1>
            <p className="text-gray-600 mt-2">
              Your green friends are ready to send you personalized WhatsApp messages
            </p>
          </div>
          
          <AddPlantButton 
            currentCount={plantCount} 
            maxPlants={maxPlants}
            userPlan={user.subscription?.plan || 'FREE'}
          />
        </div>

        {/* Plant Family Group Management */}
        <div className="mb-8">
          <PlantFamilyGroup user={user} />
        </div>

        {/* WhatsApp Message History Section - Coming Soon */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border p-6 text-center">
            <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">WhatsApp Messaging</h2>
            <p className="text-gray-600 mb-4">
              Connect your plants to WhatsApp for personalized messages and care reminders.
            </p>
            <div className="text-sm text-gray-500">
              Feature coming soon - Database setup required
            </div>
          </div>
        </div>
        
        {user.plants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🌱</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to Your Plant Dashboard!</h3>
            <div className="max-w-md mx-auto mb-8">
              <p className="text-gray-600 mb-4">
                You don't have any plants yet. Here's how to get started:
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-green-800 mb-2">🚀 Quick Start Guide:</h4>
                <ol className="text-sm text-green-700 space-y-1">
                  <li><strong>1. Get a QR sticker</strong> - Each plant pot comes with a unique QR code</li>
                  <li><strong>2. Scan the QR code</strong> - Use your phone camera to scan it</li>
                  <li><strong>3. Fill out the form</strong> - Tell us about your plant</li>
                  <li><strong>4. Get reminders</strong> - Receive WhatsApp messages in your Plant Family group</li>
                </ol>
              </div>
            </div>
            <AddPlantButton 
              currentCount={plantCount} 
              maxPlants={maxPlants}
              userPlan={user.subscription?.plan || 'FREE'}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.plants.map((plant) => (
              <PlantCard 
                key={plant.id} 
                plant={plant} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
