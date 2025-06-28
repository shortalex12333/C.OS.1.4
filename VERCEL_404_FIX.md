# Vercel 404 Error Troubleshooting Guide

## Common Causes and Solutions for 404 Errors on Vercel

### ✅ Quick Fixes

#### 1. **Updated vercel.json Configuration**
The issue was likely in the Vercel configuration. I've updated it to:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/favicon.ico",
      "dest": "/favicon.ico"
    },
    {
      "src": "/manifest.json", 
      "dest": "/manifest.json"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### 2. **Redeploy Your Application**
```bash
# Method 1: Use the deployment script
./deploy-vercel.sh

# Method 2: Manual deployment  
cd frontend && npm run build
cd .. && vercel --prod
```

#### 3. **Verify Build Output**
Make sure the build creates the correct files:
```bash
cd frontend
npm run build
ls -la build/
# Should see: index.html, static/ folder, etc.
```

### 🔍 **Other Potential Issues**

#### **Environment Variables**
Make sure you have set these in Vercel Dashboard:
- `REACT_APP_BACKEND_URL=https://api.celeste7.ai`
- `WDS_SOCKET_PORT=443`

#### **Domain/CORS Issues**
Update your backend CORS to allow your Vercel domain:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",
        "https://api.celeste7.ai"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### **Custom Domain Issues**
If using a custom domain:
1. Verify DNS records are correct
2. Wait for propagation (up to 24 hours)
3. Check SSL certificate status

### 🛠 **Debugging Steps**

#### 1. **Check Vercel Build Logs**
- Go to your Vercel dashboard
- Click on your deployment
- Check the "Build Logs" tab for errors

#### 2. **Test Locally**
```bash
# Test the production build locally
cd frontend
npm run build
npx serve -s build
# Visit http://localhost:3000
```

#### 3. **Verify File Structure**
After build, your structure should be:
```
frontend/build/
├── index.html
├── static/
│   ├── css/
│   └── js/
├── favicon.ico
└── manifest.json
```

### 🚨 **Emergency Fallback**

If you continue to have issues, try this minimal `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

And add this to your `frontend/package.json`:
```json
{
  "homepage": ".",
  "scripts": {
    "build": "react-scripts build && echo 'Build complete'"
  }
}
```

### 📞 **Get Help**

If the issue persists:
1. Check the updated files in this repository
2. Run `./pre-deploy-check.sh` to validate your setup
3. Try deploying with the updated configuration
4. Check Vercel's build logs for specific error messages

The 404 error should be resolved with the updated configuration! 🎉