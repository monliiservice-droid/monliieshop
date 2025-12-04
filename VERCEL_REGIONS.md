# ⚡ Vercel Regions - Optimalizace pro minimální lag

## 🌍 Aktuální konfigurace

### **Region: Frankfurt (fra1)**
- **Primární region:** `fra1` (Frankfurt, Německo)
- **Edge Runtime:** Zapnuto pro middleware
- **CDN:** Automaticky globální

---

## 🚀 Co je nastaveno

### **1. Vercel.json - Region preference:**
```json
{
  "regions": ["fra1"]
}
```

**Frankfurt (fra1)** je nejblíže České republiky:
- ✅ **Latence:** ~10-20ms z ČR
- ✅ **GDPR compliant:** Data v EU
- ✅ **Rychlé načítání:** Serverless funkce v Evropě

---

### **2. Edge Runtime - Middleware:**
```typescript
export const config = {
  matcher: '/admin/:path*',
  runtime: 'edge',
}
```

**Co to znamená:**
- Middleware běží na **Edge Network** (Cloudflare Workers)
- ✅ **Globální:** Běží v 275+ lokacích včetně Prahy
- ✅ **Ultra rychlé:** <10ms latence
- ✅ **Zdarma:** I na Hobby plánu

---

## 📊 Vercel plány a regiony

### **Hobby (Free):**
- Serverless funkce: **US East (iad1)** - nelze změnit
- Edge Functions: Globální ✅
- CDN: Globální ✅

### **Pro ($20/měsíc):**
- Serverless funkce: **Volba regionu** ✅
- Dostupné regiony:
  - `fra1` - Frankfurt 🇩🇪 (DOPORUČENO pro ČR)
  - `ams1` - Amsterdam 🇳🇱
  - `lhr1` - London 🇬🇧
  - `iad1` - Washington DC 🇺🇸
  - `sfo1` - San Francisco 🇺🇸
  - `hnd1` - Tokyo 🇯🇵
  - `sin1` - Singapore 🇸🇬
  - `syd1` - Sydney 🇦🇺

---

## ⚡ Jak to zrychluje web?

### **S Frankfurt regionem (Pro plán):**

```
České zákazníky → Vercel CDN (Praha/Frankfurt)
                ↓
                Serverless API (Frankfurt)
                ↓ 10-20ms
                Response
```

**Výsledek:**
- ✅ API routes: **10-20ms latence**
- ✅ Static assets: **<5ms** (CDN cache)
- ✅ Database queries: **15-30ms** (Neon EU)

---

### **Bez Frankfurt (Hobby plán):**

```
České zákazníky → Vercel CDN (Praha/Frankfurt) ← Static OK
                ↓
                Serverless API (US East)
                ↓ 100-150ms ← POMALÉ!
                Response
```

**Výsledek:**
- ⚠️ API routes: **100-150ms latence**
- ✅ Static assets: **<5ms** (CDN cache)
- ⚠️ První load: Pomalejší

---

## 🎯 Doporučení

### **Pro production (monlii.cz):**

**MOŽNOST A: Upgrade na Pro ($20/měsíc)**
```
Výhody:
- Serverless v Frankfurtu
- 10x rychlejší API
- Unlimited bandwidth
- Advanced analytics
```

**MOŽNOST B: Zůstat na Hobby**
```
Optimalizace:
✅ Edge Runtime pro middleware (už máš)
✅ CDN caching (automaticky)
✅ Image optimization (automaticky)
✅ ISR (Incremental Static Regeneration)

Nevýhody:
⚠️ API routes v US (100-150ms)
```

---

## 🔧 Aktuální nastavení (optimalizováno pro Hobby):

### **Co běží rychle (Edge/CDN):**
- ✅ Homepage (static)
- ✅ Produkty (ISR)
- ✅ Obrázky (CDN)
- ✅ Middleware (Edge Runtime)
- ✅ Instagram carousel

### **Co může být pomalejší (US Serverless):**
- ⚠️ API routes (`/api/*`)
- ⚠️ Server Components s fetch
- ⚠️ Dynamic routes

---

## 💡 Tipy pro optimalizaci bez Pro:

### **1. Static Generation kde je to možné:**
```typescript
export const revalidate = 3600 // ISR - 1 hodina
```

### **2. Client-side fetching pro méně kritická data:**
```typescript
// Místo Server Component → Client Component s SWR
```

### **3. Edge Runtime pro API routes:**
```typescript
export const runtime = 'edge'
```

### **4. Cloudflare jako proxy:**
```
Cloudflare → Cache → Vercel
```
(Ale pozor na SSL certifikáty!)

---

## 📝 Upgrade na Pro - Jak na to?

### **1. Vercel Dashboard:**
https://vercel.com/settings/billing

### **2. Vyber "Pro" plán:**
- $20/měsíc
- Unlimited bandwidth
- Advanced analytics
- Custom regions

### **3. Po upgradu nastav region:**

V `vercel.json` už je nastaveno:
```json
{
  "regions": ["fra1"]
}
```

### **4. Redeploy:**
```bash
git commit --allow-empty -m "Trigger redeploy with Frankfurt region"
git push
```

---

## ✅ Výsledek

### **Aktuálně (Hobby + optimalizace):**
- Static pages: **<50ms** ✅
- API routes: **100-150ms** ⚠️
- Images: **<30ms** ✅
- Middleware: **<10ms** ✅

### **S Pro plánem (Frankfurt):**
- Static pages: **<50ms** ✅
- API routes: **10-20ms** ✅✅
- Images: **<30ms** ✅
- Middleware: **<10ms** ✅

---

## 🌐 Test rychlosti

Po nasazení otestuj rychlost:

### **1. Vercel Analytics:**
https://vercel.com/analytics

### **2. GTmetrix:**
https://gtmetrix.com/

### **3. PageSpeed Insights:**
https://pagespeed.web.dev/

---

**Závěr:** S aktuálním nastavením máš optimalizováno maximum co jde zdarma. Pro ještě lepší výkon doporučuji upgrade na Pro s Frankfurt regionem. 🚀
