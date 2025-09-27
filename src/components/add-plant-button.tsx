'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QRScannerModal } from '@/components/qr-scanner-modal'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { validateQRToken, sanitizeQRInput } from '@/lib/qr-utils'

interface AddPlantButtonProps {
  currentCount: number
  maxPlants: number
  userPlan: string
}

export function AddPlantButton({ currentCount, maxPlants, userPlan }: AddPlantButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [showQRScanner, setShowQRScanner] = useState(false)
  
  const canAddPlant = currentCount < maxPlants
  
  const handleQRScan = () => {
    setShowQRScanner(true)
  }

  const handleQRCodeScanned = (token: string) => {
    setShowQRScanner(false)
    // Redirect to claim page with the scanned token
    router.push(`/claim?token=${token}`)
  }

  const handleScannerError = (error: string) => {
    toast.error(`QR Scanner Error: ${error}`)
    // Optionally fall back to manual entry
    setOpen(true)
  }

  const handleScannerClose = () => {
    setShowQRScanner(false)
  }
  
  const handleManualAdd = () => {
    setOpen(true)
  }
  
  const handleUpgrade = () => {
    // Redirect to billing page
    router.push('/app/settings')
  }
  
  if (!canAddPlant) {
    return (
      <div className="text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-yellow-800 mb-2">🌱 Plant Limit Reached</h4>
          <p className="text-sm text-yellow-700 mb-2">
            You&apos;ve reached your plant limit ({maxPlants} plants) on the {userPlan} plan.
          </p>
          <p className="text-sm text-yellow-700">
            Upgrade to add more plants and unlock advanced features!
          </p>
        </div>
        <Button onClick={handleUpgrade} className="w-full">
          Upgrade Plan
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">🌱 Add Your Plant</h4>
        <p className="text-sm text-green-700 mb-3">
          You can add {maxPlants - currentCount} more plant{maxPlants - currentCount !== 1 ? 's' : ''} on your {userPlan} plan.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleQRScan} variant="outline" className="flex-1">
            📱 Scan QR Code
          </Button>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                ➕ Add Manually
              </Button>
            </DialogTrigger>
            
            <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Plant Manually</DialogTitle>
            <DialogDescription>
              Enter your plant details to get started with WhatsApp messages. 
              <br/><br/>
              <strong>💡 Tip:</strong> If you have a QR sticker, scan it instead for easier setup!
              <br/><br/>
              <strong>✨ Enhanced Experience:</strong> After entering your QR token, you'll be able to choose from fun name suggestions tailored to your plant species and personality!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qrCode">QR Code Token</Label>
              <Input
                id="qrCode"
                placeholder="Enter QR code token (e.g., abc123def456)"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                className={qrCode && validateQRToken(sanitizeQRInput(qrCode)) ? 'border-green-500' : ''}
              />
              {qrCode && validateQRToken(sanitizeQRInput(qrCode)) && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  ✓ Valid token format
                </p>
              )}
              {qrCode && !validateQRToken(sanitizeQRInput(qrCode)) && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  ✗ Invalid token format
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  const sanitizedToken = sanitizeQRInput(qrCode)
                  if (validateQRToken(sanitizedToken)) {
                    router.push(`/claim?token=${sanitizedToken}`)
                  } else {
                    toast.error('Please enter a valid QR code token')
                  }
                }}
                className="flex-1"
                disabled={!qrCode || !validateQRToken(sanitizeQRInput(qrCode))}
              >
                Continue to Setup
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        open={showQRScanner}
        onQRCodeScanned={handleQRCodeScanned}
        onClose={handleScannerClose}
        onError={handleScannerError}
        onManualEntry={() => setOpen(true)}
      />
    </div>
  )
}
