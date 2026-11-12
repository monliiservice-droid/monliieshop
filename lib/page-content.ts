// Stránky, které jdou upravovat v Obsahu webu, a jejich výchozí obsah.
// Výchozí obsah odpovídá původním (napevno napsaným) stránkám – použije se, dokud stránku
// v administraci neuložíte. Sdílené mezi serverem a administrací.

import { DEFAULT_HOME_LAYOUT, type SectionDataMap, type SectionType } from './sections'
import type { PageHeaderKey } from './site-settings'

export type ContentPageKey =
  | 'home'
  | 'o-nas'
  | 'kontakty'
  | 'doprava'
  | 'obchodni-podminky'
  | 'reklamace'
  | 'ochrana-osobnich-udaju'
  | 'predplatne'

export interface ContentPage {
  label: string
  path: string
  /** Stránka má nahoře hlavičku z „Hlavičky stránek“ */
  header?: PageHeaderKey
}

export const CONTENT_PAGES: Record<ContentPageKey, ContentPage> = {
  home: { label: 'Homepage', path: '/' },
  'o-nas': { label: 'O nás', path: '/o-nas', header: 'o-nas' },
  kontakty: { label: 'Kontakty', path: '/kontakty', header: 'kontakty' },
  doprava: { label: 'Doprava a platba', path: '/doprava' },
  'obchodni-podminky': { label: 'Obchodní podmínky', path: '/obchodni-podminky' },
  reklamace: { label: 'Reklamace', path: '/reklamace' },
  'ochrana-osobnich-udaju': { label: 'Ochrana osobních údajů', path: '/ochrana-osobnich-udaju' },
  predplatne: { label: 'Předplatné', path: '/predplatne', header: 'predplatne' },
}

export const CONTENT_PAGE_KEYS = Object.keys(CONTENT_PAGES) as ContentPageKey[]

export function isContentPageKey(value: unknown): value is ContentPageKey {
  return typeof value === 'string' && value in CONTENT_PAGES
}

type LayoutItem = { type: SectionType; data?: Partial<SectionDataMap[SectionType]> }

const document = (eyebrow: string, title: string, text: string): LayoutItem => ({
  type: 'text',
  data: { eyebrow, title, lead: '', text, align: 'left', layout: 'document' },
})

const SHIPPING_TEXT = `## Způsoby dopravy

### Zásilkovna Z-BOX
Automatické výdejní boxy dostupné 24/7. Z-BOX si při objednávce vyberete na mapě Zásilkovny.

Cena: **69 Kč** | Doba dodání: **2-3 pracovní dny**

### Osobní odběr
Osobní odběr v **Havířově** nebo **Frenštátě pod Radhoštěm**.

Cena: **ZDARMA** | Připravíme do **3-5 dnů (skladem), až 14 dnů (na míru)**

Doprava Z-BOXem ZDARMA při objednávce nad 2 500 Kč

## Způsoby platby

### QR platba
Rychlá a bezpečná platba bankovním převodem pomocí QR kódu.

Po potvrzení objednávky obdržíte QR kód, který naskenujete ve své bankovní aplikaci. Všechny údaje (částka, číslo účtu, variabilní symbol) se vyplní automaticky.

Zboží odesíláme po připsání platby na účet (1-2 pracovní dny)

### Dobírka
Platba při převzetí zásilky v hotovosti nebo kartou u dopravce.

Poplatek za dobírku: **+30 Kč**

## Balení a diskrétnost

Všechny objednávky balíme s láskou a péčí do elegantního obalu. Zásilka je zcela **diskrétní** - na obalu není uvedeno, co obsahuje ani od koho pochází.

## Často kladené otázky

### Jak dlouho trvá doručení?
**Zboží skladem:** 3-5 pracovních dnů.
**Zboží na míru:** až 14 pracovních dnů (záleží na složitosti výrobku).
O stavu vaší objednávky vás budeme průběžně informovat e-mailem.

### Mohu sledovat zásilku?
Ano! Po odeslání objednávky vám zašleme sledovací číslo e-mailem, díky kterému můžete sledovat stav vaší zásilky.

### Posíláte i do zahraničí?
Momentálně odesíláme pouze v rámci České republiky. V případě zájmu o zahraniční dopravu nás kontaktujte.

### Máte dotazy?
Rádi vám pomůžeme!

**Email:** luckaivankova1@seznam.cz`

