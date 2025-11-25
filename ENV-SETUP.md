# Environment Variables Setup

This document describes the environment variables needed for the Entertainment Web App.

## Required Environment Variables

### BASE_URL / PUBLIC_BASE_URL

The base URL of your application. This is used for authentication callbacks and API endpoints.

**Development:**

```env
BASE_URL=http://localhost:4321
PUBLIC_BASE_URL=http://localhost:4321
```

**Production (Vercel):**

```env
BASE_URL=https://yourdomain.vercel.app
PUBLIC_BASE_URL=https://yourdomain.vercel.app
```

> **Note:** On Vercel, you can set these in your project's Environment Variables settings.

## Optional: OAuth Provider Credentials

If you want to enable social login (Google, GitHub, etc.), add these variables:

### Google OAuth

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

To get Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:4321/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

### GitHub OAuth

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

To get GitHub OAuth credentials:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Add callback URL:
   - Development: `http://localhost:4321/api/auth/callback/github`
   - Production: `https://yourdomain.com/api/auth/callback/github`

## Vercel Deployment Setup

1. **Add Environment Variables in Vercel Dashboard:**

   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `BASE_URL` with your production URL
   - Add `PUBLIC_BASE_URL` with your production URL
   - Add any OAuth credentials if using social login

2. **Astro DB Setup:**

   - Run `npm run db:push` to sync schema with Astro Studio
   - Link your Vercel project to Astro Studio
   - Database will be automatically configured

3. **Trusted Origins:**
   The auth configuration automatically includes your BASE_URL in trusted origins for CORS.

## Local Development

For local development, create a `.env` file in the root directory:

```env
BASE_URL=http://localhost:4321
PUBLIC_BASE_URL=http://localhost:4321

# Add OAuth credentials if testing social login
# GOOGLE_CLIENT_ID=...
# GITHUB_CLIENT_ID=...
```

> **Note:** The `.env` file is git-ignored for security.

## Testing Authentication

After setting up environment variables:

1. **Development:**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:4321/login`

2. **Production:**
   Deploy to Vercel and visit `https://yourdomain.com/login`

## Troubleshooting

### CORS Errors

- Ensure BASE_URL matches your deployment URL exactly
- Check that the URL includes protocol (https://)
- No trailing slash in BASE_URL

### OAuth Callback Errors

- Verify callback URLs in OAuth provider settings
- Ensure BASE_URL is set correctly
- Check that OAuth credentials are added to environment variables

### Database Connection Issues

- Run `npm run db:push` to sync schema
- Check Astro Studio connection
- Verify Vercel integration with Astro DB
