# Instagram oEmbed API - Návod k nastavení

## ✅ CO MÁŠ UŽ HOTOVÉ

- ✅ Instagram App ID: `2079065312836422`
- ✅ Instagram App Secret: `58c6226ce9665bd09d66e7e15ce160da`
- ✅ Vybrané posty v kódu

## 🚀 ZBÝVÁ JEN PŘIDAT DO VERCEL

### 1. Jdi na Vercel Dashboard

https://vercel.com/dashboard

### 2. Vyber projekt "monliieshop"

Klikni na něj v seznamu projektů

### 3. Jdi do Settings

V horním menu: **Settings**

### 4. Environment Variables

V levém menu: **Environment Variables**

### 5. Přidej 2 proměnné

#### **První proměnná:**
- **Key:** `INSTAGRAM_APP_ID`
- **Value:** `2079065312836422`
- **Environments:** ☑ Production, ☑ Preview, ☑ Development
- Klikni **Save**

#### **Druhá proměnná:**
- **Key:** `INSTAGRAM_APP_SECRET`
- **Value:** `58c6226ce9665bd09d66e7e15ce160da`
- **Environments:** ☑ Production, ☑ Preview, ☑ Development
- Klikni **Save**

### 6. Redeploy

1. Jdi na **Deployments** tab
2. Klikni na tři tečky **"..."** u nejnovějšího deploymentu
3. Vyber **"Redeploy"**
4. Počkaj ~3-5 minut

### 7. Hotovo! 🎉

Jdi na homepage a uvidíš své Instagram posty:
- https://monliieshop.vercel.app/
- Scroll dolů na sekci "Náš Instagram"

---

## 📝 JAK PŘIDAT DALŠÍ POSTY

### V souboru: `app/api/instagram/feed/route.ts`

Najdi řádky 22-27:
```typescript
const INSTAGRAM_POSTS = [
  'https://www.instagram.com/p/DQsCraPAhTW/',
  'https://www.instagram.com/p/DKrQpFWs5NJ/',
  'https://www.instagram.com/p/DHMQj__MpA5/',
  // Add more posts here as needed
]
```

**Prostě přidej další URL:**
```typescript
const INSTAGRAM_POSTS = [
  'https://www.instagram.com/p/DQsCraPAhTW/',
  'https://www.instagram.com/p/DKrQpFWs5NJ/',
  'https://www.instagram.com/p/DHMQj__MpA5/',
  'https://www.instagram.com/p/NOVY_POST/',  // ← nový post
  'https://www.instagram.com/p/DALSI_POST/', // ← další post
]
```

Commit, push a automaticky se nasadí na Vercel!

---

## 💡 VÝHODY TOHOTO ŘEŠENÍ

✅ **Jednoduchá správa** - jen App ID a Secret  
✅ **Plná kontrola** - vyber přesně které posty zobrazit  
✅ **Žádné expirování** - credentials nevyprší  
✅ **Rychlé** - cache 1 hodinu  
✅ **Bezpečné** - credentials v environment variables

## ⚠️ POZNÁMKY

- Instagram posty jsou **statické** - nezobrazuje automaticky nejnovější
- Pro aktualizaci přidej nové URL do pole `INSTAGRAM_POSTS`
- Maximálně doporučuji 8 postů (kvůli rychlosti načítání)
- API má limit 200 požadavků/hodinu (s cache by to neměl být problém)
