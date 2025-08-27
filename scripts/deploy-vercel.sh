#!/bin/bash

# =================================
# Deploy to Vercel Script
# =================================

set -e

echo "🚀 Deploying CelesteOS ChatGPT Clone to Vercel..."

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

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_status "Installing Vercel CLI..."
    npm install -g vercel
    print_success "Vercel CLI installed!"
fi

# Check if this is a Git repository
if [ ! -d ".git" ]; then
    print_error "This must be a Git repository to deploy to Vercel!"
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

if [ ! -f "vercel.json" ]; then
    print_error "vercel.json configuration not found!"
    exit 1
fi

# Test build before deployment
print_status "Testing production build..."
if ! npm run build:prod > /dev/null 2>&1; then
    print_error "Production build failed! Fix build errors before deploying."
    exit 1
fi
print_success "Build test passed!"

# Deploy to Vercel
print_status "Deploying to Vercel..."

# Check if project is linked to Vercel
if [ ! -f ".vercel/project.json" ]; then
    print_status "First-time deployment - linking project..."
    vercel --confirm
else
    print_status "Deploying to existing Vercel project..."
    vercel --prod --confirm
fi

print_success "🎉 Deployment complete!"

# Get deployment URL
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
    
    if [ ! -z "$PROJECT_ID" ]; then
        echo ""
        print_success "Your app is live!"
        echo "🌐 Production URL: https://your-project-name.vercel.app"
        echo ""
    fi
fi

echo "📋 Post-deployment checklist:"
echo "1. ✅ Update Microsoft OAuth redirect URI in Azure Portal"
echo "2. ✅ Test OAuth flow on production"
echo "3. ✅ Configure environment variables in Vercel dashboard"
echo "4. ✅ Set up custom domain (optional)"
echo "5. ✅ Enable analytics and monitoring"
echo ""

print_warning "Important: Update your OAuth redirect URI in Azure Portal to:"
echo "https://your-app.vercel.app/api/auth/callback"
echo ""

print_success "Deployment successful! 🚀"