import React from 'react'
import { Shield, Crown } from 'lucide-react'

const Header = () => {
  return (
    <header className="py-6 mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg backdrop-blur-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              KnowYourRights Card
            </h1>
            <p className="text-white/80 text-sm">
              Instant legal guidance and evidence capture
            </p>
          </div>
        </div>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm text-white transition-colors">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-medium">Get Premium</span>
        </button>
      </div>
    </header>
  )
}

export default Header