'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function QRGenerationPage() {
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [qrCodes, setQrCodes] = useState<Array<{ token: string; qrCode: string }>>([])
  
  const generateQRCodes = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate QR codes')
      }
      
      const data = await response.json()
      setQrCodes(data.qrCodes)
      toast.success(`Generated ${data.qrCodes.length} QR codes`)
      
    } catch (error) {
      console.error('Error generating QR codes:', error)
      toast.error('Failed to generate QR codes')
    } finally {
      setLoading(false)
    }
  }
  
  const downloadPDF = async () => {
    try {
      const response = await fetch('/api/admin/qr/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodes }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plant-qr-stickers.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('PDF downloaded successfully')
      
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download PDF')
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Generate QR Stickers</CardTitle>
            <CardDescription>
              Create QR codes for plant stickers that users can scan to claim their plants
            </CardDescription>
            
            {/* Instructions */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">📋 How to Use QR Stickers:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li><strong>1. Generate QR codes</strong> - Create the number you need</li>
                <li><strong>2. Download PDF</strong> - Print the stickers on waterproof paper</li>
                <li><strong>3. Attach to pots</strong> - Stick one QR code per plant pot</li>
                <li><strong>4. Users scan</strong> - Customers scan to claim their plants</li>
              </ol>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="count">Number of QR Codes *</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                min="1"
                max="100"
                placeholder="Enter number of QR codes to generate"
              />
              <p className="text-sm text-gray-500">
                Generate between 1-100 QR codes at a time. Each QR code is unique and can only be used once.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={generateQRCodes} disabled={loading}>
                {loading ? 'Generating...' : 'Generate QR Codes'}
              </Button>
              
              {qrCodes.length > 0 && (
                <Button onClick={downloadPDF} variant="outline">
                  Download PDF Sheet
                </Button>
              )}
            </div>
            
            {qrCodes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Generated QR Codes ({qrCodes.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {qrCodes.map((item, index) => (
                    <div key={index} className="text-center space-y-2">
                      <div className="bg-white p-2 rounded border">
                        <img 
                          src={item.qrCode} 
                          alt={`QR Code ${index + 1}`}
                          className="w-full h-auto"
                        />
                      </div>
                      <p className="text-xs text-gray-600 font-mono">
                        {item.token.substring(0, 8)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
