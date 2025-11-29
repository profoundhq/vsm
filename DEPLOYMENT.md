# Deployment Guide

## Deploy to GitHub Pages

This application is configured for automatic deployment to GitHub Pages.

### Prerequisites

1. GitHub repository with the code
2. GitHub Pages enabled in repository settings

### Setup Steps

#### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"

#### 2. Push to Main Branch

The GitHub Actions workflow will automatically:
- Install dependencies
- Build the static site
- Deploy to GitHub Pages

```bash
git push origin main
```

#### 3. Access Your Site

After deployment completes (usually 2-3 minutes), your site will be available at:

```
https://<username>.github.io/<repository-name>/
```

For example:
- `https://profoundhq.github.io/vsm/`

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the static site
npm run build

# The static files will be in the 'build' directory
# You can deploy this directory to any static hosting service
```

### Configuration Files

- **svelte.config.js** - Configured with `@sveltejs/adapter-static`
- **.github/workflows/deploy.yml** - GitHub Actions workflow
- **src/routes/+layout.ts** - Prerendering configuration
- **static/.nojekyll** - Ensures GitHub Pages serves all files correctly

### Troubleshooting

#### Build Fails

Check the GitHub Actions logs:
1. Go to **Actions** tab in your repository
2. Click on the failed workflow run
3. Review the build logs for errors

#### 404 Errors

- Ensure **GitHub Pages** is enabled with **GitHub Actions** as source
- Check that the workflow completed successfully
- Verify the repository is public (or you have GitHub Pro for private repos)

#### Blank Page

- Check browser console for errors
- Verify all routes have `export const prerender = true` in `+layout.ts`
- Clear browser cache and hard refresh

### Deploy to Other Platforms

The static build can be deployed to:

- **Vercel**: Connect repository and deploy
- **Netlify**: Drag and drop the `build` folder
- **Cloudflare Pages**: Connect repository
- **AWS S3 + CloudFront**: Upload `build` folder
- **Any static host**: Upload contents of `build` folder

### Environment Variables

This app doesn't require environment variables for basic functionality. If you add API integrations, you can configure them in:
- GitHub Secrets (for GitHub Actions)
- Your hosting platform's environment variable settings

### Updating the Deployment

Every push to the `main` branch will trigger a new deployment automatically.

To deploy manually, go to:
1. **Actions** tab
2. **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
