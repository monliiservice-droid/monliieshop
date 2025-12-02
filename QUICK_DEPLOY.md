# 🚀 Quick Deploy Guide - Monlii E-shop

**Status:** ✅ 100% READY TO DEPLOY!  
**Datum:** 2. prosince 2025, 19:45

---

## ✅ CO JE HOTOVÉ

- ✅ Kompletní aplikace (frontend + backend)
- ✅ GoPay integrace (připravená pro production)
- ✅ **Email systém (Mailtrap SMTP nastavený)**
- ✅ Fakturační systém
- ✅ Admin panel (admin / ***REMOVED***)
- ✅ Company settings (Lucie Ivanková, IČO 14316242)
- ✅ Database seed scripty
- ✅ Kompletní dokumentace
- ✅ Git repository ready
- ⚠️ **NEPUSHOVÁNO - čeká se na schválení!**

---

## 🎯 DEPLOYMENT V 5 KROCÍCH

### Krok 1: Git Push (2 minuty)

```bash
cd "/Users/roumen/Documents/Soukromé/Nevymyslíš/Monlii EShop/monlii-eshop"

# Inicializuj (pokud ještě není)
git init

# Přidej remote
git remote add origin git@github.com:monliiservice-droid/monliieshop.git

# První commit
git add .
git commit -m "Initial commit - Monlii E-shop Production Ready

Features:
- Next.js 16 aplikace
- GoPay payment integration
- Email system (Mailtrap)
- Invoice generation
- Admin panel
- Cloudflare Pages ready
"

# Push!
git push -u origin main
```

### Krok 2: Cloudflare Pages Setup (10 minut)

1. **Jdi na:** https://dash.cloudflare.com
2. **Pages** → **Create a project**
3. **Connect to Git** → GitHub
4. **Vyber:** `monliiservice-droid/monliieshop`
5. **Build settings:**
   - Framework: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
   - Root directory: `/`
   - Node version: `20`

### Krok 3: Environment Variables (5 minut)

V Cloudflare Pages nastavení přidej:

```bash
# Database (vytvoř na Neon/Supabase/Railway)
DATABASE_URL=postgresql://user:pass@host:5432/monlii_prod

# GoPay (zatím sandbox, později production)
GOPAY_GO_ID=8987654321
GOPAY_CLIENT_ID=1234567890
GOPAY_CLIENT_SECRET=test_secret

# Email (PRODUCTION READY!)
MAILTRAP_HOST=live.smtp.mailtrap.io
MAILTRAP_PORT=587
MAILTRAP_USER=api
MAILTRAP_PASS=***REMOVED***
EMAIL_FROM=noreply@monlii.cz
SELLER_EMAIL=luckaivankova1@seznam.cz

# App
NEXT_PUBLIC_URL=https://monlii.cz
NODE_ENV=production
```

### Krok 4: Database Setup (10 minut)

**A) Vytvoř Production Database:**

Doporučeno: **Neon** (zdarma) - https://neon.tech

1. Vytvoř účet
2. Vytvoř projekt "Monlii"
3. Zkopíruj connection string
4. Vlož do Cloudflare ENV jako `DATABASE_URL`

**B) Migrace & Seed:**

Po prvním deployi (nebo přes lokální s production DB):

```bash
# Nastav production DATABASE_URL lokálně
export DATABASE_URL="postgresql://..."

# Migrace
npx prisma migrate deploy

# Seed (admin + company settings)
npm run db:seed

# Ověř
npx prisma studio
```

### Krok 5: Custom Domain (5 minut)

V Cloudflare Pages:

1. **Custom domains** → **Add domain**
2. Zadej: `monlii.cz`
3. Přidej: `www.monlii.cz`
4. Cloudflare automaticky:
   - Vytvoří CNAME záznamy
   - Aktivuje SSL
   - Nastaví HTTPS redirect

---

## 🧪 TESTOVÁNÍ

### Po deployi otestuj:

1. **Homepage:** https://monlii.cz
2. **Admin:** https://monlii.cz/admin
   - Login: `admin` / `***REMOVED***`
3. **Testovací objednávka:**
   - Přidej produkt do košíku
   - Checkout
   - GoPay sandbox karta: `4111 1111 1111 1111`
   - Ověř webhook
4. **Email test:**
   - V admin změň status objednávky
   - Zkontroluj, že email přišel
5. **Faktura:**
   - Vygeneruj fakturu v admin
   - Ověř PDF

---

## 📊 TIMELINE

| Krok | Čas | Status |
|------|-----|--------|
| 1. Git push | 2 min | ⏳ Čeká na tebe |
| 2. Cloudflare setup | 10 min | ⏳ Čeká na tebe |
| 3. ENV variables | 5 min | ⏳ Čeká na tebe |
| 4. Database setup | 10 min | ⏳ Čeká na tebe |
| 5. Domain setup | 5 min | ⏳ Čeká na tebe |
| **CELKEM** | **~30 min** | **🚀 Ready!** |

---

## ⚠️ DŮLEŽITÉ POZNÁMKY

### Admin Přihlášení:
```
URL: https://monlii.cz/admin
Username: admin
Password: ***REMOVED***
```
(Automaticky z seed scriptu)

### Company Settings (v databázi):
```
Název: Lucie Ivanková
IČO: 14316242
Adresa: Dolní Domaslavice 34, 739 38 Dolní Domaslavice
Email: luckaivankova1@seznam.cz
Telefon: 735823160
Není plátce DPH
Prefix faktur: podle roku (2025)
```
(Automaticky z seed scriptu)

### Email:
```
✅ SMTP: live.smtp.mailtrap.io:587
✅ API Token: ***REMOVED***
✅ From: noreply@monlii.cz
✅ Seller: luckaivankova1@seznam.cz
```

### GoPay:
```
⏳ Sandbox ready (pro testování)
⏳ Production - registruj na https://www.gopay.com
⏳ Po schválení (1-3 dny) nastav production credentials
```

---

## 🔗 QUICK LINKS

**Repository:**  
git@github.com:monliiservice-droid/monliieshop.git

**Dokumentace:**
- `README_CLOUDFLARE.md` - Detailní Cloudflare guide
- `README_GOPAY.md` - GoPay integrace
- `GIT_SETUP.md` - Git setup
- `STATUS.md` - Aktuální status projektu

**External:**
- Cloudflare: https://dash.cloudflare.com
- Neon DB: https://neon.tech
- GoPay Sandbox: https://gw.sandbox.gopay.com
- GoPay Production: https://www.gopay.com
- Mailtrap: https://mailtrap.io

---

## 🆘 HELP

**Pokud něco nejde:**
1. Zkontroluj `STATUS.md` - aktuální stav
2. Přečti `README_CLOUDFLARE.md` - detailní návod
3. Zkontroluj ENV variables v Cloudflare
4. Zkontroluj build logs v Cloudflare Pages

---

## ✨ DONE!

Po dokončení všech kroků:
- ✅ Web běží na https://monlii.cz
- ✅ Admin panel přístupný
- ✅ Emaily fungují
- ✅ GoPay platby ready (sandbox nebo production)
- ✅ Faktury se generují
- ✅ Vše připraveno k prodeji!

**Můžeš začít přidávat produkty a prodávat! 🎉**

---

**Vytvořeno:** 2. prosince 2025  
**Developer:** Roman Velička (nevymyslis.cz)  
**Client:** Lucie Ivanková
