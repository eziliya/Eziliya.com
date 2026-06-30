# Master Credentials Guide

## Overview
Master credentials allow you to test the authentication system without needing a real SMS gateway or backend implementation. This is perfect for development and testing.

## Master Credentials

### Master OTP
**Value:** `123456`

Use this OTP for:
- Login OTP verification
- Forgot password OTP verification

### Master Password
**Value:** `Admin@123`

Use this password for:
- Admin access
- Testing purposes

## Configuration

The master credentials are configured in:
```
src/config/masterCredentials.js
```

### Enable/Disable Master Credentials

```javascript
export const MASTER_CREDENTIALS = {
  MASTER_OTP: '123456',
  MASTER_PASSWORD: 'Admin@123',
  ENABLED: true,  // Set to false in production
  ADMIN_MOBILE_NUMBERS: [
   
  ]
}
```

**⚠️ IMPORTANT:** Set `ENABLED: false` in production!

## How It Works

### Login Flow with Master OTP
1. Enter any mobile number and password
2. Click "Sign in"
3. You'll see: "OTP sent! (Dev Mode: Use 123456)"
4. Enter `123456` as the OTP
5. Successfully logged in!

### Forgot Password Flow with Master OTP
1. Click "Forgot Password?" link
2. Enter any mobile number
3. You'll see: "OTP sent! (Dev Mode: Use 123456)"
4. Enter `123456` as the OTP
5. Set new password and confirm
6. Password reset successful!

## Testing Scenarios

### Test Case 1: Login with Master OTP
```
Mobile: 1254877854
Password: anypassword
OTP: 123456
Result: ✅ Login successful
```

### Test Case 2: Forgot Password
```
Mobile: 9876543210
OTP: 123456
New Password: NewPass@123
Confirm: NewPass@123
Result: ✅ Password reset successful
```

### Test Case 3: Admin Mobile Numbers
```
Mobile: 9999999999
Password: Admin@123
OTP: 123456
Result: ✅ Admin access granted
```

## Features

### Development Mode Indicators
When master credentials are enabled, you'll see:
- "(Dev Mode: Use 123456)" in success messages
- "(Dev Mode)" in verification success messages
- Mock user session created if backend is unavailable

### Fallback Behavior
If the backend is not available:
- Master OTP still works
- Creates a mock user session
- Allows you to test the frontend completely

### Mock User Session
When backend is unavailable, a mock user is created:
```javascript
{
  mobileNumber: "entered_number",
  name: "Test User",
  role: "valuer"
}
```

## Production Deployment

### Before deploying to production:

1. **Disable Master Credentials**
   ```javascript
   // src/config/masterCredentials.js
   ENABLED: false
   ```

2. **Implement Backend Endpoints**
   - POST `/send-otp`
   - POST `/verify-otp`
   - POST `/reset-password`
   - POST `/login`

3. **Configure SMS Gateway**
   - Twilio
   - MSG91
   - AWS SNS
   - Or your preferred service

4. **Remove Dev Mode Messages**
   The system will automatically stop showing dev mode messages when `ENABLED: false`

## Security Notes

⚠️ **Never deploy with master credentials enabled in production!**

- Master credentials bypass all security
- Anyone with the master OTP can access any account
- Only use for development and testing
- Always disable before production deployment

## Customization

### Change Master OTP
```javascript
MASTER_OTP: '999999'  // Your custom OTP
```

### Change Master Password
```javascript
MASTER_PASSWORD: 'YourSecurePassword@123'
```

### Add Admin Mobile Numbers
```javascript
ADMIN_MOBILE_NUMBERS: [
  '9999999999',
  '8888888888',
  'your_number_here'
]
```

## Troubleshooting

### OTP Not Working
- Check if `ENABLED: true` in masterCredentials.js
- Verify you're entering exactly `123456`
- Check browser console for errors

### Login Fails After OTP
- Backend might be required for login
- System will create mock session automatically
- Check localStorage for token and user data

### Password Reset Not Working
- Ensure master credentials are enabled
- Check that OTP verification passed
- Verify password meets requirements (min 6 characters)

## Summary

✅ **Master OTP:** `123456`  
✅ **Master Password:** `Admin@123`  
✅ **Works for:** Login, Forgot Password  
✅ **No backend required:** Creates mock sessions  
⚠️ **Production:** Set `ENABLED: false`

Happy Testing! 🎉