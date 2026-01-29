# 🛍️ Monlii E-shop

Moderní e-shop pro značku Monlii - jedinečné spodní prádlo s českou tradicí.

**Status:** ✅ Production Ready  
**Deployment:** Cloudflare Pages  
**Repository:** git@github.com:monliiservice-droid/monliieshop.git

---

## 🚀 Technologie

- **Next.js 16** - React framework s App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS
- **Prisma ORM** - Type-safe databázový client
- **PostgreSQL** - Production databáze
- **GoPay** - Česká platební brána
- **Nodemailer** - Email systém
- **Cloudflare Pages** - Hosting a CDN
- **Lucide React** - Moderní ikony

## 📋 Kompletní Funkce

### 🎨 Frontend (Customer-facing)
- ✅ Responsivní design (mobile-first)
- ✅ Hero sekce s dynamickými obrázky (desktop/mobile)
- ✅ Produktový katalog s filtry
- ✅ Detail produktu s galerií
- ✅ Nákupní košík (localStorage)
- ✅ Checkout flow
- ✅ GoPay platební brána
- ✅ Dobírka & bankovní převod
- ✅ Zásilkovna integrace
- ✅ Předplatné (subscription boxes)
- ✅ O nás stránka s příběhem
- ✅ Kontaktní formulář
- ✅ Cookie consent (GDPR)
- ✅ SEO optimalizace
- ✅ Error pages (404, 500)

### 🛠️ Admin Panel
- ✅ Dashboard s metrikami
- ✅ Správa produktů
- ✅ Správa objednávek (9 stavů workflow)
- ✅ Automatické emails při změně stavu
- ✅ Generování faktur PDF
- ✅ Správa slevových kódů
- ✅ Sledování skladových zásob
- ✅ Company settings (IČO, DIČ, adresa)
- ✅ Přehled tržeb

### 💳 Platby & Objednávky
- ✅ GoPay online platby (karty, banky, PayPal)
- ✅ Dobírka (+30 Kč)
- ✅ Bankovní převod
- ✅ Automatické webhook zpracování
- ✅ Email potvrzení objednávky
- ✅ Fakturace s automatickým číslováním
- ✅ Slevové kódy (procentuální i fixní)

### 📧 Email Systém
- ✅ Order confirmation
- ✅ Status updates (9 stavů)
- ✅ Invoice attachments
- ✅ Branded email templates
- ✅ SMTP konfigurace

## 🛠️ Lokální Vývoj

### 1. Naklonujte repozitář
```bash
git clone git@github.com:monliiservice-droid/monliieshop.git
cd monliieshop
```

### 2. Nainstalujte závislosti
```bash
npm install
```

### 3. Vytvořte .env.local
```bash
cp .env.example .env.local
```

Vyplňte hodnoty:
```env
# Database
DATABASE_URL="file:./dev.db"

# GoPay (Sandbox)
GOPAY_GO_ID="8987654321"
GOPAY_CLIENT_ID="1234567890"
GOPAY_CLIENT_SECRET="test_secret"

# Email (Mailtrap sandbox)
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT="2525"
MAILTRAP_USER="your_user"
MAILTRAP_PASS="your_pass"
EMAIL_FROM="noreply@monlii.cz"
SELLER_EMAIL="luckaivankova1@seznam.cz"

# App
NEXT_PUBLIC_URL="http://localhost:3000"
```

### 4. Nastavte databázi
```bash
# Migrace
npx prisma migrate dev

# Seed (admin + company settings)
npm run db:seed
```

