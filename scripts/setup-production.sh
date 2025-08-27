#!/bin/bash

# =================================
# CelesteOS ChatGPT Clone - Production Setup Script
# =================================

set -e  # Exit on any error

echo "🚀 Setting up CelesteOS ChatGPT Clone for Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js and npm are installed
print_status "Checking system requirements..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm 8+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "System requirements met!"

# Create backup of existing files
print_status "Creating backup of existing configuration..."
mkdir -p backup
if [ -f "package.json" ]; then
    cp package.json backup/package.json.bak
fi
if [ -f "vite.config.ts" ]; then
    cp vite.config.ts backup/vite.config.ts.bak
fi

# Replace production files
print_status "Installing production configuration..."

if [ -f "package.production.json" ]; then
    cp package.production.json package.json
    print_success "Production package.json installed"
else
    print_error "package.production.json not found!"
    exit 1
fi

if [ -f "vite.config.production.ts" ]; then
    cp vite.config.production.ts vite.config.ts
    print_success "Production Vite config installed"
else
    print_error "vite.config.production.ts not found!"
    exit 1
fi

# Environment setup
print_status "Setting up environment configuration..."

if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_success "Created .env.local from template"
        print_warning "Please update .env.local with your actual values!"
    else
        print_error ".env.example not found!"
        exit 1
    fi
else
    print_warning ".env.local already exists - skipping"
fi

# Install dependencies
print_status "Installing production dependencies..."
npm install

print_success "Dependencies installed successfully!"

# Run type check
print_status "Running type check..."
if npm run type-check > /dev/null 2>&1; then
    print_success "Type check passed!"
else
    print_warning "Type check failed - please fix TypeScript errors before deployment"
fi

# Test build
print_status "Testing production build..."
if npm run build:prod > /dev/null 2>&1; then
    print_success "Production build successful!"
    
    # Show build stats
    if [ -d "dist" ]; then
        BUILD_SIZE=$(du -sh dist | cut -f1)
        print_status "Build size: $BUILD_SIZE"
    fi
else
    print_error "Production build failed! Please check the errors above."
    exit 1
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    print_status "Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
build/
dist/

# Environment variables
.env
.env.local
.env.production.local
.env.development.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log

# Temporary files
.tmp/
.temp/
backup/

# Vercel
.vercel

# Netlify
.netlify
EOF
    print_success "Created .gitignore"
fi

print_success "🎉 Production setup complete!"

echo ""
echo "📋 Next Steps:"
echo "1. Update .env.local with your actual environment variables"
echo "2. Test locally with: npm run preview:prod"
echo "3. Commit changes: git add . && git commit -m 'Setup production configuration'"
echo "4. Deploy to your chosen platform (Vercel or Netlify)"
echo ""
echo "📚 Documentation:"
echo "- Read PRODUCTION-DEPLOYMENT-README.md for detailed deployment instructions"
echo "- Check WEB-DEPLOYMENT-GUIDE.md for additional context"
echo ""

# Check if this is a git repo
if [ ! -d ".git" ]; then
    print_warning "This is not a Git repository. Initialize with:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit: CelesteOS ChatGPT Clone'"
fi

print_success "Ready for deployment! 🚀"