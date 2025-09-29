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

export function ClaimPageContent({ token }: { token: string }) {
  const { user, isLoaded } = useUser()
  
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
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load species: ${res.status} ${res.statusText}`)
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setSpecies(data)
        } else {
          console.error('Invalid species data format:', data)
          setSpecies([])
        }
      })
      .catch(err => {
        console.error('Failed to load species:', err)
        setSpecies([]) // Set empty array to prevent form from being completely broken
      })
  }, [])
  
  // Get selected species for name suggestions
  const selectedSpecies = species.find(s => s.id === formData.speciesId)

  const handleSpeciesChange = (speciesId: string) => {
    setFormData({ 
      ...formData, 
      speciesId
      // Don't clear the name - let the user keep their input
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
        let errorMessage = 'Failed to claim plant'
        let errorDetails = {}
        
        try {
          const errorData = await response.json()
          console.error('Claim API error details:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            errorData,
            timestamp: new Date().toISOString()
          })
          errorMessage = errorData.error || errorMessage
          errorDetails = errorData
        } catch (parseError) {
          console.error('Failed to parse error response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
            timestamp: new Date().toISOString()
          })
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        // Log the full error context
        console.error('Plant claim failed:', {
          errorMessage,
          errorDetails,
          requestData: { token, ...formData },
          timestamp: new Date().toISOString()
        })
        
        throw new Error(errorMessage)
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-12 max-w-lg sm:max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="pb-6 sm:pb-8 px-4 sm:px-8">
            <CardTitle className="flex items-center gap-3 text-xl sm:text-3xl">
              🌱 Claim Your Plant
            </CardTitle>
            <CardDescription className="text-base sm:text-lg leading-relaxed">
              <span className="hidden sm:inline">Tell us about your new plant friend so we can send personalized reminders.</span>
              <span className="sm:hidden">Tell us about your plant!</span>
              <br className="hidden sm:block"/>
              <br className="hidden sm:block"/>
              <strong className="hidden sm:inline">💡 Tip:</strong> <span className="hidden sm:inline">The more accurate information you provide, the better we can care for your plant!</span>
            </CardDescription>
            
            {/* Progress Indicator - 8px Grid */}
            <div className="mt-6 sm:mt-8">
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
                    description: 'Select species & name auto-generates',
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
          <CardContent className="px-4 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="space-y-3">
                <Label htmlFor="species" className="text-base font-medium">Plant Species *</Label>
                <Select
                  value={formData.speciesId}
                  onValueChange={handleSpeciesChange}
                  required
                >
                  <SelectTrigger className="h-14 text-base">
                    <SelectValue placeholder="Select your plant species" />
                  </SelectTrigger>
                  <SelectContent>
                    {species.length > 0 ? (
                      species.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.commonName} {s.latinName && `(${s.latinName})`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-species" disabled>
                        No species available - please refresh the page
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  <span className="sm:hidden">Helps determine watering schedule</span>
                  <span className="hidden sm:inline">This helps us determine the right watering schedule for your plant.</span>
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-medium">Plant Name *</Label>
                <PlantNameField
                  value={formData.name}
                  onChange={(name) => setFormData({ ...formData, name })}
                  speciesCommonName={selectedSpecies?.commonName}
                  personality={formData.personality}
                  disabled={loading}
                  placeholder="Choose a fun name for your plant..."
                />
                <p className="text-sm text-gray-500">
                  <span className="sm:hidden">Fun name for WhatsApp messages</span>
                  <span className="hidden sm:inline">Give your plant a fun name! This will appear in your WhatsApp messages.</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-3">
                  <Label htmlFor="potSize" className="text-base font-medium">Pot Size (cm) *</Label>
                  <Input
                    id="potSize"
                    type="number"
                    value={formData.potSizeCm}
                    onChange={(e) => setFormData({ ...formData, potSizeCm: parseInt(e.target.value) })}
                    min="5"
                    max="50"
                    required
                    className="h-14 text-base"
                  />
                  <p className="text-sm text-gray-500">
                    <span className="sm:hidden">Pot diameter</span>
                    <span className="hidden sm:inline">Measure the diameter of your pot</span>
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="lightLevel" className="text-base font-medium">Light Level *</Label>
                  <Select
                    value={formData.lightLevel}
                    onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => 
                      setFormData({ ...formData, lightLevel: value })
                    }
                  >
                    <SelectTrigger className="h-14 text-base">
                      <SelectValue placeholder="Select light level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low Light (shady corner)</SelectItem>
                      <SelectItem value="MEDIUM">Medium Light (near window)</SelectItem>
                      <SelectItem value="HIGH">High Light (bright window)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    <span className="sm:hidden">How much light?</span>
                    <span className="hidden sm:inline">How much light does your plant get?</span>
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="location" className="text-base font-medium">Location (optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Living room, Kitchen window"
                  className="h-14 text-base"
                />
                <p className="text-sm text-gray-500">
                  <span className="sm:hidden">Where is it?</span>
                  <span className="hidden sm:inline">Where is your plant located? This helps us understand its environment.</span>
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="personality" className="text-base font-medium">Plant Personality *</Label>
                <Select
                  value={formData.personality}
                  onValueChange={(value: 'FUNNY' | 'COACH' | 'ZEN' | 'CLASSIC') => 
                    setFormData({ ...formData, personality: value })
                  }
                >
                  <SelectTrigger className="h-14 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FUNNY">
                      <div className="flex items-center gap-2">
                        <span>😄 Funny</span>
                        <Badge variant="secondary" className="text-xs">Casual & playful</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="COACH">
                      <div className="flex items-center gap-2">
                        <span>💪 Coach</span>
                        <Badge variant="secondary" className="text-xs">Motivational</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="ZEN">
                      <div className="flex items-center gap-2">
                        <span>🧘‍♀️ Zen</span>
                        <Badge variant="secondary" className="text-xs">Calm & mindful</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="CLASSIC">
                      <div className="flex items-center gap-2">
                        <span>🌿 Classic</span>
                        <Badge variant="secondary" className="text-xs">Simple & clear</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  <span className="sm:hidden">How it communicates</span>
                  <span className="hidden sm:inline">Choose how your plant will communicate with you via WhatsApp.</span>
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="lastWatered" className="text-base font-medium">Last Watered *</Label>
                <Input
                  id="lastWatered"
                  type="date"
                  value={formData.lastWateredAt}
                  onChange={(e) => setFormData({ ...formData, lastWateredAt: e.target.value })}
                  required
                  className="h-14 text-base"
                />
                <p className="text-sm text-gray-500">
                  <span className="sm:hidden">When did you water it?</span>
                  <span className="hidden sm:inline">When did you last water this plant? This helps us calculate the next reminder.</span>
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 sm:p-8">
                <h4 className="font-semibold text-blue-800 mb-3 sm:mb-4 text-base sm:text-lg">🎉 Almost Done!</h4>
                <p className="text-sm sm:text-base text-blue-700">
                  <span className="sm:hidden">You'll get WhatsApp reminders based on your plant's needs.</span>
                  <span className="hidden sm:inline">Once you claim your plant, you'll receive personalized WhatsApp messages based on your plant's needs. You can always update these settings later in your dashboard.</span>
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-16 text-lg font-medium touch-manipulation" 
                disabled={loading || species.length === 0 || !formData.speciesId || !formData.name.trim()}
              >
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
