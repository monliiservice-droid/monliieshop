import Link from 'next/link'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { runSystemChecks, type CheckStatus } from '@/lib/system-check'
import { TestEmailButton } from './test-email-button'

export const dynamic = 'force-dynamic'

const STATUS_ICON: Record<CheckStatus, React.ReactNode> = {
  ok: <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" aria-label="V pořádku" />,
  warn: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" aria-label="Upozornění" />,
  error: <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-label="Chyba" />,
}

export default async function SystemCheckPage() {
  const groups = await runSystemChecks()
  const all = groups.flatMap((g) => g.checks)
  const errors = all.filter((c) => c.status === 'error').length
  const warnings = all.filter((c) => c.status === 'warn').length

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Kontrola e-shopu</h1>
        <p className="text-gray-600">Ověří, že je vše nastavené, aby zákazníci mohli objednávat a dostávali e-maily.</p>
      </div>

      <div
        className={`mb-6 rounded-lg border p-4 text-sm ${
          errors ? 'border-red-300 bg-red-50 text-red-900' : warnings ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-green-300 bg-green-50 text-green-900'
        }`}
      >
        <p className="font-semibold">
          {errors
            ? `Počet problémů, které mohou zablokovat objednávky nebo e-maily: ${errors}`
            : warnings
              ? 'Objednávky fungují, ale něco by šlo nastavit lépe.'
              : 'Vše je připravené – e-shop může přijímat objednávky.'}
        </p>
        <p className="mt-1">Po změně proměnných ve Vercelu je potřeba web znovu nasadit (Redeploy) a tuto stránku obnovit.</p>
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <Card key={group.title}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{group.title}</CardTitle>
              {group.title === 'E-maily' && <TestEmailButton />}
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {group.checks.map((check) => (
                  <li key={check.label} className="flex gap-3 py-3">
                    {STATUS_ICON[check.status]}
                    <div className="text-sm">
                      <p className="font-medium">{check.label}</p>
                      <p className="text-gray-600">{check.detail}</p>
                      {check.status !== 'ok' && check.fix && <p className="mt-1 text-gray-900">→ {check.fix}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Nejjistější test je zkušební objednávka: objednejte si něco s osobním odběrem, zkontrolujte e-maily a objednávku pak v{' '}
        <Link href="/admin/objednavky" className="underline">Objednávkách</Link> zrušte (zboží se vrátí na sklad).
      </p>
    </div>
  )
}
