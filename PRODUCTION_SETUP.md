# 🚀 Production Setup Guide - Monlii E-shop

Tento dokument obsahuje vše potřebné pro nasazení do produkce.

---

## 📋 Quick Start Checklist

### 1. Environment Variables (.env.production)

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/monlii_prod"

# GoPay (PRODUCTION CREDENTIALS!)
GOPAY_GO_ID="1234567890"
GOPAY_CLIENT_ID="0987654321"
GOPAY_CLIENT_SECRET="prod_secret_key"

# Email (Production SMTP)
MAILTRAP_HOST="smtp.yourdomain.com"  # Nebo SendGrid/AWS SES
MAILTRAP_PORT="587"
MAILTRAP_USER="your_smtp_user"
MAILTRAP_PASS="your_smtp_password"
EMAIL_FROM="noreply@monlii.cz"
SELLER_EMAIL="prodejce@monlii.cz"

# App
NEXT_PUBLIC_URL="https://monlii.cz"
NODE_ENV="production"
```

### 2. Database Migration

```bash
# Migrate database
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed initial data (if needed)
npx prisma db seed
```

### 3. Company Settings (First Time Setup)

V databázi nebo přes admin panel nastav:

```sql
INSERT INTO "CompanySettings" (
  "companyName",
  "ico",
  "dic",
  "street",
  "city",
  "zip",
  "email",
  "phone",
  "invoicePrefix",
  "nextInvoiceNum",
  "defaultVatRate",
  "vatPayer",
  "invoiceDueDays"
) VALUES (
  'Název firmy',
  '12345678',
  'CZ12345678',
  'Ulice 123',
  'Praha',
  '110 00',
  'info@monlii.cz',
  '+420 XXX XXX XXX',
  '2025',
  1,
  21,
  true,
  14
);
```

### 4. Build & Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm run start
```

---

## 🔒 Security Checklist

✅ **Implementováno:**
- [x] Security headers v next.config.ts
- [x] HTTPS redirect (nastavit na serveru)
- [x] Rate limiting na API (doporučeno přidat)
- [x] CORS nastavení
- [x] Cookie consent GDPR
- [x] XSS protection headers
- [x] GoPay webhook validation

⚠️ **Doporučeno dodat:**
- [ ] Rate limiting middleware
- [ ] DDoS protection (Cloudflare)
- [ ] WAF (Web Application Firewall)

---

## 📧 Email Setup

### Produkční SMTP Providers:

**Doporučené:**
1. **SendGrid** - 100 emailů/den zdarma
2. **AWS SES** - levné, spolehlivé
3. **Mailgun** - dobrá deliverability

### DNS Records (pro email):

```dns
# SPF Record
TXT @ "v=spf1 include:_spf.yourmailprovider.com ~all"

# DKIM Record (z providera)
TXT default._domainkey "v=DKIM1; k=rsa; p=..."

# DMARC Record
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@monlii.cz"
```

---

## 🌐 DNS Setup

```dns
# A Record (IPv4)
@ -> IP_ADDRESS

# AAAA Record (IPv6) - optional
@ -> IPv6_ADDRESS

# WWW Redirect
CNAME www -> monlii.cz

# Email (pokud používáte vlastní email)
MX 10 -> mail.yourmailprovider.com
```

---

## 📊 Monitoring & Analytics

### Doporučené služby:

**Error Tracking:**
- Sentry (doporučeno)
- LogRocket
- Rollbar

**Analytics:**
- Google Analytics 4
- Plausible Analytics (GDPR friendly)
- Fathom Analytics

**Uptime Monitoring:**
- UptimeRobot (zdarma)
- Pingdom
- Better Uptime

### Implementace:

```typescript
// app/layout.tsx - přidej analytics
{process.env.NODE_ENV === 'production' && (
  <>
    <Script src="https://www.googletagmanager.com/gtag/js?id=GA_ID" />
    <Script id="google-analytics">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_ID');
      `}
    </Script>
  </>
)}
```

---

## 🎯 Performance Optimization

✅ **Implementováno:**
- [x] Image optimization (Next.js Image)
- [x] Static page generation kde možné
- [x] Font optimization (Lora)
- [x] Code splitting automaticky

⚠️ **Doporučené:**
- [ ] CDN pro statické soubory (Cloudflare)
- [ ] Database indexy (Prisma)
- [ ] Redis cache pro session/košík
- [ ] Compression (gzip/brotli)

---

## 🧪 Pre-Launch Testing

### Checklist před spuštěním:

```bash
# 1. Build test
npm run build
npm run start

# 2. Database test
npx prisma studio
# Zkontroluj všechny tabulky

# 3. GoPay test
# Použij testovací kartu: 4111 1111 1111 1111

# 4. Email test
# Pošli testovací email přes Mailtrap/SMTP

# 5. End-to-end test
# - Registrace
# - Přidání do košíku
# - Checkout
# - Platba
# - Email potvrzení
# - Admin panel - změna statusu
# - Email s fakturou
```

### Browser Testing:

- [ ] Chrome/Edge (Windows)
- [ ] Safari (Mac/iOS)
- [ ] Firefox
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 🐛 Troubleshooting

### Časté problémy:

**1. Build fails:**
```bash
# Smazat cache a znovu
rm -rf .next
npm run build
```

**2. Database connection error:**
```bash
# Zkontroluj DATABASE_URL
npx prisma db pull
```

**3. GoPay webhook fails:**
- Zkontroluj notification URL v GoPay portálu
- Zkontroluj endpoint URL
- Zkontroluj GoPay dashboard logs

**4. Emaily nechodí:**
- Zkontroluj SMTP credentials
- Zkontroluj SPF/DKIM DNS
- Zkontroluj spam folder
- Test: `npm run demo-order` a změň status

---

## 📞 Support Contacts

**Developer:** Roman Velička  
**Web:** nevymyslis.cz  
**Email:** [doplnit]

**Hosting:** [doplnit provider]  
**Domain:** [doplnit registrátor]  
**Email Provider:** [doplnit]

---

## 🔄 Deployment Workflow

### Standardní nasazení:

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Run migrations
npx prisma migrate deploy

# 4. Build
npm run build

# 5. Restart server
pm2 restart monlii-eshop
# nebo
systemctl restart monlii-eshop
```

### Zero-downtime deployment:

```bash
# Použij PM2 cluster mode
pm2 start npm --name "monlii-eshop" -i max -- start
pm2 reload monlii-eshop
```

---

## 📈 Post-Launch

### První den:
- [ ] Sleduj error logy každou hodinu
- [ ] Zkontroluj email deliverability
- [ ] Monitoruj conversion rate
- [ ] Odpovídej na dotazy do 1 hodiny

### První týden:
- [ ] Denní kontrola metrik
- [ ] A/B testing homepage
- [ ] Optimalizace podle dat
- [ ] Sbírej user feedback

### První měsíc:
- [ ] Týdenní report
- [ ] SEO optimalizace
- [ ] Performance tuning
- [ ] Další funkce podle feedbacku

---

## 🎉 Launch Day Checklist

```
☐ DNS propagated (24-48h předem)
☐ SSL certifikát aktivní
☐ ENV proměnné nastaveny
☐ Database migrována
☐ Company settings vyplněny
☐ GoPay produkční účet aktivní
☐ Email SMTP funkční
☐ Monitoring zapnutý
☐ Analytics tracking aktivní
☐ Backup strategie nastavena
☐ Testovací objednávka provedena
☐ Social media posts připraveny
☐ Newsletter rozeslán (pokud máš databázi)
```

---

**Hodně štěstí s launch! 🚀**
