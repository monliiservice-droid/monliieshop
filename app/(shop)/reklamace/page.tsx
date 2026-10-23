import { LegalPage } from '@/components/site/legal-page'
export const metadata = {
  title: 'Reklamační řád | Monlii - Podmínky reklamace',
  description: 'Kompletní reklamační řád pro produkty z Monlii e-shopu. Informace o záruce, postupu při reklamaci a vašich právech jako spotřebitele.',
  keywords: ['reklamace monlii', 'reklamační řád', 'záruka', 'vrácení zboží', 'výměna produktu'],
  openGraph: {
    title: 'Reklamační řád | Monlii',
    description: 'Informace o reklamacích a záruce produktů Monlii.',
    url: '/reklamace',
    images: ['/story_4.jpg'],
  },
}

export default function ComplaintsPage() {
  return (
    <LegalPage eyebrow="Zákaznický servis" title="Reklamační řád">

        <div>
          <section>
            <h2>1. Záruka a reklamace</h2>
            <p>
              Na všechny produkty zakoupené v našem e-shopu se vztahuje zákonná záruka 24 měsíců 
              od data převzetí zboží. Záruka se vztahuje na výrobní vady a vady materiálu.
            </p>
          </section>

          <section>
            <h2>2. Co se nevztahuje na záruku</h2>
            <ul>
              <li>Mechanické poškození způsobené nesprávným použitím</li>
              <li>Opotřebení způsobené běžným používáním</li>
              <li>Poškození způsobené nevhodným praním nebo údržbou</li>
              <li>Poškození způsobené vyšší mocí</li>
            </ul>
          </section>

          <section>
            <h2>3. Jak uplatnit reklamaci</h2>
            <div>
              <div>
                <h3>Krok 1: Kontaktujte nás</h3>
                <p>
                  Nejdříve nás kontaktujte e-mailem na <strong>luckaivankova1@seznam.cz</strong> 
                  a popište problém. Připojte fotografie vady, pokud je to možné.
                </p>
              </div>

              <div>
                <h3>Krok 2: Zaslání zboží</h3>
                <p>
                  Po domluvě zašlete vadné zboží zpět. Doporučujeme zásilku pojistit. 
                  Přiložte:
                </p>
                <ul>
                  <li>Kopii dokladu o koupi</li>
                  <li>Popis vady</li>
                  <li>Vaše kontaktní údaje</li>
                </ul>
              </div>

              <div>
                <h3>Krok 3: Vyřízení reklamace</h3>
                <p>
                  Reklamaci vyřídíme do <strong>30 dnů</strong> od jejího uplatnění. 
                  O výsledku vás budeme informovat e-mailem.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>4. Způsoby vyřízení reklamace</h2>
            <ul>
              <li>Oprava vadného zboží</li>
              <li>Výměna za nový kus</li>
              <li>Vrácení peněz (v případě, že oprava nebo výměna není možná)</li>
              <li>Přiměřená sleva z ceny</li>
            </ul>
          </section>

          <section>
            <h2>5. Práva kupujícího</h2>
            <p>
              Pokud nejste spokojeni s vyřízením reklamace, máte právo:
            </p>
            <ul>
              <li>Obrátit se na Českou obchodní inspekci</li>
              <li>Využít mimosoudní řešení sporu</li>
              <li>Podat žalobu u soudu</li>
            </ul>
          </section>

          <section>
            <h2>6. Péče o prádlo</h2>
            <div>
              <p>
                <strong>Pro prodloužení životnosti vašeho prádla doporučujeme:</strong>
              </p>
              <ul>
                <li>Prát v síťce na jemné prádlo při max. 30°C</li>
                <li>Nepoužívat aviváž</li>
                <li>Nesušit v sušičce</li>
                <li>Nežehlit krajky</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>7. Kontakt</h2>
            <div>
              <p><strong>Email:</strong> luckaivankova1@seznam.cz</p>
              <p>
                Odpovídáme do 24 hodin (pracovní dny).
              </p>
            </div>
          </section>
        </div>
    </LegalPage>
  )
}
