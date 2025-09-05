import React from 'react'
import { X, Copy, Volume2 } from 'lucide-react'

const ScriptModal = ({ script, language, onClose }) => {
  if (!script) return null

  const handleCopyScript = () => {
    navigator.clipboard.writeText(script.content)
    alert('Script copied to clipboard!')
  }

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(script.content)
      utterance.lang = language === 'es' ? 'es-ES' : 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">
            {script.type === 'policeStop' && 'Police Stop Script'}
            {script.type === 'searchRefusal' && 'Refuse Search Script'}
            {script.type === 'silentInvocation' && 'Invoke Right to Silence'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {script.content}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleCopyScript}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            
            <button
              onClick={handleReadAloud}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Aloud</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScriptModal