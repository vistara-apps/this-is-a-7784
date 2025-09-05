import React, { useState, useEffect } from 'react'
import { MapPin, Volume2, Shield, AlertTriangle, Phone, Globe } from 'lucide-react'
import Header from './components/Header'
import RightsCard from './components/RightsCard'
import RecordingControls from './components/RecordingControls'
import ScriptModal from './components/ScriptModal'
import LanguageSelector from './components/LanguageSelector'
import LocationSelector from './components/LocationSelector'
import { stateRightsData } from './data/stateRights'
import { detectUserLocation } from './utils/location'

function App() {
  const [currentState, setCurrentState] = useState('California')
  const [language, setLanguage] = useState('en')
  const [isRecording, setIsRecording] = useState(false)
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [currentScript, setCurrentScript] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [recordings, setRecordings] = useState([])

  useEffect(() => {
    // Try to detect user location on app load
    detectUserLocation().then(state => {
      if (state) {
        setCurrentState(state)
      }
    }).catch(console.error)
  }, [])

  const currentRights = stateRightsData[currentState] || stateRightsData['California']
  const content = currentRights[language] || currentRights['en']

  const handleShowScript = (scriptType) => {
    setCurrentScript({
      type: scriptType,
      content: content.scripts[scriptType]
    })
    setShowScriptModal(true)
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      })
      
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const newRecording = {
          id: Date.now(),
          url,
          timestamp: new Date(),
          duration: 0
        }
        setRecordings(prev => [...prev, newRecording])
        
        // Stop all tracks to release camera/microphone
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access camera/microphone. Please check permissions.')
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      setMediaRecorder(null)
      setIsRecording(false)
    }
  }

  const handleSendAlert = () => {
    // Simulate sending alert to emergency contacts
    const message = `URGENT: I am in a situation requiring assistance. My location: ${currentState}. Time: ${new Date().toLocaleString()}`
    
    // In a real app, this would send SMS/email to pre-configured contacts
    alert(`Alert sent to emergency contacts:\n\n${message}`)
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6">
        <Header />
        
        {/* Language & Location Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <LanguageSelector 
            language={language}
            onLanguageChange={setLanguage}
          />
          <LocationSelector 
            currentState={currentState}
            onStateChange={setCurrentState}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rights Information */}
          <div className="space-y-6">
            <RightsCard 
              title={content.title}
              rights={content.rights}
              doNotSay={content.doNotSay}
              onShowScript={handleShowScript}
            />
          </div>

          {/* Recording & Controls */}
          <div className="space-y-6">
            <RecordingControls
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onSendAlert={handleSendAlert}
              recordings={recordings}
            />
          </div>
        </div>

        {/* Script Modal */}
        {showScriptModal && (
          <ScriptModal
            script={currentScript}
            language={language}
            onClose={() => setShowScriptModal(false)}
          />
        )}
      </div>
    </div>
  )
}

export default App