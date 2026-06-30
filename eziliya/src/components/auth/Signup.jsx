import React, { useState } from 'react'
import axios from 'axios'
import CustomButton from '../buttons/CustomButton.jsx'
import { serverUrl } from '../../../config.mjs'
import styles from './Signup.module.css'
import { useNavigate } from 'react-router-dom'
export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name: field, value } = e.target
    if (error) setError('')
    if (success) setSuccess('')
    switch (field) {
      case 'name':
        setName(value)
        break
      case 'mobileNumber':
        setMobileNumber(value)
        break
      case 'password':
        setPassword(value)
        break
      case 'role':
        setRole(value)
        break
      default:
        break
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !mobileNumber || !password || !role) {
      setError('All fields are required')
      return
    }
    setError('')
    setSuccess('')
    try {
      const response = await axios.post(
        `${serverUrl}/register`,
        { name, mobileNumber, password, role },
        { headers: { 'Content-Type': 'application/json' } }
      )
      if (response.status === 201) {
        setSuccess(response.data.message)
        navigate('/login')
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      console.error('Signup error:', err.response?.data)
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Something went wrong. Try again.'
      setError(errorMsg)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>
            Enter your details to register. You’ll use this account to access reports
            and dashboards.
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
          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-name">
              Name
            </label>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              className={styles.input}
              placeholder="Jane Cooper"
              value={name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-mobile">
              Mobile Number
            </label>
            <input
              id="signup-mobile"
              name="mobileNumber"
              type="tel"
              autoComplete="tel"
              className={styles.input}
              placeholder="Enter your mobile number"
              value={mobileNumber}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-role">
              Role
            </label>
            <select
              id="signup-role"
              name="role"
              className={styles.select}
              value={role}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select a role
              </option>
              <option value="sales-team">Sales-Team</option>
              <option value="technical engineer">Technical Engineer</option>
              <option value="office engineer">Office Engineer</option>
              <option value="site engineer">Site Engineer</option>
              <option value="valuer">Valuer</option>
            </select>
          </div>

          <div className={styles.footer}>
            <CustomButton text="Sign up" style={styles.submitBtn} />
          </div>
        </form>
      </div>
    </div>
  )
}