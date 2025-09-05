import React from 'react'
import { Globe } from 'lucide-react'

const LanguageSelector = ({ language, onLanguageChange }) => {
  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-2">
        <Globe className="w-4 h-4 text-white" />
        <span className="text-sm font-medium text-white">Language</span>
      </div>
      
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <option value="en" className="text-gray-900">English</option>
        <option value="es" className="text-gray-900">Español</option>
      </select>
    </div>
  )
}

export default LanguageSelector