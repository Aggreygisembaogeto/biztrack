#!/bin/bash

# BizTrack Unified - Quick Start Script

echo "🚀 Starting BizTrack Unified Server..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your settings!"
    echo ""
fi

# Check if frontend is built
if [ ! -d "frontend/dist" ]; then
    echo "📦 Frontend not built. Building now..."
    npm run build
    echo ""
fi

# Start the server
echo "🌟 Starting server on port ${PORT:-5001}..."
echo "📱 Frontend: http://localhost:${PORT:-5001}"
echo "🔌 API: http://localhost:${PORT:-5001}/api"
echo ""
node server-unified.js
