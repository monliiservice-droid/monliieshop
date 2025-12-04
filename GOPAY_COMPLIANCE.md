# ✅ GoPay Náležitosti prodejního místa - Checklist

## 📋 POVINNÉ NÁLEŽITOSTI PRO GOPAY

### ✅ 1. Identifikační údaje provozovatele

**Status:** ⚠️ **DOPLNIT SPRÁVNÉ ÚDAJE!**

**Kde:** Footer (patička webu)

**Co je potřeba:**
- ✅ Název společnosti: `Monlii s.r.o.`
- ⚠️ **IČO:** `12345678` **← ZMĚŇ NA SKUTEČNÉ IČO!**
- ⚠️ **Adresa:** `Ulice 123, 738 01 Frýdek-Místek` **← ZMĚŇ NA SKUTEČNOU ADRESU!**

**Akce:**
```typescript
// Soubor: components/footer.tsx (řádky 89-92)
// UPRAV tyto hodnoty na skutečné údaje:
<p className="text-sm text-gray-700 font-semibold">Monlii s.r.o.</p>
<p className="text-xs text-gray-600">
  IČO: [TVOJE_IČO] | Adresa: [TVOJE_ADRESA], Česká republika
</p>
```

---

### ✅ 2. Kontaktní údaje

**Status:** ⚠️ **DOPLNIT SPRÁVNÉ KONTAKTY!**

**Kde:** Footer (patička webu) - viditelné na každé stránce

**Co máš:**
- ⚠️ Email: `info@monlii.cz` **← ZKONTROLUJ/ZMĚŇ**
- ⚠️ Telefon: `+420 777 123 456` **← ZMĚŇ NA SKUTEČNÝ TELEFON!**

**Akce:**
```typescript
// Soubor: components/footer.tsx (řádky 50-59)
// UPRAV tyto kontakty:
<a href="mailto:[TVŮJ_EMAIL]">
  [TVŮJ_EMAIL]
</a>
<a href="tel:+420[TVŮJ_TELEFON]">
  +420 [TVŮJ_TELEFON]
</a>
```

---

### ✅ 3. Popis nabízeného zboží

**Status:** ✅ **HOTOVO**

**Kde:** Stránka každého produktu (`/produkt/[slug]`)

**Co máš:**
- ✅ Popis materiálu
- ✅ Tabulka velikostí
- ✅ Detailní foto galerie
- ✅ Informace o péči

---

### ✅ 4. Cena a měna

**Status:** ✅ **HOTOVO**

**Kde:** Všude kde se zobrazuje cena

**Co máš:**
- ✅ Cena včetně DPH
- ✅ Měna: Kč (CZK)
- ✅ Konečná cena v košíku
- ✅ Doprava zobrazena samostatně

---

### ✅ 5. Obchodní podmínky

**Status:** ✅ **EXISTUJE** (zkontroluj obsah!)

**Kde:** `/obchodni-podminky`

**Co musí obsahovat:**
- ✅ Identifikační údaje společnosti
- ✅ Odstoupení od smlouvy (14 dní)
- ✅ Způsob platby a dodání
- ✅ Náklady na dodání
- ✅ Postup při reklamaci

**Link v footeru:** ✅ ANO

**Akce:**
1. Otevři `/app/obchodni-podminky/page.tsx`
2. Zkontroluj že obsahuje všechny povinné body
3. Doplň skutečné IČO, adresu, kontakty

---

### ✅ 6. Reklamační řád

**Status:** ✅ **EXISTUJE** (zkontroluj obsah!)

**Kde:** `/reklamace`

**Co musí obsahovat:**
- ✅ Jak ohlásit reklamaci
- ✅ Adresa pro zaslání reklamovaného zboží
- ✅ Podmínky kdy nelze reklamovat
- ✅ Reklamační lhůty (24 měsíců záruka)
- ✅ Způsob vyřízení

**Link v footeru:** ✅ ANO

**Akce:**
1. Otevři `/app/reklamace/page.tsx`
2. Zkontroluj že obsahuje všechny povinné informace
3. Doplň konkrétní reklamační adresu

---

### ✅ 7. Ochrana osobních údajů (GDPR)

**Status:** ✅ **EXISTUJE** (zkontroluj obsah!)

**Kde:** `/ochrana-osobnich-udaju`

**Co musí obsahovat:**
- ✅ Jaké údaje sbíráme
- ✅ Za jakým účelem
- ✅ Jak dlouho je uchováváme
- ✅ Práva zákazníka
- ✅ Cookies policy

**Link v footeru:** ✅ ANO

**Akce:**
1. Otevři `/app/ochrana-osobnich-udaju/page.tsx`
2. Zkontroluj že je aktuální
3. Doplň správce osobních údajů (tvoje firma)

---

### ⚠️ 8. Potvrzení plnoletosti

**Status:** ⚠️ **NENÍ POTŘEBA** (neprodáváš alkohol/18+)

