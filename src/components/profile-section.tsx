'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ProfileSectionProps {
  user: any
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [phone, setPhone] = useState(user.phoneE164 || '')
  const [loading, setLoading] = useState(false)
  
  const handlePhoneUpdate = async () => {
    if (!phone) {
      toast.error('Please enter a phone number')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/user/phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update phone number')
      }
      
      toast.success('Phone number updated successfully')
      
    } catch (error) {
      console.error('Error updating phone:', error)
      toast.error('Failed to update phone number')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your account information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email || 'Not set'}
              disabled
              className="mt-1"
            />
            <p className="text-sm text-gray-600 mt-1">
              Email is managed by Clerk authentication
            </p>
          </div>
          
          <div>
            <Label htmlFor="phone">WhatsApp Number</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="flex-1"
              />
              <Button 
                onClick={handlePhoneUpdate}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Required for receiving WhatsApp messages from your plants
            </p>
          </div>
        </div>
        
        {/* Account Stats */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Account Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Member since:</span>
              <span className="ml-2 font-semibold">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Plants:</span>
              <span className="ml-2 font-semibold">{user.plants?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <Badge variant="default" className="ml-2">Active</Badge>
            </div>
            <div>
              <span className="text-gray-600">Plan:</span>
              <span className="ml-2 font-semibold">
                {user.subscription?.plan || 'FREE'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
