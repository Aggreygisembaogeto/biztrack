# 🔧 Vercel Environment Variable Setup - Simple Guide

## What You Need to Set

**Variable Name:** `VITE_API_URL`  
**Variable Value:** `https://biztrack-production-134f.up.railway.app`

---

## 📋 Step-by-Step Instructions

### Step 1: Open Vercel
1. Open your web browser
2. Go to: **https://vercel.com**
3. Click **"Login"** (top right)
4. Log in with your account

### Step 2: Find Your Project
1. After logging in, you'll see your dashboard
2. Look for a project called **"biztrack"**
3. **Click on it**

### Step 3: Go to Settings
1. At the top of the page, you'll see tabs
2. Find and click **"Settings"**

### Step 4: Open Environment Variables
1. On the left side, you'll see a menu
2. Scroll down and click **"Environment Variables"**

### Step 5: Add the Variable

**You'll see a page with a button that says "Add New" or "Add Environment Variable"**

Click that button, then fill in:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Name (Key):                                        │
│  ┌───────────────────────────────────────────────┐ │
│  │ VITE_API_URL                                  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Value:                                             │
│  ┌───────────────────────────────────────────────┐ │
│  │ https://biztrack-production-134f.up.railway.app│ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Select Environments:                               │
│  ☑ Production                                       │
│  ☑ Preview                                          │
│  ☑ Development                                      │
│                                                     │
│              [Cancel]  [Save]                       │
└─────────────────────────────────────────────────────┘
```

**Important:**
- Copy this EXACTLY: `VITE_API_URL`
- Copy this EXACTLY: `https://biztrack-production-134f.up.railway.app`
- Check ALL THREE boxes (Production, Preview, Development)

### Step 6: Save
1. Click the **"Save"** button
2. You should see the variable appear in the list

### Step 7: Redeploy (VERY IMPORTANT!)

**Without this step, nothing will work!**

1. Click **"Deployments"** tab at the top
2. You'll see a list of your deployments
3. Find the **first one** (most recent)
4. On the right side, click the **three dots (...)** button
5. Click **"Redeploy"**
6. Click **"Redeploy"** again to confirm
7. **Wait 2-3 minutes** until you see "Ready" status

### Step 8: Test Your App

1. Open a **new private/incognito window**
2. Go to: `https://biztrack-dusky.vercel.app`
3. Try to login
4. It should work now! ✅

---

## 🎯 Quick Copy-Paste

**Variable Name (copy this):**
```
VITE_API_URL
```

**Variable Value (copy this):**
```
https://biztrack-production-134f.up.railway.app
```

---

## ✅ Checklist

Before you start:
- [ ] I'm logged into Vercel
- [ ] I can see my biztrack project

Setting the variable:
- [ ] I clicked Settings tab
- [ ] I clicked Environment Variables
- [ ] I clicked Add New
- [ ] I entered: `VITE_API_URL`
- [ ] I entered: `https://biztrack-production-134f.up.railway.app`
- [ ] I checked Production box
- [ ] I checked Preview box
- [ ] I checked Development box
- [ ] I clicked Save

After setting:
- [ ] I went to Deployments tab
- [ ] I clicked "..." on latest deployment
- [ ] I clicked Redeploy
- [ ] I waited for "Ready" status
- [ ] I tested in incognito window

---

## 🆘 Troubleshooting

### "I can't find the Settings tab"
- Look at the very top of the page after clicking your project
- It should be next to "Overview" and "Deployments"

### "I can't find Environment Variables"
- After clicking Settings, look at the LEFT side of the page
- Scroll down the left menu
- It's usually between "Domains" and "Git"

### "I don't see an Add New button"
- You might already have variables
- Look for a button that says "Add" or "Add Environment Variable"
- It's usually at the top right of the page

### "I set it but it's still not working"
- Did you click Redeploy? (This is the most common mistake!)
- Did you wait for the deployment to finish?
- Did you clear your browser cache or use incognito?

### "The Redeploy button is grayed out"
- Wait a few seconds, it might be loading
- Try refreshing the page
- Make sure you're looking at the Deployments tab

---

## 📞 Need More Help?

If you're stuck, tell me:
1. Which step number you're on
2. What you see on your screen
3. What happens when you try to do that step

I'll help you get past it!

---

## 🎉 Success!

Once you complete all steps and test your app, you should be able to:
- ✅ Login successfully
- ✅ Register new users
- ✅ Use all features

Your app will be fully functional! 🚀
