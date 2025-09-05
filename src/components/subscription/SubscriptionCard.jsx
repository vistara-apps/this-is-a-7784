import React, { useState } from 'react'
import { Check, Crown, Zap, Shield, Globe, Users, Clock } from 'lucide-react'
import { SUBSCRIPTION_PLANS, createCheckoutSession, createPortalSession } from '../../lib/stripe'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const SubscriptionCard = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { user, subscriptionStatus, hasPremiumAccess } = useAuthStore()

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade')
      return
    }

    setIsLoading(true)
    try {
      await createCheckoutSession(SUBSCRIPTION_PLANS.premium.priceId, user.id)
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    if (!user?.stripe_customer_id) {
      toast.error('No subscription to manage')
      return
    }

    setIsLoading(true)
    try {
      await createPortalSession(user.stripe_customer_id)
    } catch (error) {
      console.error('Portal error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentPlan = SUBSCRIPTION_PLANS[subscriptionStatus] || SUBSCRIPTION_PLANS.free
  const premiumPlan = SUBSCRIPTION_PLANS.premium

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600">
          Protect your rights with the plan that fits your needs
        </p>
      </div>

      {/* Current Plan Status */}
      {user && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {hasPremiumAccess() ? (
                <Crown className="text-yellow-500 mr-2" size={24} />
              ) : (
                <Shield className="text-blue-500 mr-2" size={24} />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  Current Plan: {currentPlan.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {hasPremiumAccess() 
                    ? 'You have full access to all features'
                    : 'Upgrade to unlock all features'
                  }
                </p>
              </div>
            </div>
            {hasPremiumAccess() && (
              <button
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* Plans Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className={`border-2 rounded-lg p-6 ${
          !hasPremiumAccess() ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        }`}>
          <div className="text-center mb-6">
            <Shield className="mx-auto text-blue-500 mb-2" size={48} />
            <h3 className="text-2xl font-bold text-gray-900">Free</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              $0<span className="text-lg font-normal text-gray-600">/month</span>
            </div>
            <p className="text-gray-600 mt-2">Perfect for basic protection</p>
          </div>

          <ul className="space-y-3 mb-6">
            {SUBSCRIPTION_PLANS.free.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          {!hasPremiumAccess() && (
            <div className="text-center">
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
                Current Plan
              </div>
            </div>
          )}
        </div>

        {/* Premium Plan */}
        <div className={`border-2 rounded-lg p-6 relative ${
          hasPremiumAccess() ? 'border-yellow-500 bg-yellow-50' : 'border-purple-500'
        }`}>
          {/* Popular badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
          </div>

          <div className="text-center mb-6">
            <Crown className="mx-auto text-yellow-500 mb-2" size={48} />
            <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              ${premiumPlan.price}<span className="text-lg font-normal text-gray-600">/month</span>
            </div>
            <p className="text-gray-600 mt-2">Complete protection & peace of mind</p>
          </div>

          <ul className="space-y-3 mb-6">
            {premiumPlan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="text-center">
            {hasPremiumAccess() ? (
              <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium">
                Current Plan
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={isLoading || !user}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Upgrade to Premium'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="text-center p-6">
          <Globe className="mx-auto text-blue-500 mb-4" size={48} />
          <h3 className="font-semibold text-gray-900 mb-2">All States Covered</h3>
          <p className="text-gray-600 text-sm">
            Access state-specific rights information for all 50 states plus DC
          </p>
        </div>

        <div className="text-center p-6">
          <Clock className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="font-semibold text-gray-900 mb-2">Unlimited Recording</h3>
          <p className="text-gray-600 text-sm">
            Record interactions for as long as needed without time limits
          </p>
        </div>

        <div className="text-center p-6">
          <Users className="mx-auto text-purple-500 mb-4" size={48} />
          <h3 className="font-semibold text-gray-900 mb-2">Multiple Contacts</h3>
          <p className="text-gray-600 text-sm">
            Add up to 10 emergency contacts for comprehensive alert coverage
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">Can I cancel anytime?</h4>
            <p className="text-gray-600 text-sm">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900">Is my data secure?</h4>
            <p className="text-gray-600 text-sm">
              Absolutely. We use enterprise-grade encryption and store recordings on decentralized IPFS for maximum security and availability.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900">What payment methods do you accept?</h4>
            <p className="text-gray-600 text-sm">
              We accept all major credit cards and debit cards through our secure payment processor, Stripe.
            </p>
          </div>
        </div>
      </div>

      {!user && (
        <div className="mt-8 text-center p-6 bg-blue-50 rounded-lg">
          <p className="text-gray-700">
            <strong>Sign up for free</strong> to start protecting your rights today.
            No credit card required for the free plan.
          </p>
        </div>
      )}
    </div>
  )
}

export default SubscriptionCard
