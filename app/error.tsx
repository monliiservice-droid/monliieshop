'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center bg-linen text-ink">
      <div className="site-container py-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Monlii" className="mb-12 h-10 w-auto" />
        <p className="eyebrow mb-6">Něco se pokazilo</p>
        <h1 className="display max-w-3xl text-[clamp(2.75rem,6vw,5rem)]">Omlouváme se, stránku se nepodařilo načíst</h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft">Zkuste to prosím znovu. Pokud problém přetrvá, napište nám.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn btn-ink">Zkusit znovu</button>
          <Link href="/" className="btn btn-outline">Na úvod</Link>
        </div>
      </div>
    </div>
  )
}
