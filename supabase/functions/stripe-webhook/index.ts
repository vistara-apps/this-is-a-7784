import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      return new Response('Missing signature or webhook secret', { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const status = subscription.status
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
    const priceId = subscription.items.data[0]?.price.id

    // Determine subscription tier based on price ID
    let subscriptionTier = 'free'
    if (priceId === Deno.env.get('STRIPE_PREMIUM_PRICE_ID')) {
      subscriptionTier = 'premium'
    }

    // Update user subscription status
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: status === 'active' ? subscriptionTier : 'free',
        subscription_end_date: currentPeriodEnd.toISOString(),
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Failed to update user subscription:', error)
      throw error
    }

    console.log(`Updated subscription for customer ${customerId}: ${subscriptionTier}`)

  } catch (error) {
    console.error('Error handling subscription change:', error)
    throw error
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    // Update user to free tier
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'free',
        subscription_end_date: null,
        stripe_subscription_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Failed to update user after cancellation:', error)
      throw error
    }

    console.log(`Cancelled subscription for customer ${customerId}`)

  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
    throw error
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    // Log successful payment
    console.log(`Payment succeeded for customer ${customerId}, subscription ${subscriptionId}`)

    // You could add additional logic here, such as:
    // - Sending a receipt email
    // - Updating payment history
    // - Triggering analytics events

  } catch (error) {
    console.error('Error handling payment success:', error)
    throw error
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    console.log(`Payment failed for customer ${customerId}, subscription ${subscriptionId}`)

    // You could add additional logic here, such as:
    // - Sending a payment failure notification
    // - Updating user status to indicate payment issues
    // - Triggering retry logic

    // For now, we'll just log the failure
    // Stripe will handle retry logic automatically based on your settings

  } catch (error) {
    console.error('Error handling payment failure:', error)
    throw error
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    console.log(`Checkout completed for customer ${customerId}, subscription ${subscriptionId}`)

    // The subscription webhook will handle the actual subscription update
    // This is mainly for logging and any immediate post-checkout actions

  } catch (error) {
    console.error('Error handling checkout completion:', error)
    throw error
  }
}
