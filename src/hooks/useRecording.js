import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { uploadRecording } from '../lib/pinata'
import { checkSubscriptionLimits, getUpgradeMessage } from '../lib/stripe'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  
  const { user, subscriptionStatus, hasPremiumAccess } = useAuthStore()

  // Start recording
  const startRecording = useCallback(async (options = {}) => {
    try {
      // Check subscription limits
      if (!hasPremiumAccess()) {
        const canRecord = checkSubscriptionLimits(subscriptionStatus, 'startRecording', {
          recordingDuration: recordingTime
        })
        
        if (!canRecord) {
          toast.error(getUpgradeMessage('startRecording'))
          return false
        }
      }

      const constraints = {
        audio: true,
        video: options.video !== false, // Default to true unless explicitly false
        ...options.constraints
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        await handleRecordingStop()
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error)
        toast.error('Recording error occurred')
        stopRecording()
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setIsPaused(false)
      startTimeRef.current = Date.now()
      
      // Start timer
      timerRef.current = setInterval(() => {
        if (!isPaused) {
          setRecordingTime(prev => {
            const newTime = prev + 1
            
            // Check time limits for free users
            if (!hasPremiumAccess() && newTime >= 300) { // 5 minutes
              toast.warning('Free plan recording limit reached. Stopping recording.')
              stopRecording()
              return 300
            }
            
            return newTime
          })
        }
      }, 1000)

      toast.success('Recording started')
      return true

    } catch (error) {
      console.error('Failed to start recording:', error)
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone access denied. Please allow permissions.')
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera/microphone found.')
      } else {
        toast.error('Failed to start recording')
      }
      
      return false
    }
  }, [subscriptionStatus, hasPremiumAccess, recordingTime, isPaused])

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      toast.info('Recording paused')
    }
  }, [isRecording, isPaused])

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      toast.info('Recording resumed')
    }
  }, [isRecording, isPaused])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      setIsRecording(false)
      setIsPaused(false)
      
      toast.success('Recording stopped')
    }
  }, [isRecording])

  // Handle recording stop and upload
  const handleRecordingStop = useCallback(async () => {
    try {
      setIsUploading(true)
      
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const duration = recordingTime
      
      // Get current location if available
      let location = null
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false
          })
        })
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        console.log('Location not available:', error)
      }

      // Upload to IPFS
      const uploadResult = await uploadRecording(blob, {
        duration,
        location,
        userId: user?.id,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })

      // Save to database
      const { data: recording, error } = await supabase
        .from('recordings')
        .insert([
          {
            user_id: user?.id,
            file_path: uploadResult.hash,
            duration,
            shared_link: uploadResult.shareableLink,
            metadata: {
              filename: uploadResult.filename,
              size: uploadResult.size,
              location,
              ipfsUrl: uploadResult.url,
              uploadTimestamp: uploadResult.timestamp
            }
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Reset state
      setRecordingTime(0)
      chunksRef.current = []
      
      toast.success('Recording saved successfully')
      
      return {
        recording,
        uploadResult,
        blob,
        duration
      }

    } catch (error) {
      console.error('Failed to save recording:', error)
      toast.error('Failed to save recording')
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [recordingTime, user])

  // Get user recordings
  const getUserRecordings = useCallback(async (limit = 10, offset = 0) => {
    try {
      if (!user) return { data: [], error: 'No user logged in' }

      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      return { data: data || [], error }
    } catch (error) {
      console.error('Failed to fetch recordings:', error)
      return { data: [], error: error.message }
    }
  }, [user])

  // Delete recording
  const deleteRecording = useCallback(async (recordingId, ipfsHash) => {
    try {
      if (!user) throw new Error('No user logged in')

      // Delete from database
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recordingId)
        .eq('user_id', user.id)

      if (error) throw error

      // Note: In production, you might want to unpin from IPFS
      // This requires server-side implementation for security
      
      toast.success('Recording deleted')
      return true

    } catch (error) {
      console.error('Failed to delete recording:', error)
      toast.error('Failed to delete recording')
      return false
    }
  }, [user])

  // Format recording time
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (isRecording) {
      stopRecording()
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }, [isRecording, stopRecording])

  return {
    // State
    isRecording,
    isPaused,
    recordingTime,
    isUploading,
    formattedTime: formatTime(recordingTime),
    
    // Actions
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    getUserRecordings,
    deleteRecording,
    cleanup,
    
    // Utilities
    formatTime,
    canRecord: hasPremiumAccess() || recordingTime < 300
  }
}
