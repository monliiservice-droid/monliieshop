# Databázové Schema - Reference

## 📋 OrderItem Model

**Pole v databázi:**
```prisma
model OrderItem {
  id          String   @id @default(cuid())
  orderId     String   // REQUIRED - ID objednávky
  productId   String?  // OPTIONAL - ID produktu (může být null pokud produkt byl smazán)
  productName String   @default("") // REQUIRED - Název produktu (pro historii)
  quantity    Int      // REQUIRED - Počet kusů
  price       Float    // REQUIRED - Cena v okamžiku objednávky
  variant     String?  // OPTIONAL - JSON string s variantou produktu
}
```

**Použití v API:**
```typescript
// ✅ SPRÁVNĚ - v /api/orders/route.ts
items: {
  create: data.items.map((item: any) => ({
    productName: item.name || '',              // REQUIRED
    productId: item.productId || null,         // OPTIONAL
    quantity: parseInt(item.quantity) || 1,    // REQUIRED
    price: parseFloat(item.price) || 0,        // REQUIRED
    variant: item.variant ? JSON.stringify(item.variant) : null  // OPTIONAL
  }))
}
```

---

## 📋 Order Model

**Pole v databázi:**
```prisma
model Order {
  id                String      @id @default(cuid())
  orderNumber       String      @unique            // REQUIRED - Unikátní číslo objednávky
  customerName      String                         // REQUIRED - Jméno zákazníka
  customerEmail     String                         // REQUIRED - Email zákazníka
  customerPhone     String?                        // OPTIONAL - Telefon
  shippingAddress   String                         // REQUIRED - JSON string s adresou
  billingAddress    String?                        // OPTIONAL - JSON string
  totalAmount       Float                          // REQUIRED - Celková cena
  discountCode      String?                        // OPTIONAL - Kód slevy
  discountAmount    Float       @default(0)        // REQUIRED - Částka slevy
  status            String      @default("new")    // REQUIRED - Stav objednávky
  paymentMethod     String                         // REQUIRED - Způsob platby
  paymentStatus     String      @default("pending")// REQUIRED - Stav platby
  shippingMethod    String                         // REQUIRED - Způsob dopravy
  trackingNumber    String?                        // OPTIONAL - Číslo sledování
  gopayPaymentId    String?                        // OPTIONAL - GoPay ID
  gopayState        String?                        // OPTIONAL - GoPay stav
  reviewEmailSentAt DateTime?                      // OPTIONAL - Kdy byl poslán review email
  deliveredAt       DateTime?                      // OPTIONAL - Datum doručení
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}
```

---

## 📋 Product Model

**Pole v databázi:**
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String                    // REQUIRED - Název produktu
  description String?                   // OPTIONAL - Popis
  price       Float                     // REQUIRED - Cena
  stock       Int      @default(0)      // REQUIRED - Skladem
  images      String   @default("[]")   // REQUIRED - JSON array URLs
  category    String?                   // OPTIONAL - Kategorie
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 📋 CompanySettings Model

**Pole v databázi:**
```prisma
model CompanySettings {
  id              String   @id @default(cuid())
  companyName     String                          // REQUIRED - Název firmy
  ico             String                          // REQUIRED - IČO
  dic             String?                         // OPTIONAL - DIČ
  street          String                          // REQUIRED - Ulice
  city            String                          // REQUIRED - Město
  zip             String                          // REQUIRED - PSČ
  country         String   @default("Česká republika")
  email           String                          // REQUIRED - Email
  phone           String                          // REQUIRED - Telefon
  bankAccount     String?                         // OPTIONAL - Číslo účtu
  iban            String?                         // OPTIONAL - IBAN
  swift           String?                         // OPTIONAL - SWIFT
  invoicePrefix   String   @default("")
  nextInvoiceNum  Int      @default(1)
  vatPayer        Boolean  @default(true)
  defaultVatRate  Float    @default(21)
  invoiceDueDays  Int      @default(14)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 🔧 Migrace

**Při změně schema:**

1. **Lokálně:**
   ```bash
   npx prisma migrate dev --name popis_zmeny
   git add prisma/migrations
   git push
   ```

2. **Na Vercelu:**
   - Build automaticky spustí `prisma migrate deploy`
   - Aplikuje všechny pending migrace

**Ověření konzistence:**
```bash
npx tsx scripts/verify-schema.ts
```

---

## ⚠️ Důležité poznámky

### Required vs Optional
- **Required pole** = MUSÍ mít hodnotu (nebo default)
- **Optional pole** = Může být `null` (označeno `?`)

### Default hodnoty
- `@default(...)` = Hodnota pokud není specifikována
- Pro String: `@default("")`
- Pro Int/Float: `@default(0)`
- Pro Boolean: `@default(true/false)`

### JSON pole
- Ukládají se jako String
- Před uložením: `JSON.stringify(data)`
- Po načtení: `JSON.parse(string)`

---

## 📝 Checklist před commitem

- [ ] Schema je validní (`npx prisma format`)
- [ ] Migrace je vytvořená
- [ ] Kód používá správná pole
- [ ] Required pole mají fallback hodnoty
- [ ] JSON data jsou správně stringify/parse
- [ ] Build script obsahuje `prisma migrate deploy`

---

**Poslední aktualizace:** 5. prosince 2025
