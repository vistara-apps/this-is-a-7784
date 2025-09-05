import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  subscriptionStatus: 'free',

  // Initialize auth state
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({
          user: userData,
          session,
          subscriptionStatus: userData?.subscription_status || 'free',
          loading: false
        })
      } else {
        set({ loading: false })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({
            user: userData,
            session,
            subscriptionStatus: userData?.subscription_status || 'free'
          })
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            session: null,
            subscriptionStatus: 'free'
          })
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ loading: false })
    }
  },

  // Sign up with email
  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              subscription_status: 'free',
              preferred_language: 'en',
              alert_contacts: []
            }
          ])

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      toast.success('Check your email to confirm your account!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  },

  // Sign in with email
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      toast.success('Welcome back!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error(error.message)
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    try {
      const { user } = get()
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      set({ user: data })
      toast.success('Profile updated successfully')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  },

  // Update alert contacts
  updateAlertContacts: async (contacts) => {
    try {
      const { user } = get()
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('users')
        .update({ alert_contacts: contacts })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      set({ user: data })
      toast.success('Alert contacts updated')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  },

  // Check if user has premium access
  hasPremiumAccess: () => {
    const { subscriptionStatus } = get()
    return subscriptionStatus === 'premium'
  },

  // Update subscription status
  updateSubscriptionStatus: (status) => {
    set({ subscriptionStatus: status })
  }
}))

export default useAuthStore
