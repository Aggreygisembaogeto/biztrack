# Troubleshooting Blank Screen Issue 🔍

## Current Status
- ✅ Backend server running on port 5001
- ✅ Frontend server running on port 3000
- ✅ No syntax errors in code
- ✅ Environment variables configured correctly

## Possible Causes & Solutions

### 1. **Browser Cache Issue** (Most Common)
**Symptoms**: Site loads but shows blank white/dark screen

**Solution**:
1. Open browser DevTools (F12)
2. Go to Application tab → Storage
3. Click "Clear site data"
4. Or use Ctrl+Shift+Delete → Clear cache
5. Refresh page (Ctrl+F5 for hard refresh)

### 2. **Not Logged In**
**Symptoms**: Blank screen or stuck on loading

**Solution**:
1. Go to: `http://localhost:3000/login`
2. Login with your credentials
3. Or click "Continue as Demo User"

### 3. **JavaScript Error**
**Symptoms**: Blank screen with console errors

**Solution**:
1. Open browser console (F12 → Console tab)
2. Look for red error messages
3. Share the error message for specific fix

### 4. **CORS Error**
**Symptoms**: Network errors in console

**Solution**:
1. Check backend is running: `http://localhost:5001`
2. Check frontend is running: `http://localhost:3000`
3. Restart both servers if needed

### 5. **Port Conflict**
**Symptoms**: Server won't start or connection refused

**Solution**:
```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :5001

# Kill process if needed (replace PID)
taskkill /PID <process_id> /F
```

## Quick Diagnostic Steps

### Step 1: Check Browser Console
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for errors (red text)
4. Common errors:
   - `Failed to fetch` → Backend not running
   - `CORS error` → Port mismatch
   - `Unexpected token` → Syntax error
   - `Cannot read property` → Data issue

### Step 2: Check Network Tab
1. Press F12 → Network tab
2. Refresh page
3. Look for failed requests (red)
4. Check if API calls are going to correct URL
5. Should see: `http://localhost:5001/api/...`

### Step 3: Check Application Storage
1. Press F12 → Application tab
2. Go to Local Storage → `http://localhost:3000`
3. Check for:
   - `biztrack_token` (should have JWT token if logged in)
   - `biztrack_user` (should have user data if logged in)
4. If corrupted, delete them and login again

### Step 4: Check Server Status
```bash
# Backend should show:
Server running on port 5001

# Frontend should show:
VITE v5.4.21  ready in 1551 ms
➜  Local:   http://localhost:3000/
```

## Common Fixes

### Fix 1: Clear Everything and Restart
```bash
# Stop both servers (Ctrl+C in terminals)

# Clear node_modules and reinstall (if needed)
cd frontend
rm -rf node_modules
npm install

cd ../backend
rm -rf node_modules
npm install

# Start backend
cd backend
npm start

# Start frontend (in new terminal)
cd frontend
npm run dev
```

### Fix 2: Clear Browser Data
1. Open browser
2. Press Ctrl+Shift+Delete
3. Select "Cached images and files"
4. Select "Cookies and other site data"
5. Click "Clear data"
6. Go to `http://localhost:3000/login`

### Fix 3: Force Logout and Login
1. Open browser console (F12)
2. Run this command:
```javascript
localStorage.clear();
location.reload();
```
3. You'll be logged out
4. Login again

### Fix 4: Check if Stuck on Loading
If you see "Loading..." forever:
1. Open console
2. Check for errors
3. Try accessing directly: `http://localhost:3000/login`
4. Clear localStorage and try again

## What to Check Right Now

### 1. Open Browser Console
Press F12 and check Console tab. Do you see:
- ❌ Red errors? → Share the error message
- ✅ No errors? → Good, continue

### 2. Check Current URL
What URL are you on?
- `http://localhost:3000/` → Should redirect to /dashboard or /login
- `http://localhost:3000/login` → Should show login page
- `http://localhost:3000/dashboard` → Should show dashboard (if logged in)

### 3. Check Network Requests
Press F12 → Network tab → Refresh page
- Do you see requests to `localhost:5001`?
- Are they successful (status 200) or failing (status 4xx/5xx)?

### 4. Check localStorage
Press F12 → Application → Local Storage → `http://localhost:3000`
- Do you see `biztrack_token`?
- Do you see `biztrack_user`?
- If yes, you should be logged in
- If no, you need to login

## Expected Behavior

### When Not Logged In:
1. Go to `http://localhost:3000`
2. Should redirect to `/login`
3. Should see login page with:
   - Email input
   - Password input
   - Login button
   - "Continue as Demo User" link

### When Logged In:
1. Go to `http://localhost:3000`
2. Should redirect to `/dashboard`
3. Should see:
   - Sidebar on left
   - Dashboard content
   - Stats cards
   - Charts

## Debug Commands

### Check if servers are running:
```bash
# Check backend
curl http://localhost:5001/api/auth/login

# Check frontend
curl http://localhost:3000
```

### Check localStorage in console:
```javascript
// Check if logged in
console.log('Token:', localStorage.getItem('biztrack_token'));
console.log('User:', localStorage.getItem('biztrack_user'));

// Clear if needed
localStorage.clear();
```

## Still Having Issues?

### Provide This Information:
1. **What do you see?**
   - Blank white screen?
   - Blank dark screen?
   - Loading spinner forever?
   - Error message?

2. **Browser console errors?**
   - Press F12 → Console
   - Copy any red error messages

3. **Network tab status?**
   - Press F12 → Network
   - Are requests failing?
   - What's the status code?

4. **Current URL?**
   - What URL are you trying to access?

5. **localStorage content?**
   - Press F12 → Application → Local Storage
   - Do you have biztrack_token?

## Quick Fix Commands

### In Browser Console (F12):
```javascript
// Clear everything and go to login
localStorage.clear();
window.location.href = '/login';

// Check auth status
console.log('Logged in:', !!localStorage.getItem('biztrack_token'));

// Force reload
location.reload(true);
```

## Most Likely Solution

Based on the symptoms, try this:
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Go to**: `http://localhost:3000/login`
3. **Login** or click "Continue as Demo User"
4. **Should work!**

If still blank, check browser console (F12) for errors and share them.
