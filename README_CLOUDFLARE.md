# ☁️ Cloudflare Pages Deployment - Monlii E-shop

Kompletní průvodce nasazením Monlii eshopu na Cloudflare Pages.

---

## 🎯 Proč Cloudflare Pages?

✅ **Zdarma** - Unlimited requests, unlimited bandwidth  
✅ **Rychlé** - Globální CDN, edge functions  
✅ **HTTPS** - Automatický SSL certifikát  
✅ **Git workflow** - Automatické deploymenty z GitHubu  
✅ **Preview deployments** - Pro každý commit  
✅ **Environment variables** - Oddělené pro production/preview  
✅ **Custom domains** - monlii.cz zdarma  

---

## 📋 Quick Start

### 1. Připrav Git Repository

```bash
cd /Users/roumen/Documents/Soukromé/Nevymyslíš/Monlii\ EShop/monlii-eshop

# Inicializuj git (pokud ještě není)
git init

# Přidej remote
git remote add origin git@github.com:monliiservice-droid/monliieshop.git

# První commit (až budeš připravený!)
git add .
git commit -m "Initial commit - Monlii E-shop"
git push -u origin main
```

### 2. Vytvoř Cloudflare Pages Project

1. **Jdi na:** https://dash.cloudflare.com
2. **Pages** → **Create a project**
3. **Connect to Git** → Vyber GitHub
4. **Autorizuj** Cloudflare přístup k repozitáři
5. **Vyber** repository: `monliiservice-droid/monliieshop`

### 3. Nastav Build Configuration

```yaml
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: /
Node version: 20
```

### 4. Environment Variables (Production)

V Cloudflare dashboard nastav:

```bash
# Database (Připoj Cloudflare D1 nebo externí PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/monlii_prod

# GoPay
GOPAY_GO_ID=your_production_goid
GOPAY_CLIENT_ID=your_production_client_id
GOPAY_CLIENT_SECRET=your_production_secret

# Email SMTP
MAILTRAP_HOST=smtp.sendgrid.net              # Nebo jiný provider
MAILTRAP_PORT=587
MAILTRAP_USER=apikey
MAILTRAP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@monlii.cz
SELLER_EMAIL=luckaivankova1@seznam.cz

# App
NEXT_PUBLIC_URL=https://monlii.cz
NODE_ENV=production
```

### 5. Deploy!

```bash
# Automatický deploy při push
git push origin main

# Nebo v Cloudflare dashboard:
# Pages → Your Project → Create deployment
```

---

## 🗄️ Database Setup

### Volby:

#### A) Cloudflare D1 (Doporučeno - ZDARMA!)

```bash
# 1. Vytvoř D1 databázi
npx wrangler d1 create monlii-db

# 2. Zkopíruj database ID do wrangler.toml
# 3. Deploy schema
npx wrangler d1 execute monlii-db --file=./prisma/schema.sql
```

**Výhody:**
- ✅ Zdarma (50 000 rows/den)
- ✅ Globálně distribuovaná
- ✅ Nulová latence
- ✅ Automatické backups

#### B) Externí PostgreSQL

Doporučené providery:
- **Neon** - https://neon.tech (zdarma tier)
- **Supabase** - https://supabase.com (zdarma tier)
- **Railway** - https://railway.app ($5/měsíc)

```bash
# Nastav DATABASE_URL v Cloudflare ENV
DATABASE_URL=postgresql://user:pass@host:5432/monlii
```

---

## 🔧 Build Configuration

### `package.json` Build Scripts:

```json
{
  "scripts": {
    "build": "next build",
    "db:setup": "npx prisma migrate deploy && npm run db:seed",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

### Cloudflare Build Command:

```bash
npm install && npx prisma generate && npm run build
```

**DŮLEŽITÉ:** Před prvním build musíš spustit database migraci!

---

## 🌐 Custom Domain (monlii.cz)

### 1. Přidej doménu v Cloudflare

1. **Pages** → **Your Project** → **Custom domains**
2. **Add domain** → `monlii.cz`
3. **Add** → `www.monlii.cz`

### 2. DNS Záznamy

Cloudflare automaticky vytvoří:

```dns
# Automatic
CNAME monlii.cz -> <your-project>.pages.dev
CNAME www -> <your-project>.pages.dev
```

### 3. SSL

- ✅ Automaticky aktivní
- ✅ Let's Encrypt certifikát
- ✅ Auto-renewal

---

## 📧 Email Setup (Production)

### Doporučené providery:

#### 1. SendGrid (Doporučeno)
```bash
# Zdarma: 100 emailů/den
# Registrace: https://sendgrid.com

