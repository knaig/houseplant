import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { BillingSection } from '@/components/billing-section'
import { ProfileSection } from '@/components/profile-section'
import { UserButton } from '@clerk/nextjs'

export default async function SettingsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  // Get user and their subscription
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      subscription: true,
      plants: true,
    },
  })
  
  if (!user) {
    redirect('/sign-in')
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
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account, billing, and plant preferences
          </p>
        </div>
        
        <div className="space-y-8">
          <BillingSection 
            subscription={user.subscription}
            plantCount={plantCount}
            maxPlants={maxPlants}
          />
          
          <ProfileSection user={user} />
        </div>
      </div>
    </div>
  )
}
