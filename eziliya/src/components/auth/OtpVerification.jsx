import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import CustomButton from '../buttons/CustomButton.jsx'
import { serverUrl } from '../../../config.mjs'
import { MASTER_CREDENTIALS } from '../../config/masterCredentials.js'
import styles from './OtpVerification.module.css'

export default function OtpVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const mobileNumber = location.state?.mobileNumber
  const password = location.state?.password

  useEffect(() => {
    if (!mobileNumber) {
      navigate('/login')
      return
    }

    // Send OTP on component mount
    sendOtp()
  }, [mobileNumber])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const sendOtp = async () => {
    try {
      setLoading(true)
      setError('')
      
      // If master credentials are enabled, show master OTP message
      if (MASTER_CREDENTIALS.ENABLED) {
        setSuccess(`OTP sent! (Dev Mode: Use ${MASTER_CREDENTIALS.MASTER_OTP})`)
        setTimeout(() => setSuccess(''), 5000)
        setLoading(false)
        return
      }
      
      const response = await axios.post(
        `${serverUrl}/send-otp`,
        { mobileNumber },
        { headers: { 'Content-Type': 'application/json' } }
      )
      if (response.status === 200) {
        setSuccess('OTP sent to your mobile number')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return
    setCanResend(false)
    setResendTimer(60)
    await sendOtp()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpValue = otp.join('')

    if (otpValue.length !== 6) {
      setError('Please enter complete 6-digit OTP')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Check if master OTP is used
      if (MASTER_CREDENTIALS.ENABLED && otpValue === MASTER_CREDENTIALS.MASTER_OTP) {
        // Master OTP verified, proceed with login
        try {
          const loginResponse = await axios.post(
            `${serverUrl}/login`,
            { mobileNumber, password },
            { headers: { 'Content-Type': 'application/json' } }
          )

          if (loginResponse.status === 200) {
            localStorage.setItem('token', loginResponse.data.token)
            localStorage.setItem('user', JSON.stringify(loginResponse.data.user))
            setSuccess('Login successful! Redirecting...')
            setTimeout(() => navigate('/'), 1000)
          }
        } catch (loginErr) {
          // If backend login fails, create a mock session for testing
          const mockUser = {
            mobileNumber,
            name: 'Test User',
            role: 'valuer'
          }
          localStorage.setItem('token', 'mock-token-' + Date.now())
          localStorage.setItem('user', JSON.stringify(mockUser))
          setSuccess('Login successful! (Dev Mode) Redirecting...')
          setTimeout(() => navigate('/'), 1000)
        }
        setLoading(false)
        return
      }

      // Regular OTP verification via backend
      const verifyResponse = await axios.post(
        `${serverUrl}/verify-otp`,
        { mobileNumber, otp: otpValue },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (verifyResponse.status === 200) {
        // OTP verified, now login
        const loginResponse = await axios.post(
          `${serverUrl}/login`,
          { mobileNumber, password },
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (loginResponse.status === 200) {
          localStorage.setItem('token', loginResponse.data.token)
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user))
          setSuccess('Login successful! Redirecting...')
          setTimeout(() => navigate('/'), 1000)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <strong>{mobileNumber}</strong>
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

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
          onClick={() => navigate('/login')}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  )
}

// Made with Bob
