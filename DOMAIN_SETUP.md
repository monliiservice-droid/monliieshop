# 🌐 Nastavení domén - monlii.cz

## 📋 Konfigurace domén

### **Hlavní web:**
- `monlii.cz` → E-shop (homepage, produkty, košík)
- `www.monlii.cz` → Redirect na `monlii.cz`

### **Admin panel:**
- `admin.monlii.cz` → Admin panel (POUZE zde!)
- `monlii.cz/admin` → **REDIRECT** na `admin.monlii.cz/admin`

---

## 🚀 VERCEL - Přidání domén

### 1. Jdi na Vercel Dashboard
https://vercel.com/dashboard

### 2. Vyber projekt "monliieshop"

### 3. Settings → Domains

### 4. Přidej tyto domény:

#### **Doména 1:**
```
monlii.cz
```

#### **Doména 2:**
```
www.monlii.cz
```
→ Nastav jako redirect na `monlii.cz`

#### **Doména 3:**
```
admin.monlii.cz
```

---

## ☁️ CLOUDFLARE - DNS záznamy

### 1. Jdi na Cloudflare Dashboard
https://dash.cloudflare.com/

### 2. Vyber doménu "monlii.cz"

### 3. DNS → Records

### 4. Přidej tyto záznamy:

#### **Záznam 1 - Hlavní doména:**
```
Type:    A
Name:    @
Content: 76.76.21.21
Proxy:   ⚪ DNS only (VYPNUTO!)
TTL:     Auto
```

#### **Záznam 2 - WWW:**
```
Type:    CNAME
Name:    www
Content: cname.vercel-dns.com
Proxy:   ⚪ DNS only (VYPNUTO!)
TTL:     Auto
```

#### **Záznam 3 - Admin subdoména:**
```
Type:    CNAME
Name:    admin
Content: cname.vercel-dns.com
Proxy:   ⚪ DNS only (VYPNUTO!)
TTL:     Auto
```

---

## ⚠️ DŮLEŽITÉ - Cloudflare nastavení

### **1. VYPNI Proxy (Orange Cloud)**
- U všech DNS záznamů klikni na 🟠 → změní se na ⚪
- **Musí být "DNS only"** aby Vercel mohl vydat SSL certifikát

### **2. SSL/TLS nastavení:**

#### V Cloudflare → SSL/TLS:
```
Encryption mode: Full (strict)
```

#### V Cloudflare → SSL/TLS → Edge Certificates:
```
Always Use HTTPS: ON ✅
```

---

## 🔒 Environment Variables - Vercel

### Přidej do Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_URL=https://monlii.cz
NEXT_PUBLIC_ADMIN_URL=https://admin.monlii.cz
```

**Pro všechna prostředí:** Production, Preview, Development

---

## ✅ Ověření konfigurace

### Po 5-30 minutách zkontroluj:

#### **1. Vercel Domains:**
Všechny domény by měly mít stav:
```
✅ Valid Configuration
```

#### **2. Funkční test:**

**Hlavní web:**
- https://monlii.cz → Homepage ✅
- https://www.monlii.cz → Redirect na monlii.cz ✅

**Admin:**
- https://admin.monlii.cz/admin → Admin login ✅
- https://monlii.cz/admin → **REDIRECT** na admin.monlii.cz/admin ✅

**SSL certifikáty:**
- Všechny domény mají zelený zámek 🔒 ✅

---

## 🎯 Jak to funguje

### **Middleware logika:**

1. **Pokud někdo jde na:** `monlii.cz/admin`
   - Middleware detekuje hostname není `admin.monlii.cz`
   - **Automatický redirect** na `admin.monlii.cz/admin`

2. **Pokud někdo jde na:** `admin.monlii.cz/admin`
   - Hostname je správný (`admin.`)
   - Kontrola autentizace
   - Přístup povolen ✅

3. **Localhost development:**
   - `localhost:3000/admin` funguje normálně
   - Middleware rozpozná localhost a neaplikuje redirect

---

## 🆘 Troubleshooting

### **"Invalid Configuration" ve Vercelu**
→ Zkontroluj DNS záznamy v Cloudflare
→ Ujisti se že proxy je vypnuto (⚪)

### **SSL certifikát nefunguje**
→ Čekej 5-30 minut na propagaci
→ Zkontroluj že Cloudflare SSL je "Full (strict)"

### **Admin se načítá pomalu**
→ První načtení může být pomalé (cold start)
→ Další návštěvy budou rychlé

### **Redirect loop**
→ Zkontroluj že admin.monlii.cz je správně nastavena ve Vercelu
→ Clear browser cache (Ctrl+Shift+R)

---

## 📝 Poznámky

- DNS propagace: 5-30 minut
- SSL certifikát: automaticky od Vercel (Let's Encrypt)
- Cookiebot consent bude fungovat na obou doménách
- Session cookies jsou sdílené mezi subdoménami

---

**Připraveno! 🚀**
