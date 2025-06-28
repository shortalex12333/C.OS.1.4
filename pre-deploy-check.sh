#!/bin/bash

# Pre-deployment checks for CelesteOS
echo "🔍 Running pre-deployment checks..."

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: frontend/package.json not found"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"

# Navigate to frontend
cd frontend

# Check if yarn is available
if ! command -v yarn &> /dev/null; then
    echo "📦 Yarn not found, using npm instead"
    PACKAGE_MANAGER="npm"
    INSTALL_CMD="npm install"
    BUILD_CMD="npm run build"
else
    echo "📦 Using yarn package manager"
    PACKAGE_MANAGER="yarn"
    INSTALL_CMD="yarn install"
    BUILD_CMD="yarn build"
fi

# Install dependencies
echo "📦 Installing dependencies..."
$INSTALL_CMD

if [ $? -ne 0 ]; then
    echo "❌ Dependency installation failed"
    exit 1
fi

# Check environment variables
echo "🔧 Checking environment variables..."
if [ -f ".env" ]; then
    echo "✅ .env file found"
    cat .env | grep -E "^[^#]" | while read line; do
        echo "   $line"
    done
else
    echo "⚠️ No .env file found (will use Vercel environment variables)"
fi

# Build the project
echo "🔨 Testing build process..."
$BUILD_CMD

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Check build output
if [ -d "build" ]; then
    BUILD_SIZE=$(du -sh build | cut -f1)
    echo "✅ Build successful - Size: $BUILD_SIZE"
    
    # Check critical files
    if [ -f "build/index.html" ]; then
        echo "✅ index.html generated"
    else
        echo "❌ index.html missing"
        exit 1
    fi
    
    if [ -f "build/static/js/main.*.js" ]; then
        echo "✅ JavaScript bundle generated"
    else
        echo "❌ JavaScript bundle missing"
        exit 1
    fi
    
    if [ -f "build/static/css/main.*.css" ]; then
        echo "✅ CSS bundle generated"
    else
        echo "⚠️ CSS bundle missing (might be inlined)"
    fi
else
    echo "❌ Build directory not found"
    exit 1
fi

# Go back to root
cd ..

# Check Vercel configuration
echo "🔧 Checking Vercel configuration..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json found"
    
    # Validate JSON syntax
    if command -v jq &> /dev/null; then
        cat vercel.json | jq . > /dev/null
        if [ $? -eq 0 ]; then
            echo "✅ vercel.json is valid JSON"
        else
            echo "❌ vercel.json has invalid JSON syntax"
            exit 1
        fi
    else
        echo "⚠️ jq not available for JSON validation"
    fi
else
    echo "❌ vercel.json not found"
    exit 1
fi

# Check ignore file
if [ -f ".vercelignore" ]; then
    echo "✅ .vercelignore found"
else
    echo "⚠️ .vercelignore not found (using default ignore rules)"
fi

# Final checks
echo ""
echo "🎉 Pre-deployment checks completed successfully!"
echo ""
echo "📋 Summary:"
echo "   ✅ Dependencies installed"
echo "   ✅ Build process works"
echo "   ✅ Vercel configuration valid"
echo "   ✅ Ready for deployment"
echo ""
echo "🚀 You can now deploy with:"
echo "   vercel --prod"
echo ""
echo "🔧 Don't forget to set environment variables in Vercel Dashboard:"
echo "   - REACT_APP_BACKEND_URL=https://api.celeste7.ai"
echo "   - WDS_SOCKET_PORT=443"