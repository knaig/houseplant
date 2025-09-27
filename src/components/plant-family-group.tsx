'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConversationStatus } from '@/components/conversation-status'
import { MessageHistory } from '@/components/message-history'
import { MessageSquare, Users, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Plant {
  id: string
  name: string
  personality: 'FUNNY' | 'COACH' | 'ZEN' | 'CLASSIC' | null
  personalityEmoji?: string | null
  isActive?: boolean
}

interface Conversation {
  id: string
  name: string
  isActive: boolean
  createdAt: string
}

interface User {
  id: string
  phoneE164: string | null
  plants: Plant[]
  conversation?: Conversation | null
}

interface PlantFamilyGroupProps {
  user: User
}

const personalityEmojis = {
  FUNNY: '😄',
  COACH: '💪',
  ZEN: '🧘',
  CLASSIC: '🌿',
}

export function PlantFamilyGroup({ user }: PlantFamilyGroupProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [recentMessages, setRecentMessages] = useState<any[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Fetch recent messages
  const fetchRecentMessages = async () => {
    if (!user.conversation) return

    setLoadingMessages(true)
    try {
      const response = await fetch(`/api/groups/${user.conversation.id}/messages?limit=3`)
      if (response.ok) {
        const data = await response.json()
        setRecentMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching recent messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (user.conversation) {
      fetchRecentMessages()
    }
  }, [user.conversation])

  const handleCreateGroup = async () => {
    if (!user.phoneE164) {
      setError('Phone number required for WhatsApp group. Please add your phone number in your profile.')
      return
    }

    setIsCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message || 'Plant Family group created successfully!')
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        setError(data.error || 'Failed to create Plant Family group')
      }
    } catch (err) {
      setError('Failed to create Plant Family group. Please try again.')
      console.error('Error creating group:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSyncPlants = async () => {
    if (!user.conversation) return

    setIsSyncing(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/groups/${user.conversation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ syncPlants: true }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Plants synced successfully!')
      } else {
        setError(data.error || 'Failed to sync plants')
      }
    } catch (err) {
      setError('Failed to sync plants. Please try again.')
      console.error('Error syncing plants:', err)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDeactivateGroup = async () => {
    if (!user.conversation) return

    if (!confirm('Are you sure you want to deactivate your Plant Family group? You\'ll receive individual messages from your plants instead.')) {
      return
    }

    try {
      const response = await fetch(`/api/groups/${user.conversation.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Plant Family group deactivated successfully!')
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        setError(data.error || 'Failed to deactivate group')
      }
    } catch (err) {
      setError('Failed to deactivate group. Please try again.')
      console.error('Error deactivating group:', err)
    }
  }

  if (!user.conversation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌱 Plant Family Group
          </CardTitle>
          <CardDescription>
            Create a WhatsApp group where all your plants can message you together
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              {success}
            </div>
          )}

          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Benefits of Plant Family Group:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All plant reminders in one WhatsApp conversation</li>
                <li>Each plant appears as a separate participant</li>
                <li>Easy to respond to specific plants</li>
                <li>Organized conversation history</li>
              </ul>
            </div>

            {!user.phoneE164 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
                <strong>Phone number required:</strong> Please add your phone number in your profile to create a WhatsApp group.
              </div>
            ) : (
              <Button 
                onClick={handleCreateGroup} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating Group...' : 'Create Plant Family Group'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🌱 Plant Family Group
            </CardTitle>
            <CardDescription>
              Your WhatsApp group with {user.plants.length + 1} participants
            </CardDescription>
          </div>
          <ConversationStatus 
            conversationId={user.conversation.id} 
            compact 
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Enhanced Status Display */}
        <ConversationStatus 
          conversationId={user.conversation.id}
          className="mb-4"
        />

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            asChild
            className="flex-1"
          >
            <Link href="/app/chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Plant Chat
            </Link>
          </Button>
          <Button 
            onClick={handleSyncPlants} 
            disabled={isSyncing}
            variant="outline"
            size="sm"
          >
            {isSyncing ? 'Syncing...' : 'Sync Plants'}
          </Button>
        </div>

        {/* Recent Messages Preview */}
        {recentMessages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Recent Messages
              </h4>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
              >
                <Link href="/app/chat">
                  View All
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
            
            <div className="space-y-2">
              {recentMessages.map((message) => (
                <div key={message.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                  <span className="text-sm">{message.authorEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{message.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group Participants */}
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Group Participants:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">👤</span>
                <span className="text-sm">You</span>
                <Badge variant="default" className="text-xs">Active</Badge>
              </div>
              {user.plants.map((plant) => (
                <div key={plant.id} className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">
                    {plant.personalityEmoji || (plant.personality ? personalityEmojis[plant.personality] : '🌱')}
                  </span>
                  <span className="text-sm">{plant.name}</span>
                  <Badge 
                    variant={plant.isActive !== false ? "default" : "secondary"} 
                    className="text-xs"
                  >
                    {plant.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Created: {new Date(user.conversation.createdAt).toLocaleDateString()}
          </div>

          {user.conversation.isActive && (
            <Button 
              onClick={handleDeactivateGroup} 
              variant="destructive"
              size="sm"
              className="w-full"
            >
              Deactivate Group
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