MAILTRAP_HOST=smtp.sendgrid.net
MAILTRAP_PORT=587
MAILTRAP_USER=apikey
MAILTRAP_PASS=SG.xxx...
```

#### 2. AWS SES
```bash
# Velmi levné, spolehlivé
# Registrace: https://aws.amazon.com/ses

MAILTRAP_HOST=email-smtp.eu-west-1.amazonaws.com
MAILTRAP_PORT=587
MAILTRAP_USER=AKIA...
MAILTRAP_PASS=xxx...
```

#### 3. Mailgun
```bash
# Zdarma: 5 000 emailů/měsíc
# Registrace: https://mailgun.com

MAILTRAP_HOST=smtp.mailgun.org
MAILTRAP_PORT=587
MAILTRAP_USER=postmaster@mg.monlii.cz
MAILTRAP_PASS=xxx...
```

### DNS záznamy pro email:

```dns
# SPF
TXT @ "v=spf1 include:sendgrid.net ~all"

# DKIM (z providera)
TXT s1._domainkey "k=rsa; p=..."
TXT s2._domainkey "k=rsa; p=..."

# DMARC
TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@monlii.cz"
```

---

## 🔐 Environment Variables - Kompletní Seznam

### Production:

```bash
# === DATABASE ===
DATABASE_URL=postgresql://user:pass@host:5432/monlii_prod

# === GOPAY ===
GOPAY_GO_ID=1234567890
GOPAY_CLIENT_ID=0987654321
GOPAY_CLIENT_SECRET=prod_secret_key

# === EMAIL SMTP ===
MAILTRAP_HOST=smtp.sendgrid.net
MAILTRAP_PORT=587
MAILTRAP_USER=apikey
MAILTRAP_PASS=SG.xxxxx
EMAIL_FROM=noreply@monlii.cz
SELLER_EMAIL=luckaivankova1@seznam.cz

# === APP ===
NEXT_PUBLIC_URL=https://monlii.cz
NODE_ENV=production

# === ADMIN (volitelné - můžeš změnit heslo po nasazení) ===
# Admin login: admin
# Admin password: ***REMOVED***
# (nastaveno v seed scriptu)
```

### Preview/Development:

```bash
# Stejné jako production, ale s test credentials
DATABASE_URL=postgresql://user:pass@host:5432/monlii_dev
GOPAY_GO_ID=8987654321              # Sandbox
GOPAY_CLIENT_ID=1234567890          # Sandbox
GOPAY_CLIENT_SECRET=test_secret
NEXT_PUBLIC_URL=https://preview.monlii.pages.dev
NODE_ENV=development
```

---

## 🚀 Deployment Workflow

### Automatický Deployment:

```bash
# 1. Udělej změny lokálně
git add .
git commit -m "Přidány nové produkty"

# 2. Push do GitHubu
git push origin main

# 3. Cloudflare automaticky:
#    - Stáhne změny
#    - Spustí build
#    - Nasadí do produkce
#    - Pošle notifikaci
```

### Preview Deployments:

```bash
# Vytvoř feature branch
git checkout -b nova-funkce

# Push branch
git push origin nova-funkce

# Cloudflare vytvoří preview:
# https://nova-funkce.monlii.pages.dev

# Po schválení merge do main
git checkout main
git merge nova-funkce
git push origin main
```

---

## 📊 Post-Deployment Setup

### 1. Database Migrace & Seed

Po prvním deploy:

```bash
# V Cloudflare Pages Functions Console nebo lokálně s production DB:

# 1. Migrace
npx prisma migrate deploy

# 2. Seed (admin + company settings)
npm run db:seed

