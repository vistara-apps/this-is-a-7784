import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { MapPin, Volume2, Shield, AlertTriangle, Phone, Globe, User, Crown } from 'lucide-react'
import Header from './components/Header'
import RightsCard from './components/RightsCard'
import RecordingControls from './components/RecordingControls'
import ScriptModal from './components/ScriptModal'
import LanguageSelector from './components/LanguageSelector'
import LocationSelector from './components/LocationSelector'
import AuthModal from './components/auth/AuthModal'
import SubscriptionCard from './components/subscription/SubscriptionCard'
import { stateRightsData } from './data/stateRights'
import { detectUserLocation } from './utils/location'
import { useRecording } from './hooks/useRecording'
import { useAlerts } from './hooks/useAlerts'
import useAuthStore from './store/authStore'

function App() {
  const [currentState, setCurrentState] = useState('California')
  const [language, setLanguage] = useState('en')
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [currentScript, setCurrentScript] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [currentView, setCurrentView] = useState('main') // 'main', 'subscription', 'profile'

  // Auth store
  const { user, loading, initialize, signOut, hasPremiumAccess } = useAuthStore()
  
  // Recording hook
  const {
    isRecording,
    recordingTime,
    formattedTime,
    startRecording,
    stopRecording,
    getUserRecordings
  } = useRecording()
  
  // Alerts hook
  const { sendQuickAlert, isSendingAlert } = useAlerts()

  useEffect(() => {
    // Initialize auth
    initialize()
    
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

  const handleSendAlert = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    await sendQuickAlert()
  }

  const handleUserAction = (action) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    
    switch (action) {
      case 'upgrade':
        setCurrentView('subscription')
        break
      case 'profile':
        setCurrentView('profile')
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading KnowYourRights Card...</p>
        </div>
      </div>
    )
  }

  // Render different views based on currentView
  const renderContent = () => {
    switch (currentView) {
      case 'subscription':
        return <SubscriptionCard />
      case 'profile':
        return (
          <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
            {/* Profile content would go here */}
            <button
              onClick={() => setCurrentView('main')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Main
            </button>
          </div>
        )
      default:
        return (
          <div className="max-w-screen-lg mx-auto px-4 sm:px-6">
            {/* User Status Bar */}
            {user && (
              <div className="mb-4 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-between">
                <div className="flex items-center">
                  <User className="text-blue-600 mr-2" size={20} />
                  <span className="text-sm text-gray-700">
                    Welcome, {user.email}
                  </span>
                  {hasPremiumAccess() && (
                    <Crown className="text-yellow-500 ml-2" size={16} />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {!hasPremiumAccess() && (
                    <button
                      onClick={() => handleUserAction('upgrade')}
                      className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700"
                    >
                      Upgrade
                    </button>
                  )}
                  <button
                    onClick={() => handleUserAction('profile')}
                    className="text-xs bg-gray-600 text-white px-3 py-1 rounded-full hover:bg-gray-700"
                  >
                    Profile
                  </button>
                  <button
                    onClick={signOut}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}

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
                  recordingTime={formattedTime}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  onSendAlert={handleSendAlert}
                  isSendingAlert={isSendingAlert}
                  onUserAction={handleUserAction}
                />
              </div>
            </div>

            {/* Auth CTA for non-users */}
            {!user && (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Get the Full Experience
                </h3>
                <p className="text-gray-600 mb-4">
                  Sign up to save recordings, manage alert contacts, and access premium features
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign Up Free
                </button>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      {renderContent()}

      {/* Modals */}
      {showScriptModal && (
        <ScriptModal
          script={currentScript}
          language={language}
          onClose={() => setShowScriptModal(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}

export default App
