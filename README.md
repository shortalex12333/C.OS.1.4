# 🚀 **CelesteOS ChatGPT Clone - Production Deployment Guide**

## 📋 **Overview**

This is a professional ChatGPT clone interface with Microsoft OAuth integration, built with React, TypeScript, and Vite. The application features a clean, unified design system and supports both light and dark themes.

## ✅ **Features**

- **Clean ChatGPT-style Interface**: Professional design matching industry standards
- **Microsoft OAuth Integration**: Email connection with IMAP access
- **Theme Support**: Light/dark mode with system preference detection
- **Responsive Design**: Works on desktop and mobile devices
- **Unified Design System**: Consistent styling throughout the application
- **Serverless Architecture**: Ready for modern cloud deployment

## 🏗️ **Architecture**

```
Frontend (React/Vite) → Serverless Functions → Microsoft Graph API
                     → Backend APIs → n8n Webhooks (Optional)
```

## 📁 **Project Structure**

```
├── src/
│   ├── components/           # React components
│   │   ├── settings/        # Settings modal components
│   │   └── ui/             # Reusable UI components
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   └── styles/            # Global styles
├── api/                   # Serverless functions (Vercel)
├── netlify/functions/     # Netlify functions
├── public/               # Static assets
├── build/               # Build output (local)
├── dist/                # Production build
└── docs/                # Documentation
```

## 🔧 **Prerequisites**

- Node.js 18+ and npm 8+
- Microsoft Azure App Registration
- Git repository (GitHub recommended)
- Hosting platform account (Vercel or Netlify)

## 🚀 **Quick Start**

### **1. Repository Setup**

```bash
# Clone or create new repository
git clone [YOUR_REPO_URL]
cd celesteos-chatgpt-clone

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### **2. Environment Configuration**

Update `.env.local` with your values:

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_MICROSOFT_CLIENT_ID=41f6dc82-8127-4330-97e0-c6b26e6aa967
VITE_OAUTH_CALLBACK_URL=https://your-app-domain.com/api/auth/callback
```

### **3. Local Development**

```bash
# Start development server
npm run dev

# Open http://localhost:8082
```

## 🌐 **Deployment Options**

### **Option A: Vercel (Recommended)**

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Configure Environment Variables** in Vercel Dashboard:
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_TENANT_ID`  
   - `MICROSOFT_CLIENT_SECRET`

3. **Set OAuth Redirect URL** in Azure:
   ```
   https://your-app.vercel.app/api/auth/callback
   ```

### **Option B: Netlify**

1. **Connect Repository** in Netlify Dashboard

2. **Build Settings**:
   - Build command: `npm run build:prod`
   - Publish directory: `dist`

3. **Environment Variables**:
   - Add same variables as Vercel

4. **Set OAuth Redirect URL**:
   ```
   https://your-app.netlify.app/.netlify/functions/oauth-callback
   ```

## 🔐 **Microsoft OAuth Setup**

### **1. Azure App Registration**

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "App registrations" → "New registration"
3. Set redirect URI based on your deployment:
   - Vercel: `https://your-app.vercel.app/api/auth/callback`
   - Netlify: `https://your-app.netlify.app/.netlify/functions/oauth-callback`

### **2. API Permissions**

Required permissions (User-delegated):
- `openid`
- `profile` 
- `email`
- `offline_access`
- `User.Read`
- `IMAP.AccessAsUser.All`

### **3. Client Secret**

1. Go to "Certificates & secrets"
2. Create new client secret
3. Add to environment variables

## 📝 **Configuration Files**

### **package.json Updates**

Replace your current `package.json` with `package.production.json`:

```bash
cp package.production.json package.json
```

### **Vite Configuration**

Replace your current vite config:

```bash
cp vite.config.production.ts vite.config.ts
```

## 🔧 **Environment Variables Reference**

### **Frontend Variables (VITE_)**

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_ENVIRONMENT` | Environment mode | `production` |
| `VITE_API_BASE_URL` | Backend API URL | `https://api.yourapp.com` |
| `VITE_MICROSOFT_CLIENT_ID` | Azure app client ID | `41f6dc82-...` |
| `VITE_OAUTH_CALLBACK_URL` | OAuth callback URL | `https://yourapp.com/api/auth/callback` |
| `VITE_OAUTH_SCOPES` | OAuth permissions | `openid profile email...` |

### **Backend Variables (Serverless Functions)**

| Variable | Description | Required |
|----------|-------------|----------|
| `MICROSOFT_CLIENT_ID` | Azure app client ID | ✅ |
| `MICROSOFT_TENANT_ID` | Azure tenant ID | ✅ |
| `MICROSOFT_CLIENT_SECRET` | Azure client secret | ✅ |

## 🚦 **Testing**

### **Local Testing**

```bash
# Run development server
npm run dev

# Test production build locally
npm run preview:prod
```

### **Production Testing**

1. **OAuth Flow**: Test email connection
2. **Theme Switching**: Test light/dark mode
3. **Mobile Responsiveness**: Test on different devices
4. **Settings Modal**: Test all functionality

## 🔍 **Troubleshooting**

### **Common Issues**

#### **OAuth Callback Error**

```
Error: redirect_uri_mismatch
```

**Solution**: Update redirect URI in Azure to match your deployment URL

#### **Build Errors**

```
Error: Cannot resolve module
```

**Solution**: 
```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

#### **Environment Variables Not Working**

**Solution**: Ensure variables start with `VITE_` for frontend use

#### **Serverless Function Timeout**

**Solution**: Check function configuration in `vercel.json` or `netlify.toml`

### **Debug Mode**

Enable debug mode by setting:
```env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 📊 **Performance**

### **Bundle Size Optimization**

The configuration includes:
- Code splitting for vendor libraries
- Tree shaking for unused code
- Asset optimization
- Gzip compression

### **Expected Bundle Sizes**

- Main bundle: ~150KB (gzipped)
- Vendor bundle: ~200KB (gzipped)
- Total initial load: ~350KB (gzipped)

## 🔒 **Security**

### **Headers Configuration**

Both Vercel and Netlify configs include:
- CORS headers
- Security headers (CSP, XSS protection)
- Cache control for assets

### **OAuth Security**

- Secure client secret storage
- State parameter validation
- HTTPS-only redirect URIs

## 📈 **Monitoring**

### **Recommended Tools**

1. **Vercel Analytics** - Built-in performance monitoring
2. **Sentry** - Error tracking (add VITE_SENTRY_DSN)
3. **Google Analytics** - User analytics (add VITE_GOOGLE_ANALYTICS_ID)

### **Health Checks**

Monitor these endpoints:
- `/` - Main application
- `/api/auth/callback` - OAuth functionality

## 🚀 **Going Live**

### **Pre-launch Checklist**

- [ ] Environment variables configured
- [ ] OAuth redirect URLs updated
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] Build succeeds without errors
- [ ] OAuth flow works end-to-end
- [ ] Mobile responsiveness tested
- [ ] Performance optimized

### **Launch Steps**

1. **Deploy to staging** first
2. **Test all functionality**
3. **Update DNS** (if using custom domain)
4. **Deploy to production**
5. **Monitor for issues**

## 📞 **Support**

### **Documentation**

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph)

### **Deployment Platforms**

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

---

## 🎉 **Ready to Deploy!**

Your CelesteOS ChatGPT Clone is now ready for production deployment. The application includes:

✅ **Professional Design System**
✅ **Microsoft OAuth Integration** 
✅ **Serverless Architecture**
✅ **Performance Optimizations**
✅ **Security Best Practices**
✅ **Comprehensive Documentation**

Choose your deployment platform and follow the instructions above to go live!