# Ověř:
npx prisma studio
```

### 2. Ověř Admin Přístup

```
URL: https://monlii.cz/admin
Username: admin
Password: ***REMOVED***
```

### 3. Ověř Company Settings

V admin panelu nebo Prisma Studio ověř:
- ✅ Lucie Ivanková
- ✅ IČO: 14316242
- ✅ Adresa: Dolní Domaslavice 34, 73938
- ✅ Email: luckaivankova1@seznam.cz
- ✅ Telefon: 735823160
- ✅ Prefix faktur: 2025

### 4. Test End-to-End Flow

```
1. Přidej produkt do košíku
2. Checkout
3. Použij GoPay testovací kartu: 4111 1111 1111 1111
4. Ověř webhook
5. Zkontroluj email
6. Zkontroluj fakturu v admin panelu
```

---

## 🔍 Monitoring & Logs

### Cloudflare Dashboard:

1. **Analytics** → Real-time traffic
2. **Logs** → Build logs, function logs
3. **Speed** → Core Web Vitals

### Build Logs:

```bash
# V Cloudflare Pages:
Pages → Your Project → Deployments → View build log
```

### Function Logs (Real-time):

```bash
# Viz API routes a webhooks
npx wrangler tail
```

---

## 🆘 Troubleshooting

### Build Failed:

```bash
# 1. Zkontroluj build log v Cloudflare
# 2. Zkontroluj Node version (musí být 20+)
# 3. Zkontroluj dependencies
npm install
npm run build  # Test lokálně
```

### Database Connection Error:

```bash
# Ověř DATABASE_URL
# Ověř, že database je dostupná z internetu
# Zkontroluj IP whitelist (pokud používáš externí DB)
```

### Email Nesend:

```bash
# 1. Zkontroluj SMTP credentials
# 2. Zkontroluj DNS záznamy (SPF, DKIM)
# 3. Test přes terminál:
npm run demo-order
# Změň status v admin → ověř email
```

### GoPay Webhook Nefunguje:

```bash
# 1. Zkontroluj notification URL v GoPay portálu
#    Musí být: https://monlii.cz/api/webhooks/gopay

# 2. Zkontroluj GoPay logs v portálu

# 3. Test webhook manuálně:
curl https://monlii.cz/api/webhooks/gopay?id=PAYMENT_ID
```

---

## 📈 Performance Optimization

### Cloudflare Features:

```yaml
# Automaticky aktivní:
✅ Global CDN (300+ datacenter)
✅ Brotli compression
✅ HTTP/3 & QUIC
✅ Image optimization
✅ Minification (HTML/CSS/JS)
✅ Rocket Loader

# Doporučeno zapnout:
- Auto Minify (HTML, CSS, JS)
- Rocket Loader
- Polish (Image optimization)
```

### Cache Rules:

```javascript
// V next.config.ts už nastaveno:
- Static assets: 1 year
- API routes: no cache
- Pages: stale-while-revalidate
```

---

## 💰 Cloudflare Pages Pricing

### Free Tier (Monlii má dost):

```
✅ Unlimited requests
✅ Unlimited bandwidth
✅ 500 builds/month
✅ 1 concurrent build
✅ 100 custom domains
✅ Preview deployments
✅ Automatic HTTPS
✅ DDoS protection
```

### Pokud bys potřeboval více:

```
Pro Plan: $20/měsíc
- 5 000 builds/month
- 5 concurrent builds
- Advanced analytics
- Prioritized support
```

**Monlii:** Stačí Free tier! 🎉

---

## 🔗 Odkazy

- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Pages Docs:** https://developers.cloudflare.com/pages
- **D1 Database Docs:** https://developers.cloudflare.com/d1
- **Workers/Functions:** https://developers.cloudflare.com/workers
- **Community:** https://community.cloudflare.com

---

## ✅ Launch Checklist

```
☐ Git repository vytvořen a pushed
☐ Cloudflare Pages project vytvořen
☐ Custom domain (monlii.cz) připojen
☐ SSL certifikát aktivní
☐ Environment variables nastaveny
☐ Database připojena a migrována
☐ Seed spuštěn (admin + company settings)
☐ Email SMTP nakonfigurován
☐ DNS záznamy (SPF, DKIM, DMARC)
☐ GoPay production účet aktivní
☐ GoPay webhook URL nakonfigurován
☐ End-to-end test provedený
☐ Monitoring zapnutý
☐ Analytics zapnuté
☐ First deployment successful!
```

---

**Cloudflare Pages je nastavený a připravený! 🚀☁️**
