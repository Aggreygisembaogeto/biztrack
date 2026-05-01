#!/bin/bash

# BizTrack Deployment Script
# This script builds and prepares all applications for deployment

echo "🚀 Starting BizTrack Deployment Build..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if node_modules exist, if not install
check_and_install() {
    if [ ! -d "$1/node_modules" ]; then
        echo -e "${BLUE}Installing dependencies for $1...${NC}"
        cd $1
        npm install
        cd ..
    fi
}

# Build User Application
echo -e "${BLUE}📦 Building User Application...${NC}"
check_and_install "frontend"
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ User Application built successfully${NC}"
else
    echo -e "${RED}❌ User Application build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Build Admin Application
echo -e "${BLUE}📦 Building Admin Application...${NC}"
check_and_install "admin-panel"
cd admin-panel
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Admin Application built successfully${NC}"
else
    echo -e "${RED}❌ Admin Application build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Prepare Backend
echo -e "${BLUE}📦 Preparing Backend...${NC}"
cd backend
npm install --production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend prepared successfully${NC}"
else
    echo -e "${RED}❌ Backend preparation failed${NC}"
    exit 1
fi
cd ..
echo ""

# Create deployment package
echo -e "${BLUE}📦 Creating deployment package...${NC}"
mkdir -p deployment
mkdir -p deployment/user-app
mkdir -p deployment/admin-app
mkdir -p deployment/backend

# Copy built files
cp -r frontend/dist/* deployment/user-app/
cp -r admin-panel/dist/* deployment/admin-app/
cp -r backend/* deployment/backend/

# Remove development files from backend
rm -rf deployment/backend/node_modules
rm -rf deployment/backend/.env

echo -e "${GREEN}✅ Deployment package created in ./deployment/${NC}"
echo ""

echo -e "${GREEN}🎉 Build Complete!${NC}"
echo ""
echo "📁 Deployment files:"
echo "   - User App: ./deployment/user-app/"
echo "   - Admin App: ./deployment/admin-app/"
echo "   - Backend: ./deployment/backend/"
echo ""
echo "📝 Next steps:"
echo "   1. Upload files to your server"
echo "   2. Configure environment variables"
echo "   3. Set up Nginx"
echo "   4. Start backend with PM2"
echo ""
echo "   See PRODUCTION_DEPLOYMENT_GUIDE.md for detailed instructions"
