'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/10 to-white flex items-center justify-center py-20">
      <div className="container max-w-2xl text-center px-4">
        <div className="animate-fade-in">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-8">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>

          {/* Message */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Něco se pokazilo
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            Omlouváme se, ale došlo k neočekávané chybě. Zkuste to prosím znovu.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-gray-100 rounded-lg text-left max-w-lg mx-auto">
              <p className="text-sm font-mono text-gray-700 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="h-5 w-5" />
              Zkusit znovu
            </button>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-full font-bold border-2 border-gray-200 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Home className="h-5 w-5" />
              Zpět domů
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-12 p-6 bg-pink-50/50 rounded-3xl border border-pink-100">
            <p className="text-gray-700">
              Pokud problém přetrvává, prosím{' '}
              <Link href="/kontakty" className="text-[#931e31] font-semibold hover:underline">
                kontaktujte nás
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
