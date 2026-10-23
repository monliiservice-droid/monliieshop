import Link from 'next/link'
import { LegalPage } from '@/components/site/legal-page'
export const metadata = {
  title: 'Obchodní podmínky | Monlii - VOP e-shopu',
  description: 'Všeobecné obchodní podmínky pro nákup v Monlii e-shopu. Informace o objednávání, platbě, dopravě a odstoupení od smlouvy.',
  keywords: ['obchodní podmínky monlii', 'VOP', 'podmínky nákupu', 'odstoupení od smlouvy', 'nákupní podmínky'],
  openGraph: {
    title: 'Obchodní podmínky | Monlii',
    description: 'Všeobecné obchodní podmínky pro nákup v Monlii e-shopu.',
    url: '/obchodni-podminky',
    images: ['/story_4.jpg'],
  },
}

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Právní informace" title="Obchodní podmínky">

        <div>
          <section>
            <h2>1. Úvodní ustanovení</h2>
            <p>
              Tyto obchodní podmínky upravují vzájemná práva a povinnosti mezi prodávajícím 
              Lucií Ivankovou a kupujícím při nákupu zboží prostřednictvím internetového obchodu 
              umístěného na adrese monliieshop.vercel.app.
            </p>
          </section>

          <section>
            <h2>2. Objednávka a uzavření kupní smlouvy</h2>
            <p>
              Kupní smlouva je uzavřena odesláním objednávky kupujícím a jejím přijetím prodávajícím. 
              Přijetí objednávky je potvrzeno e-mailem zaslaným na e-mailovou adresu kupujícího.
            </p>
          </section>

          <section>
            <h2>3. Cena a platební podmínky</h2>
            <p>
              Ceny jsou uvedeny včetně DPH a všech poplatků. Platba je možná:
            </p>
            <ul>
              <li>QR platbou (bankovním převodem pomocí QR kódu)</li>
              <li>Na dobírku (při doručení, poplatek +30 Kč)</li>
            </ul>
            <p>
              Po potvrzení objednávky s platbou QR kódem obdržíte e-mail s QR kódem a platebními údaji 
              (číslo účtu, variabilní symbol, částka). Zboží bude odesláno po připsání platby na účet.
            </p>
          </section>

          <section>
            <h2>4. Dodání zboží</h2>
            <p>
              Zboží je dodáváno prostřednictvím přepravní společnosti na adresu uvedenou v objednávce. 
              Standardní doba dodání je 3-5 pracovních dnů od potvrzení objednávky.
            </p>
          </section>

          <section>
            <h2>5. Odstoupení od smlouvy</h2>
            <p>
              Kupující má právo odstoupit od smlouvy do 14 dnů od převzetí zboží bez udání důvodu. 
              Zboží musí být vráceno nepoužité, v původním obalu a nesmí být porušena hygienická pečeť.
            </p>
            <p>
              Pro odstoupení od smlouvy kontaktujte prodávajícího na e-mailu: luckaivankova1@seznam.cz
            </p>
          </section>

          <section>
            <h2>6. Reklamace</h2>
            <p>
              Na zboží se vztahuje zákonná záruka 24 měsíců. Reklamaci lze uplatnit:
            </p>
            <ul>
              <li>E-mailem na: luckaivankova1@seznam.cz</li>
              <li>Zboží zašlete s popisem vady na adresu prodávajícího</li>
            </ul>
            <p>
              Reklamace bude vyřízena do 30 dnů od jejího uplatnění.
            </p>
          </section>

          <section>
            <h2>7. Ochrana osobních údajů</h2>
            <p>
              Zpracování osobních údajů se řídí zákonem č. 110/2019 Sb., o zpracování osobních údajů 
              a nařízením GDPR. Více informací naleznete v <Link href="/ochrana-osobnich-udaju">zásadách ochrany osobních údajů</Link>.
            </p>
          </section>

          <section>
            <h2>8. Kontaktní údaje</h2>
            <div>
              <p><strong>Provozovatel:</strong> Lucie Ivanková</p>
              <p><strong>Email:</strong> luckaivankova1@seznam.cz</p>
            </div>
          </section>

          <section>
            <p>
              Tyto obchodní podmínky jsou platné od 2. prosince 2024.
            </p>
          </section>
        </div>
    </LegalPage>
  )
}
