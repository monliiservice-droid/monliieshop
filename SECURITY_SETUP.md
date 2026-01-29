# Security Setup Guide

## 🔒 Required Environment Variables

Before deploying or running the application, you **MUST** set up the following environment variables. Never commit these values to Git!

### 1. Admin Credentials
Create strong, unique credentials for admin access:
```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<YOUR_STRONG_PASSWORD_HERE>
JWT_SECRET=<YOUR_RANDOM_JWT_SECRET_64_CHARS>
```

**How to generate a secure JWT secret:**
```bash
openssl rand -base64 64
```

### 2. Database
```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DIRECT_URL="postgresql://user:password@host:5432/dbname"
```

### 3. Email (Mailtrap)
```bash
MAILTRAP_HOST=live.smtp.mailtrap.io
MAILTRAP_PORT=587
MAILTRAP_USER=api
MAILTRAP_PASS=<YOUR_MAILTRAP_PASSWORD>
EMAIL_FROM=noreply@monlii.cz
SELLER_EMAIL=<YOUR_SELLER_EMAIL>
```

### 4. Zásilkovna API
Get your API key from Zásilkovna dashboard:
```bash
NEXT_PUBLIC_ZASILKOVNA_API_KEY=<YOUR_ZASILKOVNA_API_KEY>
```

### 5. Application URLs
```bash
NEXT_PUBLIC_URL=https://your-domain.com
NEXT_PUBLIC_ADMIN_URL=https://your-domain.com
```

### 6. Instagram (Optional)
Only needed if you want Instagram feed integration:
```bash
INSTAGRAM_APP_ID=<YOUR_INSTAGRAM_APP_ID>
INSTAGRAM_APP_SECRET=<YOUR_INSTAGRAM_APP_SECRET>
```

---

## 🚨 Security Checklist Before GitHub Push

- [x] ✅ Admin credentials moved to environment variables
- [x] ✅ Zásilkovna API key moved to environment variables
- [x] ✅ All `.env*` files are in `.gitignore`
- [x] ✅ `.env.example` contains NO real secrets
- [x] ✅ Database connection strings use placeholders
- [x] ✅ Email passwords are not hardcoded

---

## 📝 Production Deployment Steps

### For Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all variables from the list above
4. Set appropriate values for Production, Preview, and Development

### For Other Platforms:
1. Create a `.env.production` file locally (NOT committed to Git)
2. Copy all variables from `.env.example`
3. Fill in real values
4. Upload to your hosting provider's environment variable settings

---

## 🔐 Current Security Status

### ✅ Secure (Fixed)
- Admin credentials now use `ADMIN_USERNAME` and `ADMIN_PASSWORD` from env
- Zásilkovna API key now uses `NEXT_PUBLIC_ZASILKOVNA_API_KEY` from env
- JWT secret now uses `JWT_SECRET` from env
- All `.env` files are gitignored
- `.env.example` contains only placeholders

### ⚠️ Important Notes
- The account number **7843801238/6363** is embedded in the QR payment code (`lib/qr-payment.ts`) - this is OK as it's public payment information
- Old GoPay fields in database schema are kept for backwards compatibility with old orders

---

## 🔑 Password Security Recommendations

### For Admin Password:
- **Minimum 16 characters**
- Mix of uppercase, lowercase, numbers, and symbols
- Use a password manager
- Never reuse passwords

### For JWT Secret:
- **Minimum 64 characters**
- Use `openssl rand -base64 64` to generate
- Keep it secret and never share it

---

## 📧 Email Setup

The application uses Mailtrap for email delivery. To set up:

1. Create a Mailtrap account at https://mailtrap.io
2. Go to "Sending Domains" and add your domain
3. Verify your domain with DNS records
4. Get your SMTP credentials
5. Add them to your environment variables

---

## 🔍 Verifying Security

Run this command to check for accidentally committed secrets:
```bash
git log --all --full-history --source -- .env .env.local .env.production
```

Should return empty if everything is secure.

---

## 🆘 If Secrets Were Accidentally Committed

If you've already committed secrets to Git:

1. **Immediately rotate all compromised credentials**
2. Change admin password
3. Regenerate API keys
4. Update all environment variables
5. Use `git filter-branch` or BFG Repo-Cleaner to remove from history
6. Force push to GitHub

**Never reuse compromised credentials!**
