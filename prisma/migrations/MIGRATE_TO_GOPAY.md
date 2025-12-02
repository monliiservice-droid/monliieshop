# 🔄 Migrace ze Stripe na GoPay

Tento dokument popisuje, jak migrovat z existující Stripe integrace na GoPay.

## 📋 Kroky migrace

### 1. Backup databáze

```bash
# SQLite
cp prisma/dev.db prisma/dev.db.backup

# PostgreSQL
pg_dump your_database > backup_before_gopay.sql
```

### 2. Spusť migraci

```bash
# Vygeneruj migraci
npx prisma migrate dev --name switch_to_gopay

# Nebo ruční SQL pro existující databázi:
```

### 3. Ruční SQL migrace (pokud už máš data)

```sql
-- Přejmenuj sloupec stripePaymentId na gopayPaymentId
ALTER TABLE "Order" 
  RENAME COLUMN "stripePaymentId" TO "gopayPaymentId";

-- Přidej sloupec gopayState
ALTER TABLE "Order" 
  ADD COLUMN "gopayState" TEXT;

-- Aktualizuj existující objednávky (pokud jsou nějaké Stripe platby)
-- DŮLEŽITÉ: Tento krok je jen pro migraci existujících dat
-- V nové instalaci není potřeba

-- Nastav paymentMethod z 'stripe' na 'gopay' (pokud existují takové záznamy)
UPDATE "Order" 
SET "paymentMethod" = 'gopay' 
WHERE "paymentMethod" = 'stripe';
```

### 4. Ověř migraci

```bash
# Zkontroluj schema
npx prisma studio

# Ověř, že:
# - Sloupec stripePaymentId byl přejmenován na gopayPaymentId
# - Sloupec gopayState existuje
# - Existující data jsou zachována
```

### 5. Aktualizuj aplikaci

```bash
# Nainstaluj závislosti (pokud jsou nové)
npm install

# Vygeneruj Prisma client
npx prisma generate

# Restartuj aplikaci
npm run dev
```

## 🔍 Ověření

Zkontroluj, že:

- [x] Database schema obsahuje `gopayPaymentId` místo `stripePaymentId`
- [x] Database schema obsahuje `gopayState`
- [x] Existující objednávky jsou zachované
- [x] Aplikace se spouští bez chyb
- [x] Můžeš vytvořit novou objednávku
- [x] GoPay API credentials jsou v ENV

## ⚠️ Pro novou instalaci

Pokud instaluješ čistou aplikaci (bez existujících dat):

```bash
# Jednoduchá migrace
npx prisma migrate dev

# Nebo reset databáze a znovu vytvoř
npx prisma migrate reset
```

## 🆘 Rollback (v případě problémů)

```bash
# 1. Obnov backup
cp prisma/dev.db.backup prisma/dev.db

# PostgreSQL
psql your_database < backup_before_gopay.sql

# 2. Vrať předchozí schema
git checkout HEAD~1 -- prisma/schema.prisma

# 3. Vygeneruj client
npx prisma generate
```

## 📝 Poznámky

- Migrace je **jednostranná** - po přechodu na GoPay není jednoduché vrátit se na Stripe
- Existující Stripe platby zůstanou v databázi, ale nebude možné je aktualizovat
- Doporučujeme dokončit všechny pending Stripe platby před migrací
- V produkci zvažte scénář, kdy máte obě brány běžící paralelně po přechodnou dobu
