import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDVrrqdkzHOQdMG4JBNdQe8lEOJSkKxlMI",
  authDomain: "eziliya-5eac7.firebaseapp.com",
  projectId: "eziliya-5eac7",
  storageBucket: "eziliya-5eac7.firebasestorage.app",
  messagingSenderId: "379384294056",
  appId: "1:379384294056:web:e9ecb4b685799b04dfb09d",
  measurementId: "G-0GS6SDMB6Z"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get auth instance
export const auth = firebase.auth();

// TEST MODE: Enable this for testing without real SMS (requires Blaze Plan for real SMS)
const TEST_MODE = true; // Set to false when you upgrade to Blaze Plan
const TEST_OTP = '123456'; // Test OTP code

// Configure reCAPTCHA for phone authentication
export const setupRecaptcha = (elementId = 'recaptcha-container') => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(elementId, {
      size: 'invisible',
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber
        console.log('reCAPTCHA verified');
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        console.log('reCAPTCHA expired');
      }
    });
  }
  return window.recaptchaVerifier;
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber) => {
  try {
    // TEST MODE: Simulate OTP sending without real SMS
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: OTP would be sent to +91' + phoneNumber);
      console.log('🔑 Use OTP:', TEST_OTP);
      
      // Store phone number for test verification
      window.testPhoneNumber = phoneNumber;
      
      return {
        success: true,
        message: `TEST MODE: Use OTP ${TEST_OTP} (No real SMS sent)`,
        testMode: true
      };
    }
    
    // PRODUCTION MODE: Real Firebase SMS
    // Ensure phone number is in E.164 format (+91XXXXXXXXXX)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const recaptchaVerifier = setupRecaptcha();
    const confirmationResult = await auth.signInWithPhoneNumber(formattedPhone, recaptchaVerifier);
    
    // Store confirmation result in window for verification
    window.confirmationResult = confirmationResult;
    
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Reset reCAPTCHA on error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    return {
      success: false,
      message: error.message || 'Failed to send OTP'
    };
  }
};

// Verify OTP
export const verifyOTP = async (otp) => {
  try {
    // TEST MODE: Verify test OTP
    if (TEST_MODE) {
      if (otp === TEST_OTP && window.testPhoneNumber) {
        console.log('✅ TEST MODE: OTP verified successfully');
        
        // Create mock user data
        const mockUser = {
          uid: 'test-' + Date.now(),
          phoneNumber: '+91' + window.testPhoneNumber,
          token: 'test-token-' + Date.now()
        };
        
        return {
          success: true,
          user: mockUser,
          testMode: true
        };
      } else {
        return {
          success: false,
          message: `Invalid OTP. Use ${TEST_OTP} in test mode.`
        };
      }
    }
    
    // PRODUCTION MODE: Real Firebase verification
    if (!window.confirmationResult) {
      throw new Error('No confirmation result found. Please request OTP again.');
    }
    
    const result = await window.confirmationResult.confirm(otp);
    const user = result.user;
    
    return {
      success: true,
      user: {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        token: await user.getIdToken()
      }
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: error.message || 'Invalid OTP'
    };
  }
};

// Sign out
export const signOut = async () => {
  try {
    await auth.signOut();
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    window.confirmationResult = null;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, message: error.message };
  }
};

export default firebase;
