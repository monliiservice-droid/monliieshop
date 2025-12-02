# ⚡ Rychlý Checklist Před Spuštěním

## 🔴 KRITICKÉ - MUSÍ BÝT HOTOVÉ

### 1. Environment Variables (.env)
```bash
# Zkopíruj .env.example do .env a vyplň:
DATABASE_URL="postgresql://..."              # ✓ Produkční databáze
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..." # ✓ Produkční Stripe
STRIPE_SECRET_KEY="sk_..."                   # ✓ Produkční Stripe
STRIPE_WEBHOOK_SECRET="whsec_..."            # ✓ Z Stripe dashboard
MAILTRAP_USER="..."                          # ✓ Nebo jiný SMTP
MAILTRAP_PASS="..."                          # ✓ Nebo jiný SMTP
EMAIL_FROM="noreply@monlii.cz"               # ✓ Tvá doména
SELLER_EMAIL="prodejce@monlii.cz"            # ✓ Tvůj email
NEXT_PUBLIC_URL="https://monlii.cz"          # ✓ Produkční URL
```

### 2. Databáze
```bash
# Nastav produkční databázi
npx prisma migrate deploy
npx prisma generate
npx prisma db seed  # pokud máš seed data
```

### 3. Company Settings (Faktury)
V admin panelu nebo přes databázi nastav:
- Název firmy
- IČO
- DIČ (pokud jsi plátce DPH)
- Adresa firmy
- Email firmy
- Telefon firmy
- Prefix faktur (např. "2025")
- Počáteční číslo faktury

### 4. Stripe Setup
1. Přepni Stripe account na produkční mód
2. Vytvoř webhook endpoint: `https://monlii.cz/api/webhooks/stripe`
3. Zkopíruj webhook secret do .env
4. Otestuj testovací platbu

### 5. Email Setup
1. Změň z Mailtrap na produkční SMTP (SendGrid/AWS SES/Mailgun)
2. Nastav SPF a DKIM DNS záznamy
3. Pošli testovací email
4. Zkontroluj spam score

### 6. DNS & SSL
```bash
# DNS záznamy:
A record:     @ → IP serveru
CNAME:        www → monlii.cz
MX records:   (pokud hostujete email)
TXT (SPF):    v=spf1 include:... ~all
TXT (DKIM):   (z email providera)
```

### 7. SEO Basics
- [ ] `robots.txt` vytvořen
- [ ] `sitemap.xml` vygenerován
- [ ] Google Search Console připojen
- [ ] Google Analytics / Plausible nastaveno
- [ ] Meta tagy zkontrolovány

---

## 🟡 DŮLEŽITÉ - PŘED SPUŠTĚNÍM

### Obsah
- [ ] Alespoň 10 produktů s fotkami
- [ ] Všechny popisy vyplněny
- [ ] Obchodní podmínky přidány
- [ ] Zásady ochrany osobních údajů (GDPR)
- [ ] Reklamační řád
- [ ] Kontaktní informace aktuální

### Testování
- [ ] Objednat testovací produkt (platební karta)
- [ ] Zkontrolovat všechny emaily
- [ ] Test na iPhone
- [ ] Test na Android
- [ ] Test v Safari, Chrome, Firefox

### Monitoring
- [ ] Error tracking (Sentry) nastaven
- [ ] Uptime monitoring aktivní
- [ ] Backup strategie připravena

---

## 📋 ДЕНЬ PŘED SPUŠTĚNÍM

```bash
# Build check
npm run build
npm run start

# Test na produkci
- Testovací objednávka END-TO-END
- Zkontrolovat všechny stránky
- Mobile test
- Email test
```

---

## 🚀 DEN SPUŠTĚNÍ

### Ráno (před spuštěním):
1. Finální backup databáze
2. Zkontrolovat monitoring
3. Přepnout DNS na produkci
4. Počkat na propagaci DNS (15-60 min)
5. Otestovat HTTPS certifikát
6. První testovací objednávka

### Odpoledne:
1. Sledovat error logy
2. Sledovat analytics
3. Sledovat emaily
4. Odpovídat na dotazy

---

## ⚠️ OPRAVENÉ RESPONSIVITY PROBLÉMY

✅ **Hero section hlavní stránky** - přidán mobilní obrázek
✅ **Product detail miniatury** - zvětšeny na mobile (3 sloupce místo 4)
✅ **Všechny stránky** - desktop i mobilní hero obrázky

---

## 📞 EMERGENCY CONTACTS

**Developer:** Roman Velička
- Web: nevymyslis.cz
- Email: [doplnit]

**Hosting:** [doplnit provider]
**Email Provider:** [doplnit]
**Stripe Dashboard:** https://dashboard.stripe.com

---

## 🎉 PO SPUŠTĚNÍ

Den 1:
- Sledovat metriky každé 2 hodiny
- Sledovat error rate
- Odpovídat na dotazy do 1 hodiny

Týden 1:
- Denní kontrola metrik
- Sbírat user feedback
- Optimalizovat podle dat

Měsíc 1:
- Týdenní report
- A/B testing homepage
- Optimalizace konverzí

---

## 📊 KLÍČOVÉ METRIKY

Monitor první týden:
- Conversion rate (cíl: 2-5%)
- Average order value
- Cart abandonment rate (cíl: <70%)
- Page load time (cíl: <2s)
- Error rate (cíl: <0.1%)
- Email delivery rate (cíl: >98%)

---

**Hodně štěstí! 🚀**
