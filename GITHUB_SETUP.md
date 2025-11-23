# GitHub Actions Error Fix

## Problem
The GitHub Action is failing with: `Error: Input required and not supplied: vercel-token`

## Solution (Recommended): Use Vercel's GitHub Integration

Instead of using GitHub Actions for deployment, use Vercel's built-in GitHub integration. It's simpler and more reliable.

### Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Select your `tools-convert` repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

### What This Does

- ✅ Automatic deployments on every push to `main`
- ✅ Preview deployments for pull requests
- ✅ No secrets needed in GitHub
- ✅ Built-in monitoring and analytics
- ✅ Automatic HTTPS and CDN

### GitHub Action Status

The GitHub Action has been updated to **only run tests**, not deploy. It will:
- ✅ Run on every push and PR
- ✅ Check TypeScript types
- ✅ Run all tests
- ✅ Build the project
- ❌ No longer attempts to deploy (Vercel handles this)

## Alternative: Keep GitHub Actions for Deployment

If you prefer to use GitHub Actions for deployment, you need to add secrets:

### Get Vercel Credentials

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login and link project:
   ```bash
   vercel login
   cd /path/to/your/project
   vercel link
   ```

3. Get your credentials from `.vercel/project.json`:
   ```json
   {
     "projectId": "prj_xxxxx",
     "orgId": "team_xxxxx"
   }
   ```

4. Get your Vercel token:
   - Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Click "Create Token"
   - Copy the token

### Add Secrets to GitHub

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add these three secrets:

   | Name | Value |
   |------|-------|
   | `VERCEL_TOKEN` | Your token from vercel.com/account/tokens |
   | `VERCEL_ORG_ID` | The `orgId` from `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | The `projectId` from `.vercel/project.json` |

5. Re-enable deployment in `.github/workflows/deploy.yml`

## Recommendation

**Use Vercel's GitHub integration** - it's simpler, more reliable, and requires no secret management.

The current workflow will continue to run tests on every push, which is valuable for code quality!

---

**Current Status**:
- ✅ Tests run on every push via GitHub Actions
- ✅ Ready to deploy via Vercel's GitHub integration
- ✅ No errors with current setup
