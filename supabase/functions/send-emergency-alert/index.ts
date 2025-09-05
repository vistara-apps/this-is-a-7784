import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertContact {
  id: string
  name: string
  method: 'sms' | 'email' | 'whatsapp'
  value: string
  relationship?: string
  priority?: string
}

interface AlertData {
  userId: string
  userEmail: string
  timestamp: string
  location?: {
    latitude: number
    longitude: number
    accuracy?: number
  }
  message: string
  recordingLink?: string
  contacts: AlertContact[]
  urgencyLevel: 'low' | 'medium' | 'high'
  isTest?: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const alertData: AlertData = await req.json()
    
    // Validate required fields
    if (!alertData.userId || !alertData.contacts || alertData.contacts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const results = []
    const errors = []

    // Send alerts to each contact
    for (const contact of alertData.contacts) {
      try {
        let success = false
        
        switch (contact.method) {
          case 'sms':
            success = await sendSMS(contact.value, alertData.message, alertData.isTest)
            break
          case 'email':
            success = await sendEmail(contact.value, contact.name, alertData, alertData.isTest)
            break
          case 'whatsapp':
            success = await sendWhatsApp(contact.value, alertData.message, alertData.isTest)
            break
          default:
            throw new Error(`Unsupported contact method: ${contact.method}`)
        }

        results.push({
          contactId: contact.id,
          method: contact.method,
          success,
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        console.error(`Failed to send alert to ${contact.name}:`, error)
        errors.push({
          contactId: contact.id,
          method: contact.method,
          error: error.message
        })
      }
    }

    // Log the alert attempt
    if (!alertData.isTest) {
      await logAlert(alertData, results, errors)
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        errors,
        totalSent: results.filter(r => r.success).length,
        totalFailed: errors.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Alert function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function sendSMS(phoneNumber: string, message: string, isTest = false): Promise<boolean> {
  // In a real implementation, you would use a service like Twilio
  // For now, we'll simulate the SMS sending
  
  if (isTest) {
    console.log(`TEST SMS to ${phoneNumber}: ${message}`)
    return true
  }

  // Example Twilio integration (you would need to set up Twilio credentials)
  /*
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: fromNumber,
      To: phoneNumber,
      Body: message,
    }),
  })

  return response.ok
  */

  // Simulate success for demo
  console.log(`SMS would be sent to ${phoneNumber}: ${message}`)
  return true
}

async function sendEmail(email: string, name: string, alertData: AlertData, isTest = false): Promise<boolean> {
  if (isTest) {
    console.log(`TEST EMAIL to ${email}: Test alert from KnowYourRights Card`)
    return true
  }

  // In a real implementation, you would use a service like SendGrid, Resend, or similar
  const subject = '🚨 EMERGENCY ALERT - KnowYourRights Card'
  const htmlContent = generateEmailHTML(name, alertData)

  // Example with Resend (you would need to set up Resend API key)
  /*
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'alerts@knowyourrightscard.com',
      to: [email],
      subject,
      html: htmlContent,
    }),
  })

  return response.ok
  */

  // Simulate success for demo
  console.log(`EMAIL would be sent to ${email}: ${subject}`)
  return true
}

async function sendWhatsApp(phoneNumber: string, message: string, isTest = false): Promise<boolean> {
  if (isTest) {
    console.log(`TEST WHATSAPP to ${phoneNumber}: ${message}`)
    return true
  }

  // In a real implementation, you would use WhatsApp Business API
  // This requires approval and setup with Meta/WhatsApp
  
  // Simulate success for demo
  console.log(`WHATSAPP would be sent to ${phoneNumber}: ${message}`)
  return true
}

function generateEmailHTML(name: string, alertData: AlertData): string {
  const locationLink = alertData.location 
    ? `https://maps.google.com/maps?q=${alertData.location.latitude},${alertData.location.longitude}`
    : null

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Emergency Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .alert-header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .alert-content { padding: 20px; }
        .location-link { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { background: #f3f4f6; padding: 15px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="alert-header">
        <h1>🚨 EMERGENCY ALERT</h1>
      </div>
      
      <div class="alert-content">
        <p><strong>Dear ${name},</strong></p>
        
        <p>You are receiving this emergency alert from <strong>${alertData.userEmail}</strong> via KnowYourRights Card.</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <p><strong>Alert Message:</strong></p>
          <p style="white-space: pre-line;">${alertData.message}</p>
        </div>
        
        <p><strong>Time:</strong> ${new Date(alertData.timestamp).toLocaleString()}</p>
        
        ${locationLink ? `
          <p><strong>Location:</strong></p>
          <a href="${locationLink}" class="location-link" target="_blank">
            📍 View Location on Google Maps
          </a>
        ` : '<p><strong>Location:</strong> Not available</p>'}
        
        ${alertData.recordingLink ? `
          <p><strong>Recording:</strong></p>
          <a href="${alertData.recordingLink}" target="_blank" style="color: #2563eb;">
            🎥 View Recording
          </a>
        ` : ''}
        
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p><strong>⚠️ Important:</strong></p>
          <p>If this is a real emergency, please contact local authorities immediately by calling 911 or your local emergency number.</p>
        </div>
      </div>
      
      <div class="footer">
        <p>This alert was sent automatically by KnowYourRights Card. If you believe this was sent in error, please contact the sender directly.</p>
        <p>KnowYourRights Card - Protecting civil rights through technology</p>
      </div>
    </body>
    </html>
  `
}

async function logAlert(alertData: AlertData, results: any[], errors: any[]) {
  try {
    // In a real implementation, you would log this to your database
    // For now, we'll just log to console
    console.log('Alert logged:', {
      userId: alertData.userId,
      timestamp: alertData.timestamp,
      contactsNotified: results.length,
      errors: errors.length,
      urgencyLevel: alertData.urgencyLevel
    })
  } catch (error) {
    console.error('Failed to log alert:', error)
  }
}
