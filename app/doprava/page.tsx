import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Package, CreditCard, Truck } from 'lucide-react'

export const metadata = {
  title: 'Doprava a platba | Monlii',
  description: 'Informace o dopravě a platbě pro Monlii e-shop',
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na hlavní stránku
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Doprava a platba</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Doprava */}
          <section>
            <div className="flex items-center mb-4">
              <Truck className="h-6 w-6 text-[#931e31] mr-3" />
              <h2 className="text-2xl font-semibold">Způsoby dopravy</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg hover:border-[#931e31] transition-colors">
                <h3 className="font-semibold mb-2">📦 Zásilkovna - Odběrné místo</h3>
                <p className="text-gray-700 mb-2">
                  Doručení na výdejní místo Zásilkovny dle vašeho výběru.
                </p>
                <p className="text-sm text-gray-600">
                  Cena: <strong>59 Kč</strong> | Doba dodání: <strong>3-5 pracovních dnů (skladem), až 14 dnů (na míru)</strong>
                </p>
              </div>

              <div className="p-4 border rounded-lg hover:border-[#931e31] transition-colors">
                <h3 className="font-semibold mb-2">🏠 Zásilkovna - Domů</h3>
                <p className="text-gray-700 mb-2">
                  Doručení kurýrem Zásilkovny přímo na vaši adresu.
                </p>
                <p className="text-sm text-gray-600">
                  Cena: <strong>79 Kč</strong> | Doba dodání: <strong>3-5 pracovních dnů (skladem), až 14 dnů (na míru)</strong>
                </p>
              </div>

              <div className="p-4 border rounded-lg hover:border-[#931e31] transition-colors">
                <h3 className="font-semibold mb-2">🏪 Osobní odběr</h3>
                <p className="text-gray-700 mb-2">
                  Osobní odběr v <strong>Havířově</strong> nebo <strong>Frenštátě pod Radhoštěm</strong>.
                </p>
                <p className="text-sm text-gray-600">
                  Cena: <strong>ZDARMA</strong> | Připravíme do <strong>3-5 dnů (skladem), až 14 dnů (na míru)</strong>
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  ✨ Doprava ZDARMA při objednávce nad 1 500 Kč
                </p>
              </div>
            </div>
          </section>

          {/* Platba */}
          <section>
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-[#931e31] mr-3" />
              <h2 className="text-2xl font-semibold">Způsoby platby</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg hover:border-[#931e31] transition-colors">
                <h3 className="font-semibold mb-2">💳 Platební karta (GoPay)</h3>
                <p className="text-gray-700 mb-2">
                  Bezpečná online platba kartou přes platební bránu GoPay.
                </p>
                <p className="text-sm text-gray-600">
                  Přijímáme: Visa, Mastercard, Maestro
                </p>
              </div>

              <div className="p-4 border rounded-lg hover:border-[#931e31] transition-colors">
                <h3 className="font-semibold mb-2">🏦 Bankovní převod</h3>
                <p className="text-gray-700 mb-2">
                  Platba předem bankovním převodem.
                </p>
                <p className="text-sm text-gray-600">
                  Zboží odesíláme po připsání platby na účet (1-2 pracovní dny)
                </p>
              </div>

              <div className="p-4 border rounded-lg hover:border-[#931e31] transition-colors">
                <h3 className="font-semibold mb-2">💵 Dobírka</h3>
                <p className="text-gray-700 mb-2">
                  Platba při převzetí zásilky.
                </p>
                <p className="text-sm text-gray-600">
                  Poplatek za dobírku: <strong>+30 Kč</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Balení */}
          <section>
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-[#931e31] mr-3" />
              <h2 className="text-2xl font-semibold">Balení a diskrétnost</h2>
            </div>
            
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                Všechny objednávky balíme s láskou a péčí do elegantního obalu. 
                Zásilka je zcela <strong>diskrétní</strong> - na obalu není uvedeno, 
                co obsahuje ani od koho pochází. 💝
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Často kladené otázky</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">📅 Jak dlouho trvá doručení?</h3>
                <p className="text-gray-700">
                  <strong>Zboží skladem:</strong> 3-5 pracovních dnů.<br/>
                  <strong>Zboží na míru:</strong> až 14 pracovních dnů (záleží na složitosti výrobku).<br/>
                  O stavu vaší objednávky vás budeme průběžně informovat e-mailem.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">📍 Mohu sledovat zásilku?</h3>
                <p className="text-gray-700">
                  Ano! Po odeslání objednávky vám zašleme sledovací číslo e-mailem, 
                  díky kterému můžete sledovat stav vaší zásilky.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">🌍 Posíláte i do zahraničí?</h3>
                <p className="text-gray-700">
                  Momentálně odesíláme pouze v rámci České republiky. 
                  V případě zájmu o zahraniční dopravu nás kontaktujte.
                </p>
              </div>
            </div>
          </section>

          {/* Kontakt */}
          <section>
            <div className="p-4 bg-[#931e31] text-white rounded-lg">
              <h3 className="font-semibold mb-2">Máte dotazy?</h3>
              <p className="mb-2">Rádi vám pomůžeme!</p>
              <p><strong>Email:</strong> luckaivankova1@seznam.cz</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
