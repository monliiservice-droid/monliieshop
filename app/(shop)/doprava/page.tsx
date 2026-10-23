import { LegalPage } from '@/components/site/legal-page'
export const metadata = {
  title: 'Doprava a platba | Monlii - Informace o doručení',
  description: 'Doprava zdarma nad 2500 Kč do Z-BOXu Zásilkovny. Osobní odběr zdarma v Havířově nebo Frenštátě. Platba QR kódem nebo na dobírku.',
  keywords: ['doprava monlii', 'zásilkovna', 'z-box', 'osobní odběr', 'QR platba', 'dobírka', 'havířov', 'frenštát'],
  openGraph: {
    title: 'Doprava a platba | Monlii',
    description: 'Doprava zdarma nad 2500 Kč do Z-BOXu. Platba QR kódem nebo na dobírku.',
    url: '/doprava',
    images: ['/story_4.jpg'],
  },
}

export default function ShippingPage() {
  return (
    <LegalPage eyebrow="Informace" title="Doprava a platba">

        <div>
          {/* Doprava */}
          <section>
            <div>
              <h2>Způsoby dopravy</h2>
            </div>

            <div>
              <div>
                <h3>Zásilkovna Z-BOX</h3>
                <p>
                  Automatické výdejní boxy dostupné 24/7. Z-BOX si při objednávce vyberete na mapě Zásilkovny.
                </p>
                <p>
                  Cena: <strong>69 Kč</strong> | Doba dodání: <strong>2-3 pracovní dny</strong>
                </p>
              </div>

              <div>
                <h3>Osobní odběr</h3>
                <p>
                  Osobní odběr v <strong>Havířově</strong> nebo <strong>Frenštátě pod Radhoštěm</strong>.
                </p>
                <p>
                  Cena: <strong>ZDARMA</strong> | Připravíme do <strong>3-5 dnů (skladem), až 14 dnů (na míru)</strong>
                </p>
              </div>

              <div>
                <p>
                  Doprava Z-BOXem ZDARMA při objednávce nad 2 500 Kč
                </p>
              </div>
            </div>
          </section>

          {/* Platba */}
          <section>
            <div>
              <h2>Způsoby platby</h2>
            </div>

            <div>
              <div>
                <h3>QR platba</h3>
                <p>
                  Rychlá a bezpečná platba bankovním převodem pomocí QR kódu.
                </p>
                <p>
                  Po potvrzení objednávky obdržíte QR kód, který naskenujete ve své bankovní aplikaci. 
                  Všechny údaje (částka, číslo účtu, variabilní symbol) se vyplní automaticky.
                </p>
                <p>
                  Zboží odesíláme po připsání platby na účet (1-2 pracovní dny)
                </p>
              </div>

              <div>
                <h3>Dobírka</h3>
                <p>
                  Platba při převzetí zásilky v hotovosti nebo kartou u dopravce.
                </p>
                <p>
                  Poplatek za dobírku: <strong>+30 Kč</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Balení */}
          <section>
            <div>
              <h2>Balení a diskrétnost</h2>
            </div>
            
            <div>
              <p>
                Všechny objednávky balíme s láskou a péčí do elegantního obalu. 
                Zásilka je zcela <strong>diskrétní</strong> - na obalu není uvedeno, 
                co obsahuje ani od koho pochází. </p>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2>Často kladené otázky</h2>
            
            <div>
              <div>
                <h3>Jak dlouho trvá doručení?</h3>
                <p>
                  <strong>Zboží skladem:</strong> 3-5 pracovních dnů.<br/>
                  <strong>Zboží na míru:</strong> až 14 pracovních dnů (záleží na složitosti výrobku).<br/>
                  O stavu vaší objednávky vás budeme průběžně informovat e-mailem.
                </p>
              </div>

              <div>
                <h3>Mohu sledovat zásilku?</h3>
                <p>
                  Ano! Po odeslání objednávky vám zašleme sledovací číslo e-mailem, 
                  díky kterému můžete sledovat stav vaší zásilky.
                </p>
              </div>

              <div>
                <h3>Posíláte i do zahraničí?</h3>
                <p>
                  Momentálně odesíláme pouze v rámci České republiky. 
                  V případě zájmu o zahraniční dopravu nás kontaktujte.
                </p>
              </div>
            </div>
          </section>

          {/* Kontakt */}
          <section>
            <div>
              <h3>Máte dotazy?</h3>
              <p>Rádi vám pomůžeme!</p>
              <p><strong>Email:</strong> luckaivankova1@seznam.cz</p>
            </div>
          </section>
        </div>
    </LegalPage>
  )
}
