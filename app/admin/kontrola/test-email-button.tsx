'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function TestEmailButton() {
  const [sending, setSending] = useState(false)
  const send = async () => {
    setSending(true)
    try {
      const response = await fetch('/api/admin/system-check/test-email', { method: 'POST' })
      const result = await response.json().catch(() => ({}))
      if (response.ok) toast.success(result.message)
      else toast.error(result.message || 'Testovací e-mail se nepodařilo odeslat')
    } catch {
      toast.error('Testovací e-mail se nepodařilo odeslat')
    } finally {
      setSending(false)
    }
  }
  return (
    <Button type="button" variant="outline" onClick={send} disabled={sending}>
      <Mail className="mr-2 h-4 w-4" />
      {sending ? 'Odesílám…' : 'Poslat testovací e-mail'}
    </Button>
  )
}