**Poznámka:** Pokud začneš prodávat zboží 18+, přidej age gate.

---

### ⚠️ 9. Exportní omezení

**Status:** ⚠️ **NENÍ POTŘEBA** (zatím jen ČR)

**Poznámka:** 
- Pokud začneš prodávat do zahraničí, přidej do Dopravy
- Specifikuj země kam posíláš

---

### ✅ 10. Loga platebních karet

**Status:** ✅ **HOTOVO**

**Kde:** Footer (patička webu)

**Co máš:**
- ✅ VISA
- ✅ Mastercard
- ✅ GoPay
- ✅ 3D Secure

**Zobrazení:** Na každé stránce v patičce ✅

---

## 🎯 CO MUSÍŠ UDĚLAT HNED:

### 1. **DOPLŇ SKUTEČNÉ ÚDAJE DO FOOTERU:**

**Soubor:** `components/footer.tsx`

```typescript
// Řádky 89-92 - FIREMNÍ ÚDAJE
<p className="text-sm text-gray-700 font-semibold">Monlii s.r.o.</p>
<p className="text-xs text-gray-600">
  IČO: [DOPLŇ_IČO] | Adresa: [DOPLŇ_ADRESU], Česká republika
</p>

// Řádky 50-59 - KONTAKTY
<a href="mailto:[DOPLŇ_EMAIL]">[DOPLŇ_EMAIL]</a>
<a href="tel:+420[DOPLŇ_TELEFON]">+420 [DOPLŇ_TELEFON]</a>
```

---

### 2. **ZKONTROLUJ OBSAH STRÁNEK:**

#### A) **Obchodní podmínky** (`/app/obchodni-podminky/page.tsx`)
- [ ] Obsahuje IČO, adresu, kontakty
- [ ] Popisuje odstoupení od smlouvy (14 dní)
- [ ] Popisuje způsoby platby (GoPay, převod)
- [ ] Popisuje dopravu (Zásilkovna, osobní odběr)
- [ ] Náklady na dopravu jasně uvedeny

#### B) **Reklamační řád** (`/app/reklamace/page.tsx`)
- [ ] Reklamační adresa uvedena
- [ ] Postup reklamace popsán
- [ ] Lhůty uvedeny (24 měsíců záruka)

#### C) **Ochrana osobních údajů** (`/app/ochrana-osobnich-udaju/page.tsx`)
- [ ] Správce údajů (tvoje firma)
- [ ] Jaké údaje sbíráme
- [ ] Účel zpracování
- [ ] Doba uchovávání

---

### 3. **COMMIT A PUSH:**

```bash
# Po úpravě údajů:
git add components/footer.tsx
git commit -m "Update company details and contacts for GoPay compliance"
git push
```

---

## ⚠️ DŮLEŽITÉ UPOZORNĚNÍ:

### **Před aktivací GoPay MUSÍŠ:**

1. ✅ **Doplnit VŠECHNY skutečné údaje** (IČO, adresa, telefon, email)
2. ✅ **Zkontrolovat obsah všech právních stránek**
3. ✅ **Ověřit že kontakty jsou funkční** (email, telefon)
4. ✅ **Mít aktuální doménu** (monlii.cz) - ne vercel URL

### **Možné sankce při nedodržení:**

- ⚠️ **Česká obchodní inspekce:** Pokuta až 20 000 000 Kč
- ⚠️ **Karetní asociace:** Zablokování plateb
- ⚠️ **GoPay:** Odmítnutí registrace

---

## 📊 AKTUÁLNÍ STAV:

```
✅ Struktura webu:          HOTOVO
✅ Právní stránky:          EXISTUJÍ
✅ Footer s logem:          HOTOVO
⚠️ Firemní údaje:          DOPLNIT!
⚠️ Kontakty:               DOPLNIT!
⚠️ Obsah právních stránek: ZKONTROLOVAT!
```

---

## 🎯 CHECKLIST PŘED SPUŠTĚNÍM:

- [ ] IČO doplněno do footeru
- [ ] Adresa doplněna do footeru  
- [ ] Email doplněn do footeru
- [ ] Telefon doplněn do footeru
- [ ] Obchodní podmínky zkontrolovány
- [ ] Reklamační řád zkontrolován
- [ ] GDPR stránka zkontrolována
- [ ] Všechny odkazy v footeru fungují
- [ ] Doména monlii.cz aktivní
- [ ] Loga platebních karet viditelná

---

## 📝 POZNÁMKY:

### **Email:**
- Doporučuji: `obchod@monlii.cz` nebo `info@monlii.cz`
- Musí být funkční!
- Stejný email použij v GoPay registraci

### **Telefon:**
- Musí být dostupný pro zákazníky
- Doporučuji: mobilní číslo nebo zákaznická linka

### **IČO a adresa:**
- Musí odpovídat živnostenskému listu/výpisu z OR
- Stejné údaje použij v GoPay registraci

---

**Po doplnění všech údajů je tvůj web ready pro GoPay! 🚀**
