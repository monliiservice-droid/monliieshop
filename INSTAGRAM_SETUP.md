# Instagram Embeds - Návod

## ✅ JAK TO FUNGUJE

Web nyní používá **Instagram native embeds** - oficiální embed kód od Instagramu.

**Výhody:**
- ✅ **Žádné API** - funguje bez schvalování od Meta
- ✅ **Oficiální** - přímo od Instagramu
- ✅ **Bezpečné** - žádné tokeny ani credentials
- ✅ **Interaktivní** - uživatelé vidí i lajky, komentáře
- ✅ **Aktuální** - Instagram automaticky aktualizuje embed

**Nevýhody:**
- ⚠️ Trochu pomalejší načítání (Instagram script)
- ⚠️ Potřebuje JavaScript

---

## 📝 JAK PŘIDAT DALŠÍ POSTY

### V souboru: `components/InstagramFeed.tsx`

Najdi řádky 6-11:
```typescript
const INSTAGRAM_POSTS = [
  'https://www.instagram.com/p/DQsCraPAhTW/',
  'https://www.instagram.com/p/DKrQpFWs5NJ/',
  'https://www.instagram.com/p/DHMQj__MpA5/',
  'https://www.instagram.com/p/DHYlZ1fIjPv/',
]
```

**Prostě přidej další URL:**
```typescript
const INSTAGRAM_POSTS = [
  'https://www.instagram.com/p/DQsCraPAhTW/',
  'https://www.instagram.com/p/DKrQpFWs5NJ/',
  'https://www.instagram.com/p/DHMQj__MpA5/',
  'https://www.instagram.com/p/DHYlZ1fIjPv/',
  'https://www.instagram.com/p/NOVY_POST/',  // ← nový post
]
```

**Commit a push:**
```bash
git add -A
git commit -m "Add new Instagram post"
git push
```

Vercel automaticky nasadí změny (~3 min).

---

## 🎨 JAK ZÍSKAT URL POSTU

1. **Otevři Instagram** (web nebo aplikace)
2. **Najdi post** který chceš zobrazit
3. **Klikni na tři tečky** (...) na postu
4. **Vyber "Copy link"** (Zkopírovat odkaz)
5. **URL vypadá:** `https://www.instagram.com/p/ABC123xyz/`

---

## 💡 DOPORUČENÍ

- **Optimální počet:** 4-6 postů (rychlejší načítání)
- **Layout:** 2 sloupce na desktop, 1 na mobile
- **Aktualizace:** Přidávej nové posty každý měsíc

---

## 🔧 TECHNICKÉ DETAILY

### **Jak to funguje:**
1. Komponenta obsahuje pole URL Instagram postů
2. Instagram embed script (`embed.js`) se načte ze serveru Instagramu
3. Script najde všechny `blockquote` elementy s třídou `instagram-media`
4. Automaticky je převede na interaktivní embeds

### **Co se zobrazí:**
- ✅ Obrázek/video z postu
- ✅ Caption (popisek)
- ✅ Datum publikace
- ✅ Počet lajků
- ✅ Tlačítko "View on Instagram"

---

## ⚠️ POZNÁMKY

- Embeds fungují **jen na veřejných postech**
- Pokud je účet privátní, embed nebude fungovat
- Instagram může embeds občas aktualizovat/změnit vzhled
- Žádné environment variables nejsou potřeba!