const TERMS_TEXT = `## 1. Úvodní ustanovení

Tyto obchodní podmínky upravují vzájemná práva a povinnosti mezi prodávajícím Lucií Ivankovou a kupujícím při nákupu zboží prostřednictvím internetového obchodu umístěného na adrese monliieshop.vercel.app.

## 2. Objednávka a uzavření kupní smlouvy

Kupní smlouva je uzavřena odesláním objednávky kupujícím a jejím přijetím prodávajícím. Přijetí objednávky je potvrzeno e-mailem zaslaným na e-mailovou adresu kupujícího.

## 3. Cena a platební podmínky

Ceny jsou uvedeny včetně DPH a všech poplatků. Platba je možná:
- QR platbou (bankovním převodem pomocí QR kódu)
- Na dobírku (při doručení, poplatek +30 Kč)

Po potvrzení objednávky s platbou QR kódem obdržíte e-mail s QR kódem a platebními údaji (číslo účtu, variabilní symbol, částka). Zboží bude odesláno po připsání platby na účet.

## 4. Dodání zboží

Zboží je dodáváno prostřednictvím přepravní společnosti na adresu uvedenou v objednávce. Standardní doba dodání je 3-5 pracovních dnů od potvrzení objednávky.

## 5. Odstoupení od smlouvy

Kupující má právo odstoupit od smlouvy do 14 dnů od převzetí zboží bez udání důvodu. Zboží musí být vráceno nepoužité, v původním obalu a nesmí být porušena hygienická pečeť.

Pro odstoupení od smlouvy kontaktujte prodávajícího na e-mailu: luckaivankova1@seznam.cz

## 6. Reklamace

Na zboží se vztahuje zákonná záruka 24 měsíců. Reklamaci lze uplatnit:
- E-mailem na: luckaivankova1@seznam.cz
- Zboží zašlete s popisem vady na adresu prodávajícího

Reklamace bude vyřízena do 30 dnů od jejího uplatnění.

## 7. Ochrana osobních údajů

Zpracování osobních údajů se řídí zákonem č. 110/2019 Sb., o zpracování osobních údajů a nařízením GDPR. Více informací naleznete v [zásadách ochrany osobních údajů](/ochrana-osobnich-udaju).

## 8. Kontaktní údaje

**Provozovatel:** Lucie Ivanková

**Email:** luckaivankova1@seznam.cz

Tyto obchodní podmínky jsou platné od 2. prosince 2024.`

const COMPLAINTS_TEXT = `## 1. Záruka a reklamace

Na všechny produkty zakoupené v našem e-shopu se vztahuje zákonná záruka 24 měsíců od data převzetí zboží. Záruka se vztahuje na výrobní vady a vady materiálu.

## 2. Co se nevztahuje na záruku

- Mechanické poškození způsobené nesprávným použitím
- Opotřebení způsobené běžným používáním
- Poškození způsobené nevhodným praním nebo údržbou
- Poškození způsobené vyšší mocí

## 3. Jak uplatnit reklamaci

### Krok 1: Kontaktujte nás
Nejdříve nás kontaktujte e-mailem na **luckaivankova1@seznam.cz** a popište problém. Připojte fotografie vady, pokud je to možné.

### Krok 2: Zaslání zboží
Po domluvě zašlete vadné zboží zpět. Doporučujeme zásilku pojistit. Přiložte:
- Kopii dokladu o koupi
- Popis vady
- Vaše kontaktní údaje

### Krok 3: Vyřízení reklamace
Reklamaci vyřídíme do **30 dnů** od jejího uplatnění. O výsledku vás budeme informovat e-mailem.

## 4. Způsoby vyřízení reklamace

- Oprava vadného zboží
- Výměna za nový kus
- Vrácení peněz (v případě, že oprava nebo výměna není možná)
- Přiměřená sleva z ceny

## 5. Práva kupujícího

Pokud nejste spokojeni s vyřízením reklamace, máte právo:
- Obrátit se na Českou obchodní inspekci
- Využít mimosoudní řešení sporu
- Podat žalobu u soudu

## 6. Péče o prádlo

**Pro prodloužení životnosti vašeho prádla doporučujeme:**
- Prát v síťce na jemné prádlo při max. 30°C
- Nepoužívat aviváž
- Nesušit v sušičce
- Nežehlit krajky

## 7. Kontakt

**Email:** luckaivankova1@seznam.cz

Odpovídáme do 24 hodin (pracovní dny).`

