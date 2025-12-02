# Instrukce pro migraci databáze - Slevové kódy a Zásilkovna

## Nové funkce:
1. ✅ Slevové kódy s admin správou
2. ✅ Zásilkovna - výdejní místo (69 Kč)
3. ✅ Zásilkovna - doručení na adresu (99 Kč)
4. ✅ Doprava ZDARMA nad 2500 Kč
5. ✅ Dobírka 30 Kč

## Kroky pro aktivaci:

### 1. Migrace databáze

Spusťte Prisma migraci pro vytvoření tabulky `DiscountCode` a aktualizaci `Order`:

```bash
npx prisma migrate dev --name add_discount_codes
```

### 2. Generování Prisma Client

Po migraci vygenerujte nový Prisma Client:

```bash
npx prisma generate
```

### 3. Restart development serveru

```bash
npm run dev
```

## Změny v databázi:

### Nový model: DiscountCode
- `code` - Unikátní kód (např. "LETO2024")
- `type` - "percentage" nebo "fixed"
- `value` - Hodnota slevy
- `minAmount` - Minimální částka objednávky
- `maxUses` - Max. počet použití
- `usedCount` - Počítadlo použití
- `totalRevenue` - Celková tržba s tímto kódem
- `isActive` - Aktivní/neaktivní
- `validFrom` / `validUntil` - Platnost

### Aktualizace Order modelu:
- `discountCode` - Použitý slevový kód
- `discountAmount` - Částka slevy
- `shippingMethod` - Aktualizováno na: zasilkovna_pickup, zasilkovna_home, personal

## Admin panel:

Slevové kódy spravujete v admin panelu na adrese:
```
/admin/slevove-kody
```

Zde můžete:
- ✅ Vytvářet nové slevové kódy
- ✅ Aktivovat/deaktivovat kódy
- ✅ Sledovat statistiky použití
- ✅ Vidět celkovou tržbu s každým kódem
- ✅ Smazat kódy

## Příklady slevových kódů:

### Procentuální sleva:
- Kód: LETO10
- Typ: percentage
- Hodnota: 10 (= 10% sleva)

### Pevná sleva:
- Kód: WELCOME100
- Typ: fixed
- Hodnota: 100 (= 100 Kč sleva)

### S minimální částkou:
- Min. Amount: 500 (sleva platí jen nad 500 Kč)

### S limitem použití:
- Max Uses: 50 (kód lze použít max. 50×)

## Ceny dopravy:

Upraveno v `/lib/zasilkovna-config.ts`:

```typescript
pickupPointPrice: 69,     // Kč - výdejní místo
homeDeliveryPrice: 99,    // Kč - doručení na adresu (BEZ free shipping!)
freeShippingThreshold: 2500,  // Kč - doprava ZDARMA pouze pro výdejní místo
codFee: 30,              // Kč - poplatek za dobírku
```

**DŮLEŽITÉ:** Doprava zdarma nad 2500 Kč platí POUZE pro Zásilkovnu - výdejní místo, 
NIKOLI pro doručení na adresu!

## Zásilkovna API Key:

Nastaveno natvrdo v konfiguraci:
```
API Key: dee61660b640a98d
```

## Testování:

1. **Košík:**
   - Přidejte produkt do košíku
   - Zadejte slevový kód
   - Ověřte výpočet slevy
   - Zkontrolujte free shipping message nad 2500 Kč

2. **Checkout:**
   - Vyberte "Zásilkovna - výdejní místo" → musí vybrat výdejní místo, free shipping nad 2500 Kč
   - Vyberte "Zásilkovna - doručení na adresu" → 99 Kč vždy (bez free shipping)
   - Vyberte "Osobní odběr" → musí vybrat Havířov nebo Frenštát, zdarma
   - Zkontrolujte ceny dopravy
   - Ověřte free shipping pouze pro výdejní místo nad 2500 Kč

3. **Admin - Slevové kódy:**
   - Vytvořte testovací kód
   - Aktivujte/deaktivujte
   - Použijte kód v košíku
   - Ověřte statistiky v adminu

## Poznámky:

- Lint chyby týkající se `discountCode` zmizí po spuštění `npx prisma generate`
- Slevové kódy se automaticky validují proti planosti, min. částce, max. použití
- Statistics v adminu se aktualizují při každé objednávce (TODO: implementovat v order API)
