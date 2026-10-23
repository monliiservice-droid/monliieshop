'use client'

import { useState } from 'react'

const EMPTY = { name: '', email: '', phone: '', message: '', website: '' }

export function ContactForm() {
  const [formData, setFormData] = useState(EMPTY)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus('idle')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setStatus('success')
        setFormData(EMPTY)
      } else {
        const result = await response.json().catch(() => ({}))
        setErrorMessage(result.message || '')
        setStatus('error')
      }
    } catch {
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="border-l-2 border-wine bg-white p-8">
        <p className="display text-4xl">Děkujeme za zprávu</p>
        <p className="mt-3 text-ink-soft">Ozveme se vám obvykle do 24 hodin.</p>
        <button type="button" onClick={() => setStatus('idle')} className="mt-6 text-sm underline underline-offset-4">
          Napsat další zprávu
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot – skryté pole pro odhalení botů */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Web</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm text-ink-soft">Jméno *</label>
          <input id="name" name="name" required maxLength={100} className="field" value={formData.name} onChange={handleChange} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-ink-soft">E-mail *</label>
          <input id="email" name="email" type="email" required className="field" value={formData.email} onChange={handleChange} autoComplete="email" />
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="mb-2 block text-sm text-ink-soft">Telefon</label>
        <input id="phone" name="phone" type="tel" maxLength={30} className="field" value={formData.phone} onChange={handleChange} autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm text-ink-soft">Zpráva *</label>
        <textarea id="message" name="message" required rows={6} maxLength={5000} className="field resize-y" value={formData.message} onChange={handleChange} />
      </div>
      {status === 'error' && (
        <p className="text-sm text-wine">{errorMessage || 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu nebo nám napište e-mail.'}</p>
      )}
      <button type="submit" disabled={isSubmitting} className="btn btn-ink">
        {isSubmitting ? 'Odesílám…' : 'Odeslat zprávu'}
      </button>
    </form>
  )
}
