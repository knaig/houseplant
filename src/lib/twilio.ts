import twilio from 'twilio'
import { env } from './env'
import { formatPhoneForWhatsApp } from './utils'
import { db } from './db'

// Lazy initialization of Twilio client
let client: any = null

function getTwilioClient() {
  if (!client && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  }
  return client
}

export function getConversationService() {
  const twilioClient = getTwilioClient()
  if (!twilioClient) {
    throw new Error('Twilio client not initialized. Check environment variables.')
  }
  return twilioClient.conversations.v1
}

export interface SendSMSOptions {
  to: string
  body: string
  from?: string
}

export interface SendWhatsAppOptions {
  to: string
  body: string
  mediaUrl?: string
  from?: string
}

export interface ConversationOptions {
  friendlyName: string
  messagingServiceSid: string
}

export interface ConversationMessageOptions {
  conversationSid: string
  author: string
  body: string
  mediaUrl?: string
}

export interface ConversationParticipantOptions {
  conversationSid: string
  identity: string
  messagingBinding?: {
    type: 'sms' | 'whatsapp'
    address: string
  }
}

export async function sendSMS({ to, body, from }: SendSMSOptions) {
  try {
    const twilioClient = getTwilioClient()
    if (!twilioClient) {
      return {
        success: false,
        error: 'Twilio client not initialized. Check environment variables.'
      }
    }

    const messageOptions: any = {
      body,
      to,
      from: from || env.TWILIO_MESSAGING_SERVICE_SID,
      messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID,
    }
    
    if (env.TWILIO_STATUS_CALLBACK_URL) {
      messageOptions.statusCallback = env.TWILIO_STATUS_CALLBACK_URL
    }
    
    const message = await twilioClient.messages.create(messageOptions)
    
    return {
      success: true,
      sid: message.sid,
      status: message.status
    }
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function sendWhatsApp({ to, body, mediaUrl, from }: SendWhatsAppOptions) {
  try {
    const twilioClient = getTwilioClient()
    if (!twilioClient) {
      return {
        success: false,
        error: 'Twilio client not initialized. Check environment variables.'
      }
    }

    // Ensure phone number has whatsapp: prefix
    const whatsappTo = to.startsWith('whatsapp:') ? to : formatPhoneForWhatsApp(to)
    const whatsappFrom = from || env.TWILIO_WHATSAPP_FROM
    
    const messageOptions: any = {
      body,
      to: whatsappTo,
      from: whatsappFrom,
    }
    
    // Add media URL if provided
    if (mediaUrl) {
      messageOptions.mediaUrl = [mediaUrl]
    }
    
    if (env.TWILIO_STATUS_CALLBACK_URL) {
      messageOptions.statusCallback = env.TWILIO_STATUS_CALLBACK_URL
    }
    
    const message = await twilioClient.messages.create(messageOptions)
    
    return {
      success: true,
      sid: message.sid,
      status: message.status
    }
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function sendMessage(
  channel: 'SMS' | 'WHATSAPP',
  options: SendSMSOptions | SendWhatsAppOptions
) {
  if (channel === 'WHATSAPP') {
    return sendWhatsApp(options as SendWhatsAppOptions)
  } else {
    return sendSMS(options as SendSMSOptions)
  }
}

export function parseInboundMessage(body: string): {
  command: 'watered' | 'moved' | 'droopy' | 'too_dry' | 'photo' | 'help' | 'unknown'
  confidence: number
} {
  const normalizedBody = body.toLowerCase().trim()
  
  // High confidence matches
  if (normalizedBody === 'watered' || normalizedBody === 'done') {
    return { command: 'watered', confidence: 1.0 }
  }
  
  if (normalizedBody === 'help') {
    return { command: 'help', confidence: 1.0 }
  }
  
  // Medium confidence fuzzy matches
  const wateredPatterns = [
    /watered/i,
    /done watering/i,
    /just watered/i,
    /watered it/i,
    /gave water/i
  ]
  
  const movedPatterns = [
    /moved/i,
    /relocated/i,
    /new spot/i
  ]
  
  const droopyPatterns = [
    /droopy/i,
    /wilting/i,
    /sad/i,
    /unhappy/i
  ]
  
  const tooDryPatterns = [
    /too dry/i,
    /very dry/i,
    /parched/i,
    /thirsty/i
  ]
  
  const photoPatterns = [
    /photo/i,
    /picture/i,
    /image/i
  ]
  
  for (const pattern of wateredPatterns) {
    if (pattern.test(normalizedBody)) {
      return { command: 'watered', confidence: 0.8 }
    }
  }
  
  for (const pattern of movedPatterns) {
    if (pattern.test(normalizedBody)) {
      return { command: 'moved', confidence: 0.8 }
    }
  }
  
  for (const pattern of droopyPatterns) {
    if (pattern.test(normalizedBody)) {
      return { command: 'droopy', confidence: 0.8 }
    }
  }
  
  for (const pattern of tooDryPatterns) {
    if (pattern.test(normalizedBody)) {
      return { command: 'too_dry', confidence: 0.8 }
    }
  }
  
  for (const pattern of photoPatterns) {
    if (pattern.test(normalizedBody)) {
      return { command: 'photo', confidence: 0.8 }
    }
  }
  
  return { command: 'unknown', confidence: 0.0 }
}

export async function createConversation({ friendlyName, messagingServiceSid }: ConversationOptions) {
  try {
    const twilioClient = getTwilioClient()
    if (!twilioClient) {
      return {
        success: false,
        error: 'Twilio client not initialized. Check environment variables.'
      }
    }

    const conversation = await twilioClient.conversations.v1.conversations.create({
      friendlyName,
      messagingServiceSid,
    })
    
    return {
      success: true,
      sid: conversation.sid,
      status: conversation.state
    }
  } catch (error) {
    console.error('Failed to create conversation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function addConversationParticipant({ conversationSid, identity, messagingBinding }: ConversationParticipantOptions) {
  try {
    const twilioClient = getTwilioClient()
    if (!twilioClient) {
      return {
        success: false,
        error: 'Twilio client not initialized. Check environment variables.'
      }
    }

    const participantOptions: any = {
      conversationSid,
      identity,
    }
    
    if (messagingBinding) {
      participantOptions.messagingBinding = messagingBinding
    }
    
    const participant = await twilioClient.conversations.v1.conversations(conversationSid).participants.create(participantOptions)
    
    return {
      success: true,
      sid: participant.sid,
      status: participant.state
    }
  } catch (error) {
    console.error('Failed to add conversation participant:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function sendConversationMessage({ conversationSid, author, body, mediaUrl }: ConversationMessageOptions) {
  try {
    const twilioClient = getTwilioClient()
    if (!twilioClient) {
      return {
        success: false,
        error: 'Twilio client not initialized. Check environment variables.'
      }
    }

    const messageOptions: any = {
      conversationSid,
      author,
      body,
    }
    
    if (mediaUrl) {
      messageOptions.mediaSid = mediaUrl
    }
    
    const message = await twilioClient.conversations.v1.conversations(conversationSid).messages.create(messageOptions)
    
    return {
      success: true,
      sid: message.sid,
      status: message.delivery?.status || 'sent'
    }
  } catch (error) {
    console.error('Failed to send conversation message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getOrCreateUserConversation(user: { id: string; phoneE164: string | null; plants: Array<{ id: string; name: string; personality: string }> }) {
  try {
    // Check if user already has an active conversation
    const existingConversation = await db.conversation.findUnique({
      where: { userId: user.id },
    })
    
    if (existingConversation && existingConversation.isActive) {
      return {
        success: true,
        conversationSid: existingConversation.twilioSid,
        isNew: false
      }
    }
    
    if (!user.phoneE164) {
      return {
        success: false,
        error: 'User phone number required for WhatsApp conversation'
      }
    }
    
    // Create new conversation
    const conversationResult = await createConversation({
      friendlyName: 'Plant Family',
      messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID,
    })
    
    if (!conversationResult.success) {
      return conversationResult
    }
    
    const conversationSid = conversationResult.sid!
    
    // Add user as participant
    const userParticipantResult = await addConversationParticipant({
      conversationSid,
      identity: user.phoneE164,
      messagingBinding: {
        type: 'whatsapp',
        address: formatPhoneForWhatsApp(user.phoneE164)
      }
    })
    
    if (!userParticipantResult.success) {
      console.error('Failed to add user participant:', userParticipantResult.error)
      // Continue anyway, user can still receive messages
    }
    
    // Add plants as virtual participants
    for (const plant of user.plants) {
      const plantParticipantResult = await addConversationParticipant({
        conversationSid,
        identity: `plant_${plant.id}`,
      })
      
      if (!plantParticipantResult.success) {
        console.error(`Failed to add plant ${plant.name} participant:`, plantParticipantResult.error)
      }
    }
    
    // Store conversation in database
    const conversation = await db.conversation.create({
      data: {
        userId: user.id,
        twilioSid: conversationSid,
        name: 'Plant Family',
        isActive: true,
      },
    })
    
    return {
      success: true,
      conversationSid,
      isNew: true,
      conversationId: conversation.id
    }
  } catch (error) {
    console.error('Failed to get or create user conversation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
