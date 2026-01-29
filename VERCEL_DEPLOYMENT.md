# Vercel Deployment Guide for Monlii E-shop

## Prerequisites

1. **Database**: You need a PostgreSQL database accessible from the internet
   - Recommended: [Neon](https://neon.tech) (free tier available)
   - Alternative: Supabase, Railway, or any PostgreSQL provider

2. **Environment Variables**: All required env vars from `.env.example`

---

## Deployment Steps

### 1. Prepare Your Database

Get your production PostgreSQL connection string in this format:
```
postgresql://username:password@host:5432/database?sslmode=require
```

### 2. Configure Vercel Environment Variables

In your Vercel project settings → Environment Variables, add:

```bash
# Database (CRITICAL - Production PostgreSQL)
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
DIRECT_URL="postgresql://username:password@host:5432/database?sslmode=require"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your_secure_password_here"
JWT_SECRET="66qNSP2i2m5ql0x3tc4EtthkVR9a7LoKQtkJRqxlcXkYSa+QNbpLoMJHrV9HJIdg8AAA6SdOdMlUy7+0J/5BEw=="

# Email (Mailtrap Production)
MAILTRAP_HOST="live.smtp.mailtrap.io"
MAILTRAP_PORT="587"
MAILTRAP_USER="api"
MAILTRAP_PASS="your_mailtrap_password"
EMAIL_FROM="noreply@monlii.cz"
SELLER_EMAIL="your_seller_email@example.com"

# Zásilkovna Z-BOX API
NEXT_PUBLIC_ZASILKOVNA_API_KEY="dee61660b640a98d"

# App URLs
NEXT_PUBLIC_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_ADMIN_URL="https://your-domain.vercel.app"

# Optional: Instagram
INSTAGRAM_APP_ID="your_instagram_app_id"
INSTAGRAM_APP_SECRET="your_instagram_app_secret"
```

### 3. Run Database Migrations

**IMPORTANT**: Migrations must run BEFORE the first deployment.

#### Option A: Local Migration (Recommended)
```bash
# Set your production DATABASE_URL temporarily
export DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# Run migrations
npx prisma migrate deploy

# Seed initial data (admin, products, etc.)
npm run db:seed
```

#### Option B: Vercel CLI Migration
```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# Seed data
npm run db:seed
```

### 4. Deploy to Vercel

#### Via GitHub Integration (Recommended)
1. Push your code to GitHub
2. Connect repository to Vercel
3. Vercel will automatically deploy on push
4. First deployment will:
   - Run `prisma generate` (from build script)
   - Build your Next.js app
   - Deploy to production

#### Via Vercel CLI
```bash
vercel --prod
```

---

## How Prisma Works on Vercel

### Current Build Configuration
```json
"scripts": {
  "build": "prisma generate && next build",
  "postinstall": "prisma generate"
}
```

### What Happens During Deployment:

1. **Install Phase**: `npm install` → runs `postinstall` → `prisma generate`
2. **Build Phase**: `npm run build` → runs `prisma generate && next build`
3. **Runtime**: Your app connects to the database using `DATABASE_URL`

**Note**: `prisma migrate deploy` is NOT in the build script because:
- Migrations should run ONCE before deployment, not on every build
- Running migrations during build can cause race conditions in serverless environments
- Vercel's build environment may not have stable database access

---

## Handling Future Migrations

When you make schema changes:

### Development
```bash
# Create and apply migration locally
npx prisma migrate dev --name your_migration_name
```

### Production Deployment
```bash
# 1. Apply migration to production database
export DATABASE_URL="your_production_url"
npx prisma migrate deploy

# 2. Commit schema.prisma and migration files
git add prisma/
git commit -m "feat: Add new migration"
git push

# 3. Vercel will auto-deploy with new schema
```

---

## Vercel-Specific Configuration

### Optional: Create `vercel.json`

If you need custom build settings:

```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs",
  "installCommand": "npm install && prisma generate"
}
```

**Current setup doesn't need this** - package.json scripts are sufficient.

---

## Database Recommendations for Vercel

### Best Options:

1. **Neon** (Recommended)
   - Serverless PostgreSQL
   - Free tier: 0.5 GB storage
   - Connection pooling built-in
   - Low latency from Vercel edge
   - URL: https://neon.tech

2. **Supabase**
   - Free tier: 500 MB storage
   - Includes connection pooler
   - URL: https://supabase.com

3. **Railway**
   - $5/month for 1GB
   - Good for production
   - URL: https://railway.app

### Connection Pooling

For serverless functions, use connection pooling:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
```

---

## Troubleshooting

### Build Fails with Database Error
- **Cause**: Database not accessible during build
- **Solution**: Ensure `DATABASE_URL` is set in Vercel environment variables
- **Note**: The current build script (`prisma generate`) doesn't need database access

### "Can't reach database server" at Runtime
- **Cause**: Wrong `DATABASE_URL` or firewall blocking Vercel IPs
- **Solution**: Ensure your database allows connections from `0.0.0.0/0` or add Vercel IPs to allowlist

### Prisma Client Out of Sync
- **Cause**: Schema changed but `prisma generate` didn't run
- **Solution**: Re-deploy or run `vercel --prod --force`

---

## Security Checklist

- [ ] All environment variables set in Vercel (not in code)
- [ ] Database has SSL enabled (`?sslmode=require`)
- [ ] Admin password is strong and unique
- [ ] JWT secret is random 64-char base64 string
- [ ] Mailtrap password is production API key
- [ ] Zásilkovna API key is valid

---

## Quick Deploy Checklist

- [ ] Production PostgreSQL database created
- [ ] Environment variables added to Vercel
- [ ] Migrations applied to production DB: `prisma migrate deploy`
- [ ] Initial data seeded: `npm run db:seed`
- [ ] Code pushed to GitHub
- [ ] Vercel connected to GitHub repo
- [ ] Automatic deployment triggered
- [ ] Test the deployed app
- [ ] Admin login works at `/admin/login`
- [ ] Products display correctly
- [ ] Checkout flow works with Z-BOX delivery

---

## Monitoring

After deployment, check:
- Vercel deployment logs
- Database connection pooling metrics
- API response times
- Error tracking (consider Sentry)

Your app should now be live on Vercel! 🚀
