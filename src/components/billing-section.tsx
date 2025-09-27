'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RazorpayPayment } from '@/components/razorpay-payment'
import { toast } from 'sonner'

interface BillingSectionProps {
  subscription: any
  plantCount: number
  maxPlants: number
}

export function BillingSection({ subscription, plantCount, maxPlants }: BillingSectionProps) {
  const [loading, setLoading] = useState(false)
  const [showRazorpay, setShowRazorpay] = useState(false)
  
  const handleUpgrade = async (plan: 'PRO' | 'PRO_PLUS') => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }
      
      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
      
    } catch (error) {
      console.error('Error upgrading:', error)
      toast.error('Failed to start upgrade process')
    } finally {
      setLoading(false)
    }
  }
  
  const handleManageBilling = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }
      
      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
      
    } catch (error) {
      console.error('Error opening billing portal:', error)
      toast.error('Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }
  
  const currentPlan = subscription?.plan || 'FREE'
  const isActive = subscription?.status === 'ACTIVE'
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & Subscription</CardTitle>
        <CardDescription>
          Manage your subscription and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {currentPlan === 'FREE' ? 'Free Plan' : 
                 currentPlan === 'PRO' ? 'Pro Plan' : 'Pro Plus Plan'}
              </h3>
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {plantCount}/{maxPlants} plants used
            </p>
          </div>
          
          {subscription && (
            <Button 
              variant="outline" 
              onClick={handleManageBilling}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Manage Billing'}
            </Button>
          )}
        </div>
        
        {/* Payment Options */}
        <div className="mb-6">
          <h4 className="font-semibold mb-4">Choose Payment Method</h4>
          <div className="flex gap-2">
            <Button 
              variant={!showRazorpay ? "default" : "outline"}
              size="sm"
              onClick={() => setShowRazorpay(false)}
            >
              Stripe (International)
            </Button>
            <Button 
              variant={showRazorpay ? "default" : "outline"}
              size="sm"
              onClick={() => setShowRazorpay(true)}
            >
              Razorpay (India)
            </Button>
          </div>
        </div>

        {/* Plan Features */}
        {showRazorpay ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Free Plan</h4>
              <div className="text-2xl font-bold mb-2">₹0</div>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✓ 1 plant</li>
                <li>✓ WhatsApp messages</li>
                <li>✓ All personalities</li>
                <li>✓ Basic dashboard</li>
              </ul>
              {currentPlan === 'FREE' && (
                <Badge className="mt-2">Current Plan</Badge>
              )}
            </div>
            
            <div className="space-y-4">
              <RazorpayPayment 
                plan="PRO" 
                onSuccess={() => window.location.reload()}
              />
              <RazorpayPayment 
                plan="PRO_PLUS" 
                onSuccess={() => window.location.reload()}
              />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Free Plan</h4>
              <div className="text-2xl font-bold mb-2">$0</div>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✓ 1 plant</li>
                <li>✓ WhatsApp messages</li>
                <li>✓ All personalities</li>
                <li>✓ Basic dashboard</li>
              </ul>
              {currentPlan === 'FREE' && (
                <Badge className="mt-2">Current Plan</Badge>
              )}
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Pro Plan</h4>
              <div className="text-2xl font-bold mb-2">$5.99<span className="text-sm text-gray-500">/month</span></div>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✓ Up to 10 plants</li>
                <li>✓ WhatsApp messages</li>
                <li>✓ All personalities</li>
                <li>✓ Advanced dashboard</li>
                <li>✓ Priority support</li>
              </ul>
              {currentPlan === 'PRO' ? (
                <Badge className="mt-2">Current Plan</Badge>
              ) : (
                <Button 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => handleUpgrade('PRO')}
                  disabled={loading}
                >
                  Upgrade
                </Button>
              )}
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Pro Plus Plan</h4>
              <div className="text-2xl font-bold mb-2">$9.99<span className="text-sm text-gray-500">/month</span></div>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✓ Up to 25 plants</li>
                <li>✓ WhatsApp messages</li>
                <li>✓ All personalities</li>
                <li>✓ Advanced dashboard</li>
                <li>✓ Priority support</li>
                <li>✓ Analytics</li>
              </ul>
              {currentPlan === 'PRO_PLUS' ? (
                <Badge className="mt-2">Current Plan</Badge>
              ) : (
                <Button 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => handleUpgrade('PRO_PLUS')}
                  disabled={loading}
                >
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Usage Stats */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Usage This Month</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Plants:</span>
              <span className="ml-2 font-semibold">{plantCount}/{maxPlants}</span>
            </div>
            <div>
              <span className="text-gray-600">Plan:</span>
              <span className="ml-2 font-semibold">{currentPlan}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
