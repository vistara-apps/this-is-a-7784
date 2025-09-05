import React from 'react'
import { MapPin } from 'lucide-react'

const LocationSelector = ({ currentState, onStateChange }) => {
  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ]

  return (
    <div className="glass-card rounded-lg p-4 flex-1">
      <div className="flex items-center space-x-2 mb-2">
        <MapPin className="w-4 h-4 text-white" />
        <span className="text-sm font-medium text-white">Current State</span>
      </div>
      
      <select
        value={currentState}
        onChange={(e) => onStateChange(e.target.value)}
        className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        {states.map(state => (
          <option key={state} value={state} className="text-gray-900">
            {state}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LocationSelector