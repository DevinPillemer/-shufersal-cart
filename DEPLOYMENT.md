# Deployment Guide - Shufersal Cart Automation

This guide walks through deploying the Shufersal cart automation to Vercel with Apify integration.

## Prerequisites

- GitHub account with access to `DevinPillemer` organization
- Vercel account
- Apify account
- Node.js 18+ installed locally

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web UI
1. Go to https://github.com/new
2. Create a new repository:
   - **Owner:** DevinPillemer
   - **Repository name:** shufersal-cart
   - **Description:** Automated shopping cart management for Shufersal
   - **Visibility:** Public
   - **Initialize with:** None (we already have code)

3. After creation, run locally:
```bash
cd /root/.openclaw/workspace/shufersal-cart
git remote add origin https://github.com/DevinPillemer/shufersal-cart.git
git branch -M main
git push -u origin main
```

### Option B: Using GitHub CLI
```bash
gh auth login  # If not already authenticated
gh repo create shufersal-cart --source=. --remote=origin --push
```

## Step 2: Set Up Apify Actor

### 2.1 Create Apify Account
1. Go to https://apify.com
2. Sign up or log in
3. Go to Actors section

### 2.2 Upload Actor Code
1. Create a new actor (name: `shufersal-cart`)
2. Copy code from `/apify-actor/main.js`
3. Update `package.json` dependencies
4. Save and build

### 2.3 Get Actor ID
1. In Apify console, find your actor ID
2. Your actor will be accessible at: `https://api.apify.com/v2/acts/{YOUR_USERNAME}~{ACTOR_NAME}/runs`

**Actor ID Format:** `devinpillemer~shufersal-cart`

## Step 3: Deploy to Vercel

### 3.1 Using Vercel Web UI
1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitHub:
   - Select `DevinPillemer/shufersal-cart`
   - Framework: Next.js (auto-detected)
   - Build settings: auto-detected
4. Add Environment Variables:
   ```
   APIFY_API_KEY: YOUR_APIFY_KEY
   SHUFERSAL_EMAIL: devin.pillemer@gmail.com
   SHUFERSAL_PASSWORD: Shufersal88
   ```
5. Click Deploy

### 3.2 Using Vercel CLI
```bash
cd /root/.openclaw/workspace/shufersal-cart

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (creates domain shufersal-cart.vercel.app)
vercel --prod

# Add environment variables
vercel env add APIFY_API_KEY
# paste: YOUR_APIFY_KEY

vercel env add SHUFERSAL_EMAIL
# paste: devin.pillemer@gmail.com

vercel env add SHUFERSAL_PASSWORD
# paste: Shufersal88

# Redeploy with env vars
vercel --prod
```

### 3.3 Configure Domain
In Vercel dashboard:
1. Go to Project Settings → Domains
2. Add custom domain (if desired)
3. Default domain: `shufersal-cart.vercel.app`

## Step 4: Verify Deployment

### 4.1 Check Vercel Status
- Visit: https://shufersal-cart.vercel.app
- Should see the UI with search form

### 4.2 Test API Endpoint
```bash
curl -X POST https://shufersal-cart.vercel.app/api/shufersal \
  -H "Content-Type: application/json" \
  -d '{"action":"search","query":"milk"}'
```

### 4.3 Using Python Client
```bash
python3 test_client.py --search "חלב"
python3 test_client.py --add-to-cart "חלב תנובה"
python3 test_client.py --get-cart
```

## Step 5: Configure Apify Actor in Next.js

The actor ID in the Next.js code needs to match your Apify actor:

**File:** `app/api/shufersal/route.ts`

Current configuration:
```typescript
const apiUrl = `https://api.apify.com/v2/acts/devinpillemer~shufersal-cart/runs`;
```

If using a different actor, update:
- `devinpillemer` → your Apify username
- `shufersal-cart` → your actor name

Redeploy after changes:
```bash
vercel --prod
```

## Troubleshooting

### API Returns 500 Error
- Check Vercel environment variables
- Verify APIFY_API_KEY is set correctly
- Check Apify account limits

### Actor Not Starting
- Verify actor is published in Apify
- Check Apify credentials in env vars
- Review Apify actor logs

### Build Fails on Vercel
- Delete `.next` folder locally
- Run `npm install` and `npm run build`
- Push updated `package-lock.json`

### Slow API Responses
- Apify actors take 2-5 minutes for complex tasks
- Check Apify pricing/limits
- Consider caching results

## Monitoring

### Vercel Analytics
- https://vercel.com/dashboard/project/shufersal-cart
- Check deployment logs, function logs, analytics

### Apify Logs
- https://apify.com/my-actors/shufersal-cart
- View recent runs and logs

## Security Notes

⚠️ **IMPORTANT:** Never commit credentials to GitHub
- API keys are stored in Vercel env vars (not in code)
- Credentials are never exposed in git history
- Use `.env.local` for local development only

## Maintenance

### Regular Updates
```bash
# Check for dependency updates
npm outdated

# Update dependencies
npm update

# Update to latest Next.js
npm install next@latest

# Test locally
npm run dev
npm run build
```

### Monitoring Costs
- **Vercel:** First 100GB bandwidth/month free
- **Apify:** Check actor costs in Apify dashboard
- **Monitor:** Set up cost alerts in both platforms

## Rollback

If deployment fails:
```bash
# Revert to previous version
vercel rollback shufersal-cart

# Or redeploy specific commit
vercel deploy --prod <commit-hash>
```

## Local Testing Before Deploy

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build locally
npm run build

# Test with Python client (pointing to localhost)
python3 test_client.py --search "milk" --local
```

## Success Checklist

- [ ] GitHub repo created: `DevinPillemer/shufersal-cart`
- [ ] Apify actor deployed with actor ID
- [ ] Vercel project deployed
- [ ] Environment variables set in Vercel
- [ ] API endpoint responding at `shufersal-cart.vercel.app/api/shufersal`
- [ ] Web UI loads at `shufersal-cart.vercel.app`
- [ ] Python client tests pass
- [ ] Apify actor status is "Ready"
- [ ] Monitoring and logging configured

## Next Steps

After deployment:
1. Monitor first runs in Apify dashboard
2. Test all three actions (search, add-to-cart, get-cart)
3. Set up monitoring alerts
4. Document any customizations needed
5. Share deployment URL with team
