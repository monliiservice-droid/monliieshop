import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Reklamační řád | Monlii',
  description: 'Reklamační řád pro Monlii e-shop',
}

export default function ComplaintsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na hlavní stránku
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Reklamační řád</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Záruka a reklamace</h2>
            <p className="text-gray-700 leading-relaxed">
              Na všechny produkty zakoupené v našem e-shopu se vztahuje zákonná záruka 24 měsíců 
              od data převzetí zboží. Záruka se vztahuje na výrobní vady a vady materiálu.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Co se nevztahuje na záruku</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mechanické poškození způsobené nesprávným použitím</li>
              <li>Opotřebení způsobené běžným používáním</li>
              <li>Poškození způsobené nevhodným praním nebo údržbou</li>
              <li>Poškození způsobené vyšší mocí</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Jak uplatnit reklamaci</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Krok 1: Kontaktujte nás</h3>
                <p className="text-gray-700">
                  Nejdříve nás kontaktujte e-mailem na <strong>luckaivankova1@seznam.cz</strong> 
                  a popište problém. Připojte fotografie vady, pokud je to možné.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Krok 2: Zaslání zboží</h3>
                <p className="text-gray-700">
                  Po domluvě zašlete vadné zboží zpět. Doporučujeme zásilku pojistit. 
                  Přiložte:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 mt-2">
                  <li>Kopii dokladu o koupi</li>
                  <li>Popis vady</li>
                  <li>Vaše kontaktní údaje</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Krok 3: Vyřízení reklamace</h3>
                <p className="text-gray-700">
                  Reklamaci vyřídíme do <strong>30 dnů</strong> od jejího uplatnění. 
                  O výsledku vás budeme informovat e-mailem.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Způsoby vyřízení reklamace</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Oprava vadného zboží</li>
              <li>Výměna za nový kus</li>
              <li>Vrácení peněz (v případě, že oprava nebo výměna není možná)</li>
              <li>Přiměřená sleva z ceny</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Práva kupujícího</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Pokud nejste spokojeni s vyřízením reklamace, máte právo:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Obrátit se na Českou obchodní inspekci</li>
              <li>Využít mimosoudní řešení sporu</li>
              <li>Podat žalobu u soudu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Péče o prádlo</h2>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Pro prodloužení životnosti vašeho prádla doporučujeme:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Prát v síťce na jemné prádlo při max. 30°C</li>
                <li>Nepoužívat aviváž</li>
                <li>Nesušit v sušičce</li>
                <li>Nežehlit krajky</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Kontakt</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> luckaivankova1@seznam.cz</p>
              <p className="text-gray-700 mt-2">
                Odpovídáme do 24 hodin (pracovní dny).
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
