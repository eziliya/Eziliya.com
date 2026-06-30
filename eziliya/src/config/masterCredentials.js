// Master credentials for testing/development
// In production, remove or disable these

export const MASTER_CREDENTIALS = {
  // Master OTP that works for any mobile number
  MASTER_OTP: '123456',
  
  // Master password for admin access
  MASTER_PASSWORD: 'Admin@123',
  
  // Enable/disable master credentials (set to false in production)
  ENABLED: true,
  
  // Master admin mobile numbers that can use master credentials
  ADMIN_MOBILE_NUMBERS: [
    '9999999999',
    '1234567890',
    '0000000000'
  ]
}

// Check if OTP is valid (either master OTP or real OTP)
export const isValidOTP = (enteredOTP, realOTP = null) => {
  if (MASTER_CREDENTIALS.ENABLED && enteredOTP === MASTER_CREDENTIALS.MASTER_OTP) {
    return true
  }
  return enteredOTP === realOTP
}

// Check if password is valid (either master password or real password)
export const isValidPassword = (enteredPassword, realPassword = null) => {
  if (MASTER_CREDENTIALS.ENABLED && enteredPassword === MASTER_CREDENTIALS.MASTER_PASSWORD) {
    return true
  }
  return enteredPassword === realPassword
}

// Check if mobile number is admin
export const isAdminMobile = (mobileNumber) => {
  return MASTER_CREDENTIALS.ADMIN_MOBILE_NUMBERS.includes(mobileNumber)
}

// Made with Bob
