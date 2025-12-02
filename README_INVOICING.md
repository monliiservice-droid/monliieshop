# Systém fakturace Monlii E-shop

## 📋 Přehled

Kompletní systém pro správu faktur a tržeb v admin panelu.

## 🎯 Funkce

### 1. Dashboard s klikacími kartami
- **Produkty** → `/admin/produkty`
- **Objednávky** → `/admin/objednavky`
- **Tržby** → `/admin/trzby`

Karty jsou interaktivní tlačítka s hover efekty.

### 2. Stránka Tržby (`/admin/trzby`)

#### Statistiky
- Celkové tržby (zaplacené faktury)
- Počet zaplacených faktur
- Počet nezaplacených faktur

#### Graf měsíčních tržeb
- Vizualizace tržeb po měsících pomocí sloupcového grafu
- Kliknutím na sloupec se filtrují faktury za daný měsíc
- Zobrazení počtu faktur a celkové tržby za měsíc

#### Seznam faktur
- Zobrazení všech faktur nebo filtrovaných podle měsíce
- Informace: číslo faktury, zákazník, částka, datum vystavení, splatnost
- Status faktury: zaplaceno, nezaplaceno, po splatnosti, zrušeno
- Typ faktury: automatická (z objednávky) nebo manuální
- Tlačítka: Zobrazit, Stáhnout PDF

### 3. Fakturační údaje (`/admin/nastaveni` → záložka Fakturace)

#### Základní údaje firmy
- Název firmy *
- IČO *
- DIČ
- Checkbox: Plátce DPH

#### Adresa
- Ulice a číslo *
- Město *
- PSČ *
- Země

#### Kontaktní údaje
- Email *
- Telefon *

#### Bankovní údaje
- Číslo účtu
- IBAN
- SWIFT/BIC

#### Nastavení faktur
- Prefix faktur (např. "2024" → faktury 2024000001)
- Výchozí DPH sazba (%)
- Splatnost faktur (dny)

## 📊 Databázové modely

### Invoice
```prisma
model Invoice {
  id              String   @id @default(cuid())
  invoiceNumber   String   @unique
  orderId         String?
  order           Order?
  type            String   // "automatic" nebo "manual"
  customerName    String
  customerEmail   String
  customerPhone   String?
  customerAddress String   // JSON
  customerIco     String?
  customerDic     String?
  items           String   // JSON array
  subtotal        Float    // Částka bez DPH
  vatRate         Float
  vatAmount       Float
  totalAmount     Float
  notes           String?
  issueDate       DateTime
  dueDate         DateTime
  paidDate        DateTime?
  status          String   // unpaid, paid, overdue, cancelled
  createdAt       DateTime
  updatedAt       DateTime
}
```

### CompanySettings
```prisma
model CompanySettings {
  id              String   @id @default(cuid())
  companyName     String
  ico             String
  dic             String?
  street          String
  city            String
  zip             String
  country         String
  email           String
  phone           String
  bankAccount     String?
  iban            String?
  swift           String?
  invoicePrefix   String
  nextInvoiceNum  Int
  vatPayer        Boolean
  defaultVatRate  Float
  invoiceDueDays  Int
  createdAt       DateTime
  updatedAt       DateTime
}
```

## 🔌 API Endpoints

### Faktury

#### `GET /api/admin/invoices`
Vrátí seznam všech faktur.

#### `POST /api/admin/invoices`
Vytvoří manuální fakturu.

**Body:**
```json
{
  "customerName": "Jan Novák",
  "customerEmail": "jan@example.com",
  "customerPhone": "+420 123 456 789",
  "customerAddress": {
    "street": "Hlavní 1",
    "city": "Praha",
    "zip": "100 00"
  },
  "customerIco": "12345678",
  "customerDic": "CZ12345678",
  "items": [
    {
      "name": "Produkt 1",
      "quantity": 2,
      "price": 500
    }
  ],
  "subtotal": 1000,
  "vatRate": 21,
  "notes": "Poznámka",
  "status": "unpaid"
}
```

#### `GET /api/admin/invoices/[id]`
Detaily faktury.

#### `PATCH /api/admin/invoices/[id]`
Aktualizace faktury (např. změna statusu).

#### `DELETE /api/admin/invoices/[id]`
Smazání faktury.

#### `GET /api/admin/invoices/revenue`
Měsíční tržby pro graf.

**Response:**
```json
[
  {
    "month": "2024-12",
    "revenue": 15000,
    "invoices": 5
  }
]
```

### Fakturační údaje

#### `GET /api/admin/company-settings`
Načte fakturační údaje firmy.

#### `POST /api/admin/company-settings`
Uloží/aktualizuje fakturační údaje.

## 🛠️ Utilita pro generování faktur

### `lib/invoice-generator.ts`

#### `createInvoiceForOrder(order: OrderData)`
Automaticky vytvoří fakturu pro objednávku:
- Vygeneruje číslo faktury
- Vypočítá DPH
- Nastaví datum splatnosti
- Zvýší čítač faktur

**Použití:**
```typescript
import { createInvoiceForOrder } from '@/lib/invoice-generator'

// Při vytvoření objednávky
const invoice = await createInvoiceForOrder(order)
```

#### `markInvoiceAsPaid(invoiceId: string)`
Označí fakturu jako zaplacenou.

#### `markOrderInvoicesAsPaid(orderId: string)`
Označí všechny faktury objednávky jako zaplacené.

## 🎨 Frontend komponenty

### `/app/admin/trzby/page.tsx`
Hlavní stránka tržeb s grafem a seznamem faktur.

**Features:**
- Real-time statistiky
- Interaktivní graf (Recharts)
- Filtrování podle měsíce
- Responsive design

### `/app/admin/nastaveni/page.tsx`
Rozšířeno o záložku Fakturace pro správu fakturačních údajů.

## 📦 Závislosti

```json
{
  "recharts": "^2.x.x" // Pro grafy
}
```

## 🚀 Instalace

1. **Migrace databáze:**
```bash
npx prisma migrate dev
```

2. **Instalace závislostí:**
```bash
npm install recharts
```

3. **Restart dev serveru:**
```bash
npm run dev
```

## 💡 Budoucí vylepšení

- [ ] Export faktur do PDF
- [ ] Email notifikace pro zákazníky
- [ ] Automatické označování po splatnosti
- [ ] Hromadné operace s fakturami
- [ ] Šablony pro faktury
- [ ] Multi-měnová podpora
- [ ] Automatické vytváření faktur při objednávce

## 📝 Poznámky

- Faktury jsou automaticky číslovány podle nastavení v CompanySettings
- Číslo faktury: `{prefix}{číslo}` např. "2024000001"
- DPH se počítá pouze pokud je firma plátce DPH
- Splatnost se počítá od data vystavení + počet dnů

## ⚠️ Důležité

Před nasazením do produkce:
1. Nastavte správné fakturační údaje v `/admin/nastaveni`
2. Ověřte správnost výpočtu DPH
3. Otestujte generování faktur
4. Nastavte správný prefix faktur pro aktuální rok
