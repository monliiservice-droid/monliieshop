import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Obchodní podmínky | Monlii',
  description: 'Obchodní podmínky pro Monlii e-shop',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na hlavní stránku
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Obchodní podmínky</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Úvodní ustanovení</h2>
            <p className="text-gray-700 leading-relaxed">
              Tyto obchodní podmínky upravují vzájemná práva a povinnosti mezi prodávajícím 
              Lucií Ivankovou a kupujícím při nákupu zboží prostřednictvím internetového obchodu 
              umístěného na adrese monliieshop.vercel.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Objednávka a uzavření kupní smlouvy</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Kupní smlouva je uzavřena odesláním objednávky kupujícím a jejím přijetím prodávajícím. 
              Přijetí objednávky je potvrzeno e-mailem zaslaným na e-mailovou adresu kupujícího.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cena a platební podmínky</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Ceny jsou uvedeny včetně DPH a všech poplatků. Platba je možná:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Platební kartou online (prostřednictvím GoPay)</li>
              <li>Bankovním převodem</li>
              <li>Na dobírku (při doručení)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Dodání zboží</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Zboží je dodáváno prostřednictvím přepravní společnosti na adresu uvedenou v objednávce. 
              Standardní doba dodání je 3-5 pracovních dnů od potvrzení objednávky.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Odstoupení od smlouvy</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Kupující má právo odstoupit od smlouvy do 14 dnů od převzetí zboží bez udání důvodu. 
              Zboží musí být vráceno nepoužité, v původním obalu a nesmí být porušena hygienická pečeť.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Pro odstoupení od smlouvy kontaktujte prodávajícího na e-mailu: luckaivankova1@seznam.cz
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Reklamace</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Na zboží se vztahuje zákonná záruka 24 měsíců. Reklamaci lze uplatnit:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>E-mailem na: luckaivankova1@seznam.cz</li>
              <li>Zboží zašlete s popisem vady na adresu prodávajícího</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Reklamace bude vyřízena do 30 dnů od jejího uplatnění.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Ochrana osobních údajů</h2>
            <p className="text-gray-700 leading-relaxed">
              Zpracování osobních údajů se řídí zákonem č. 110/2019 Sb., o zpracování osobních údajů 
              a nařízením GDPR. Více informací naleznete v <Link href="/ochrana-osobnich-udaju" className="text-[#931e31] hover:underline">zásadách ochrany osobních údajů</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Kontaktní údaje</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Provozovatel:</strong> Lucie Ivanková</p>
              <p className="text-gray-700"><strong>Email:</strong> luckaivankova1@seznam.cz</p>
            </div>
          </section>

          <section>
            <p className="text-sm text-gray-500 mt-8">
              Tyto obchodní podmínky jsou platné od 2. prosince 2024.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