const PRIVACY_TEXT = `## 1. Základní ustanovení

Provozovatelem internetového obchodu Monlii je Lucie Ivanková. Ochrana vašich osobních údajů je pro nás prioritou. Tento dokument popisuje, jak nakládáme s osobními údaji, které nám poskytnete.

## 2. Jaké údaje zpracováváme

Při objednávce od vás vyžadujeme následující údaje:
- Jméno a příjmení
- E-mailová adresa
- Telefonní číslo
- Doručovací adresa
- Fakturační údaje (pokud jsou odlišné od doručovací adresy)

## 3. Účel zpracování

Vaše osobní údaje zpracováváme pro následující účely:
- Vyřízení a doručení objednávky
- Komunikace ohledně objednávky
- Vystavení daňových dokladů
- Řešení reklamací a záručních nároků
- Zasílání obchodních sdělení (pouze s vaším souhlasem)

## 4. Doba uchovávání

Osobní údaje uchováváme pouze po dobu nezbytně nutnou k naplnění účelu zpracování, minimálně však po dobu stanovenou právními předpisy (zejména zákonem o archivnictví a evidenci - 5 let pro účetní doklady).

## 5. Předávání třetím stranám

Vaše osobní údaje můžeme předávat:
- Dopravním společnostem (za účelem doručení zboží)
- Účetní společnosti (za účelem vedení účetnictví)

Všechny třetí strany jsou smluvně zavázány k ochraně vašich osobních údajů. Pro zpracování QR plateb nejsou vaše údaje předávány třetím stranám - platba probíhá standardním bankovním převodem přímo na účet prodávajícího.

## 6. Vaše práva

V souvislosti se zpracováním osobních údajů máte právo:
- Na přístup k osobním údajům
- Na opravu osobních údajů
- Na výmaz osobních údajů
- Na omezení zpracování
- Na přenositelnost údajů
- Vznést námitku proti zpracování
- Podat stížnost u Úřadu pro ochranu osobních údajů

## 7. Zabezpečení

Přijímáme vhodná technická a organizační opatření k ochraně vašich osobních údajů před náhodným nebo neoprávněným zničením, ztrátou, pozměněním, neoprávněným zveřejněním nebo zpřístupněním.

## 8. Cookies

Náš web používá cookies pro zajištění základní funkcionality e-shopu. Nepoužíváme analytické ani marketingové cookies třetích stran.

## 9. Kontakt

V případě jakýchkoliv dotazů ohledně zpracování osobních údajů nás můžete kontaktovat:

**Email:** luckaivankova1@seznam.cz

Tyto zásady ochrany osobních údajů jsou platné od 2. prosince 2024.`

const ABOUT_TEXT = `Začal u mamky. U jejího snu, který si nosila v hlavě celé roky, ale nikdy si na něj nenašla prostor. Vždycky tu byl někdo, o koho se starala víc než o sebe — my dvě, práce, domácnost… život.

A pak jednoho dne přišel moment, kdy jsme si jako tři holky sedly ke stolu a řekly si: „Proč vlastně ne? Proč nezkusit vytvořit něco vlastního, něco, co bude dávat smysl nám třem a bude nás bavit?“ A tak vzniklo Monlii. Název, který pro nás neznamená jen brand, ale připomínku toho, že když se spojíme, dokážeme vytvořit víc, než jsme si kdy myslely.

## Proč vlastně prádlo?

Věříme, že každý si zaslouží cítit se ve svém těle dobře. Bez ohledu na věk, postavu, náladu nebo to, co čeká venku. Ne dokonale… ale skutečně dobře.

Proto vybíráme materiály, které nejsou jen hezké, ale i pohodlné. Proto si hrajeme s krajkou, detaily a střihem. Proto zkoušíme, ladíme, fotíme, předěláváme… protože každý kus musí mít duši.

## Rodinný projekt

Pracujeme spolu. Dohadujeme se, smějeme se, zkoušíme prototypy a přemýšlíme, jak udělat Monlii nejen produktem, ale i pocitem. Jsme tři různé ženy – každá jiná, každá se svým pohledem. A právě díky tomu tvoříme věci, které nejsou jen pro „ideální postavy“, ale pro skutečné lidi.

## Nově pro celou rodinu

Začínaly jsme dámským prádlem. Teď šijeme i pro muže a děti – se stejnou péčí, ze stejně příjemných materiálů a se stejným přístupem: pomalu, poctivě a s láskou k tělu i přírodě.`

export const DEFAULT_PAGE_LAYOUTS: Record<ContentPageKey, LayoutItem[]> = {
  home: DEFAULT_HOME_LAYOUT,
  'o-nas': [
    {
      type: 'text',
      data: {
        eyebrow: 'Náš příběh',
        title: '',
        lead: 'Monlii není jen značka. Je to náš rodinný projekt, který začal dávno předtím, než vznikl samotný e-shop.',
        text: ABOUT_TEXT,
        align: 'left',
        layout: 'article',
      },
    },
    {
      type: 'imageText',
      data: {
        eyebrow: 'Co je pro nás důležité',
        title: '',
        items: [
          { title: 'Ruční výroba', text: 'Každý kousek ušijeme ručně s péčí o detail. Žádná masová výroba, jen poctivé řemeslo.' },
          { title: 'Česká dílna', text: 'Navazujeme na českou švadlenskou tradici. Všechno vzniká u nás, v malých sériích.' },
          { title: 'Pro skutečná těla', text: 'Šijeme pro reálné postavy – a když je potřeba, rády ušijeme i na míru.' },
        ],
        text: 'Tři holky, jedna rodina a jeden společný sen.',
        image: '/about_us.jpg',
        imagePosition: 'left',
        button: { text: 'Prohlédnout kolekci', link: '/obchod' },
        background: 'sand',
      },
    },
  ],
  kontakty: [{ type: 'contact' }],
  doprava: [document('Informace', 'Doprava a platba', SHIPPING_TEXT)],
  'obchodni-podminky': [document('Právní informace', 'Obchodní podmínky', TERMS_TEXT)],
  reklamace: [document('Zákaznický servis', 'Reklamační řád', COMPLAINTS_TEXT)],
  'ochrana-osobnich-udaju': [document('Právní informace', 'Ochrana osobních údajů', PRIVACY_TEXT)],
  predplatne: [{ type: 'subscription' }],
}

