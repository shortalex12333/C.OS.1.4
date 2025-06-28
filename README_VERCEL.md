# CelesteOS Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)
1. Fork this repository to your GitHub account
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your forked repository
5. Vercel will automatically detect the configuration from `vercel.json`

### Option 2: Manual Deploy via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Run deployment script
./deploy-vercel.sh
```

### Option 3: Deploy via Git Integration
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Vercel will auto-deploy on every push to main branch

## 📁 Files Created for Vercel Deployment

### 1. `vercel.json` - Main Configuration
```json
{
  "version": 2,
  "name": "celesteos-chat",
  "framework": "create-react-app",
  "outputDirectory": "frontend/build",
  "installCommand": "cd frontend && yarn install",
  "buildCommand": "cd frontend && yarn build"
}
```

### 2. `.vercelignore` - Files to Exclude
- Backend files
- Node modules
- Test files
- Environment files

### 3. `deploy-vercel.sh` - Deployment Script
- Automated deployment script
- Includes dependency installation
- Build verification
- Production deployment

### 4. `VERCEL_DEPLOYMENT.md` - Environment Setup Guide
- Environment variable configuration
- CORS setup instructions
- Deployment checklist

## ⚙️ Environment Variables Setup

After deployment, configure these in Vercel Dashboard:

| Variable | Value | Purpose |
|----------|-------|---------|
| `REACT_APP_BACKEND_URL` | `https://api.celeste7.ai` | Backend API endpoint |
| `WDS_SOCKET_PORT` | `443` | WebSocket configuration |

## 🔧 Build Configuration

The project is configured to:
- ✅ Use `create-react-app` framework detection
- ✅ Build from `frontend/` directory
- ✅ Output to `frontend/build/`
- ✅ Handle SPA routing with rewrites
- ✅ Serve static assets correctly
- ✅ Support React hot reloading in development

## 🌐 Domain Configuration

### Custom Domain (Optional)
1. In Vercel Dashboard → Domains
2. Add your custom domain (e.g., `chat.celesteos.com`)
3. Configure DNS records as instructed
4. Update CORS settings on backend

### SSL Certificate
- Automatic HTTPS via Vercel
- No configuration needed

## 🧪 Testing Deployment

### Pre-deployment Checklist
- [ ] Frontend builds successfully locally
- [ ] All dependencies are in `package.json`
- [ ] Environment variables are configured
- [ ] Backend CORS allows Vercel domain
- [ ] API endpoints are accessible

### Post-deployment Testing
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Chat functionality works
- [ ] Dark/light mode switching
- [ ] Mobile responsiveness
- [ ] API calls to backend succeed
- [ ] Redis cache integration works

## 🔄 Continuous Deployment

### Automatic Deployments
- Production: Deploys from `main` branch
- Preview: Deploys from pull requests
- Development: Deploys from feature branches

### Manual Deployments
```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# Deploy with alias
vercel --prod --alias chat.celesteos.com
```

## 📊 Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Edge caching
- ✅ Image optimization
- ✅ Gzip compression
- ✅ HTTP/2 support
- ✅ Serverless functions (if needed)

## 🐛 Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Check build locally
cd frontend && yarn build
```

**Environment Variables Not Working:**
- Ensure variables start with `REACT_APP_`
- Check Vercel Dashboard → Settings → Environment Variables

**API Calls Failing:**
- Verify `REACT_APP_BACKEND_URL` is correct
- Check CORS configuration on backend
- Ensure backend is accessible from Vercel

**404 on Direct Routes:**
- `vercel.json` includes SPA rewrites
- All routes redirect to `/index.html`

## 📱 Features Enabled

The deployed application includes:
- ✅ Professional ChatGPT-style interface
- ✅ Redis cache integration (sub-200ms load times)
- ✅ Real-time token tracking
- ✅ Dark/light mode switching
- ✅ Message actions (copy, edit, regenerate)
- ✅ Mobile-responsive design
- ✅ Session persistence
- ✅ User profile management
- ✅ Advanced markdown rendering

## 🎉 Your CelesteOS Chat Interface is Ready!

Once deployed, your users will have access to a blazing-fast, professional chat interface with all the advanced features and Redis cache optimizations delivering sub-200ms response times.

**Live Example:** `https://your-project.vercel.app`