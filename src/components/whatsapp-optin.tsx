'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Phone, MessageSquare, CheckCircle, XCircle } from 'lucide-react'

interface WhatsAppOptInProps {
  currentPhoneNumber?: string
  currentOptIn?: boolean
  onUpdate?: () => void
}

export function WhatsAppOptIn({ currentPhoneNumber, currentOptIn, onUpdate }: WhatsAppOptInProps) {
  const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber || '')
  const [optIn, setOptIn] = useState(currentOptIn || false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    // Basic phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid phone number in international format (+1234567890)')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/whatsapp/optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          optIn
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update WhatsApp settings')
      }

      const result = await response.json()
      
      if (optIn) {
        toast.success('✅ Successfully opted in to WhatsApp notifications!')
      } else {
        toast.success('WhatsApp notifications disabled')
      }

      if (onUpdate) {
        onUpdate()
      }

    } catch (error) {
      console.error('Error updating WhatsApp settings:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update WhatsApp settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          WhatsApp Notifications
        </CardTitle>
        <CardDescription>
          Get personalized watering reminders and plant care tips via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number *
            </Label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="flex-1"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500">
              Use international format with country code (e.g., +91 for India, +1 for US)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="optin" className="text-sm font-medium">
                Enable WhatsApp Notifications
              </Label>
              <p className="text-xs text-gray-500">
                Receive watering reminders and plant care tips
              </p>
            </div>
            <Switch
              id="optin"
              checked={optIn}
              onCheckedChange={setOptIn}
              disabled={loading}
            />
          </div>

          {optIn && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">You'll receive:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Watering reminders for each plant</li>
                    <li>• Plant care tips and advice</li>
                    <li>• Quick watering confirmation buttons</li>
                    <li>• Personalized messages based on plant personality</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !phoneNumber.trim()}
          >
            {loading ? 'Updating...' : optIn ? 'Enable WhatsApp Notifications' : 'Disable WhatsApp Notifications'}
          </Button>
        </form>

        {currentOptIn && currentPhoneNumber && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>WhatsApp notifications enabled for {currentPhoneNumber}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
