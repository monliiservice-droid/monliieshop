# Admin Panel - Monlii E-shop

## Přístup k admin funkcím:

### 📋 Menu navigace:

1. **Dashboard** (`/admin`)
   - Přehled objednávek a statistik

2. **Produkty** (`/admin/produkty`)
   - Seznam všech produktů
   - Přidání nového produktu (`/admin/produkty/novy`)
   - Úprava produktu (`/admin/produkty/[id]`)
   - Smazání produktu

3. **Objednávky** (`/admin/objednavky`)
   - Seznam všech objednávek
   - Detaily objednávek
   - Změna stavu objednávek

4. **Slevové kódy** (`/admin/slevove-kody`) ✨ NOVÉ
   - Vytváření slevových kódů
   - Správa aktivních/neaktivních kódů
   - Statistiky použití
   - Sledování tržeb s kódy

5. **Nastavení** (`/admin/nastaveni`)
   - Platby (Stripe)
   - Informace o obchodě
   - Sociální sítě

---

## 🏷️ Slevové kódy

### Jak vytvořit slevový kód:

1. Přejděte na `/admin/slevove-kody`
2. Klikněte na "Nový slevový kód"
3. Vyplňte:
   - **Kód** - např. "LETO2024"
   - **Typ** - Procentuální nebo Pevná částka
   - **Hodnota** - např. 10 (pro 10%) nebo 100 (pro 100 Kč)
   - **Min. částka** - Volitelné, minimální částka objednávky
   - **Max. počet použití** - Volitelné
   - **Platnost do** - Volitelné datum vypršení

### Funkce:
- ✅ Aktivace/Deaktivace kódů
- ✅ Sledování počtu použití
- ✅ Sledování celkové tržby s každým kódem
- ✅ Smazání kódů

---

## 🚚 Nastavení dopravy a Zásilkovna

**DŮLEŽITÉ:** Nastavení dopravy a Zásilkovna API klíč jsou **natvrdo v konfiguraci**.

Nachází se v souboru: `/lib/zasilkovna-config.ts`

```typescript
export const ZASILKOVNA_CONFIG = {
  apiKey: '***REMOVED***',
  pickupPointPrice: 69,        // Kč
  homeDeliveryPrice: 99,       // Kč
  freeShippingThreshold: 2500, // Kč
  codFee: 30,                  // Kč
}
```

### Ceny dopravy:
- **Zásilkovna - výdejní místo:** 69 Kč (zdarma nad 2500 Kč)
- **Zásilkovna - doručení domů:** 99 Kč (vždy)
- **Osobní odběr:** Zdarma (Havířov nebo Frenštát)
- **Dobírka:** +30 Kč

**Změny cen:** Pro změnu cen upravte přímo soubor `/lib/zasilkovna-config.ts`

**Zásilkovna API:** Klíč je nastaven natvrdo, není potřeba měnit v admin panelu.

---

## 📊 Statistiky slevových kódů

Na stránce `/admin/slevove-kody` uvidíte:

### Globální statistiky:
- Celkový počet kódů
- Počet aktivních kódů
- Celková tržba se slevami

### Statistiky jednotlivých kódů:
- Kód a typ slevy
- Počet použití / Max. použití
- Celková tržba s tímto kódem
- Datum vytvoření
- Platnost

---

## 🔧 Technické poznámky:

### Databáze:
Po přidání slevových kódů je potřeba spustit migraci:
```bash
npx prisma migrate dev --name add_discount_codes
npx prisma generate
```

### API Endpointy:
- `POST /api/discount-codes/validate` - Validace kódu při použití
- `GET /api/admin/discount-codes` - Seznam všech kódů
- `POST /api/admin/discount-codes` - Vytvoření nového kódu
- `PATCH /api/admin/discount-codes/[id]` - Aktualizace kódu
- `DELETE /api/admin/discount-codes/[id]` - Smazání kódu

---

## 🎯 Quick Start:

1. Vytvořte testovací slevový kód (např. "TEST10" pro 10% slevu)
2. Přidejte produkt do košíku
3. Použijte slevový kód v košíku
4. Zkontrolujte statistiky v admin panelu

---

**Verze:** 2.0  
**Poslední aktualizace:** Prosinec 2024
