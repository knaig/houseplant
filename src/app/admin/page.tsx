import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AdminStats } from '@/components/admin-stats'
import { AdminUsers } from '@/components/admin-users'
import { AdminPlants } from '@/components/admin-plants'
import { AdminMessages } from '@/components/admin-messages'
import { UserButton } from '@clerk/nextjs'

export default async function AdminPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  // In a real app, you'd check if user has admin role
  // For now, we'll allow any authenticated user
  
  // Get admin stats
  const stats = await db.$transaction([
    db.user.count(),
    db.plant.count(),
    db.message.count(),
    db.subscription.count({ where: { status: 'ACTIVE' } }),
  ])
  
  const [userCount, plantCount, messageCount, activeSubscriptions] = stats
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌱</span>
            </div>
            <span className="font-bold text-xl">Text From Your Plants - Admin</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor platform health, manage users, and generate QR stickers for plant distribution
          </p>
          
          {/* Quick Actions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🚀 Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <a href="/admin/qr" className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200">
                📱 Generate QR Codes
              </a>
              <a href="/admin/users" className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200">
                👥 Manage Users
              </a>
              <a href="/admin/plants" className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200">
                🌱 Manage Plants
              </a>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <AdminStats 
            userCount={userCount}
            plantCount={plantCount}
            messageCount={messageCount}
            activeSubscriptions={activeSubscriptions}
          />
          
          <div className="grid lg:grid-cols-2 gap-8">
            <AdminUsers />
            <AdminPlants />
          </div>
          
          <AdminMessages />
        </div>
      </div>
    </div>
  )
}