### 5. Spusťte dev server
```bash
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000)

## 📱 Stránky

### Veřejné stránky
- `/` - Domovská stránka
- `/obchod` - Výpis všech produktů
- `/o-nas` - O značce Monlii
- `/kontakty` - Kontaktní informace

### Admin rozhraní
- `/admin` - Dashboard (Login: admin / 111023@Granko)
- `/admin` - Přehled objednávek a metrik
- Správa produktů, objednávek, slevových kódů
- Generování faktur

**Admin přihlášení:**
- Username: `admin`
- Password: `111023@Granko`
- (nastaveno automaticky při `npm run db:seed`)

## 🔑 Integrace

### GoPay (Platby)
1. **Testování:** https://gw.sandbox.gopay.com
2. **Produkce:** https://www.gopay.com/cs/obchodnici
3. Získejte GO ID, Client ID, Client Secret
4. Nastavte v ENV variables
5. Nakonfigurujte webhook URL v GoPay portálu

**Dokumentace:** `README_GOPAY.md`

### Email (SMTP)
Doporučené providery:
- **SendGrid** - 100 emailů/den zdarma
- **AWS SES** - velmi levné
- **Mailgun** - 5000 emailů/měsíc zdarma

**Dokumentace:** `README_EMAIL_SYSTEM.md`

### Fakturace
- Automatické generování PDF faktur
- Číslování podle roku (prefix)
- Company settings v databázi

**Dokumentace:** `README_INVOICING.md`

## 📦 Přidání prvního produktu

1. Spusťte aplikaci a přejděte na `/admin/produkty`
2. Klikněte na "Přidat produkt"
3. Vyplňte:
   - Název produktu
   - Popis
   - Cenu v Kč
   - Počet kusů na skladě
   - Kategorii (volitelné)
   - URL obrázků (jeden na řádek)
4. Klikněte na "Vytvořit produkt"

## 🗄️ Databázové schéma

### Product (Produkt)
- název, popis, cena, sklad
- obrázky (JSON array)
- kategorie
- varianty (velikost, barva)

### Order (Objednávka)
- číslo objednávky
- zákazník (jméno, email, telefon)
- adresy (doručovací, fakturační)
- položky objednávky
- celková částka
- stav (pending, paid, shipped, delivered, cancelled)
- platební metoda a stav
- způsob dopravy

### Settings (Nastavení)
- klíč-hodnota páry pro konfiguraci

## 🎨 Přizpůsobení designu

### Barvy
Hlavní barva růžová je definována v Tailwind CSS. Pro změnu upravte:
```css
/* v app/globals.css */
.bg-pink-600 -> .bg-your-color
.text-pink-600 -> .text-your-color
```

### Logo
Logo lze upravit v komponentě `components/navbar.tsx`

## 📝 Další vývoj

### Doporučené rozšíření:
- [ ] Košík a checkout proces
- [ ] Autentizace admina (NextAuth)
- [ ] Upload obrázků (místo URL)
- [ ] Detailní stránka produktu s variantami
- [ ] Filtrování a vyhledávání produktů
- [ ] Newsletter
- [ ] Hodnocení produktů
- [ ] Wishlist

## 🚀 Production Deployment

### Cloudflare Pages (Configured)

Aplikace je připravená pro deploy na Cloudflare Pages.

**Kompletní návod:** Viz `README_CLOUDFLARE.md`

**Quick deploy:**
```bash
# 1. Push na GitHub
git push origin main

# 2. V Cloudflare Dashboard:
# - Connect GitHub repository
# - Framework: Next.js
# - Build command: npm run build
# - Output: .next

# 3. Nastav Environment Variables (viz README_CLOUDFLARE.md)

# 4. Deploy!
```

### Environment Variables (Production)

V Cloudflare Pages dashboard nastav:
- `DATABASE_URL` - PostgreSQL connection string
- `GOPAY_GO_ID` - Production GO ID
- `GOPAY_CLIENT_ID` - Production Client ID
- `GOPAY_CLIENT_SECRET` - Production Secret
- `MAILTRAP_HOST` - SMTP host (čeká se na info)
- `EMAIL_FROM` - noreply@monlii.cz
- `SELLER_EMAIL` - luckaivankova1@seznam.cz
- `NEXT_PUBLIC_URL` - https://monlii.cz

## 📚 Dokumentace

Kompletní dokumentace v samostatných souborech:

- **`README_CLOUDFLARE.md`** - Cloudflare Pages deployment
- **`README_GOPAY.md`** - GoPay integrace a testování  
- **`README_EMAIL_SYSTEM.md`** - Email systém a SMTP
- **`README_INVOICING.md`** - Fakturační systém
- **`PRODUCTION_SETUP.md`** - Production setup guide
- **`FINAL_DEPLOYMENT_CHECKLIST.md`** - Pre-launch checklist
- **`GIT_SETUP.md`** - Git setup a první push

## 🏢 Company Info (Pre-configured)

**Lucie Ivanková**  
IČO: 14316242  
Dolní Domaslavice 34  
739 38 Dolní Domaslavice  
Email: luckaivankova1@seznam.cz  
Telefon: 735823160  
⚠️ Není plátce DPH

(Nastaveno automaticky v `prisma/seed.ts`)

## 📞 Kontakt & Podpora

**Developer:** Roman Velička (nevymyslis.cz)  
**Client:** Lucie Ivanková  
**Email:** luckaivankova1@seznam.cz  
**Repository:** git@github.com:monliiservice-droid/monliieshop.git

---

**Vytvořeno s ❤️ pro Monlii | Production Ready ✅**
