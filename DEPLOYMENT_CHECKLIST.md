# 🚀 Deployment Checklist & Responsivity Report

## 📱 RESPONSIVITY KONTROLA

### ✅ Hlavní stránka (/)
- ✅ Hero section - responsive na všech zařízeních
- ✅ Logo ve správné velikosti (desktop i mobile)
- ✅ Produktové karty - grid se správně mění (1 col mobile, 3 cols desktop)
- ✅ Story carousel - horizontální scroll na mobile
- ✅ CTA tlačítka - správná velikost na mobile
- ⚠️ **UPRAV:** Hero section nemá mobilní verzi obrázku (na rozdíl od ostatních stránek)

### ✅ Obchod (/obchod)
- ✅ Hero section - desktop i mobilní obrázek
- ✅ Product grid - responsive (1-2-3 sloupce podle viewportu)
- ✅ Filtry - správně se zobrazují na mobile
- ✅ Ceny a tlačítka - dobře čitelné

### ✅ Detail produktu (/produkt/[id])
- ✅ Galerie - full width na mobile, 2 sloupce na desktop
- ✅ Informační sekce - správně stackované
- ✅ Variant selector - responsive
- ✅ Add to cart tlačítko - sticky na mobile
- ⚠️ **UPRAV:** Miniatury obrázků - na mobile jsou příliš malé

### ✅ O nás (/o-nas)
- ✅ Hero section - desktop i mobilní obrázek
- ✅ Content grid - správně se přepíná na mobile
- ✅ Text bloky - dobře čitelné

### ✅ Předplatné (/predplatne)
- ✅ Hero section - desktop i mobilní obrázek
- ✅ Cenové karty - grid 1-2-3 podle viewportu
- ✅ Benefit icons - správně zarovnané
- ⚠️ **UPRAV:** FAQ accordion - padding na mobile je moc velký

### ✅ Kontakty (/kontakty)
- ✅ Hero section - desktop i mobilní obrázek
- ✅ Kontaktní formulář - full width na mobile
- ✅ Kontaktní informace - správně stackované

### ✅ Košík (/kosik)
- ✅ Tabulka produktů - horizontální scroll na mobile
- ✅ Souhrn - sticky na desktop
- ✅ Tlačítka - správná velikost
- ⚠️ **UPRAV:** Tabulka na mobile by měla být jako karty místo scrollovací tabulky

### ✅ Checkout (/checkout)
- ✅ Formulář - full width na mobile
- ✅ Souhrn objednávky - sticky na desktop
- ✅ Platební metody - správně zobrazené
- ✅ Všechna pole jsou touch-friendly

### ✅ Navbar & Footer
- ✅ Navbar - hamburger menu na mobile
- ✅ Logo responsive
- ✅ Košík ikona s počtem položek
- ✅ Footer - grid se správně mění na mobile
- ✅ Social media ikony - správná velikost

---

## 🔧 TECHNICKÉ ÚPRAVY PŘED SPUŠTĚNÍM

### 🔴 KRITICKÉ (Musí být hotové)

