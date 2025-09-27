'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { ProgressIndicator } from '@/components/progress-indicator'
import { LoadingState } from '@/components/loading-state'
import { PlantNameField } from '@/components/plant-name-field'

interface Species {
  id: string
  commonName: string
  latinName?: string
  defaultWaterDays: number
}

interface ClaimFormData {
  name: string
  speciesId: string
  potSizeCm: number
  lightLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  location: string
  personality: 'FUNNY' | 'COACH' | 'ZEN' | 'CLASSIC'
  lastWateredAt: string
}

function ClaimPageContent() {
  const { user, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ClaimFormData>({
    name: '',
    speciesId: '',
    potSizeCm: 15,
    lightLevel: 'MEDIUM',
    location: '',
    personality: 'FUNNY',
    lastWateredAt: new Date().toISOString().split('T')[0],
  })
  
  useEffect(() => {
    if (isLoaded && !user) {
      toast.error('Please sign in to claim a plant')
    }
  }, [isLoaded, user])
  
  useEffect(() => {
    // Load species data
    fetch('/api/species')
      .then(res => res.json())
      .then(data => setSpecies(data))
      .catch(err => console.error('Failed to load species:', err))
  }, [])
  
  // Get selected species for name suggestions
  const selectedSpecies = species.find(s => s.id === formData.speciesId)

  const handleSpeciesChange = (speciesId: string) => {
    setFormData({ 
      ...formData, 
      speciesId,
      name: '' // Clear name when species changes to refresh suggestions
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !token) {
      toast.error('Please sign in and provide a valid token')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/plants/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          ...formData,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to claim plant')
      }
      
      const result = await response.json()
      toast.success('🌱 Plant claimed successfully! You\'ll receive your first WhatsApp reminder soon.')
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/app'
      }, 2000)
      
    } catch (error) {
      console.error('Error claiming plant:', error)
      toast.error('Failed to claim plant. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <LoadingState message="Loading your plant claim page..." size="lg" />
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to sign in to claim your plant. This helps us keep track of your plants and send you personalized reminders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => window.location.href = '/sign-in'}>
              Sign In to Continue
            </Button>
            <p className="text-sm text-gray-500 text-center">
              Don't have an account? <a href="/sign-up" className="text-green-600 hover:underline">Sign up for free</a>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <CardTitle>Invalid QR Code Link</CardTitle>
            <CardDescription>
              This QR code link is invalid or has expired. Please scan a valid QR code from your plant pot.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Make sure you're scanning the QR code correctly with your phone camera.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌱 Claim Your Plant
            </CardTitle>
            <CardDescription>
              Tell us about your new plant friend so we can send personalized reminders. 
              <br/><br/>
              <strong>💡 Tip:</strong> The more accurate information you provide, the better we can care for your plant!
            </CardDescription>
            
            {/* Progress Indicator */}
            <div className="mt-6">
              <ProgressIndicator
                steps={[
                  {
                    id: 'scan',
                    title: 'Scan QR',
                    description: 'QR code scanned',
                    completed: true,
                    current: false
                  },
                  {
                    id: 'info',
                    title: 'Plant Info',
                    description: 'Choose a fun name with suggestions',
                    completed: false,
                    current: true
                  },
                  {
                    id: 'setup',
                    title: 'Setup',
                    description: 'Choose personality',
                    completed: false,
                    current: false
                  },
                  {
                    id: 'complete',
                    title: 'Complete',
                    description: 'Start receiving WhatsApp messages',
                    completed: false,
                    current: false
                  }
                ]}
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Plant Name *</Label>
                <PlantNameField
                  value={formData.name}
                  onChange={(name) => setFormData({ ...formData, name })}
                  speciesCommonName={selectedSpecies?.commonName}
                  personality={formData.personality}
                  disabled={loading}
                  placeholder="Choose a fun name for your plant..."
                />
                <p className="text-sm text-gray-500">Give your plant a fun name! This will appear in your WhatsApp messages.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="species">Plant Species *</Label>
                <Select
                  value={formData.speciesId}
                  onValueChange={handleSpeciesChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your plant species" />
                  </SelectTrigger>
                  <SelectContent>
                    {species.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.commonName} {s.latinName && `(${s.latinName})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">This helps us determine the right watering schedule for your plant.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="potSize">Pot Size (cm) *</Label>
                  <Input
                    id="potSize"
                    type="number"
                    value={formData.potSizeCm}
                    onChange={(e) => setFormData({ ...formData, potSizeCm: parseInt(e.target.value) })}
                    min="5"
                    max="50"
                    required
                  />
                  <p className="text-sm text-gray-500">Measure the diameter of your pot</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lightLevel">Light Level *</Label>
                  <Select
                    value={formData.lightLevel}
                    onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => 
                      setFormData({ ...formData, lightLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select light level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low Light (shady corner)</SelectItem>
                      <SelectItem value="MEDIUM">Medium Light (near window)</SelectItem>
                      <SelectItem value="HIGH">High Light (bright window)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">How much light does your plant get?</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Living room, Kitchen window"
                />
                <p className="text-sm text-gray-500">Where is your plant located? This helps us understand its environment.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="personality">Plant Personality *</Label>
                <Select
                  value={formData.personality}
                  onValueChange={(value: 'FUNNY' | 'COACH' | 'ZEN' | 'CLASSIC') => 
                    setFormData({ ...formData, personality: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FUNNY">
                      <div className="flex items-center gap-2">
                        <span>😄 Funny</span>
                        <Badge variant="secondary">Casual & playful</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="COACH">
                      <div className="flex items-center gap-2">
                        <span>💪 Coach</span>
                        <Badge variant="secondary">Motivational</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="ZEN">
                      <div className="flex items-center gap-2">
                        <span>🧘‍♀️ Zen</span>
                        <Badge variant="secondary">Calm & mindful</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="CLASSIC">
                      <div className="flex items-center gap-2">
                        <span>🌿 Classic</span>
                        <Badge variant="secondary">Simple & clear</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">Choose how your plant will communicate with you via WhatsApp.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastWatered">Last Watered *</Label>
                <Input
                  id="lastWatered"
                  type="date"
                  value={formData.lastWateredAt}
                  onChange={(e) => setFormData({ ...formData, lastWateredAt: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500">When did you last water this plant? This helps us calculate the next reminder.</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">🎉 Almost Done!</h4>
                <p className="text-sm text-blue-700">
                  Once you claim your plant, you'll receive personalized WhatsApp messages based on your plant's needs. 
                  You can always update these settings later in your dashboard.
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Claiming Plant...' : 'Claim My Plant 🌱'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <LoadingState message="Loading your plant claim page..." size="lg" />
      </div>
    }>
      <ClaimPageContent />
    </Suspense>
  )
}
