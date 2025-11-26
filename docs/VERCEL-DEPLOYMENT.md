# Vercel Deployment Guide

## Database Setup for Vercel

Since Vercel uses serverless functions, file-based SQLite (better-sqlite3) won't work in production. You have two options:

### Option 1: Turso (Recommended - Remote SQLite)

1. **Create a Turso account** at [turso.tech](https://turso.tech)
2. **Create a database:**
   ```bash
   turso db create your-db-name
   ```
3. **Get database URL and token:**
   ```bash
   turso db show your-db-name
   turso db tokens create your-db-name
   ```
4. **Add to Vercel Environment Variables:**
   - `TURSO_DATABASE_URL` - Your Turso database URL
   - `TURSO_AUTH_TOKEN` - Your Turso auth token

The app will automatically use Turso in production when these env vars are set.

### Option 2: Postgres (Alternative)

If you prefer Postgres, you'll need to:

1. Update `db/index.ts` to use Postgres adapter
2. Update `drizzle.config.ts` to use Postgres dialect
3. Add `DATABASE_URL` environment variable in Vercel

## Build Process

The build process is configured in `vercel.json` and `package.json`:

- **Build Command:** `npm run vercel-build`
- This runs `db:push` (migrates schema) then `astro build`

## Environment Variables for Vercel

Add these in your Vercel project settings:

### Required:

- `PUBLIC_BASE_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
- `TURSO_DATABASE_URL` - Turso database URL (if using Turso)
- `TURSO_AUTH_TOKEN` - Turso auth token (if using Turso)

### Optional (OAuth):

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret

## Local Development

For local development, the app uses file-based SQLite (`.data/sqlite.db`). No additional setup needed.

## Migration Notes

After migrating from Astro DB to Drizzle ORM:

- ✅ Database migrations are handled automatically during build
- ✅ Schema is pushed to database before build
- ✅ Works with both local (SQLite) and production (Turso) databases
