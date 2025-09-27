import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes Indian mobile numbers to E.164 format
 * Handles various input formats: 9876543210, 09876543210, +919876543210, etc.
 */
export function normalizeIndianNumber(phoneInput: string): string {
  // Remove all non-digit characters except +
  let cleaned = phoneInput.replace(/[^\d+]/g, '')
  
  // Handle different input formats
  if (cleaned.startsWith('+91')) {
    // Already has country code
    cleaned = cleaned.substring(3)
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    // Has country code without +
    cleaned = cleaned.substring(2)
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // Has leading zero
    cleaned = cleaned.substring(1)
  }
  
  // Validate Indian mobile number format
  if (cleaned.length !== 10) {
    throw new Error('Indian mobile number must be 10 digits')
  }
  
  // Check if it starts with valid Indian mobile prefixes (6, 7, 8, 9)
  if (!/^[6-9]/.test(cleaned)) {
    throw new Error('Indian mobile number must start with 6, 7, 8, or 9')
  }
  
  // Return in E.164 format
  return `+91${cleaned}`
}

/**
 * Formats phone number for WhatsApp messaging
 */
export function formatPhoneForWhatsApp(phoneE164: string): string {
  return `whatsapp:${phoneE164}`
}

/**
 * Validates if a number follows Indian mobile format
 */
export function validateIndianMobile(phoneInput: string): boolean {
  try {
    normalizeIndianNumber(phoneInput)
    return true
  } catch {
    return false
  }
}
