'use client'

import { useState, useEffect } from 'react'
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
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5" role="dialog" aria-label="Souhlas s cookies">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 border border-line bg-linen p-5 text-ink shadow-[0_20px_50px_-20px_rgba(43,15,12,0.35)] sm:flex-row sm:items-center sm:gap-6">
        <p className="flex-1 text-sm leading-relaxed text-ink-soft">
          Cookies používáme jen pro chod e-shopu (košík, objednávky) a pro zlepšení webu. Více v{' '}
          <Link href="/ochrana-osobnich-udaju" className="underline underline-offset-4">zásadách ochrany osobních údajů</Link>.
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={rejectCookies} className="btn btn-outline h-10 px-4">Jen nezbytné</button>
          <button type="button" onClick={acceptCookies} className="btn btn-ink h-10 px-4">Přijmout</button>
        </div>
      </div>
    </div>
  )
}
