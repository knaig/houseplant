import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseInboundMessage, sendSMS, sendWhatsApp, sendConversationMessage } from '@/lib/twilio'
import { getPersonalityMessage } from '@/lib/personalities'
import { inngest, events } from '@/lib/inngest'
import { normalizeIndianNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const body = formData.get('Body') as string
    const from = formData.get('From') as string
    const mediaUrl = formData.get('MediaUrl0') as string
    const conversationSid = formData.get('ConversationSid') as string
    const author = formData.get('Author') as string
    
    // Detect if this is a conversation message
    const isConversationMessage = !!conversationSid
    const isWhatsApp = from.startsWith('whatsapp:')
    const channel = isWhatsApp ? 'WHATSAPP' : 'SMS'
    
    console.log(`Inbound ${isConversationMessage ? 'conversation' : 'individual'} ${channel}:`, { 
      body, from, conversationSid, author, mediaUrl 
    })
    
    let user
    let conversationId = null
    let plantId = null
    
    if (isConversationMessage) {
      // Handle conversation message
      const conversation = await db.conversation.findUnique({
        where: { twilioSid: conversationSid },
        include: {
          user: {
            include: {
              plants: {
                include: {
                  species: true,
                },
              },
            },
          },
        },
      })
      
      if (!conversation || !conversation.isActive) {
        console.log('Conversation not found or inactive:', conversationSid)
        return new NextResponse('Conversation not found', { status: 404 })
      }
      
      user = conversation.user
      conversationId = conversation.id
      
      // Parse plant ID from author if it's a plant
      if (author && author.startsWith('plant_')) {
        plantId = author.replace('plant_', '')
      }
      
    } else {
      // Handle individual message (existing logic)
      const cleanPhone = isWhatsApp ? from.replace('whatsapp:', '') : from
      const normalized = isWhatsApp ? normalizeIndianNumber(cleanPhone) : cleanPhone
      
      user = await db.user.findUnique({
        where: { phoneE164: normalized },
        include: {
          plants: {
            include: {
              species: true,
            },
          },
        },
      })
      
      if (!user) {
        console.log('User not found for phone:', normalized)
        return new NextResponse('User not found', { status: 404 })
      }
    }
    
    // Log the inbound message
    await db.message.create({
      data: {
        userId: user.id,
        plantId: plantId || null,
        direction: 'INBOUND',
        channel: channel,
        body,
        mediaUrl: mediaUrl || null,
        conversationId,
      },
    })
    
    let responseMessage = ''
    let targetPlant = null
    
    // Find the target plant for feedback
    if (plantId) {
      // Use the specific plant from conversation context
      targetPlant = user.plants.find(p => p.id === plantId)
    }
    
    if (!targetPlant) {
      // Fallback to first plant or most recently messaged plant
      targetPlant = user.plants[0]
    }
    
    if (command === 'watered') {
      if (targetPlant) {
        // Trigger feedback processing
        await inngest.send({
          name: 'plant/feedback.processed',
          data: {
            plantId: targetPlant.id,
            feedback: 'watered',
            confidence,
          },
        })
        
        responseMessage = getPersonalityMessage(
          targetPlant.personality,
          'congrats',
          { plantName: targetPlant.name }
        )
      }
      
    } else if (command === 'help') {
      if (targetPlant) {
        responseMessage = getPersonalityMessage(
          targetPlant.personality,
          'help',
          { plantName: targetPlant.name }
        )
      } else {
        responseMessage = "Hi! I'm your plant care assistant. Commands: 'watered' (confirm watering), 'moved' (relocated), 'droopy' (plant looks sad), 'too dry' (soil is dry)."
      }
      
    } else if (command === 'too_dry' || command === 'droopy') {
      if (targetPlant) {
        await inngest.send({
          name: 'plant/feedback.processed',
          data: {
            plantId: targetPlant.id,
            feedback: command,
            confidence,
          },
        })
        
        responseMessage = `Thanks for the feedback! I'll adjust ${targetPlant.name}'s watering schedule.`
      }
      
    } else if (command === 'photo') {
      responseMessage = "Thanks for the photo! I'll keep it on file for your plant's records."
      
    } else {
      responseMessage = "I didn't understand that. Try 'watered', 'help', 'moved', 'droopy', or 'too dry'."
    }
    
    // Send response if we have one
    if (responseMessage) {
      let result
      
      if (isConversationMessage && conversationSid) {
        // Send response to conversation with plant as author
        const conversationResponse = targetPlant 
          ? `${targetPlant.name} 🌱: ${responseMessage}`
          : responseMessage
        
        result = await sendConversationMessage({
          conversationSid,
          author: targetPlant ? `plant_${targetPlant.id}` : 'system',
          body: conversationResponse,
        })
        
        console.log('Conversation response sent:', result)
      } else {
        // Send individual response (existing logic)
        const normalized = isWhatsApp ? normalizeIndianNumber(from.replace('whatsapp:', '')) : from
        
        if (isWhatsApp) {
          result = await sendWhatsApp({
            to: normalized,
            body: responseMessage,
          })
          console.log('WhatsApp response sent:', result)
        } else {
          result = await sendSMS({
            to: normalized,
            body: responseMessage,
          })
          console.log('SMS response sent:', result)
        }
      }
      
      await db.message.create({
        data: {
          userId: user.id,
          plantId: targetPlant?.id || null,
          direction: 'OUTBOUND',
          channel: channel,
          body: result.success ? (isConversationMessage && targetPlant ? `${targetPlant.name} 🌱: ${responseMessage}` : responseMessage) : responseMessage,
          twilioSid: result.success ? result.sid : null,
          conversationId,
        },
      })
    }
    
    return new NextResponse('OK', { status: 200 })
    
  } catch (error) {
    console.error('Error processing inbound message:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
