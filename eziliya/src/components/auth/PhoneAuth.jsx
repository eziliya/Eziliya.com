import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendOTP, verifyOTP } from '../firebase.js'
import CustomButton from '../buttons/CustomButton.jsx'
import styles from './OtpVerification.module.css'

export default function PhoneAuth() {
  const navigate = useNavigate()
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
  }, [resendTimer, step])

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setError('')
    setLoading(true)

    try {
      setDebugInfo('Sending OTP to +91' + phoneNumber + '...')
      const result = await sendOTP(phoneNumber)
      
      if (result.success) {
        if (result.testMode) {
          setSuccess('🧪 TEST MODE: Use OTP 123456 (No real SMS sent)')
          setDebugInfo('⚠️ TEST MODE ACTIVE: Real SMS requires Firebase Blaze Plan. Using test OTP: 123456')
        } else {
          setSuccess('OTP sent successfully to your mobile number!')
          setDebugInfo('OTP sent! Check your phone for the verification code.')
        }
        setStep('otp')
        setResendTimer(60)
        setCanResend(false)
      } else {
        setError(result.message || 'Failed to send OTP')
        setDebugInfo('Error: ' + (result.message || 'Unknown error'))
        
        // Provide helpful error messages
        if (result.message?.includes('auth/operation-not-allowed')) {
          setError('⚠️ Phone authentication is not enabled in Firebase Console. Please enable it first.')
        } else if (result.message?.includes('auth/quota-exceeded')) {
          setError('⚠️ SMS quota exceeded. Please upgrade to Firebase Blaze Plan or use test phone numbers.')
        } else if (result.message?.includes('reCAPTCHA')) {
          setError('⚠️ reCAPTCHA verification failed. Please refresh the page and try again.')
        }
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to send OTP. Please try again.'
      setError(errorMsg)
      setDebugInfo('Exception: ' + errorMsg)
      console.error('Send OTP error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return
    
    setCanResend(false)
    setResendTimer(60)
    setError('')
    setLoading(true)

    try {
      const result = await sendOTP(phoneNumber)
      
      if (result.success) {
        setSuccess('OTP resent successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take last character
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char
    })
    setOtp(newOtp)

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5)
    const lastInput = document.getElementById(`otp-${lastIndex}`)
    if (lastInput) lastInput.focus()
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    const otpValue = otp.join('')

    if (otpValue.length !== 6) {
      setError('Please enter complete 6-digit OTP')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await verifyOTP(otpValue)
      
      if (result.success) {
        // Store user data in localStorage
        localStorage.setItem('firebaseToken', result.user.token)
        localStorage.setItem('user', JSON.stringify({
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber,
          mobileNumber: phoneNumber
        }))
        
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => navigate('/'), 1000)
      } else {
        setError(result.message)
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', ''])
        const firstInput = document.getElementById('otp-0')
        if (firstInput) firstInput.focus()
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.')
      console.error('Verify OTP error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToPhone = () => {
    setStep('phone')
    setOtp(['', '', '', '', '', ''])
    setError('')
    setSuccess('')
  }

  if (step === 'phone') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <header className={styles.header}>
            <h1 className={styles.title}>Phone Authentication</h1>
            <p className={styles.subtitle}>
              Enter your mobile number to receive an OTP
            </p>
          </header>

          {error && (
            <div className={styles.alertError} role="alert" style={{ whiteSpace: 'pre-wrap' }}>
              {error}
              {error.includes('Firebase Console') && (
                <div style={{ marginTop: '10px', fontSize: '13px' }}>
                  <strong>Quick Fix:</strong>
                  <ol style={{ textAlign: 'left', marginTop: '5px', paddingLeft: '20px' }}>
                    <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Firebase Console</a></li>
                    <li>Select your project: eziliya-5eac7</li>
                    <li>Authentication → Sign-in method</li>
                    <li>Enable "Phone" provider</li>
                  </ol>
                </div>
              )}
            </div>
          )}
          {success && (
            <p className={styles.alertSuccess} role="status">
              {success}
            </p>
          )}
          {debugInfo && (
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '10px',
              padding: '8px',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px'
            }}>
              {debugInfo}
            </p>
          )}

          <form className={styles.form} onSubmit={handlePhoneSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone-number">
                Mobile Number
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>+91</span>
                <input
                  id="phone-number"
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  className={styles.input}
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setPhoneNumber(value)
                    setError('')
                  }}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div className={styles.footer}>
              <CustomButton 
                text={loading ? 'Sending OTP...' : 'Send OTP'} 
                style={styles.submitBtn}
                disabled={loading || phoneNumber.length !== 10}
              />
            </div>
          </form>

          {/* reCAPTCHA container - invisible */}
          <div id="recaptcha-container"></div>

          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/login')}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    )
  }

  // OTP Verification Step
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className={styles.title}>Verify OTP</h1>
          <p className={styles.subtitle}>
            Enter the 6-digit code sent to
            <br />
            <strong>+91 {phoneNumber}</strong>
          </p>
        </header>

        {error && (
          <p className={styles.alertError} role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className={styles.alertSuccess} role="status">
            {success}
          </p>
        )}

        <form className={styles.form} onSubmit={handleOtpSubmit} noValidate>
          <div className={styles.otpContainer}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={styles.otpInput}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                autoFocus={index === 0}
                disabled={loading}
              />
            ))}
          </div>

          <div className={styles.footer}>
            <CustomButton 
              text={loading ? 'Verifying...' : 'Verify & Sign In'} 
              style={styles.submitBtn}
              disabled={loading}
            />
          </div>
        </form>

        <div className={styles.resendSection}>
          {canResend ? (
            <button
              type="button"
              className={styles.resendBtn}
              onClick={handleResendOtp}
              disabled={loading}
            >
              Resend OTP
            </button>
          ) : (
            <p className={styles.timerText}>
              Resend OTP in <strong>{resendTimer}s</strong>
            </p>
          )}
        </div>

        <button
          type="button"
          className={styles.backBtn}
          onClick={handleBackToPhone}
        >
          ← Change Phone Number
        </button>
      </div>
    </div>
  )
}

// Made with Bob
