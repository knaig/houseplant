'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plant, Species, Personality, LightLevel } from '@prisma/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { MessageSquare, Wifi, WifiOff, Clock, CheckCircle } from 'lucide-react'

interface PlantCardProps {
  plant: Plant & {
    species: Species
  }
  conversationId?: string
}

const personalityEmojis = {
  FUNNY: '😄',
  COACH: '💪',
  ZEN: '🧘‍♀️',
  CLASSIC: '🌿',
}

const lightLevelColors = {
  LOW: 'bg-yellow-100 text-yellow-800',
  MEDIUM: 'bg-orange-100 text-orange-800',
  HIGH: 'bg-red-100 text-red-800',
}

export function PlantCard({ plant, conversationId }: PlantCardProps) {
  const [isWatering, setIsWatering] = useState(false)
  const [messageStatus, setMessageStatus] = useState<{
    lastMessage?: string
    messageCount?: number
    isConnected?: boolean
  }>({})
  const router = useRouter()
  
  const daysSinceWatered = plant.lastWateredAt 
    ? Math.floor((Date.now() - plant.lastWateredAt.getTime()) / (1000 * 60 * 60 * 24))
    : null
  
  const daysUntilNext = plant.nextWaterDue
    ? Math.ceil((plant.nextWaterDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null
  
  const isOverdue = daysUntilNext !== null && daysUntilNext < 0

  // Fetch plant message status
  useEffect(() => {
    if (!conversationId) return

    const fetchMessageStatus = async () => {
      try {
        const response = await fetch(`/api/groups/${conversationId}/messages?limit=10`)
        if (response.ok) {
          const data = await response.json()
          const plantMessages = data.messages.filter((msg: any) => 
            msg.author === `plant_${plant.id}`
          )
          
          setMessageStatus({
            lastMessage: plantMessages[0]?.createdAt,
            messageCount: plantMessages.length,
            isConnected: true
          })
        }
      } catch (error) {
        console.error('Error fetching message status:', error)
        setMessageStatus({ isConnected: false })
      }
    }

    fetchMessageStatus()
  }, [conversationId, plant.id])

  const handleWaterNow = async () => {
    setIsWatering(true)
    
    try {
      const response = await fetch(`/api/plants/${plant.id}/water`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to water plant')
      }

      const result = await response.json()
      
      toast.success(`🌱 ${plant.name} watered successfully! Next watering in ${plant.customWaterDays ?? plant.species.defaultWaterDays} days.`)
      
      // Refresh the page to update plant data
      router.refresh()
      
    } catch (error) {
      console.error('Error watering plant:', error)
      toast.error(`Failed to water ${plant.name}. Please try again.`)
    } finally {
      setIsWatering(false)
    }
  }
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate pr-2">{plant.name}</CardTitle>
          <span className="text-2xl flex-shrink-0">{personalityEmojis[plant.personality]}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{plant.species.commonName}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={lightLevelColors[plant.lightLevel]}>
              {plant.lightLevel.toLowerCase()} light
            </Badge>
            <Badge variant="outline">
              {plant.potSizeCm}cm pot
            </Badge>
            {plant.location && (
              <Badge variant="outline">
                📍 {plant.location}
              </Badge>
            )}
            {/* WhatsApp Status Indicator */}
            {conversationId && (
              <Badge 
                variant={messageStatus.isConnected ? "default" : "secondary"}
                className="text-xs"
              >
                {messageStatus.isConnected ? (
                  <Wifi className="h-3 w-3 mr-1" />
                ) : (
                  <WifiOff className="h-3 w-3 mr-1" />
                )}
                WhatsApp
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">
            <strong>Personality:</strong> {plant.personality.toLowerCase()} • <strong>Species:</strong> {plant.species.latinName || plant.species.commonName}
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">💧 Watering Status</h4>
            {plant.lastWateredAt && (
              <div className="text-sm mb-1">
                <span className="text-gray-600">Last watered:</span>{' '}
                <span className="font-medium">
                  {daysSinceWatered === 0 ? 'Today' : 
                   daysSinceWatered === 1 ? 'Yesterday' : 
                   `${daysSinceWatered} days ago`}
                </span>
              </div>
            )}
            
            {plant.nextWaterDue && (
              <div className="text-sm">
                <span className="text-gray-600">Next watering:</span>{' '}
                <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                  {isOverdue ? `${Math.abs(daysUntilNext)} days overdue` :
                   daysUntilNext === 0 ? 'Today' :
                   daysUntilNext === 1 ? 'Tomorrow' :
                   `In ${daysUntilNext} days`}
                </span>
              </div>
            )}
          </div>

          {/* WhatsApp Message Status */}
          {conversationId && messageStatus.isConnected && (
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                WhatsApp Activity
              </h4>
              {messageStatus.lastMessage && (
                <div className="text-sm mb-1">
                  <span className="text-gray-600">Last message:</span>{' '}
                  <span className="font-medium">
                    {new Date(messageStatus.lastMessage).toLocaleDateString()}
                  </span>
                </div>
              )}
              {messageStatus.messageCount !== undefined && (
                <div className="text-sm">
                  <span className="text-gray-600">Messages this week:</span>{' '}
                  <span className="font-medium text-green-600">
                    {messageStatus.messageCount}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href={`/app/plants/${plant.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={handleWaterNow}
              disabled={isWatering}
            >
              {isWatering ? '💧 Watering...' : '💧 Water Now'}
            </Button>
          </div>
          
          {/* WhatsApp Quick Actions */}
          {conversationId && (
            <div className="flex gap-2">
              <Link href="/app/chat" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  View Messages
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  // Quick message from this plant
                  toast.info(`Quick message feature coming soon! ${plant.name} will be able to send you a message.`)
                }}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Quick Message
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
