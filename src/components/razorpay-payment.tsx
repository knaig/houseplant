'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface RazorpayPaymentProps {
  plan: 'PRO' | 'PRO_PLUS'
  onSuccess?: () => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function RazorpayPayment({ plan, onSuccess }: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false)
  
  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // Create order
      const orderResponse = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      
      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }
      
      const { orderId, amount, currency, key } = await orderResponse.json()
      
      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const options = {
          key: key,
          amount: amount,
          currency: currency,
          name: 'Text From Your Plants',
          description: `${plan} Plan Subscription`,
          order_id: orderId,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  plan,
                }),
              })
              
              if (verifyResponse.ok) {
                toast.success('Payment successful! Your subscription is now active.')
                onSuccess?.()
              } else {
                throw new Error('Payment verification failed')
              }
            } catch (error) {
              console.error('Payment verification error:', error)
              toast.error('Payment verification failed. Please contact support.')
            }
          },
          prefill: {
            name: 'Plant Lover',
            email: 'user@example.com',
          },
          theme: {
            color: '#16a34a',
          },
          modal: {
            ondismiss: function() {
              setLoading(false)
            }
          }
        }
        
        const rzp = new window.Razorpay(options)
        rzp.open()
      }
      
      document.body.appendChild(script)
      
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
      setLoading(false)
    }
  }
  
  const planDetails = {
    PRO: {
      name: 'Pro Plan',
      price: '₹4.99',
      period: '/month',
      features: ['Up to 10 plants', 'WhatsApp messages', 'All personalities', 'Advanced dashboard', 'Priority support']
    },
    PRO_PLUS: {
      name: 'Pro Plus Plan',
      price: '₹9.99',
      period: '/month',
      features: ['Up to 25 plants', 'WhatsApp messages', 'All personalities', 'Advanced dashboard', 'Priority support', 'Analytics']
    }
  }
  
  const details = planDetails[plan]
  
  return (
    <Card className="border-green-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {details.name}
          <Badge className="bg-green-500">Most Popular</Badge>
        </CardTitle>
        <CardDescription>
          Perfect for plant enthusiasts in India
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4">
          {details.price}<span className="text-lg text-gray-500">{details.period}</span>
        </div>
        
        <ul className="space-y-2 mb-6">
          {details.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Processing...' : `Pay ${details.price} with Razorpay`}
        </Button>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Secure payment powered by Razorpay
        </p>
      </CardContent>
    </Card>
  )
}
