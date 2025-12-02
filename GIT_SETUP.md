# 🚀 Git Setup & První Push

Návod pro nastavení Git repository a první push na GitHub.

---

## ⚠️ PŘED PRVNÍM PUSHEM

Zkontroluj tyto věci:

- [ ] `.env*` soubory NEJSOU v gitu (jsou v `.gitignore`)
- [ ] Database soubory `*.db` NEJSOU v gitu
- [ ] `node_modules/` NENÍ v gitu
- [ ] Všechny citlivé informace jsou v `.gitignore`

---

## 📋 Krok za krokem

### 1. Inicializuj Git (pokud ještě není)

```bash
cd "/Users/roumen/Documents/Soukromé/Nevymyslíš/Monlii EShop/monlii-eshop"

# Zkontroluj, jestli už není git
git status

# Pokud není, inicializuj
git init
```

### 2. Přidej Remote Repository

```bash
# Přidej GitHub remote
git remote add origin git@github.com:monliiservice-droid/monliieshop.git

# Ověř remote
git remote -v
```

### 3. Vytvoř .gitignore (už je vytvořený ✅)

Soubor `.gitignore` už obsahuje:
- ✅ `.env*` - Environment variables
- ✅ `*.db` - Database soubory
- ✅ `/node_modules` - Dependencies
- ✅ `/.next` - Build output
- ✅ `.wrangler` - Cloudflare config

### 4. První Commit

```bash
# Přidej všechny soubory
git add .

# Zkontroluj, co se přidává
git status

# DŮLEŽITÉ: Ověř, že .env soubory NEJSOU v listu!
# Měly by být ignorované

# Vytvoř commit
git commit -m "Initial commit - Monlii E-shop

- Next.js 16 aplikace
- GoPay payment integration
- Email system s Nodemailer
- Fakturační systém
- Admin panel
- Prisma ORM
- Seed scripty (admin + company settings)
- Cloudflare Pages ready
- Production dokumentace
"
```

### 5. Push na GitHub

```bash
# Nastav main jako default branch
git branch -M main

# První push
git push -u origin main

# Při dalších pushech stačí:
git push
```

---

## 🔍 Ověření

### Zkontroluj GitHub:

1. Jdi na: https://github.com/monliiservice-droid/monliieshop
2. Ověř, že vidíš všechny soubory
3. **DŮLEŽITÉ:** Zkontroluj, že `.env` soubory NEJSOU viditelné!
4. Zkontroluj, že `README.md` se zobrazuje správně

---

## 🌿 Git Workflow Pro Budoucnost

### Feature Development:

```bash
# 1. Vytvoř novou branch
git checkout -b nova-funkce

# 2. Udělej změny
# ... práce ...

# 3. Commit změn
git add .
git commit -m "Popis změny"

# 4. Push branch
git push origin nova-funkce

# 5. Na GitHubu vytvoř Pull Request
# 6. Po review merge do main
# 7. Cloudflare automaticky nasadí
```

### Quick Updates:

```bash
# 1. Změny
# ... práce ...

# 2. Add & Commit
git add .
git commit -m "Update produktů"

# 3. Push
git push

# 4. Cloudflare automaticky nasadí
```

---

## 📁 Co JE v Gitu

✅ **Source code:**
- `/app` - Next.js pages a API routes
- `/components` - React komponenty
- `/lib` - Utility funkce
- `/prisma` - Database schema a migrations
- `/public` - Static assets (obrázky, loga)

✅ **Configuration:**
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `next.config.ts` - Next.js config
- `tailwind.config.ts` - Tailwind config
- `.gitignore` - Git ignores

✅ **Documentation:**
- `README.md` - Hlavní dokumentace
- `README_GOPAY.md` - GoPay integrace
- `README_CLOUDFLARE.md` - Cloudflare deployment
- `README_EMAIL_SYSTEM.md` - Email systém
- `README_INVOICING.md` - Fakturace
- `PRODUCTION_SETUP.md` - Production setup
- `FINAL_DEPLOYMENT_CHECKLIST.md` - Deployment checklist

---

## 🚫 Co NENÍ v Gitu

❌ **Citlivé informace:**
- `.env*` - Environment variables
- `*.db` - Database soubory
- API keys, credentials

❌ **Build artifacts:**
- `/.next` - Build output
- `/node_modules` - Dependencies
- `*.tsbuildinfo` - TypeScript build info

❌ **Temporary:**
- `.DS_Store` - macOS files
- `*.log` - Log soubory

---

## 🆘 Troubleshooting

### "Repository not found":

```bash
# Ověř SSH klíč
ssh -T git@github.com

# Mělo by vrátit:
# Hi monliiservice-droid! You've successfully authenticated...

# Pokud ne, přidej SSH klíč:
cat ~/.ssh/id_rsa.pub
# Zkopíruj a přidej na GitHub Settings → SSH Keys
```

### ".env je v gitu!":

```bash
# OKAMŽITĚ odstraň ze staging
git rm --cached .env
git rm --cached .env.local
git rm --cached .env.production

# Commit
git commit -m "Remove .env files from git"
git push

# Ověř .gitignore
cat .gitignore | grep "\.env"
```

### "Velké soubory":

```bash
# GitHub má limit 100MB per file
# Pokud máš větší soubory (např. velké obrázky):

# 1. Přesuň je jinam (CDN, external storage)
# 2. Nebo použij Git LFS:
git lfs install
git lfs track "*.psd"
git add .gitattributes
```

---

## 📊 Git Best Practices

### Commit Messages:

```bash
# ✅ Dobré:
git commit -m "Přidán nový produkt: Krajkový set"
git commit -m "Fix: Oprava GoPay webhook handleru"
git commit -m "Update: Aktualizace company settings"

# ❌ Špatné:
git commit -m "update"
git commit -m "fix"
git commit -m "asdf"
```

### Branch Naming:

```bash
# ✅ Dobré:
feature/novy-produkt
fix/gopay-webhook
update/company-settings

# ❌ Špatné:
test
temp
asdf
```

### Kdy commitovat:

```
✅ Po každé logické změně
✅ Před začátkem nové funkce
✅ Po dokončení funkce
✅ Před koncem pracovního dne

❌ Ne po každém souboru
❌ Ne uprostřed rozepsané funkce
❌ Ne s nefunkčním kódem
```

---

## 🎉 Po Prvním Pushi

1. **Ověř GitHub:** Repository je viditelné
2. **Connect Cloudflare:** Připoj Pages k repository
3. **První Deploy:** Cloudflare automaticky nasadí
4. **Setup ENV:** Nastav environment variables
5. **Test:** Ověř, že aplikace funguje

---

## 📞 Další Kroky

Po úspěšném pushi pokračuj podle:
- `README_CLOUDFLARE.md` - Cloudflare Pages setup
- `PRODUCTION_SETUP.md` - Production konfigurace
- `FINAL_DEPLOYMENT_CHECKLIST.md` - Deployment checklist

---

**Git je nastavený a připravený! Stačí už jen pushovat! 🚀**
