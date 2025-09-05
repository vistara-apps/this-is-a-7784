import { loadStripe } from '@stripe/stripe-js'
import { supabase } from './supabase'
import toast from 'react-hot-toast'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export const getStripe = () => stripePromise

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Access to 3 states',
      'Basic recording (5 minutes)',
      '1 alert contact',
      'English only'
    ],
    limitations: {
      maxStates: 3,
      maxRecordingDuration: 300, // 5 minutes in seconds
      maxAlertContacts: 1,
      languages: ['en']
    }
  },
  premium: {
    name: 'Premium',
    price: 4.99,
    priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID,
    features: [
      'All 50 states + DC',
      'Unlimited recording',
      'Up to 10 alert contacts',
      'English & Spanish',
      'Priority support',
      'Offline access'
    ],
    limitations: {
      maxStates: 51, // All states + DC
      maxRecordingDuration: null, // unlimited
      maxAlertContacts: 10,
      languages: ['en', 'es']
    }
  }
}

// Create Stripe checkout session
export const createCheckoutSession = async (priceId, userId) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        userId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancelled`
      }
    })

    if (error) throw error

    const stripe = await getStripe()
    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    })

    if (stripeError) throw stripeError

  } catch (error) {
    console.error('Checkout error:', error)
    toast.error('Failed to start checkout process')
    throw error
  }
}

// Create customer portal session
export const createPortalSession = async (customerId) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: {
        customerId,
        returnUrl: `${window.location.origin}/profile`
      }
    })

    if (error) throw error

    window.location.href = data.url

  } catch (error) {
    console.error('Portal error:', error)
    toast.error('Failed to open customer portal')
    throw error
  }
}

// Check subscription limits
export const checkSubscriptionLimits = (subscriptionStatus, action, currentUsage = {}) => {
  const plan = SUBSCRIPTION_PLANS[subscriptionStatus] || SUBSCRIPTION_PLANS.free
  
  switch (action) {
    case 'addState':
      return currentUsage.stateCount < plan.limitations.maxStates
    
    case 'startRecording':
      return plan.limitations.maxRecordingDuration === null || 
             currentUsage.recordingDuration < plan.limitations.maxRecordingDuration
    
    case 'addAlertContact':
      return currentUsage.alertContactCount < plan.limitations.maxAlertContacts
    
    case 'changeLanguage':
      return plan.limitations.languages.includes(currentUsage.language)
    
    default:
      return true
  }
}

// Get upgrade message for limits
export const getUpgradeMessage = (action) => {
  const messages = {
    addState: 'Upgrade to Premium to access all 50 states + DC',
    startRecording: 'Upgrade to Premium for unlimited recording time',
    addAlertContact: 'Upgrade to Premium to add up to 10 alert contacts',
    changeLanguage: 'Upgrade to Premium for Spanish language support'
  }
  
  return messages[action] || 'Upgrade to Premium for full access'
}

// Webhook handler utilities (for backend)
export const webhookHandlers = {
  'checkout.session.completed': async (session) => {
    const { customer, subscription, metadata } = session
    const userId = metadata.userId

    // Update user subscription status
    await supabase
      .from('users')
      .update({
        subscription_status: 'premium',
        stripe_customer_id: customer
      })
      .eq('id', userId)
  },

  'customer.subscription.updated': async (subscription) => {
    const { customer, status } = subscription
    
    // Update subscription status based on Stripe status
    const subscriptionStatus = status === 'active' ? 'premium' : 'cancelled'
    
    await supabase
      .from('users')
      .update({ subscription_status: subscriptionStatus })
      .eq('stripe_customer_id', customer)
  },

  'customer.subscription.deleted': async (subscription) => {
    const { customer } = subscription
    
    await supabase
      .from('users')
      .update({ subscription_status: 'cancelled' })
      .eq('stripe_customer_id', customer)
  }
}
