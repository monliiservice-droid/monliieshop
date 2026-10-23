import { LegalPage } from '@/components/site/legal-page'
export const metadata = {
  title: 'Ochrana osobních údajů | Monlii - GDPR a soukromí',
  description: 'Informace o zpracování a ochraně vašich osobních údajů v souladu s GDPR. Zjistěte, jak nakládáme s vašimi daty při nákupu v Monlii e-shopu.',
  keywords: ['ochrana osobních údajů', 'GDPR', 'zpracování údajů', 'soukromí', 'cookies'],
  openGraph: {
    title: 'Ochrana osobních údajů | Monlii',
    description: 'Informace o zpracování a ochraně vašich osobních údajů v souladu s GDPR.',
    url: '/ochrana-osobnich-udaju',
    images: ['/story_4.jpg'],
  },
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage eyebrow="Právní informace" title="Ochrana osobních údajů">

        <div>
          <section>
            <h2>1. Základní ustanovení</h2>
            <p>
              Provozovatelem internetového obchodu Monlii je Lucie Ivanková.
              Ochrana vašich osobních údajů je pro nás prioritou. Tento dokument popisuje, 
              jak nakládáme s osobními údaji, které nám poskytnete.
            </p>
          </section>

          <section>
            <h2>2. Jaké údaje zpracováváme</h2>
            <p>
              Při objednávce od vás vyžadujeme následující údaje:
            </p>
            <ul>
              <li>Jméno a příjmení</li>
              <li>E-mailová adresa</li>
              <li>Telefonní číslo</li>
              <li>Doručovací adresa</li>
              <li>Fakturační údaje (pokud jsou odlišné od doručovací adresy)</li>
            </ul>
          </section>

          <section>
            <h2>3. Účel zpracování</h2>
            <p>
              Vaše osobní údaje zpracováváme pro následující účely:
            </p>
            <ul>
              <li>Vyřízení a doručení objednávky</li>
              <li>Komunikace ohledně objednávky</li>
              <li>Vystavení daňových dokladů</li>
              <li>Řešení reklamací a záručních nároků</li>
              <li>Zasílání obchodních sdělení (pouze s vaším souhlasem)</li>
            </ul>
          </section>

          <section>
            <h2>4. Doba uchovávání</h2>
            <p>
              Osobní údaje uchováváme pouze po dobu nezbytně nutnou k naplnění účelu zpracování, 
              minimálně však po dobu stanovenou právními předpisy (zejména zákonem o archivnictví 
              a evidenci - 5 let pro účetní doklady).
            </p>
          </section>

          <section>
            <h2>5. Předávání třetím stranám</h2>
            <p>
              Vaše osobní údaje můžeme předávat:
            </p>
            <ul>
              <li>Dopravním společnostem (za účelem doručení zboží)</li>
              <li>Účetní společnosti (za účelem vedení účetnictví)</li>
            </ul>
            <p>
              Všechny třetí strany jsou smluvně zavázány k ochraně vašich osobních údajů. 
              Pro zpracování QR plateb nejsou vaše údaje předávány třetím stranám - platba probíhá 
              standardním bankovním převodem přímo na účet prodávajícího.
            </p>
          </section>

          <section>
            <h2>6. Vaše práva</h2>
            <p>
              V souvislosti se zpracováním osobních údajů máte právo:
            </p>
            <ul>
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
            <h2>7. Zabezpečení</h2>
            <p>
              Přijímáme vhodná technická a organizační opatření k ochraně vašich osobních údajů 
              před náhodným nebo neoprávněným zničením, ztrátou, pozměněním, neoprávněným zveřejněním 
              nebo zpřístupněním.
            </p>
          </section>

          <section>
            <h2>8. Cookies</h2>
            <p>
              Náš web používá cookies pro zajištění základní funkcionality e-shopu. 
              Nepoužíváme analytické ani marketingové cookies třetích stran.
            </p>
          </section>

          <section>
            <h2>9. Kontakt</h2>
            <p>
              V případě jakýchkoliv dotazů ohledně zpracování osobních údajů nás můžete kontaktovat:
            </p>
            <div>
              <p><strong>Email:</strong> luckaivankova1@seznam.cz</p>
            </div>
          </section>

          <section>
            <p>
              Tyto zásady ochrany osobních údajů jsou platné od 2. prosince 2024.
            </p>
          </section>
        </div>
    </LegalPage>
  )
}
