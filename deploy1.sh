#!/bin/bash
# CELESTE7 Oracle API Deployment Script

set -e

echo "🚀 Deploying CELESTE7 Oracle API..."

# Check environment
if [ -z "$DEPLOY_ENV" ]; then
  echo "❌ DEPLOY_ENV not set. Use: staging or production"
  exit 1
fi

# Build Docker image
echo "📦 Building Docker image..."
docker build -t celeste7-oracle:latest .

# Tag for registry
if [ "$DEPLOY_ENV" == "production" ]; then
  docker tag celeste7-oracle:latest registry.celeste7.com/oracle:latest
  docker tag celeste7-oracle:latest registry.celeste7.com/oracle:$(git rev-parse --short HEAD)
else
  docker tag celeste7-oracle:latest registry.celeste7.com/oracle:staging
fi

# Push to registry
echo "📤 Pushing to registry..."
docker push registry.celeste7.com/oracle:latest

# Deploy to Kubernetes
echo "☸️ Deploying to Kubernetes..."
kubectl apply -f k8s/${DEPLOY_ENV}/

# Wait for rollout
echo "⏳ Waiting for rollout..."
kubectl rollout status deployment/oracle-api -n celeste7

# Run health check
echo "🏥 Running health check..."
./scripts/health-check.sh

echo "✅ Deployment complete!"