# Environment Variables for Vercel Deployment

## Required Environment Variables

When deploying to Vercel, you need to set the following environment variables in your Vercel dashboard:

### 1. Backend URL
```
REACT_APP_BACKEND_URL=https://api.celeste7.ai
```

**Important:** 
- Remove the `/webhook` suffix as it will be added in the API calls
- This should point to your production API endpoint
- Make sure CORS is configured on your backend to allow your Vercel domain

### 2. WebSocket Configuration (if needed)
```
WDS_SOCKET_PORT=443
```

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `REACT_APP_BACKEND_URL` | `https://api.celeste7.ai` | Production, Preview, Development |
| `WDS_SOCKET_PORT` | `443` | Production, Preview, Development |

## Local Development

For local development, update your `/frontend/.env` file:

```bash
# Frontend Environment Variables
WDS_SOCKET_PORT=443
REACT_APP_BACKEND_URL=https://api.celeste7.ai
```

## Backend CORS Configuration

Make sure your backend (https://api.celeste7.ai) has CORS configured to allow:

```python
# In your FastAPI backend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",  # Your Vercel domain
        "https://celesteos.com",               # Your custom domain (if any)
        "http://localhost:3000"                # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Deployment Checklist

- [ ] Set `REACT_APP_BACKEND_URL` environment variable in Vercel
- [ ] Set `WDS_SOCKET_PORT` environment variable in Vercel  
- [ ] Configure CORS on backend to allow Vercel domain
- [ ] Test API endpoints from deployed frontend
- [ ] Verify chat functionality works with production backend
- [ ] Test authentication flow
- [ ] Verify Redis cache integration works
- [ ] Test dark/light mode switching
- [ ] Test mobile responsiveness