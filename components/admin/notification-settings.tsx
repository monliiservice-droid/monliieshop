'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TestEmailButton } from '@/components/admin/test-email-button'
import { toastNetworkError, toastResponseError } from '@/lib/admin-client'

const EMAIL_REGEX = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/

/** Adresy, na které chodí upozornění na nové objednávky a zprávy z kontaktního formuláře */
export function NotificationSettings() {
  const [emails, setEmails] = useState<string[]>([])
  const [envEmails, setEnvEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/notification-emails')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        // Dokud v adminu nic není, předvyplníme adresy z Vercelu (SELLER_EMAIL)
        setEmails(data.emails.length > 0 ? data.emails : data.envEmails)
        setEnvEmails(data.envEmails)
      })
      .catch(() => toast.error('Nepodařilo se načíst adresy'))
      .finally(() => setLoaded(true))
  }, [])

  const add = () => {
    const email = newEmail.trim().toLowerCase()
    if (!EMAIL_REGEX.test(email)) {
      toast.error('Zadejte platnou e-mailovou adresu')
      return
    }
    if (!emails.includes(email)) setEmails([...emails, email])
    setNewEmail('')
  }

  const save = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/notification-emails', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      })
      if (!response.ok) {
        await toastResponseError(response, 'Adresy se nepodařilo uložit')
        return
      }
      toast.success('Adresy pro upozornění uloženy')
    } catch {
      toastNetworkError('Adresy se nepodařilo uložit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Komu chodí upozornění</CardTitle>
        <CardDescription>
          Na tyto adresy přijde e-mail o každé nové objednávce a zpráva z kontaktního formuláře. Zákazníkům se nic nemění.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loaded && emails.length === 0 && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">Zatím tu není žádná adresa – upozornění na objednávky nikomu nepřijdou.</p>
        )}
        <ul className="space-y-2">
          {emails.map((email) => (
            <li key={email} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              {email}
              <button type="button" onClick={() => setEmails(emails.filter((e) => e !== email))} className="text-gray-400 hover:text-red-600" aria-label={`Odebrat ${email}`}>
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
        >
          <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="např. kolegyne@monlii.cz" aria-label="Nová adresa" />
          <Button type="submit" variant="outline">
            <Plus className="mr-1 h-4 w-4" /> Přidat
          </Button>
        </form>
        {envEmails.length > 0 && (
          <p className="text-xs text-gray-500">Ve Vercelu je nastaveno SELLER_EMAIL = {envEmails.join(', ')}. Adresy uložené tady mají přednost.</p>
        )}
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button type="button" onClick={save} disabled={saving || !loaded}>
            {saving ? 'Ukládám…' : 'Uložit adresy'}
          </Button>
          <TestEmailButton />
        </div>
        <p className="text-xs text-gray-500">Testovací e-mail odejde na uložené adresy – nejdřív uložte. Pokud nedorazí, zkontrolujte spam a Kontrolu e-shopu.</p>
      </CardContent>
    </Card>
  )
}
