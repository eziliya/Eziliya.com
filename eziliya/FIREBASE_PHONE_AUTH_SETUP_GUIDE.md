# Firebase Phone Authentication Setup Guide

## ⚠️ IMPORTANT: Required Firebase Console Configuration

Firebase Phone Authentication will NOT work until you complete these steps in the Firebase Console.

## Step-by-Step Setup Instructions

### Step 1: Enable Phone Authentication

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `eziliya-5eac7`

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on "Sign-in method" tab

3. **Enable Phone Provider**
   - Find "Phone" in the list of providers
   - Click on "Phone"
   - Toggle the "Enable" switch to ON
   - Click "Save"

### Step 2: Add Authorized Domains

1. **In the same "Sign-in method" tab**
   - Scroll down to "Authorized domains" section
   - You should see `localhost` already listed
   - If deploying to production, add your domain (e.g., `yourdomain.com`)

2. **For Development:**
   - `localhost` should already be authorized
   - If not, click "Add domain" and add `localhost`

### Step 3: Configure reCAPTCHA (Important!)

Firebase uses reCAPTCHA to prevent abuse. You have two options:

#### Option A: Use Invisible reCAPTCHA (Recommended - Already Implemented)
- Our code already uses invisible reCAPTCHA
- No additional configuration needed
- Works automatically once Phone Auth is enabled

#### Option B: Use Test Phone Numbers (For Development Only)

1. **In Firebase Console → Authentication → Sign-in method**
2. **Scroll to "Phone numbers for testing"**
3. **Click "Add phone number"**
4. **Add test numbers:**
   - Phone: `+91 1234567890`
   - Code: `123456`
   - Click "Add"

5. **Use these test numbers during development** (no real SMS sent)

### Step 4: Enable Billing (Required for Production)

⚠️ **CRITICAL:** Firebase Phone Authentication requires a paid plan (Blaze Plan) for production use.

1. **Go to Firebase Console → Project Settings**
2. **Click on "Usage and billing"**
3. **Upgrade to Blaze Plan** (Pay as you go)
   - Free tier includes: 10K verifications/month
   - After that: $0.06 per verification

**For Development/Testing:**
- You can use test phone numbers without billing
- Real SMS requires Blaze Plan

### Step 5: Verify Setup

After completing the above steps:

1. **Restart your development server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Test the flow:**
   - Go to http://localhost:5173/login
   - Click "Phone Number (Firebase OTP)"
   - Enter a test phone number (if using test numbers)
   - OR enter a real number (if Blaze Plan is enabled)

## Troubleshooting Common Issues

### Issue 1: "auth/operation-not-allowed"
**Solution:** Phone authentication is not enabled in Firebase Console
- Follow Step 1 above

### Issue 2: "auth/quota-exceeded"
**Solution:** You've exceeded the free tier limit
- Upgrade to Blaze Plan (Step 4)
- Or use test phone numbers for development

### Issue 3: "reCAPTCHA verification failed"
**Solution:** Domain not authorized
- Add your domain to authorized domains (Step 2)
- Clear browser cache and try again

### Issue 4: "auth/invalid-phone-number"
**Solution:** Phone number format is incorrect
- Use format: `+91XXXXXXXXXX` (10 digits after +91)
- Our code auto-formats, but ensure no spaces or special characters

### Issue 5: SMS not received
**Possible causes:**
1. Blaze Plan not enabled (required for real SMS)
2. Phone number is invalid or blocked
3. SMS quota exceeded
4. Carrier issues

**Solutions:**
- Enable Blaze Plan
- Use test phone numbers for development
- Check Firebase Console → Authentication → Usage for quota

## Quick Test with Test Phone Numbers

If you want to test immediately without billing:

1. **Add test number in Firebase Console:**
   - Phone: `+91 9999999999`
   - Code: `123456`

2. **In your app:**
   - Enter: `9999999999`
   - OTP will be: `123456`
   - No real SMS sent!

## Production Checklist

Before deploying to production:

- [ ] Phone authentication enabled in Firebase Console
- [ ] Blaze Plan activated
- [ ] Production domain added to authorized domains
- [ ] SMS quota limits configured
- [ ] Billing alerts set up
- [ ] Test with real phone numbers
- [ ] Monitor usage in Firebase Console

## Cost Estimation

**Firebase Phone Authentication Pricing:**
- First 10,000 verifications/month: FREE
- Additional verifications: $0.06 each

**Example:**
- 100 users/day × 30 days = 3,000 verifications/month = FREE
- 500 users/day × 30 days = 15,000 verifications/month = $300 (5,000 × $0.06)

## Support

If you still face issues after following this guide:

1. Check browser console for specific error messages
2. Check Firebase Console → Authentication → Usage
3. Verify all steps above are completed
4. Check Firebase Status: https://status.firebase.google.com/

## Next Steps

1. ✅ Complete Firebase Console setup (Steps 1-4)
2. ✅ Test with test phone numbers first
3. ✅ Enable Blaze Plan for production
4. ✅ Test with real phone numbers
5. ✅ Deploy to production

---

**Need Help?** Share the exact error message from browser console for specific troubleshooting.