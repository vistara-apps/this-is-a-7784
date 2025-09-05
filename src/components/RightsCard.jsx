import React from 'react'
import { Shield, AlertTriangle, MessageSquare, ChevronRight } from 'lucide-react'

const RightsCard = ({ title, rights, doNotSay, onShowScript }) => {
  return (
    <div className="glass-card rounded-lg p-6 text-white">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-5 h-5" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      {/* Your Rights Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Shield className="w-4 h-4 mr-2 text-green-300" />
          Your Rights
        </h3>
        <ul className="space-y-2">
          {rights.map((right, index) => (
            <li key={index} className="flex items-start space-x-2 text-sm">
              <span className="w-1.5 h-1.5 bg-green-300 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-white/90">{right}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Do NOT Say Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2 text-red-300" />
          Do NOT Say
        </h3>
        <ul className="space-y-2">
          {doNotSay.map((item, index) => (
            <li key={index} className="flex items-start space-x-2 text-sm">
              <span className="w-1.5 h-1.5 bg-red-300 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-white/90">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Script Buttons */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <MessageSquare className="w-4 h-4 mr-2 text-blue-300" />
          What to Say
        </h3>
        
        <button
          onClick={() => onShowScript('policeStop')}
          className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group"
        >
          <span className="text-sm font-medium">Police Stop Script</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button
          onClick={() => onShowScript('searchRefusal')}
          className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group"
        >
          <span className="text-sm font-medium">Refuse Search Script</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button
          onClick={() => onShowScript('silentInvocation')}
          className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group"
        >
          <span className="text-sm font-medium">Invoke Right to Silence</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

export default RightsCard