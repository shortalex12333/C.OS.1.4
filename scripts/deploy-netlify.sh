#!/bin/bash

# =================================
# Deploy to Netlify Script
# =================================

set -e

echo "🚀 Deploying CelesteOS ChatGPT Clone to Netlify..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    print_status "Installing Netlify CLI..."
    npm install -g netlify-cli
    print_success "Netlify CLI installed!"
fi

# Check if this is a Git repository
if [ ! -d ".git" ]; then
    print_error "This must be a Git repository to deploy to Netlify!"
    echo "Initialize Git with:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    exit 1
fi

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    print_warning "You have uncommitted changes!"
    echo "Commit your changes first:"
    echo "  git add ."
    echo "  git commit -m 'Deploy: Production configuration'"
    exit 1
fi

# Verify environment setup
print_status "Checking environment configuration..."

if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    echo "Create it with your production environment variables."
    exit 1
fi

if [ ! -f "netlify.toml" ]; then
    print_error "netlify.toml configuration not found!"
    exit 1
fi

if [ ! -d "netlify/functions" ]; then
    print_error "Netlify functions directory not found!"
    exit 1
fi

# Test build before deployment
print_status "Testing production build..."
if ! npm run build:prod > /dev/null 2>&1; then
    print_error "Production build failed! Fix build errors before deploying."
    exit 1
fi
print_success "Build test passed!"

# Login to Netlify (if needed)
print_status "Checking Netlify authentication..."
if ! netlify status > /dev/null 2>&1; then
    print_status "Please login to Netlify..."
    netlify login
fi
print_success "Netlify authentication verified!"

# Deploy to Netlify
print_status "Deploying to Netlify..."

# Check if site exists
if [ ! -f ".netlify/state.json" ]; then
    print_status "First-time deployment - creating new site..."
    
    # Create new site
    netlify deploy --dir=dist --prod
    
    # Initialize site
    netlify init
else
    print_status "Deploying to existing Netlify site..."
    netlify deploy --dir=dist --prod
fi

print_success "🎉 Deployment complete!"

# Get site information
if [ -f ".netlify/state.json" ]; then
    SITE_ID=$(cat .netlify/state.json | grep -o '"siteId":"[^"]*' | cut -d'"' -f4)
    
    if [ ! -z "$SITE_ID" ]; then
        SITE_INFO=$(netlify sites:list --json | grep -A5 -B5 "$SITE_ID" || echo "")
        
        echo ""
        print_success "Your app is live!"
        echo "🌐 Production URL: Check Netlify dashboard for URL"
        echo "📊 Site ID: $SITE_ID"
        echo ""
    fi
fi

echo "📋 Post-deployment checklist:"
echo "1. ✅ Update Microsoft OAuth redirect URI in Azure Portal"
echo "2. ✅ Test OAuth flow on production"
echo "3. ✅ Configure environment variables in Netlify dashboard"
echo "4. ✅ Set up custom domain (optional)"
echo "5. ✅ Enable form handling and analytics"
echo ""

print_warning "Important: Update your OAuth redirect URI in Azure Portal to:"
echo "https://your-app.netlify.app/.netlify/functions/oauth-callback"
echo ""

echo "🔧 Netlify Configuration Tips:"
echo "1. Go to Site settings → Environment variables"
echo "2. Add your Microsoft OAuth credentials"
echo "3. Enable automatic deployments from Git"
echo "4. Set up branch deploy previews"
echo ""

print_success "Deployment successful! 🚀"