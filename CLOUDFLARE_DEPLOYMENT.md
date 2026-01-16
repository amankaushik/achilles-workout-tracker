# Cloudflare Pages Deployment Guide

This guide walks you through deploying the Achilles Workout Tracker to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account (free tier works fine)
2. Your Supabase project set up and running
3. Git repository pushed to GitHub

## Step 1: Prepare Your Repository

The repository is already configured for Cloudflare Pages with:
- `public/_redirects` - Handles SPA routing (redirects all routes to index.html)
- `.env.example` - Documents required environment variables

## Step 2: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages**
3. Click **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select the `achilles-workout-tracker` repository

## Step 3: Configure Build Settings

Set the following build configuration:

- **Production branch**: `master`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty or use root)

### Framework preset
- Select **None** or **Vite** (Cloudflare should auto-detect Vite)

## Step 4: Configure Environment Variables

In the Cloudflare Pages project settings, add the following environment variables:

**Variable Name** | **Value** | **Where to Find**
---|---|---
`VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Project Settings → API → Project URL
`VITE_SUPABASE_ANON_KEY` | `your-anon-key` | Supabase Project Settings → API → Project API keys → `anon` `public`

### To add environment variables:

1. In your Cloudflare Pages project, go to **Settings** → **Environment variables**
2. Click **Add variable**
3. For **Production** environment, add both variables
4. Click **Save**

**Important:** These are the same values from your `.env.local` file.

## Step 5: Deploy

1. Click **Save and Deploy**
2. Cloudflare will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Run the build command (`npm run build`)
   - Deploy the `dist` folder
3. Your site will be live at `https://your-project.pages.dev`

## Step 6: Configure Supabase for Production

Update your Supabase project to allow requests from your Cloudflare Pages domain:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your Cloudflare Pages URL to **Site URL**: `https://your-project.pages.dev`
3. Add to **Redirect URLs**: `https://your-project.pages.dev/**`

## Step 7: Custom Domain (Optional)

To use a custom domain:

1. In Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `workout.yourdomain.com`)
4. Cloudflare will automatically configure DNS if your domain is on Cloudflare
5. Update Supabase URL configuration with your custom domain

## Automatic Deployments

Cloudflare Pages automatically deploys when you push to the `master` branch:

- **Production**: Deploys from `master` branch
- **Preview**: Creates preview deployments for pull requests

## Troubleshooting

### Build Fails

**Issue:** Build fails with "npm not found" or similar error

**Solution:** Cloudflare Pages uses Node.js 16 by default. To use a different version, add an environment variable:
- Variable: `NODE_VERSION`
- Value: `18` or `20`

### Environment Variables Not Working

**Issue:** App shows "No authenticated user" or Supabase errors

**Solution:**
1. Check that environment variables are set in Cloudflare Pages settings
2. Make sure variable names start with `VITE_` (required for Vite)
3. Redeploy after adding/changing environment variables

### Authentication Redirect Issues

**Issue:** Auth redirects fail or users can't log in

**Solution:**
1. Verify Cloudflare Pages URL is added to Supabase redirect URLs
2. Check that `public/_redirects` file exists and contains `/* /index.html 200`
3. Ensure SPA routing is working (all routes should load index.html)

### Pages Not Loading After Deploy

**Issue:** Routes show 404 errors

**Solution:**
- The `public/_redirects` file should handle this automatically
- If issues persist, check Cloudflare Pages **Functions** → **Routes** settings

## Local Development vs Production

**Local (.env.local):**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Production (Cloudflare Pages Environment Variables):**
- Same values, set in Cloudflare Pages dashboard
- No `.env.local` file is deployed (it's in `.gitignore`)

## Performance Optimization

Cloudflare Pages automatically provides:
- Global CDN distribution
- HTTP/3 support
- Automatic HTTPS
- DDoS protection
- Edge caching for static assets

No additional configuration needed!

## Monitoring

View deployment status and logs:
1. Go to your Cloudflare Pages project
2. Click **View build** on any deployment
3. See build logs, deployment status, and any errors

## Cost

Cloudflare Pages Free Tier includes:
- Unlimited sites
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 1 concurrent build

This is more than sufficient for the Achilles Workout Tracker.

## Next Steps

After deployment:
1. Test authentication (sign up, log in)
2. Create a test workout to verify database connectivity
3. Check that data persists across sessions
4. Verify History and Stats pages load correctly
5. Test on mobile devices

## Support

For issues:
- **Cloudflare Pages**: [Cloudflare Community](https://community.cloudflare.com/)
- **Supabase**: [Supabase Discord](https://discord.supabase.com/)
- **This App**: Check `SETUP_SUPABASE.md` and `AUTH_SETUP.md`
