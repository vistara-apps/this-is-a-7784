import React from 'react'
import { Video, Square, Phone, Clock, Play, Crown, AlertTriangle } from 'lucide-react'

const RecordingControls = ({ 
  isRecording, 
  recordingTime,
  onStartRecording, 
  onStopRecording, 
  onSendAlert, 
  isSendingAlert,
  onUserAction
}) => {
  return (
    <div className="space-y-6">
      {/* Recording Control */}
      <div className="glass-card rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Video className="w-5 h-5 mr-2" />
          Record Evidence
        </h2>
        
        <div className="text-center">
          {!isRecording ? (
            <button
              onClick={onStartRecording}
              className="w-24 h-24 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto transition-colors shadow-lg"
            >
              <Video className="w-8 h-8 text-white" />
            </button>
          ) : (
            <button
              onClick={onStopRecording}
              className="w-24 h-24 bg-red-500 recording-pulse rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg"
            >
              <Square className="w-8 h-8 text-white" />
            </button>
          )}
          
          <p className="text-sm text-white/80 mb-4">
            {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
          </p>
          
          {isRecording && (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2 text-red-300">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">REC</span>
              </div>
              {recordingTime && (
                <div className="text-lg font-mono text-white">
                  {recordingTime}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alert Contacts */}
      <div className="glass-card rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Phone className="w-5 h-5 mr-2" />
          Emergency Alert
        </h2>
        
        <button
          onClick={onSendAlert}
          disabled={isSendingAlert}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {isSendingAlert ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending Alert...</span>
            </>
          ) : (
            <>
              <Phone className="w-4 h-4" />
              <span>Alert Emergency Contacts</span>
            </>
          )}
        </button>
        
        <p className="text-xs text-white/60 mt-2 text-center">
          Sends your location and situation to pre-configured contacts
        </p>
      </div>

      {/* Upgrade Prompt */}
      <div className="glass-card rounded-lg p-6 text-white border border-yellow-400/30">
        <div className="flex items-center mb-3">
          <Crown className="w-5 h-5 mr-2 text-yellow-400" />
          <h3 className="text-lg font-semibold">Upgrade to Premium</h3>
        </div>
        
        <div className="space-y-2 text-sm text-white/80 mb-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span>Unlimited recording time</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span>Up to 10 alert contacts</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span>All 50 states + DC</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span>Spanish language support</span>
          </div>
        </div>
        
        <button
          onClick={() => onUserAction && onUserAction('upgrade')}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
        >
          Upgrade for $4.99/month
        </button>
      </div>
    </div>
  )
}

export default RecordingControls
