# Monlii E-shop

E-shop s ručně šitým prádlem a oblečením pro ženy, muže i děti – [monlii.cz](https://monlii.cz), administrace na [admin.monlii.cz](https://admin.monlii.cz).

## Technologie

- **Next.js 15** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS 4**, komponenty ve stylu shadcn/ui (`components/ui`)
- **Prisma 5** + **PostgreSQL**
- **Nodemailer** (SMTP přes Mailtrap) – transakční e-maily
- **Vercel** – hosting, Blob Storage (obrázky produktů), Cron (e-maily s žádostí o recenzi)
- **Zásilkovna Z-BOX** – doprava, **QR platba** (SPAYD) – platba převodem

## Lokální vývoj

```bash
npm install
cp .env.example .env        # vyplň hodnoty (viz níže)
npm run db:setup            # vygeneruje klienta, aplikuje migrace, založí výchozí fakturační údaje
npm run dev                 # http://localhost:3000, admin na http://localhost:3000/admin
```

Užitečné příkazy:

| Příkaz | Co dělá |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | kontrola typů |
| `npm run build` | produkční build |
| `npm run db:migrate` | aplikuje migrace (`prisma migrate deploy`) |
| `npm run db:studio` | Prisma Studio – prohlížení databáze |
| `npm run demo-order` | vytvoří testovací objednávku |

## Proměnné prostředí

Vzor je v [`.env.example`](.env.example). Na Vercelu se nastavují v *Settings → Environment Variables*.

| Proměnná | Povinná | Popis |
| --- | --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | ano | PostgreSQL (`DIRECT_URL` bez connection pooleru – pro migrace) |
| `JWT_SECRET` | ano | podpis admin session (`openssl rand -base64 64`) |
| `ADMIN_USERNAME` | ne | přihlašovací jméno admina (výchozí `admin`) |
| `ADMIN_PASSWORD_HASH` | ano* | bcrypt hash hesla admina (doporučeno) |
| `ADMIN_PASSWORD` | ano* | heslo v čitelné podobě – jen pokud není nastaven hash |
| `MAILTRAP_HOST`, `MAILTRAP_PORT`, `MAILTRAP_USER`, `MAILTRAP_PASS` | ano | SMTP pro odesílání e-mailů |
| `EMAIL_FROM` | ano | odesílatel e-mailů |
| `SELLER_EMAIL` | ano | kam chodí upozornění na objednávky a zprávy z kontaktního formuláře |
| `ZASILKOVNA_API_KEY` | ano | API klíč Zásilkovny pro mapový widget (API *heslo* se nepoužívá) |
| `BLOB_READ_WRITE_TOKEN` | ano | Vercel Blob – nahrávání obrázků produktů |
| `NEXT_PUBLIC_URL` | ano | veřejná adresa webu (odkazy v e-mailech, sitemap) |
| `BANK_ACCOUNT_NUMBER`, `BANK_CODE` | ano | účet pro QR platby |
| `CRON_SECRET` | ano | zabezpečení cron endpointu; bez něj cron v produkci nic neodešle |

\* stačí jedna z nich. Hash vygeneruješ: `node -e "console.log(require('bcryptjs').hashSync('heslo', 12))"`

## Nasazení (Vercel)

- Build: `prisma generate && next build` (viz `vercel.json`), region `fra1`.
- **Migrace se při buildu nespouštějí** – po změně schématu spusť `npm run db:migrate` proti produkční DB (s `DATABASE_URL`/`DIRECT_URL` produkce).
- Domény: `monlii.cz` (e-shop), `www.monlii.cz` → přesměrování, `admin.monlii.cz` (administrace).
  `middleware.ts` přesměruje `/admin` z hlavní domény na admin subdoménu a hlídá přihlášení.
- Pokud DNS běží přes Cloudflare, záznamy pro Vercel musí být *DNS only* (bez proxy), jinak Vercel nevydá certifikát.
- Cron `/api/cron/review-emails` běží denně v 9:00 UTC (`vercel.json`).

### Migrace při nasazení nové verze

**Před nasazením verze, která přidává migraci, ji nejdřív spusťte na produkční databázi** (`npm run db:migrate`
s produkčními `DATABASE_URL` / `DIRECT_URL`). Nový kód počítá s novými sloupci a tabulkami – bez migrace by obchod
nefungoval. Migrace `1_shop_builder` přidává kategorie, výprodeje a sekce stránek a stávající produkty sama zařadí
do nového stromu kategorií (podle jejich dosavadní kategorie). Migrace `2_sold_out_and_sale_listing` přidává
volbu „skrýt vyprodaný produkt“ a „produkty jen ve výprodeji“.

### Migrace – jednorázový přechod na novou historii

Historie migrací byla nahrazena jedinou výchozí migrací `prisma/migrations/0_init`, která přesně odpovídá
`schema.prisma` (původní migrace byly částečně psané pro SQLite a na PostgreSQL neprošly).
Na **existující produkční databázi** stačí jednou spustit:

```bash
# 1) ověř, že produkční DB odpovídá schématu (má vypsat "No difference detected.")
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma

# 2) označ výchozí migraci jako aplikovanou (nic nemění na datech)
npx prisma migrate resolve --applied 0_init
```

Pokud krok 1 vypíše rozdíly, nejdřív je vyřeš (neaplikuj migraci naslepo). Nová databáze se založí běžně přes `npm run db:migrate`.

## Administrace – co kde najdete

| Sekce | K čemu slouží |
| --- | --- |
| **Produkty** | Produkty, fotky (první = hlavní, druhá se ukáže po najetí), barvy, sklad, skrytí, „doporučený“, **Skrýt, když je vyprodáno** (produkt s nulovým skladem zmizí z webu) |
| **Kategorie** | Strom kategorií. Nejvyšší úroveň (Ženy / Muži / Děti…) je v hlavním menu, podkategorie v megamenu. U kategorie se nastavuje **typ velikostí** (podprsenka, braletka, set, prádlo XS–XL, oblečení XS–XXL, dětské 86–164, bez velikostí) – podkategorie ho může zdědit. **Pořadí** se mění šipkami a platí všude (menu, dlaždice, filtry, admin). |
| **Obsah webu** | Shop builder homepage: sekce (úvodní banner, dlaždice kategorií, produkty, fotka + text, hodnoty, výprodej, příběhy, recenze, Instagram, text) – pořadí, viditelnost, texty, fotky. Záložka *Hlavičky stránek* upravuje hlavičky Obchodu, O nás, Kontaktů… |
| **Výprodeje** | Časově omezené akce (sezóna, doprodej skladu…) se slevou v %, na celý obchod / kategorie / produkty. Akce má vlastní stránku `/vyprodej/<slug>`, odkaz v menu a banner. Sleva se automaticky promítne do cen i objednávek. Volba **Zobrazovat produkty jen ve výprodeji** je po dobu akce schová z jejich kategorie a z Obchodu – ukážou se jen na stránce výprodeje; po skončení akce se samy vrátí. |
| **Nastavení → Obchod** | Vzhled produktových karet (klasické / minimalistické / přes fotku), počet sloupců, informační lišta nad menu, **písma** nadpisů a textu, **zapnutí/skrytí předplatného** |
| **Nastavení → Fakturace** | Firemní údaje a číselná řada faktur |

Změny z administrace se na webu projeví okamžitě (stránky se po uložení přegenerují).

## Jak to funguje

### Objednávka

1. Košík je v `localStorage`; uplatněný slevový kód také (`appliedDiscount`).
2. Checkout → souhrn → `POST /api/orders`.
3. **Server ceny vždy přepočítá** (`lib/order-pricing.ts`) – z databáze (produkty, sety) a z ceníku předplatného
   (`lib/pricing.ts`). Pokud se částka liší od toho, co viděl zákazník, objednávka se nevytvoří (409).
4. V jedné transakci se vytvoří objednávka, odečte sklad a započítá použití slevového kódu (`lib/order-inventory.ts`).
5. QR platba: hned se vystaví faktura a zákazník dostane e-mail s QR kódem a fakturou.
   Dobírka / platba na prodejně: faktura se vystaví při přepnutí do stavu *Ve výrobě*.

Doprava: Z-BOX 69 Kč, zdarma od 2 500 Kč (po slevě); dobírka +30 Kč; osobní odběr Havířov / Frenštát zdarma.

- **Z-BOX** si zákazník vybírá na mapě v oficiálním widgetu Zásilkovny (`lib/zasilkovna-zbox.ts`,
  klíč poskytuje `/api/zasilkovna/config`).
- **Místa osobního odběru** (adresy prodejen) jsou na jednom místě v `lib/pickup-locations.ts` –
  používá je checkout, administrace i e-maily.

### Stavy objednávky

`new` → `in_production` → `ready_to_ship` → `shipped` → `delivered`, případně `rejected` / `cancelled`.
Při změně stavu se zákazníkovi posílá e-mail (`lib/email.ts`). Odmítnutí nebo zrušení vrátí zboží na sklad
a uvolní slevový kód; smazání objednávky, která ještě neodešla, také. U QR platby přepnutí do výroby
zároveň označí objednávku i fakturu jako zaplacenou.

### Faktury

Číselná řada je v *Administrace → Nastavení → Fakturace* (`invoicePrefix` + `nextInvoiceNum`).
Číslo se rezervuje a faktura vytvoří v jedné transakci – souběžné objednávky nedostanou stejné číslo.
Bez vyplněných fakturačních údajů se faktura nevystaví (raději chyba než faktura s vymyšlenými údaji).

### Slevové kódy

Spravují se v administraci. Sleva (procentní / pevná částka) se uplatňuje jen na zboží, ne na dopravu.
Server kontroluje platnost, minimální částku i maximální počet použití.

### Zabezpečení

- Admin API ověřuje session cookie (`lib/auth.ts`), přihlášení má limit pokusů.
- Veřejné formuláře (objednávky, kontakt, slevové kódy) mají rate limit (`lib/rate-limit.ts` – v paměti instance,
  tedy „best effort“).
- Všechna data od zákazníků se v e-mailech escapují (`lib/escape-html.ts`).

### Design

- Barvy a písma jsou v `app/globals.css` (`@theme`): vínová `wine`, tmavá `ink` (barva loga), lněný podklad `linen`,
  výchozí písma Cormorant Garamond (nadpisy) a Manrope (text) – lze je změnit v administraci; nabídka písem je
  v `lib/font-options.ts`, načítání v `lib/fonts.ts`. Logo je `public/logo.svg` (tmavé) a `public/logo-light.svg`
  (světlé); pro e-maily `public/logo-email.png`.
- Stránky obchodu sdílí layout `app/(shop)/layout.tsx` (lišta, hlavička s megamenu, patička). Hlavička i menu se
  skládají z kategorií, výprodejů a nastavení (`lib/navigation.ts`).
- Sekce homepage jsou v `components/sections/`, jejich data a výchozí obsah v `lib/sections.ts`, editor polí
  v `lib/section-fields.ts`.

### Detail produktu a SEO

Detail produktu (`app/(shop)/produkt/[id]`) se vykresluje na serveru a cachuje (po úpravě v adminu se obnoví hned): má vlastní titulek, popis,
canonical URL, náhled pro sdílení (Open Graph) a strukturovaná data Product (cena, dostupnost) pro Google.

## Struktura

```
app/                 stránky (App Router) a API routy (app/api)
  (shop)/            stránky obchodu se společnou hlavičkou a patičkou
  admin/             administrace
components/          site/ (obchod), sections/ (sekce homepage), product/ (detail), admin/, ui/ (základní prvky)
lib/                 logika: ceny, objednávky, faktury, e-maily, Zásilkovna, QR platby
prisma/              schéma, migrace, seed
scripts/             pomocné skripty (demo objednávka, kontrola schématu)
public/              statické soubory
```
