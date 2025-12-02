# Mailovací systém a workflow objednávek - Monlii E-shop

## 📧 Přehled systému

Komplexní automatický mailovací systém s workflow pro správu objednávek od přijetí po doručení a follow-up.

**AKTUALIZACE:** Přidáno automatické vytváření a odesílání faktur při přijetí objednávky.

---

## 🎯 Workflow objednávek

### Stavy objednávky (Order Status)

1. **`new`** - Nová objednávka
   - Automaticky po vytvoření objednávky
   - Odešle se email zákazníkovi i prodejci
   
2. **`accepted`** - Přijato
   - Prodejce potvrdí objednávku v admin panelu
   - Email zákazníkovi: "Objednávka přijata"
   
3. **`rejected`** - Odmítnuto
   - Prodejce odmítne objednávku
   - Email zákazníkovi: "Objednávka odmítnuta"
   - Vratka platby (pokud zaplaceno kartou)
   
4. **`in_production`** - Ve výrobě
   - Po přijetí prodejce označí že se vyrábí
   - Email zákazníkovi: "Objednávka ve výrobě"
   
5. **`ready_to_ship`** - Připraveno k odeslání
   - Když je výrobek hotový
   - Email zákazníkovi: "Připraveno k odeslání"
   
6. **`shipped`** - Odesláno
   - Po předání dopravci
   - Email zákazníkovi: "Odesláno" + tracking číslo
   
7. **`delivered`** - Doručeno
   - Automaticky přes tracking Zásilkovny
   - Email zákazníkovi: "Doručeno"
   
8. **`cancelled`** - Zrušeno

---

## 📬 Typy emailů

### 1. Order Received - Customer
**Kdy:** Ihned po vytvoření objednávky  
**Komu:** Zákazník  
**Obsah:**
- Poděkování za objednávku
- Číslo objednávky
- Detail položek
- Celková částka
- Info o dalších krocích

### 2. Order Received - Seller
**Kdy:** Ihned po vytvoření objednávky  
**Komu:** Prodejce (nastavitelný email)  
**Obsah:**
- Upozornění na novou objednávku
- Detail zákazníka
- Detail položek
- Link do admin panelu

### 3. Order Accepted
**Kdy:** Po kliknutí "Přijmout" v admin panelu  
**Komu:** Zákazník  
**Obsah:**
- Potvrzení přijetí objednávky
- Info o zahájení výroby

### 4. Order Rejected
**Kdy:** Po kliknutí "Odmítnout" v admin panelu  
**Komu:** Zákazník  
**Obsah:**
- Omluva za odmítnutí
- Info o vratce platby

### 5. Order In Production
**Kdy:** Po kliknutí "Ve výrobě" v admin panelu  
**Komu:** Zákazník  
**Obsah:**
- Info že se vyrábí
- Motivační zpráva

### 6. Order Ready to Ship
**Kdy:** Po kliknutí "Připraveno" v admin panelu  
**Komu:** Zákazník  
**Obsah:**
- Info že je hotové
- Brzy bude odesláno

### 7. Order Shipped
**Kdy:** Po kliknutí "Odeslat" v admin panelu  
**Komu:** Zákazník  
**Obsah:**
- Info o odeslání
- Sledovací číslo Zásilkovny
- Link na tracking

### 8. Order Delivered
**Kdy:** Automaticky po doručení (tracking Zásilkovny)  
**Komu:** Zákazník  
**Obsah:**
- Potvrzení doručení
- Poděkování

### 9. Review Request + Upsell
**Kdy:** 7 dní po doručení (automaticky)  
**Komu:** Zákazník  
**Obsah:**
- Žádost o recenzi na Google
- Slevový kód 15% na další nákup (REVIEW15)
- Link na obchod

---

## ⚙️ Konfigurace

### Environment Variables (.env)

```env
# Email (Mailtrap)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_username
MAILTRAP_PASS=your_password
EMAIL_FROM=noreply@monlii.cz
SELLER_EMAIL=prodejce@monlii.cz

# App
NEXT_PUBLIC_URL=https://monlii.cz
```

### Mailtrap Setup

