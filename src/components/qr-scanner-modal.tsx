"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CameraIcon, 
  FlashlightIcon, 
  RotateCcwIcon,
  AlertCircleIcon,
  CheckCircleIcon 
} from 'lucide-react'
import { 
  extractTokenFromQR, 
  validateQRToken, 
  processQRCode,
  QR_ERROR_MESSAGES,
  supportsQRScanning 
} from '@/lib/qr-utils'
import { toast } from 'sonner'

interface QRScannerModalProps {
  open: boolean
  onQRCodeScanned: (token: string) => void
  onClose: () => void
  onError?: (error: string) => void
  onManualEntry?: () => void
}

interface CameraState {
  hasCamera: boolean
  hasPermission: boolean
  isLoading: boolean
  error?: string
  devices: MediaDeviceInfo[]
  selectedDeviceId: string | null
}

export function QRScannerModal({ 
  open, 
  onQRCodeScanned, 
  onClose, 
  onError,
  onManualEntry 
}: QRScannerModalProps) {
  const [cameraState, setCameraState] = useState<CameraState>({
    hasCamera: false,
    hasPermission: false,
    isLoading: true,
    devices: [],
    selectedDeviceId: null
  })
  const [isScanning, setIsScanning] = useState(false)
  const [scannedToken, setScannedToken] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)

  // Check camera support and permissions on mount
  useEffect(() => {
    if (!open) return

    const checkCameraSupport = async () => {
      setCameraState(prev => ({ ...prev, isLoading: true, error: undefined }))

      try {
        // Check if browser supports QR scanning
        if (!supportsQRScanning()) {
          throw new Error('Camera-based QR scanning is not supported in this browser')
        }

        // Check for camera availability
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        
        if (videoDevices.length === 0) {
          throw new Error('No camera found on this device')
        }

        // Find the back camera (environment facing) as default
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        )
        const defaultDeviceId = backCamera?.deviceId || videoDevices[0].deviceId

        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        })
        
        // Stop the test stream immediately
        stream.getTracks().forEach(track => track.stop())

        setCameraState({
          hasCamera: true,
          hasPermission: true,
          isLoading: false,
          devices: videoDevices,
          selectedDeviceId: defaultDeviceId
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to access camera'
        
        setCameraState({
          hasCamera: false,
          hasPermission: false,
          isLoading: false,
          error: errorMessage,
          devices: [],
          selectedDeviceId: null
        })

        onError?.(errorMessage)
      }
    }

    checkCameraSupport()
  }, [open, onError])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setScannedToken(null)
      setShowSuccess(false)
      setIsScanning(false)
      setTorchEnabled(false)
      setCameraState(prev => ({
        ...prev,
        devices: [],
        selectedDeviceId: null
      }))
    }
  }, [open])

  const handleQRCodeDetected = useCallback((result: string) => {
    if (!result || isScanning) return

    setIsScanning(true)

    try {
      // Process the QR code data
      const processingResult = processQRCode(result)
      
      if (!processingResult.isValid) {
        toast.error(processingResult.error || QR_ERROR_MESSAGES.INVALID_FORMAT)
        setIsScanning(false)
        return
      }

      const token = processingResult.token!
      
      // Show success feedback
      setScannedToken(token)
      setShowSuccess(true)
      
      // Auto-close after a brief success display
      setTimeout(() => {
        onQRCodeScanned(token)
        onClose()
      }, 1000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process QR code'
      toast.error(errorMessage)
      onError?.(errorMessage)
      setIsScanning(false)
    }
  }, [isScanning, onQRCodeScanned, onClose, onError])

  const handleError = useCallback((error: unknown) => {
    console.error('QR Scanner error:', error)
    toast.error('Camera error occurred while scanning')
    onError?.(error instanceof Error ? error.message : 'Unknown error')
  }, [onError])

  const handleManualEntry = () => {
    onClose()
    onManualEntry?.()
  }

  const toggleTorch = () => {
    setTorchEnabled(prev => !prev)
  }

  const switchCamera = (deviceId: string) => {
    setCameraState(prev => ({
      ...prev,
      selectedDeviceId: deviceId
    }))
  }

  const renderCameraError = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircleIcon className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {cameraState.error || 'Unable to access camera for QR scanning'}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handleManualEntry}>
          Enter Token Manually
        </Button>
      </div>
    </div>
  )

  const renderSuccessState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">QR Code Scanned!</h3>
      <p className="text-sm text-muted-foreground">
        Valid token detected. Redirecting...
      </p>
    </div>
  )

  const renderScanner = () => (
    <div className="relative">
      {/* Scanner Container */}
      <div className="relative w-full max-w-md mx-auto aspect-square rounded-lg overflow-hidden bg-black">
        {cameraState.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <Scanner
            onScan={(detectedCodes) => {
              if (detectedCodes.length > 0) {
                handleQRCodeDetected(detectedCodes[0].rawValue)
              }
            }}
            onError={handleError}
            styles={{
              container: {
                width: '100%',
                height: '100%'
              },
              video: {
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }
            }}
            constraints={cameraState.selectedDeviceId ? 
              { deviceId: { exact: cameraState.selectedDeviceId } } :
              { facingMode: 'environment' }
            }
            scanDelay={300}
          />
        )}

        {/* Scanner Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Finder Frame */}
          <div className="absolute inset-4 border-2 border-white rounded-lg">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
          </div>

          {/* Scanning Line Animation */}
          {isScanning && (
            <div className="absolute left-4 right-4 h-0.5 bg-green-400 animate-pulse"></div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              Point camera at QR code
            </p>
          </div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="space-y-3 mt-4">
        {/* Camera Selection */}
        {cameraState.devices.length > 1 && (
          <div className="flex justify-center">
            <Select
              value={cameraState.selectedDeviceId || ''}
              onValueChange={switchCamera}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Camera" />
              </SelectTrigger>
              <SelectContent>
                {cameraState.devices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTorch}
            disabled={cameraState.isLoading}
          >
            <FlashlightIcon className="h-4 w-4" />
            {torchEnabled ? 'Torch On' : 'Torch Off'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualEntry}
          >
            <CameraIcon className="h-4 w-4" />
            Manual Entry
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Point your camera at a plant token QR code to add it to your collection.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {showSuccess ? (
            renderSuccessState()
          ) : cameraState.error ? (
            renderCameraError()
          ) : (
            renderScanner()
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          {cameraState.error && (
            <Button onClick={handleManualEntry} className="w-full sm:w-auto">
              Enter Token Manually
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
