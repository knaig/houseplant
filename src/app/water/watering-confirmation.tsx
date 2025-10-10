'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plant, Species } from '@prisma/client'
import { PlantCareCalculation } from '@/lib/plant-care'
import { toast } from 'sonner'
import { Droplets, Calendar, Clock, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface WateringConfirmationProps {
  plant: Plant & { species: Species }
  careCalculation: PlantCareCalculation
  userPhoneNumber?: string | null
}

export function WateringConfirmation({ plant, careCalculation, userPhoneNumber }: WateringConfirmationProps) {
  const [loading, setLoading] = useState(false)
  const [watered, setWatered] = useState(false)

  const handleWateringConfirmation = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/plants/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantId: plant.id,
          userId: plant.userId,
          phoneNumber: userPhoneNumber
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to confirm watering')
      }

      const result = await response.json()
      setWatered(true)
      toast.success('✅ Plant marked as watered!')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/app'
      }, 2000)

    } catch (error) {
      console.error('Error confirming watering:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to confirm watering')
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = () => {
    if (careCalculation.daysOverdue > 2) return 'text-red-600'
    if (careCalculation.daysOverdue > 0) return 'text-orange-600'
    return 'text-green-600'
  }

  const getUrgencyBadge = () => {
    if (careCalculation.daysOverdue > 2) return { color: 'destructive', text: 'Urgent' }
    if (careCalculation.daysOverdue > 0) return { color: 'secondary', text: 'Overdue' }
    return { color: 'default', text: 'Due Today' }
  }

  const urgencyBadge = getUrgencyBadge()

  if (watered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Plant Watered!</CardTitle>
            <CardDescription>
              Great job! {plant.name} has been marked as watered.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Next watering reminder: {careCalculation.nextWaterDue.toLocaleDateString()}
            </p>
            <Link href="/app">
              <Button className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/app">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plant Watering</h1>
            <p className="text-gray-600">Confirm you've watered your plant</p>
          </div>
        </div>

        {/* Plant Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                {plant.name}
              </CardTitle>
              <Badge variant={urgencyBadge.color as any}>
                {urgencyBadge.text}
              </Badge>
            </div>
            <CardDescription>
              {plant.species.commonName} • {plant.potSizeCm}cm pot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Watering Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Last Watered
                </div>
                <p className="font-medium">
                  {plant.lastWateredAt ? 
                    new Date(plant.lastWateredAt).toLocaleDateString() : 
                    'Never'
                  }
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Days Overdue
                </div>
                <p className={`font-medium ${getUrgencyColor()}`}>
                  {careCalculation.daysOverdue} day{careCalculation.daysOverdue !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Next Watering */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800 mb-1">
                <Calendar className="h-4 w-4" />
                Next Watering Due
              </div>
              <p className="font-medium text-blue-900">
                {careCalculation.nextWaterDue.toLocaleDateString()}
              </p>
            </div>

            {/* Care Info */}
            <div className="text-sm text-gray-600">
              <p><strong>Species:</strong> {plant.species.commonName}</p>
              <p><strong>Light Level:</strong> {plant.lightLevel}</p>
              <p><strong>Personality:</strong> {plant.personality}</p>
              {plant.location && <p><strong>Location:</strong> {plant.location}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Card */}
        <Card>
          <CardHeader>
            <CardTitle>Confirm Watering</CardTitle>
            <CardDescription>
              Tap the button below to confirm you've watered {plant.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleWateringConfirmation}
              disabled={loading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirming...
                </>
              ) : (
                <>
                  <Droplets className="h-5 w-5 mr-2" />
                  ✅ I've Watered {plant.name}
                </>
              )}
            </Button>
            
            {userPhoneNumber && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                You'll receive a WhatsApp confirmation at {userPhoneNumber}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
