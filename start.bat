@echo off
REM BizTrack Unified - Quick Start Script for Windows

echo 🚀 Starting BizTrack Unified Server...
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo ✅ Created .env file. Please edit it with your settings!
    echo.
)

REM Check if frontend is built
if not exist "frontend\dist" (
    echo 📦 Frontend not built. Building now...
    call npm run build
    echo.
)

REM Start the server
echo 🌟 Starting server on port 5001...
echo 📱 Frontend: http://localhost:5001
echo 🔌 API: http://localhost:5001/api
echo.
node server-unified.js