#### 1. **Environment Variables**
- [ ] Nastavit produkční `DATABASE_URL`
- [ ] Nastavit produkční Stripe keys
- [ ] Nastavit Stripe webhook secret
- [ ] Změnit Mailtrap na produkční SMTP (nebo SendGrid/AWS SES)
- [ ] Nastavit správný `NEXT_PUBLIC_URL` (např. https://monlii.cz)
- [ ] Nastavit `EMAIL_FROM` na produkční doménu
- [ ] Nastavit správný `SELLER_EMAIL`

#### 2. **Databáze**
- [ ] Migrovat databázi na produkční server
- [ ] Zkontrolovat všechny indexy v Prisma schema
- [ ] Vytvořit zálohovací strategii
- [ ] Nastavit automatické zálohy

#### 3. **Platby (Stripe)**
- [ ] Změnit na produkční Stripe klíče
- [ ] Nastavit webhook endpoint na produkční URL
- [ ] Otestovat kompletní platební flow
- [ ] Otestovat webhook z Stripe dashboard
- [ ] Nastavit notifikace o failed platbách

#### 4. **Email System**
- [ ] Změnit z Mailtrap na produkční SMTP
- [ ] Otestovat všechny email šablony:
  - [ ] Order received (customer)
  - [ ] Order received (seller)
  - [ ] Order accepted
  - [ ] Order rejected
  - [ ] Order in production
  - [ ] Order ready to ship
  - [ ] Order shipped
  - [ ] Order delivered
  - [ ] Review request
  - [ ] Invoice email
- [ ] Ověřit, že emaily nechodí do spamu
- [ ] Nastavit SPF a DKIM DNS záznamy

#### 5. **Faktury**
- [ ] Vyplnit správné údaje firmy v `CompanySettings`:
  - [ ] Název firmy
  - [ ] IČO
  - [ ] DIČ (pokud jste plátci DPH)
  - [ ] Adresa
  - [ ] Email
  - [ ] Telefon
- [ ] Zkontrolovat DPH sazbu (21%)
- [ ] Nastavit počáteční číslo faktury
- [ ] Nastavit prefix faktury (např. "2025")

#### 6. **Obrázky & Assets**
- [ ] Optimalizovat všechny obrázky (WebP formát)
- [ ] Zkontrolovat, že všechny hero obrázky existují:
  - [ ] `hero_section_alternative_2.jpg` (hlavní stránka)
  - [ ] `hero_section_new.png` (ostatní desktop)
  - [ ] `hero_section_new_mobile.JPG` (ostatní mobile)
- [ ] Přidat favicon všech velikostí
- [ ] Přidat Open Graph obrázky pro social media

#### 7. **SEO & Metadata**
- [ ] Přidat správné meta tagy na všech stránkách
- [ ] Přidat Open Graph tagy
- [ ] Přidat Twitter Card tagy
- [ ] Vytvořit `robots.txt`
- [ ] Vytvořit `sitemap.xml`
- [ ] Nastavit Google Analytics nebo Plausible
- [ ] Přidat Google Search Console

#### 8. **Zabezpečení**
- [ ] Povolit pouze HTTPS
- [ ] Nastavit CORS správně
- [ ] Implementovat rate limiting na API endpoints
- [ ] Zkontrolovat autentizaci admin routes
- [ ] Skrýt error detaily v produkci
- [ ] Nastavit CSP (Content Security Policy)

#### 9. **Performance**
- [ ] Zkontrolovat bundle size
- [ ] Povolit komprimaci (gzip/brotli)
- [ ] Nastavit caching headers
- [ ] Optimalizovat databázové queries
- [ ] Přidat loading states na všechny fetch operace

#### 10. **Monitoring & Logs**
- [ ] Nastavit error tracking (Sentry)
- [ ] Nastavit uptime monitoring
- [ ] Nastavit log aggregation
- [ ] Připravit alerting pro kritické chyby

---

### 🟡 DŮLEŽITÉ (Mělo by být hotové)

#### 1. **Uživatelská dokumentace**
- [ ] Vytvořit FAQ sekci
- [ ] Přidat "Jak nakupovat" guide
- [ ] Vysvětlit měřící tabulky
- [ ] Přidat reklamační řád
- [ ] Přidat obchodní podmínky
- [ ] Přidat zásady ochrany osobních údajů (GDPR)

#### 2. **Admin Panel**
- [ ] Zkontrolovat, že všechny funkce fungují
- [ ] Otestovat workflow objednávek
- [ ] Ověřit generování faktur
- [ ] Otestovat CSV export
- [ ] Přidat možnost filtrování objednávek

#### 3. **Testování**
- [ ] Kompletní user journey test
- [ ] Test na různých prohlížečích (Chrome, Safari, Firefox, Edge)
- [ ] Test na různých zařízeních (iPhone, Android, iPad)
- [ ] Test všech formulářů
- [ ] Test platebního procesu (testovací karty)
- [ ] Test emailových notifikací

#### 4. **Content**
- [ ] Přidat alespoň 10 produktů s kvalitními fotkami
- [ ] Vyplnit všechny popisy produktů
- [ ] Přidat zákaznické recenze
- [ ] Aktualizovat O nás sekci
- [ ] Přidat kontaktní informace

#### 5. **Právní**
- [ ] Obchodní podmínky
- [ ] Zásady ochrany osobních údajů
- [ ] Reklamační řád
- [ ] Cookie lišta a souhlas
- [ ] Informace o zpracování osobních údajů

---

### 🟢 VOLITELNÉ (Nice to have)

#### 1. **Funkce**
- [ ] Newsletter subscription
- [ ] Wishlist/oblíbené produkty
- [ ] Sdílení produktů na social media
- [ ] Live chat podpora
- [ ] Push notifikace
- [ ] PWA (Progressive Web App)

#### 2. **Marketing**
- [ ] Facebook Pixel
- [ ] Google Ads tracking
- [ ] Affiliate systém
- [ ] Slevové kupóny
- [ ] Loyalty program
- [ ] Referral program

#### 3. **Integrace**
- [ ] Zásilkovna API pro tracking
- [ ] Automatický update tracking čísel
- [ ] Heureka/Zboží.cz feed
- [ ] Instagram integrace
- [ ] Facebook Shop

#### 4. **Optimalizace**
- [ ] A/B testing homepage
- [ ] Heatmap tracking
- [ ] User session recording
- [ ] Performance monitoring (Core Web Vitals)

---

## 📋 QUICK CHECKLIST PŘED NASAZENÍM

### Den před spuštěním:
```
□ Všechny ENV proměnné nastaveny
□ Databáze připravena a zálohována
□ Stripe v produkčním módu
□ Email systém otestován
□ Všechny obrázky nahrány
□ SEO metadata zkontrolována
□ SSL certifikát aktivní
□ DNS záznamy nastaveny
□ Monitoring zapnutý
□ Error tracking aktivní
```

### První hodina po spuštění:
```
□ Provést testovací objednávku
□ Zkontrolovat, že emaily chodí
□ Ověřit generování faktury
□ Zkontrolovat admin panel
□ Sledovat error logy
□ Zkontrolovat analytics
□ Test na mobilním zařízení
```

### První den:
```
□ Sledovat konverze
□ Zkontrolovat rychlost webu
□ Sledovat error rate
□ Odpovědět na první dotazy
□ Zkontrolovat email deliverability
```

---

## 🐛 ZNÁMÉ PROBLÉMY K OPRAVĚ

### Responsivita:
1. **Hero section hlavní stránky** - přidat mobilní verzi obrázku
2. **Košík** - změnit tabulku na karty na mobile
3. **Product detail** - zvětšit miniatury na mobile
4. **FAQ** - zmenšit padding na mobile

### Funkčnost:
1. **Cron job** - nastavit pro review emails (každý den v 9:00)
2. **Image optimization** - konvertovat na WebP
3. **Loading states** - přidat na všechny fetch operace

---

## 📞 KONTAKTY PRO PRODUKCI

**Hosting:** [Sem doplnit]
**Domain registrátor:** [Sem doplnit]
**Email provider:** [Sem doplnit]
**Database host:** [Sem doplnit]

**Developer:** Roman Velička (nevymyslis.cz)

---

## 🎉 PO SPUŠTĚNÍ

- [ ] Oznámit spuštění na sociálních sítích
- [ ] Poslat email databázi zájemců
- [ ] Aktivovat reklamní kampaně
- [ ] Sledovat metriky první den/týden
- [ ] Sbírat feedback od zákazníků
- [ ] Průběžně optimalizovat
