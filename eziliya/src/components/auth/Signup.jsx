import React, { useState } from 'react'
import axios from 'axios'
import CustomButton from '../buttons/CustomButton'
import { serverUrl } from '../../../config.mjs'
import styles from './Signup.module.css'
import { useNavigate } from 'react-router-dom'
export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
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
      case 'contactNumber':
        setContactNumber(value)
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
    
    // Validate all fields
    if (!name || !contactNumber || !password || !role) {
      setError('All fields are required')
      return
    }

    // Validate contact number format (10 digits)
    const contactRegex = /^[0-9]{10}$/
    if (!contactRegex.test(contactNumber)) {
      setError('Please enter a valid 10-digit contact number')
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setError('')
    setSuccess('')
    try {
      const response = await axios.post(
        `${serverUrl}/register`,
        { name, contactNumber, password, role },
        { headers: { 'Content-Type': 'application/json' } }
      )
      if (response.status === 201) {
        // Store user data in localStorage
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('userName', response.data.user.name)
        localStorage.setItem('userRole', response.data.user.role)
        
        setSuccess(response.data.message)
        // Navigate to home instead of login since user is now authenticated
        navigate('/')
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Try again.')
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
              placeholder="Enter your full name"
              value={name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-contactNumber">
              Contact Number
            </label>
            <input
              id="signup-contactNumber"
              name="contactNumber"
              type="tel"
              autoComplete="tel"
              className={styles.input}
              placeholder="Enter your 10-digit contact number"
              value={contactNumber}
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
              placeholder="Enter your password"
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
              <option value="admin">Admin</option>
              <option value="office-engineer">Office-Engineer</option>
              <option value="site-engineer">Site-Engineer</option>
              <option value="technical-engineer">Technical-Engineer</option>
              <option value="valuer">Valuer</option>
              <option value="sales-team">Sales-Team</option>

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