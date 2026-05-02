#!/bin/bash

# BizTrack Vercel Deployment Script
# This script helps you deploy the frontend to Vercel

echo "🚀 BizTrack Vercel Deployment"
echo "═══════════════════════════════════════════════════"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo ""
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo ""
fi

echo "✅ Vercel CLI found"
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "📦 Preparing frontend for deployment..."
echo ""

# Navigate to frontend
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
    echo ""
fi

# Build the frontend
echo "🔨 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed"
    echo "Please fix the errors and try again"
    exit 1
fi

echo ""
echo "✅ Build successful"
echo ""

# Check if VITE_API_URL is set
echo "⚠️  IMPORTANT: Make sure you have your backend URL ready"
echo ""
echo "You'll need to set the VITE_API_URL environment variable in Vercel"
echo "Example: https://your-backend.railway.app"
echo ""

read -p "Do you have your backend URL ready? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please deploy your backend first:"
    echo "1. Go to https://railway.app"
    echo "2. Deploy the backend"
    echo "3. Copy the backend URL"
    echo "4. Come back and run this script again"
    echo ""
    exit 1
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════"
    echo "🎉 Deployment successful!"
    echo "═══════════════════════════════════════════════════"
    echo ""
    echo "Next steps:"
    echo "1. Copy your Vercel URL from above"
    echo "2. Go to your Railway backend"
    echo "3. Update FRONTEND_URL environment variable"
    echo "4. Redeploy backend"
    echo "5. Test your application"
    echo ""
    echo "Your app should be live at the URL shown above!"
    echo ""
else
    echo ""
    echo "❌ Deployment failed"
    echo "Please check the errors above and try again"
    echo ""
    exit 1
fi
