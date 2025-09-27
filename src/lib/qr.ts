import QRCode from 'qrcode'
import { env } from './env'

export interface QRCodeOptions {
  token: string
  plantTemplate?: {
    speciesId?: string
    potSizeCm?: number
    lightLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
  }
}

export async function generateQRCode(options: QRCodeOptions): Promise<string> {
  const claimUrl = `${env.APP_BASE_URL}/claim?token=${options.token}`
  
  const qrCodeDataURL = await QRCode.toDataURL(claimUrl, {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })
  
  return qrCodeDataURL
}

export async function generateQRCodeSVG(options: QRCodeOptions): Promise<string> {
  const claimUrl = `${env.APP_BASE_URL}/claim?token=${options.token}`
  
  const qrCodeSVG = await QRCode.toString(claimUrl, {
    type: 'svg',
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })
  
  return qrCodeSVG
}

export function createClaimToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}
