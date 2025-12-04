# Instagram Basic Display API - Návod k nastavení

## 1. Vytvoření Facebook App

1. Jdi na https://developers.facebook.com/apps/
2. Klikni na **"Create App"** (Vytvořit aplikaci)
3. Vyber **"Consumer"** jako typ aplikace
4. Vyplň název aplikace (např. "Monlii EShop")
5. Klikni na **"Create App"**

## 2. Přidání Instagram Basic Display

1. V levém menu najdi **"Add Product"** (Přidat produkt)
2. Najdi **"Instagram Basic Display"** a klikni **"Set Up"**
3. Proklikej se přes průvodce

## 3. Vytvoření Instagram App

1. V levém menu klikni na **"Instagram Basic Display" → "Basic Display"**
2. Scroll dolů na **"Instagram App"**
3. Klikni **"Create New App"**
4. Vyplň:
   - **Valid OAuth Redirect URIs:** `https://monliieshop.vercel.app/`
   - **Deauthorize Callback URL:** `https://monliieshop.vercel.app/`
   - **Data Deletion Request URL:** `https://monliieshop.vercel.app/`
5. Klikni **"Save Changes"**

## 4. Přidání Instagram Test User

1. Scroll dolů na **"User Token Generator"**
2. Klikni **"Add or Remove Instagram Testers"**
3. Otevře se Instagram, přihlaš se
4. Najdi **"Tester Invites"** v nastavení
5. Přijmi pozvánku pro `@monlii_i`

## 5. Získání Access Token

1. Vrať se do Facebook Developers
2. V sekci **"User Token Generator"**
3. Klikni **"Generate Token"** u `@monlii_i`
4. Autorizuj aplikaci
5. **Zkopíruj Long-Lived Access Token**

## 6. Přidání do Vercel

1. Jdi na https://vercel.com/dashboard
2. Vyber projekt **monliieshop**
3. Jdi na **"Settings" → "Environment Variables"**
4. Přidej novou proměnnou:
   - **Key:** `INSTAGRAM_ACCESS_TOKEN`
   - **Value:** *tvůj long-lived token*
   - **Environments:** Production, Preview, Development
5. Klikni **"Save"**

## 7. Redeploy

1. Jdi na **"Deployments"** tab
2. Klikni na tři tečky u nejnovějšího deploymentu
3. Klikni **"Redeploy"**

## 8. Test

Po deploymenu jdi na homepage:
- https://monliieshop.vercel.app/
- Scroll dolů na sekci "Náš Instagram"
- Měly by se zobrazit skutečné Instagram posty místo placeholderů

## ⚠️ DŮLEŽITÉ

- **Access Token vyprší za 60 dní** - musíš ho obnovit
- Pro produkci doporuču nastavit automatické obnovování
- Token nikdy necommituj do gitu

## 📝 Poznámky

- Instagram Basic Display API má limit 200 requestů/hodinu
- Feed je cachovaný 1 hodinu
- Zobrazuje se max 8 nejnovějších postů
- Filtruje pouze obrázky (ne videa)
