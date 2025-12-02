'use client'

import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'
import Link from 'next/link'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowBanner(false)
  }

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-fade-in">
      <div className="container max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 md:p-8 relative">
          {/* Close Button */}
          <button
            onClick={rejectCookies}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                <Cookie className="h-8 w-8 text-[#931e31]" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Používáme cookies
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Tento web používá cookies pro zajištění základní funkčnosti eshopu (nákupní košík, objednávky) 
                a pro zlepšení vašeho zážitku. Více informací najdete v našich{' '}
                <Link href="/ochrana-osobnich-udaju" className="text-[#931e31] font-semibold hover:underline">
                  zásadách ochrany osobních údajů
                </Link>
                .
              </p>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptCookies}
                  className="bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white px-6 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Přijmout vše
                </button>
                <button
                  onClick={rejectCookies}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-full font-semibold transition-all duration-300"
                >
                  Pouze nezbytné
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
