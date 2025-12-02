# 🏦 GoPay Payment Integration - Monlii E-shop

Dokumentace integrace GoPay platební brány do Monlii e-shopu.

---

## 📋 Obsah

1. [Přehled](#přehled)
2. [Setup](#setup)
3. [Environment Variables](#environment-variables)
4. [API Flow](#api-flow)
5. [Testing](#testing)
6. [Production Checklist](#production-checklist)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Přehled

GoPay je česká platební brána podporující:
- **Platební karty** (Visa, Mastercard, Apple Pay, Google Pay)
- **Bankovní účty** (online bankovnictví)
- **PayPal**
- **Mobilní platby**

### Výhody pro Monlii:
✅ České prostředí a podpora  
✅ Nižší poplatky než zahraniční brány  
✅ Rychlé vyúčtování (1-2 dny)  
✅ Lepší známost u českých zákazníků  
✅ Jednoduché vrácení plateb  

---

## 🔧 Setup

### 1. Registrace na GoPay

**Testovací účet (sandbox):**
1. Jdi na https://gw.sandbox.gopay.com
2. Registruj se jako obchodník
3. Získáš:
   - **GO_ID** (identifikátor obchodníka)
   - **Client ID** (OAuth2)
   - **Client Secret** (OAuth2)

**Produkční účet:**
1. Jdi na https://www.gopay.com/cs/obchodnici
2. Vyplň formulář a projdi verifikací
3. Po schválení dostaneš přístup do portálu
4. V portálu najdeš produkční credentials

### 2. Instalace (žádná nutná!)

GoPay API používáme přes čistý `fetch`, není potřeba žádný balíček.

### 3. Environment Variables

Přidej do `.env.local` (development) nebo `.env.production`:

```bash
# GoPay Credentials
GOPAY_GO_ID="8123456789"
GOPAY_CLIENT_ID="1234567890"
GOPAY_CLIENT_SECRET="AbCdEfGh"

# App URL
NEXT_PUBLIC_URL="http://localhost:3000"  # v produkci: https://monlii.cz
```

---

## 🔐 Environment Variables

### Development (Sandbox)

```bash
# .env.local
GOPAY_GO_ID="8987654321"                    # Testovací GO ID
GOPAY_CLIENT_ID="1234567890"                # Testovací Client ID  
GOPAY_CLIENT_SECRET="test_secret_key"       # Testovací Secret
NEXT_PUBLIC_URL="http://localhost:3000"
NODE_ENV="development"
```

### Production

```bash
# .env.production
GOPAY_GO_ID="1234567890"                    # Produkční GO ID
GOPAY_CLIENT_ID="0987654321"                # Produkční Client ID
GOPAY_CLIENT_SECRET="prod_secret_key"       # Produkční Secret
NEXT_PUBLIC_URL="https://monlii.cz"
NODE_ENV="production"
```

---

## 🔄 API Flow

### 1. Vytvoření objednávky a platby

```typescript
// Frontend - checkout page
const handleCheckout = async () => {
  // 1. Vytvoř objednávku v DB
  const orderResponse = await fetch('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify({
      customer: {...},
      items: [...],
      shipping: {...}
    })
  })
  const { orderId } = await orderResponse.json()

  // 2. Vytvoř GoPay platbu
  const paymentResponse = await fetch('/api/gopay/create-payment', {
    method: 'POST',
    body: JSON.stringify({ orderId })
  })
  const { gatewayUrl } = await paymentResponse.json()

  // 3. Přesměruj na GoPay platební bránu
  window.location.href = gatewayUrl
}
```

### 2. Zákazník platí na GoPay

- Zákazník je přesměrován na `https://gw.sandbox.gopay.com/gw/pay-full-v2?id=XXX`
- Vybere si platební metodu (karta, banka, PayPal...)
- Zaplatí

### 3. Return URL (návrat zákazníka)

Po zaplacení je zákazník přesměrován na:
```
https://monlii.cz/checkout/success?order=MON-2025-001
```

### 4. Webhook (notification URL)

GoPay asynchronně pošle notifikaci na:
```
POST https://monlii.cz/api/webhooks/gopay
```

Webhook handler:
- Ověří stav platby pomocí GoPay API
- Aktualizuje objednávku v DB
- Pošle potvrzovací email

---

## 📂 Struktura souborů

```
lib/
  gopay.ts                           # GoPay API client

app/api/
  gopay/
    create-payment/
      route.ts                       # Vytvoření GoPay platby
  webhooks/
    gopay/
      route.ts                       # Zpracování GoPay notifikací
  orders/
    create/
      route.ts                       # Vytvoření objednávky

prisma/schema.prisma                 # gopayPaymentId, gopayState
```

---

## 🧪 Testing

### Testovací karty (sandbox)

GoPay sandbox přijímá tyto testovací karty:

**Úspěšná platba:**
```
Číslo: 4111 1111 1111 1111
Platnost: 12/30
CVV: 123
```

**Zamítnutá platba:**
```
Číslo: 4000 0000 0000 0002
Platnost: 12/30
CVV: 123
```

### Test flow

```bash
# 1. Spusť development server
npm run dev

# 2. Přidej produkty do košíku
# 3. Jdi na checkout
# 4. Vyplň údaje a pokračuj na platbu
# 5. Použij testovací kartu
# 6. Zkontroluj:
#    - Objednávka vytvořena v DB
#    - GoPay payment ID uloženo
#    - Webhook přijatý a zpracovaný
#    - Email odeslán
#    - Status objednávky aktualizován
```

### Manuální test webhook

```bash
# Získej payment status
curl http://localhost:3000/api/webhooks/gopay?id=3123456789

# Simuluj webhook
curl -X POST http://localhost:3000/api/webhooks/gopay \
  -d "id=3123456789"
```

---

## ✅ Production Checklist

### Před spuštěním:

- [ ] Máš produkční GO ID, Client ID, Client Secret
- [ ] ENV proměnné nastaveny na produkční
- [ ] Webhook URL nakonfigurovaný v GoPay portálu
- [ ] SSL certifikát aktivní (HTTPS)
- [ ] Return URL správně nastavená
- [ ] Database migrace provedena
- [ ] End-to-end test s produkčním účtem
- [ ] Email notifikace fungují

### V GoPay portálu:

1. **Notification URL:**
   ```
   https://monlii.cz/api/webhooks/gopay
   ```

2. **Povolené události:**
   - ✅ Změna stavu platby

3. **Return URL:**
   ```
   https://monlii.cz/checkout/success
   ```

---

## 🔍 GoPay Stavy Platby

| Stav | Popis | Akce |
|------|-------|------|
| `CREATED` | Platba vytvořena | Čeká se na zákazníka |
| `PAYMENT_METHOD_CHOSEN` | Zákazník vybral metodu | Probíhá autorizace |
| `PAID` | ✅ Zaplaceno | Objednávka → accepted |
| `AUTHORIZED` | ✅ Autorizováno | Objednávka → accepted |
| `CANCELED` | ❌ Zrušeno | Objednávka → cancelled |
| `TIMEOUTED` | ❌ Vypršelo | Objednávka → cancelled |
| `REFUNDED` | 💸 Vráceno | paymentStatus → refunded |
| `PARTIALLY_REFUNDED` | 💸 Částečně vráceno | paymentStatus → refunded |

---

## 🚨 Troubleshooting

### Chyba: "GoPay credentials are not configured"

```bash
# Zkontroluj ENV proměnné
echo $GOPAY_GO_ID
echo $GOPAY_CLIENT_ID
echo $GOPAY_CLIENT_SECRET

# Ujisti se, že jsou správně nastaveny
```

### Chyba: "GoPay auth failed"

- Zkontroluj Client ID a Secret
- V produkci ověř, že používáš produkční credentials
- Zkontroluj, že credentials jsou správně Base64 enkódované

### Webhook nedorazil

1. Zkontroluj notification URL v GoPay portálu
2. Ověř, že URL je přístupná z internetu (ne localhost)
3. Zkontroluj webhook logy v GoPay portálu
4. Pro testing použij ngrok nebo podobný nástroj:
   ```bash
   npx ngrok http 3000
   # Použij ngrok URL jako notification URL
   ```

### Platba uvízla v "CREATED"

- Zákazník nejspíš neopustil platební stránku
- Platba vyprší po 15 minutách
- Status se automaticky změní na `TIMEOUTED`

### Email neodeslán po platbě

- Zkontroluj SMTP nastavení
- Zkontroluj webhook logy
- Ověř, že webhook skutečně dorazil
- Email se posílá jen při přechodu pending → paid

---

## 📊 Poplatky GoPay

**Standardní sazby (2025):**
- Platební karty: ~1.9% + 2 Kč
- Online bankovnictví: ~0.9% + 3 Kč
- PayPal: ~2.5%

**Měsíční poplatek:**
- Cca 300-500 Kč/měsíc podle tarifu

**Vyúčtování:**
- Výplata každý pracovní den (D+1)
- Přímý převod na bankovní účet

---

## 🔗 Užitečné odkazy

- **Dokumentace:** https://doc.gopay.com
- **Sandbox portál:** https://gw.sandbox.gopay.com
- **Produkční portál:** https://gw.gopay.com
- **Podpora:** podpora@gopay.cz
- **Telefon:** +420 228 224 267

---

## 💡 Best Practices

### 1. Vždy používej webhook
```typescript
// ✅ Správně
// Aktualizuj objednávku v webhook handleru
// Zákazník může zavřít okno před return URL

// ❌ Špatně
// Spoléhat se jen na return URL
```

### 2. Idempotence
```typescript
// ✅ Ověř, že platba ještě neexistuje
const existingOrder = await prisma.order.findUnique({
  where: { gopayPaymentId: paymentId }
})
if (existingOrder.paymentStatus === 'paid') {
  return // Už zpracováno
}
```

### 3. Error handling
```typescript
// ✅ Loguj všechny chyby
try {
  await gopay.createPayment(...)
} catch (error) {
  console.error('GoPay error:', error)
  // Pošli alert nebo ulož do error trackingu
  throw error
}
```

### 4. Monitoring
```typescript
// ✅ Sleduj metriky
// - Počet úspěšných plateb
// - Počet neúspěšných plateb
// - Průměrný čas do zaplacení
// - Webhook delivery rate
```

---

## 🎓 Migrace ze Stripe

Pokud migruješ ze Stripe:

1. **Database:** `stripePaymentId` → `gopayPaymentId`
2. **API routes:** `/api/stripe/*` → `/api/gopay/*`
3. **Webhooks:** `/api/webhooks/stripe` → `/api/webhooks/gopay`
4. **ENV:** `STRIPE_*` → `GOPAY_*`
5. **Checkout flow:** Odstranit Stripe Elements, použít redirect

---

**GoPay integrace je hotová a připravená k použití! 🎉**
