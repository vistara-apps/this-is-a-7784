import React, { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import useAuthStore from '../../store/authStore'

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode) // 'signin' or 'signup'
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { signIn, signUp } = useAuthStore()
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  if (!isOpen) return null

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      if (mode === 'signin') {
        await signIn(data.email, data.password)
        onClose()
      } else {
        await signUp(data.email, data.password)
        // Don't close modal immediately for signup - user needs to check email
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    reset()
    setShowPassword(false)
  }

  const handleClose = () => {
    reset()
    setShowPassword(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {mode === 'signin' 
              ? 'Access your rights information and recordings'
              : 'Join KnowYourRights Card to save your preferences'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={switchMode}
              className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Features for signup */}
        {mode === 'signup' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Free Account Includes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Access to 3 states</li>
              <li>• Basic recording (5 minutes)</li>
              <li>• 1 alert contact</li>
              <li>• English language support</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              Upgrade to Premium for unlimited access to all features
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthModal
