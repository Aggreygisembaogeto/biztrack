# 📱 M-Pesa STK Push Setup Guide

## Overview

This guide will help you set up M-Pesa STK Push (Lipa Na M-Pesa Online) for your BizTrack application.

---

## 🔧 What Was Fixed

### Issues Resolved:
1. ✅ Fixed API URL (was using port 5000, now uses 5001)
2. ✅ Fixed token key (was using 'token', now uses 'biztrack_token')
3. ✅ Added M-Pesa environment variables to .env
4. ✅ Improved error handling and logging
5. ✅ Added mock payment for development (when M-Pesa not configured)

---

## 🚀 Quick Start (Development Mode)

### Current Status:
- **M-Pesa is NOT configured** (credentials empty)
- **Mock payments are enabled** automatically
- You can test the payment flow without real M-Pesa

### To Test Mock Payments:
1. Restart backend: `npm start`
2. Open frontend
3. Try M-Pesa payment
4. It will create a mock transaction immediately
5. No real STK push will be sent

---

## 📋 Setting Up Real M-Pesa

### Step 1: Get Safaricom Developer Account

1. Go to: https://developer.safaricom.co.ke/
2. Click **"Sign Up"**
3. Fill in your details
4. Verify your email
5. Login to your account

### Step 2: Create an App

1. Click **"My Apps"**
2. Click **"Add a New App"**
3. Fill in:
   - **App Name**: BizTrack
   - **Description**: Business management system
4. Select **"Lipa Na M-Pesa Online"** API
5. Click **"Create App"**

### Step 3: Get Credentials

After creating the app, you'll see:

1. **Consumer Key** - Copy this
2. **Consumer Secret** - Copy this

### Step 4: Get Test Credentials (Sandbox)

For testing, Safaricom provides:

```
Shortcode: 174379
Passkey: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

### Step 5: Update Your .env File

Open `backend/.env` and add:

```env
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=http://localhost:5001/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

### Step 6: Restart Backend

```bash
cd backend
npm start
```

### Step 7: Test with Sandbox

Safaricom provides test phone numbers:

**Test Phone Numbers:**
- `254708374149` - Success
- `254708374150` - Failed (insufficient funds)
- `254708374151` - Failed (wrong PIN)

**Test Amount:** Any amount between 1 and 70,000

---

## 🧪 Testing the Integration

### Test Flow:

1. **Open Frontend**
   - Go to Dashboard
   - Click "Quick Actions"
   - Select "M-Pesa Payment"

2. **Enter Details:**
   ```
   Amount: 100
   Phone: 254708374149
   Customer Name: Test Customer
   Description: Test payment
   ```

3. **Click "Send Payment Request"**

4. **What Happens:**
   - Backend receives request
   - Generates access token
   - Sends STK push to Safaricom
   - Safaricom sends STK to phone
   - Customer enters PIN
   - Safaricom sends callback
   - Transaction updated

---

## 📱 Phone Number Format

### Accepted Formats:
- `254712345678` ✅ (Correct)
- `0712345678` ✅ (Auto-converted to 254712345678)
- `712345678` ✅ (Auto-converted to 254712345678)

### Invalid Formats:
- `+254712345678` ❌ (Remove +)
- `254 712 345 678` ❌ (Remove spaces)
- `07123456` ❌ (Too short)

---

## 🔐 Production Setup

### Step 1: Go Live

1. Login to Safaricom Developer Portal
2. Go to your app
3. Click **"Go Live"**
4. Fill in the Go Live form
5. Wait for approval (1-3 business days)

### Step 2: Get Production Credentials

After approval, you'll receive:
- Production Consumer Key
- Production Consumer Secret
- Your actual Paybill/Till Number
- Production Passkey

### Step 3: Update Production .env

```env
# M-Pesa Production Configuration
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_SHORTCODE=your_actual_paybill_number
MPESA_PASSKEY=your_production_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_ENVIRONMENT=production
```

### Step 4: Update API URLs

Change from sandbox to production:

**In `backend/controllers/mpesaController.js`:**

```javascript
// Sandbox (testing)
const authUrl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const stkUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

// Production (live)
const authUrl = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const stkUrl = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
```

---

## 🔍 Troubleshooting

### Issue: "M-PESA not configured"

**Solution:**
- Check if `MPESA_CONSUMER_KEY` and `MPESA_CONSUMER_SECRET` are set in `.env`
- Restart backend after adding credentials
- This message means mock payments are being used

### Issue: "Invalid phone number format"

**Solution:**
- Use format: `254XXXXXXXXX`
- Remove spaces, dashes, or plus signs
- Must be exactly 12 digits starting with 254

### Issue: "Error getting access token"

**Solution:**
- Check Consumer Key and Secret are correct
- Verify you're using correct environment (sandbox/production)
- Check internet connection
- Verify Safaricom API is not down

### Issue: "STK Push not received on phone"

**Solution:**
- Verify phone number is correct
- Check phone has network coverage
- Ensure phone is M-Pesa registered
- Try with test phone numbers first (sandbox)
- Check if phone has enough balance

### Issue: "Callback not working"

**Solution:**
- Ensure callback URL is publicly accessible
- For local testing, use ngrok or similar
- Check callback URL in Safaricom portal matches your .env
- Verify callback endpoint is not protected by auth

---

## 📊 Transaction Flow

```
1. User clicks "M-Pesa Payment"
   ↓
2. Frontend sends request to backend
   ↓
3. Backend validates data
   ↓
4. Backend gets M-Pesa access token
   ↓
5. Backend sends STK push request
   ↓
6. Safaricom sends STK to customer phone
   ↓
7. Customer enters M-Pesa PIN
   ↓
8. Safaricom processes payment
   ↓
9. Safaricom sends callback to backend
   ↓
10. Backend updates transaction status
    ↓
11. Frontend shows success/failure
```

---

## 🔒 Security Best Practices

### 1. Protect Your Credentials
- Never commit `.env` file to git
- Use different credentials for dev/prod
- Rotate credentials regularly

### 2. Validate Callbacks
- Verify callback source is Safaricom
- Check transaction amounts match
- Validate phone numbers

### 3. Handle Errors Gracefully
- Log all errors
- Don't expose sensitive info in errors
- Provide user-friendly messages

### 4. Monitor Transactions
- Log all M-Pesa requests
- Track success/failure rates
- Set up alerts for failures

---

## 📝 Environment Variables Reference

```env
# Required for Real M-Pesa
MPESA_CONSUMER_KEY=your_key          # From Safaricom portal
MPESA_CONSUMER_SECRET=your_secret    # From Safaricom portal
MPESA_SHORTCODE=174379               # Your paybill/till number
MPESA_PASSKEY=your_passkey           # From Safaricom portal

# Optional
MPESA_CALLBACK_URL=http://localhost:5001/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox            # or 'production'
```

---

## 🎯 Current Status

### Development Mode:
- ✅ Mock payments enabled
- ✅ No real M-Pesa needed
- ✅ Instant transaction creation
- ✅ Perfect for testing UI/UX

### To Enable Real M-Pesa:
1. Get Safaricom developer account
2. Create app and get credentials
3. Add credentials to `.env`
4. Restart backend
5. Test with sandbox phone numbers

---

## 📞 Support

### Safaricom Support:
- Developer Portal: https://developer.safaricom.co.ke/
- Email: apisupport@safaricom.co.ke
- Phone: +254 711 082 300

### Common Issues:
- Check Safaricom API status
- Verify credentials are correct
- Ensure callback URL is accessible
- Test with provided test numbers first

---

## ✅ Checklist

### For Development:
- [x] Backend API URL fixed (port 5001)
- [x] Token key fixed (biztrack_token)
- [x] Mock payments working
- [ ] Get Safaricom developer account
- [ ] Create app and get credentials
- [ ] Add credentials to .env
- [ ] Test with sandbox

### For Production:
- [ ] Go live on Safaricom portal
- [ ] Get production credentials
- [ ] Update production .env
- [ ] Change API URLs to production
- [ ] Set up public callback URL
- [ ] Test with real phone numbers
- [ ] Monitor transactions

---

**Status:** Mock payments working, ready for real M-Pesa integration  
**Next Step:** Get Safaricom developer account and credentials
