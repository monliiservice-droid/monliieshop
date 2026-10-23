# Monlii E-shop

E-shop s ručně šitým spodním prádlem – [monlii.cz](https://monlii.cz), administrace na [admin.monlii.cz](https://admin.monlii.cz).

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
| `ZASILKOVNA_API_KEY` | ano | API klíč Zásilkovny – **pouze serverová proměnná, bez `NEXT_PUBLIC_`** |
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

### Instagram na homepage

`components/InstagramFeed.tsx` – seznam příspěvků (obrázek v `public/instagram/post-N.jpg` + odkaz na post).
Nový příspěvek = ulož obrázek do `public/instagram/` a přidej položku do pole v komponentě.

## Struktura

```
app/                 stránky (App Router) a API routy (app/api)
  admin/             administrace
components/          sdílené komponenty, components/ui = základní UI prvky
lib/                 logika: ceny, objednávky, faktury, e-maily, Zásilkovna, QR platby
prisma/              schéma, migrace, seed
scripts/             pomocné skripty (demo objednávka, kontrola schématu)
public/              statické soubory
```
