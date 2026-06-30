import React, { useState, useRef } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import CustomButton from '../buttons/CustomButton.jsx'
import { serverUrl } from '../../../config.mjs'
import { MASTER_CREDENTIALS } from '../../config/masterCredentials.js'
import { sendOTP, verifyOTP } from '../../firebase.js'
import styles from './Login.module.css'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [firebaseVerified, setFirebaseVerified] = useState(false)
  const handleMobileSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!mobileNumber) {
      setError('Please enter your registered mobile number')
      return
    }

    if (mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)

    try {
      // Use Firebase OTP
      const result = await sendOTP(mobileNumber)
      
      if (result.success) {
        if (result.testMode) {
          setSuccess('🧪 TEST MODE: Use OTP 123456 (No real SMS sent)')
        } else {
          setSuccess('OTP sent to your mobile number!')
        }
        setTimeout(() => {
          setStep(2)
          setSuccess('')
        }, 1500)
      } else {
        setError(result.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
      console.error('Send OTP error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      // Verify Firebase OTP
      const result = await verifyOTP(otp)
      
      if (result.success) {
        setFirebaseVerified(true)
        if (result.testMode) {
          setSuccess('✅ OTP verified successfully! (Test Mode)')
        } else {
          setSuccess('✅ OTP verified successfully!')
        }
        setTimeout(() => {
          setStep(3)
          setSuccess('')
        }, 1500)
      } else {
        setError(result.message || 'Invalid OTP. Please try again.')
        setOtp('')
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.')
      console.error('Verify OTP error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // If master credentials are enabled, allow password reset without backend
      if (MASTER_CREDENTIALS.ENABLED) {
        setSuccess('Password reset successfully! (Dev Mode) Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
        setLoading(false)
        return
      }

      const response = await axios.post(
        `${serverUrl}/reset-password`,
        { mobileNumber, newPassword },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (response.status === 200) {
        setSuccess('Password reset successfully! Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setError('')
    setSuccess('')
    
    if (name === 'mobileNumber') {
      if (value === '' || /^[0-9]{0,10}$/.test(value)) {
        setMobileNumber(value)
      }
    } else if (name === 'otp') {
      if (value === '' || /^[0-9]{0,6}$/.test(value)) {
        setOtp(value)
      }
    } else if (name === 'newPassword') {
      setNewPassword(value)
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {step === 1 && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Forgot Password</h1>
              <p className={styles.subtitle}>
                Enter your registered mobile number to receive an OTP
              </p>
            </header>

            {error && <p className={styles.alertError} role="alert">{error}</p>}
            {success && <p className={styles.alertSuccess} role="status">{success}</p>}

            <form className={styles.form} onSubmit={handleMobileSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="mobileNumber">
                  Mobile Number
                </label>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  autoComplete="tel"
                  className={styles.input}
                  placeholder="Enter your registered mobile number"
                  value={mobileNumber}
                  onChange={handleChange}
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className={styles.footer}>
                <CustomButton
                  text={loading ? 'Sending OTP...' : 'Send OTP'}
                  style={styles.submitBtn}
                  disabled={loading}
                />
              </div>
              
              {/* reCAPTCHA container - invisible */}
              <div id="recaptcha-container"></div>
            </form>

            <p className={styles.signupPrompt}>
              Remember your password?
              <Link to="/login" className={styles.signupLink}>
                Back to Login
              </Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Verify OTP</h1>
              <p className={styles.subtitle}>
                Enter the 6-digit OTP sent to <strong>{mobileNumber}</strong>
              </p>
            </header>

            {error && <p className={styles.alertError} role="alert">{error}</p>}
            {success && <p className={styles.alertSuccess} role="status">{success}</p>}

            <form className={styles.form} onSubmit={handleOtpSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="otp">
                  OTP Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="6"
                  className={styles.input}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={handleChange}
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className={styles.footer}>
                <CustomButton 
                  text={loading ? 'Verifying...' : 'Verify OTP'} 
                  style={styles.submitBtn}
                  disabled={loading}
                  
                />
              </div>
            </form>

            <p className={styles.signupPrompt}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className={styles.signupLink}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                disabled={loading}
              >
                ← Back to Mobile Number
              </button>
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Reset Password</h1>
              <p className={styles.subtitle}>
                Enter your new password
              </p>
            </header>

            {error && <p className={styles.alertError} role="alert">{error}</p>}
            {success && <p className={styles.alertSuccess} role="status">{success}</p>}

            <form className={styles.form} onSubmit={handlePasswordReset} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  className={styles.input}
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={handleChange}
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={styles.input}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className={styles.footer}>
                <CustomButton 
                  text={loading ? 'Resetting...' : 'Reset Password'} 
                  style={styles.submitBtn}
                  disabled={loading}
                />
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// Made with Bob
