@echo off
REM BizTrack Vercel Deployment Script for Windows

echo 🚀 BizTrack Vercel Deployment
echo ═══════════════════════════════════════════════════
echo.

REM Check if vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI not found
    echo.
    echo Installing Vercel CLI...
    call npm install -g vercel
    echo.
)

echo ✅ Vercel CLI found
echo.

REM Check if we're in the right directory
if not exist "frontend" (
    echo ❌ Error: frontend directory not found
    echo Please run this script from the project root directory
    exit /b 1
)

echo 📦 Preparing frontend for deployment...
echo.

REM Navigate to frontend
cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📥 Installing dependencies...
    call npm install
    echo.
)

REM Build the frontend
echo 🔨 Building frontend...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build failed
    echo Please fix the errors and try again
    exit /b 1
)

echo.
echo ✅ Build successful
echo.

REM Important notice
echo ⚠️  IMPORTANT: Make sure you have your backend URL ready
echo.
echo You'll need to set the VITE_API_URL environment variable in Vercel
echo Example: https://your-backend.railway.app
echo.

set /p READY="Do you have your backend URL ready? (y/n): "

if /i not "%READY%"=="y" (
    echo.
    echo Please deploy your backend first:
    echo 1. Go to https://railway.app
    echo 2. Deploy the backend
    echo 3. Copy the backend URL
    echo 4. Come back and run this script again
    echo.
    exit /b 1
)

echo.
echo 🚀 Deploying to Vercel...
echo.

REM Deploy to Vercel
call vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ═══════════════════════════════════════════════════
    echo 🎉 Deployment successful!
    echo ═══════════════════════════════════════════════════
    echo.
    echo Next steps:
    echo 1. Copy your Vercel URL from above
    echo 2. Go to your Railway backend
    echo 3. Update FRONTEND_URL environment variable
    echo 4. Redeploy backend
    echo 5. Test your application
    echo.
    echo Your app should be live at the URL shown above!
    echo.
) else (
    echo.
    echo ❌ Deployment failed
    echo Please check the errors above and try again
    echo.
    exit /b 1
)

cd ..
