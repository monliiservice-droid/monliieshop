import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Ochrana osobních údajů | Monlii',
  description: 'Zásady ochrany osobních údajů pro Monlii e-shop',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na hlavní stránku
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Ochrana osobních údajů</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Základní ustanovení</h2>
            <p className="text-gray-700 leading-relaxed">
              Provozovatelem internetového obchodu Monlii je Lucie Ivanková.
              Ochrana vašich osobních údajů je pro nás prioritou. Tento dokument popisuje, 
              jak nakládáme s osobními údaji, které nám poskytnete.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Jaké údaje zpracováváme</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Při objednávce od vás vyžadujeme následující údaje:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Jméno a příjmení</li>
              <li>E-mailová adresa</li>
              <li>Telefonní číslo</li>
              <li>Doručovací adresa</li>
              <li>Fakturační údaje (pokud jsou odlišné od doručovací adresy)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Účel zpracování</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vaše osobní údaje zpracováváme pro následující účely:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Vyřízení a doručení objednávky</li>
              <li>Komunikace ohledně objednávky</li>
              <li>Vystavení daňových dokladů</li>
              <li>Řešení reklamací a záručních nároků</li>
              <li>Zasílání obchodních sdělení (pouze s vaším souhlasem)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Doba uchovávání</h2>
            <p className="text-gray-700 leading-relaxed">
              Osobní údaje uchováváme pouze po dobu nezbytně nutnou k naplnění účelu zpracování, 
              minimálně však po dobu stanovenou právními předpisy (zejména zákonem o archivnictví 
              a evidenci - 5 let pro účetní doklady).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Předávání třetím stranám</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vaše osobní údaje můžeme předávat:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Dopravním společnostem (za účelem doručení zboží)</li>
              <li>Platebním branám (za účelem zpracování platby)</li>
              <li>Účetní společnosti (za účelem vedení účetnictví)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Všechny třetí strany jsou smluvně zavázány k ochraně vašich osobních údajů.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Vaše práva</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              V souvislosti se zpracováním osobních údajů máte právo:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Na přístup k osobním údajům</li>
              <li>Na opravu osobních údajů</li>
              <li>Na výmaz osobních údajů</li>
              <li>Na omezení zpracování</li>
              <li>Na přenositelnost údajů</li>
              <li>Vznést námitku proti zpracování</li>
              <li>Podat stížnost u Úřadu pro ochranu osobních údajů</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Zabezpečení</h2>
            <p className="text-gray-700 leading-relaxed">
              Přijímáme vhodná technická a organizační opatření k ochraně vašich osobních údajů 
              před náhodným nebo neoprávněným zničením, ztrátou, pozměněním, neoprávněným zveřejněním 
              nebo zpřístupněním.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Náš web používá cookies pro zajištění základní funkcionality e-shopu. 
              Nepoužíváme analytické ani marketingové cookies třetích stran.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Kontakt</h2>
            <p className="text-gray-700 leading-relaxed">
              V případě jakýchkoliv dotazů ohledně zpracování osobních údajů nás můžete kontaktovat:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> luckaivankova1@seznam.cz</p>
            </div>
          </section>

          <section>
            <p className="text-sm text-gray-500 mt-8">
              Tyto zásady ochrany osobních údajů jsou platné od 2. prosince 2024.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
