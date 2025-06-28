#!/bin/bash

# Vercel Deployment Script for CelesteOS Chat Interface
# This script prepares and deploys the frontend to Vercel

echo "🚀 Starting CelesteOS Vercel Deployment..."

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
yarn install

# Build the project
echo "🔨 Building frontend for production..."
yarn build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed! Please check the build logs."
    exit 1
fi

# Go back to root
cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - REACT_APP_BACKEND_URL=https://api.celeste7.ai"
echo "   - WDS_SOCKET_PORT=443"
echo ""
echo "2. Configure CORS on your backend to allow the Vercel domain"
echo ""
echo "3. Test the deployed application"
echo ""
echo "🎉 Your CelesteOS chat interface is now live on Vercel!"