1. Vytvořte účet na [mailtrap.io](https://mailtrap.io)
2. V Sending Domains přidejte vaši doménu
3. Ověřte doménu (SPF, DKIM, DMARC)
4. Zkopírujte SMTP credentials do .env

---

## 🔌 API Endpoints

### Order Status Management

#### `PATCH /api/admin/orders/[id]/status`
Změní status objednávky a odešle příslušný email.

**Body:**
```json
{
  "status": "accepted" // nebo jiný status
}
```

**Response:**
```json
{
  "id": "...",
  "orderNumber": "...",
  "status": "accepted",
  ...
}
```

### Review Email Cron

#### `GET /api/cron/review-emails`
Najde objednávky doručené před 7 dny a odešle review email.

**Nastavení:**
- Volat denně (např. Vercel Cron Jobs)
- Nebo externí cron služba (cron-job.org)

**Response:**
```json
{
  "message": "Processed 5 orders",
  "results": [
    {
      "orderId": "...",
      "orderNumber": "...",
      "success": true
    }
  ]
}
```

---

## 🎨 Admin Panel

### Objednávky (`/admin/objednavky`)

**Funkce:**
- Seznam všech objednávek
- Barevné statusy
- Detail objednávky (klik na ikonu oka)
- Workflow tlačítka podle aktuálního stavu

**Workflow tlačítka:**
- **Nová objednávka:** "Přijmout" nebo "Odmítnout"
- **Přijato:** "Ve výrobě"
- **Ve výrobě:** "Připraveno"
- **Připraveno:** "Odeslat"
- **Odesláno:** "Doručeno"

**Detail objednávky obsahuje:**
- Aktuální status a platba
- Workflow tlačítka
- Údaje zákazníka
- Položky objednávky
- Celková částka
- Datum vytvoření
- Sledovací číslo (pokud existuje)

---

## 🔔 Automatizace

### 1. Při vytvoření objednávky
```typescript
// V API route pro vytvoření objednávky
import { sendOrderEmail } from '@/lib/email'

// Po uložení objednávky do DB
await sendOrderEmail('order_received_customer', orderData)
await sendOrderEmail('order_received_seller', orderData)
```

### 2. Při změně statusu
Automaticky při změně přes API endpoint `/api/admin/orders/[id]/status`

### 3. Review emaily
**Vercel Cron Jobs** (vercel.json):
```json
{
  "crons": [
    {
      "path": "/api/cron/review-emails",
      "schedule": "0 10 * * *"
    }
  ]
}
```

Nebo externí služba jako **cron-job.org**:
- URL: `https://monlii.cz/api/cron/review-emails`
- Schedule: Denně v 10:00

---

## 📧 Email Šablony

Všechny email šablony jsou v `/lib/email.ts`

**Obsahují:**
- Logo Monlii
- Responzivní HTML design
- Jednotný brand styl
- Kredit: "Stránku vytvořil Roman Velička z nevymyslis.cz"

**Customizace:**
Upravte funkci `getEmailTemplate()` v `/lib/email.ts`

---

## 🚀 Použití

### V Admin Panelu

1. Otevřete `/admin/objednavky`
2. Klikněte na objednávku
3. Uvidíte aktuální status
4. Klikněte na příslušné tlačítko (Přijmout, Ve výrobě, atd.)
5. Automaticky se odešle email zákazníkovi
6. Status se aktualizuje

### Tracking Zásilkovny

Po označení jako "Odesláno":
1. Zadejte sledovací číslo
2. Automaticky se sleduje doručení
3. Po doručení se změní status na "Doručeno"
4. Email zákazníkovi
5. Za 7 dní automaticky review email

---

## 📝 Poznámky

### Testování

**Development (Mailtrap Sandbox):**
- Emaily se neodešlou zákazníkům
- Vše vidíte v Mailtrap inbox
- Ideální pro testování

**Production (Mailtrap Sending):**
- Emaily se skutečně odešlou
- Ujistěte se, že máte ověřenou doménu
- Monitorujte bounce rate

### Best Practices

1. **Vždy testujte nejprve v sandbox**
2. **Ověřte všechny email šablony**
3. **Nastavte správný SELLER_EMAIL**
4. **Monitorujte delivery rate v Mailtrap**
5. **Pravidelně kontrolujte cron job**

### Rozšíření

- **SMS notifikace** (Twilio)
- **Push notifikace**
- **WhatsApp notifikace**
- **Více jazyků emailů**
- **A/B testing šablon**

---

## 🎨 Design Features

### Logo v Emailech
Automaticky přidáno logo Monlii do každého emailu z `/public/logo_wide_black.png`

### Logo v Admin Panelu
Logo přidáno do headeru admin panelu

### Kredit v Footeru
Na všech zákaznických stránkách: "Stránku vytvořil Roman Velička z nevymyslis.cz"

---

## 🆘 Troubleshooting

### Emaily se neodeslou
1. Zkontrolujte .env proměnné
2. Ověřte Mailtrap credentials
3. Zkontrolujte logy v konzoli
4. Test connection: `npm run test:email`

### Review emaily se neodešlou
1. Zkontrolujte cron job běží
2. Ověřte že jsou objednávky doručené před 7 dny
3. Zkontrolujte `reviewEmailSentAt` v DB

### Status se nezmění
1. Zkontrolujte API endpoint
2. Ověřte že order existuje
3. Zkontrolujte Prisma connection

---

## ✅ Checklist před spuštěním

- [ ] Nastavené Mailtrap credentials v .env
- [ ] Ověřená doména v Mailtrap
- [ ] Správný SELLER_EMAIL
- [ ] Logo soubory v /public
- [ ] Databáze migrována
- [ ] Otestované všechny email šablony
- [ ] Nastavený cron job pro review emaily
- [ ] Otestovaný celý workflow v sandbox

---

**Systém je kompletní a připravený k použití!** 🎉
