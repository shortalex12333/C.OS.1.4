#!/bin/bash

echo "🚀 Deploying CelesteOS v1.4 to Vercel..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Build the project
echo "📦 Building production bundle..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
echo ""
echo "Run the following command to deploy:"
echo ""
echo "  vercel --prod"
echo ""
echo "Or if you have the Vercel token set:"
echo ""
echo "  vercel --prod --yes --token YOUR_VERCEL_TOKEN"
echo ""
echo "📝 Notes:"
echo "  - The app will be deployed to: https://celesteos-v1-4.vercel.app"
echo "  - Environment variables are configured in vercel.json"
echo "  - Make sure your Vercel project is linked to this directory"
echo ""
echo "To link this project to Vercel (if not already done):"
echo "  vercel link"
echo ""