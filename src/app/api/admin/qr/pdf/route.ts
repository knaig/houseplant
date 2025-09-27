import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { qrCodes } = await request.json()
    
    if (!qrCodes || qrCodes.length === 0) {
      return NextResponse.json({ error: 'No QR codes provided' }, { status: 400 })
    }
    
    // For now, we'll return a simple HTML page that can be printed as PDF
    // In a real app, you'd use a proper PDF library like puppeteer or jsPDF
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Plant QR Stickers</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #16a34a;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .sticker {
              border: 2px solid #16a34a;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              background: white;
            }
            .qr-code {
              width: 120px;
              height: 120px;
              margin: 0 auto 10px;
            }
            .qr-code img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .instructions {
              font-size: 12px;
              color: #666;
              margin-top: 10px;
            }
            .token {
              font-family: monospace;
              font-size: 10px;
              color: #999;
              margin-top: 5px;
            }
            @media print {
              body { margin: 0; }
              .grid { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌱 Text From Your Plants</div>
            <p>QR Stickers for Plant Claiming</p>
          </div>
          
          <div class="grid">
            ${qrCodes.map((item: { qrCode: string; token: string }) => `
              <div class="sticker">
                <div class="qr-code">
                  <img src="${item.qrCode}" alt="QR Code" />
                </div>
                <div class="instructions">
                  Scan to claim your plant
                </div>
                <div class="token">
                  ${item.token.substring(0, 12)}...
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
            <p>Instructions: Cut along the borders and stick on plant pots</p>
            <p>Each QR code is unique and expires in 30 days</p>
          </div>
        </body>
      </html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
