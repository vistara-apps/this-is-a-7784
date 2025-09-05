import React from 'react'
import { Video, Square, Phone, Clock, Play } from 'lucide-react'

const RecordingControls = ({ 
  isRecording, 
  onStartRecording, 
  onStopRecording, 
  onSendAlert, 
  recordings 
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
            <div className="flex items-center justify-center space-x-2 text-red-300">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">REC</span>
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
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Phone className="w-4 h-4" />
          <span>Alert Emergency Contacts</span>
        </button>
        
        <p className="text-xs text-white/60 mt-2 text-center">
          Sends your location and situation to pre-configured contacts
        </p>
      </div>

      {/* Recent Recordings */}
      {recordings.length > 0 && (
        <div className="glass-card rounded-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Recordings
          </h2>
          
          <div className="space-y-3">
            {recordings.slice(-3).map((recording) => (
              <div key={recording.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Play className="w-4 h-4 text-blue-300" />
                  <div>
                    <p className="text-sm font-medium">
                      {recording.timestamp.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-white/60">
                      {recording.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(recording.url, '_blank')}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-xs transition-colors"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RecordingControls