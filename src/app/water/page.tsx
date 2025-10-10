import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { plantCareService } from '@/lib/plant-care'
import { WateringConfirmation } from './watering-confirmation'

interface WateringPageProps {
  searchParams: Promise<{ plant?: string }>
}

export default async function WateringPage({ searchParams }: WateringPageProps) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const params = await searchParams
  const plantId = params.plant

  if (!plantId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Invalid QR Code</h1>
          <p className="text-gray-600 mb-4">No plant ID found in the QR code. Please scan a valid plant QR code.</p>
          <a href="/app" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Get user and verify plant ownership
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      plants: {
        include: { species: true }
      }
    }
  })

  if (!user) {
    redirect('/sign-in')
  }

  // Find the specific plant
  const plant = user.plants.find(p => p.id === plantId)

  if (!plant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Plant Not Found</h1>
          <p className="text-gray-600 mb-4">This plant doesn't belong to your account or doesn't exist.</p>
          <a href="/app" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Calculate watering status
  const careCalculation = plantCareService.calculateWateringSchedule(plant)

  return (
    <WateringConfirmation 
      plant={plant}
      careCalculation={careCalculation}
      userPhoneNumber={user.phoneE164}
    />
  )
}
