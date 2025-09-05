import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { checkSubscriptionLimits, getUpgradeMessage } from '../lib/stripe'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export const useAlerts = () => {
  const [isSendingAlert, setIsSendingAlert] = useState(false)
  const { user, subscriptionStatus, hasPremiumAccess, updateAlertContacts } = useAuthStore()

  // Send emergency alert
  const sendEmergencyAlert = useCallback(async (options = {}) => {
    try {
      setIsSendingAlert(true)

      if (!user) {
        toast.error('Please sign in to send alerts')
        return false
      }

      const alertContacts = user.alert_contacts || []
      
      if (alertContacts.length === 0) {
        toast.error('No alert contacts configured. Please add contacts in your profile.')
        return false
      }

      // Get current location
      let location = null
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          })
        })
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        console.warn('Location not available:', error)
        // Continue without location
      }

      // Prepare alert data
      const alertData = {
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
        location,
        message: options.customMessage || generateAlertMessage(location),
        recordingLink: options.recordingLink || null,
        contacts: alertContacts,
        urgencyLevel: options.urgencyLevel || 'high'
      }

      // Send alert via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-emergency-alert', {
        body: alertData
      })

      if (error) throw error

      toast.success(`Alert sent to ${alertContacts.length} contact(s)`)
      
      // Log the alert for user's records
      await logAlert(alertData)
      
      return true

    } catch (error) {
      console.error('Failed to send alert:', error)
      toast.error('Failed to send emergency alert')
      return false
    } finally {
      setIsSendingAlert(false)
    }
  }, [user])

  // Add alert contact
  const addAlertContact = useCallback(async (contact) => {
    try {
      if (!user) {
        toast.error('Please sign in to manage contacts')
        return false
      }

      const currentContacts = user.alert_contacts || []
      
      // Check subscription limits
      if (!hasPremiumAccess()) {
        const canAdd = checkSubscriptionLimits(subscriptionStatus, 'addAlertContact', {
          alertContactCount: currentContacts.length
        })
        
        if (!canAdd) {
          toast.error(getUpgradeMessage('addAlertContact'))
          return false
        }
      }

      // Validate contact
      if (!contact.name || !contact.method || !contact.value) {
        toast.error('Please provide name, contact method, and contact value')
        return false
      }

      // Check for duplicates
      const isDuplicate = currentContacts.some(c => 
        c.method === contact.method && c.value === contact.value
      )
      
      if (isDuplicate) {
        toast.error('This contact already exists')
        return false
      }

      const newContact = {
        id: Date.now().toString(),
        name: contact.name.trim(),
        method: contact.method, // 'sms', 'email', 'whatsapp'
        value: contact.value.trim(),
        relationship: contact.relationship || 'emergency contact',
        priority: contact.priority || 'normal',
        verified: false,
        createdAt: new Date().toISOString()
      }

      const updatedContacts = [...currentContacts, newContact]
      
      const { error } = await updateAlertContacts(updatedContacts)
      if (error) throw error

      toast.success('Alert contact added successfully')
      return true

    } catch (error) {
      console.error('Failed to add contact:', error)
      toast.error('Failed to add alert contact')
      return false
    }
  }, [user, subscriptionStatus, hasPremiumAccess, updateAlertContacts])

  // Remove alert contact
  const removeAlertContact = useCallback(async (contactId) => {
    try {
      if (!user) {
        toast.error('Please sign in to manage contacts')
        return false
      }

      const currentContacts = user.alert_contacts || []
      const updatedContacts = currentContacts.filter(c => c.id !== contactId)
      
      const { error } = await updateAlertContacts(updatedContacts)
      if (error) throw error

      toast.success('Alert contact removed')
      return true

    } catch (error) {
      console.error('Failed to remove contact:', error)
      toast.error('Failed to remove alert contact')
      return false
    }
  }, [user, updateAlertContacts])

  // Update alert contact
  const updateAlertContact = useCallback(async (contactId, updates) => {
    try {
      if (!user) {
        toast.error('Please sign in to manage contacts')
        return false
      }

      const currentContacts = user.alert_contacts || []
      const updatedContacts = currentContacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, ...updates, updatedAt: new Date().toISOString() }
          : contact
      )
      
      const { error } = await updateAlertContacts(updatedContacts)
      if (error) throw error

      toast.success('Alert contact updated')
      return true

    } catch (error) {
      console.error('Failed to update contact:', error)
      toast.error('Failed to update alert contact')
      return false
    }
  }, [user, updateAlertContacts])

  // Test alert contact
  const testAlertContact = useCallback(async (contactId) => {
    try {
      if (!user) {
        toast.error('Please sign in to test contacts')
        return false
      }

      const contact = user.alert_contacts?.find(c => c.id === contactId)
      if (!contact) {
        toast.error('Contact not found')
        return false
      }

      const testData = {
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
        message: `This is a test message from KnowYourRights Card. Your emergency contact has been successfully configured.`,
        contacts: [contact],
        isTest: true
      }

      const { data, error } = await supabase.functions.invoke('send-emergency-alert', {
        body: testData
      })

      if (error) throw error

      toast.success('Test alert sent successfully')
      return true

    } catch (error) {
      console.error('Failed to send test alert:', error)
      toast.error('Failed to send test alert')
      return false
    }
  }, [user])

  // Get alert history
  const getAlertHistory = useCallback(async (limit = 10, offset = 0) => {
    try {
      if (!user) return { data: [], error: 'No user logged in' }

      // This would typically be stored in a separate alerts table
      // For now, we'll return empty array as this is a basic implementation
      return { data: [], error: null }

    } catch (error) {
      console.error('Failed to fetch alert history:', error)
      return { data: [], error: error.message }
    }
  }, [user])

  // Log alert for user's records
  const logAlert = useCallback(async (alertData) => {
    try {
      // In a full implementation, you'd store this in an alerts table
      console.log('Alert logged:', alertData)
      return true
    } catch (error) {
      console.error('Failed to log alert:', error)
      return false
    }
  }, [])

  // Generate alert message
  const generateAlertMessage = useCallback((location) => {
    const timestamp = new Date().toLocaleString()
    let message = `🚨 EMERGENCY ALERT 🚨\n\n`
    message += `I am in a situation requiring immediate assistance.\n\n`
    message += `Time: ${timestamp}\n`
    
    if (location) {
      message += `Location: https://maps.google.com/maps?q=${location.latitude},${location.longitude}\n`
      message += `Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n`
    } else {
      message += `Location: Unable to determine location\n`
    }
    
    message += `\nThis alert was sent from KnowYourRights Card app.\n`
    message += `If this is a real emergency, please contact local authorities immediately.`
    
    return message
  }, [])

  // Quick alert with current recording
  const sendQuickAlert = useCallback(async (recordingLink = null) => {
    return await sendEmergencyAlert({
      recordingLink,
      urgencyLevel: 'high',
      customMessage: recordingLink 
        ? generateAlertMessage() + `\n\nRecording: ${recordingLink}`
        : generateAlertMessage()
    })
  }, [sendEmergencyAlert, generateAlertMessage])

  // Validate contact information
  const validateContact = useCallback((contact) => {
    const errors = []

    if (!contact.name || contact.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters')
    }

    if (!contact.method) {
      errors.push('Contact method is required')
    }

    if (!contact.value) {
      errors.push('Contact value is required')
    } else {
      // Validate based on method
      switch (contact.method) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(contact.value)) {
            errors.push('Invalid email address')
          }
          break
        case 'sms':
          const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
          if (!phoneRegex.test(contact.value)) {
            errors.push('Invalid phone number')
          }
          break
        case 'whatsapp':
          const whatsappRegex = /^\+?[\d\s\-\(\)]{10,}$/
          if (!whatsappRegex.test(contact.value)) {
            errors.push('Invalid WhatsApp number')
          }
          break
      }
    }

    return errors
  }, [])

  return {
    // State
    isSendingAlert,
    alertContacts: user?.alert_contacts || [],
    maxContacts: hasPremiumAccess() ? 10 : 1,
    
    // Actions
    sendEmergencyAlert,
    sendQuickAlert,
    addAlertContact,
    removeAlertContact,
    updateAlertContact,
    testAlertContact,
    getAlertHistory,
    
    // Utilities
    validateContact,
    generateAlertMessage,
    canAddContact: hasPremiumAccess() || (user?.alert_contacts?.length || 0) < 1
  }
}
