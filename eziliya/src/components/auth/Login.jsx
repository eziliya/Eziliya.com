import React, { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import CustomButton from '../buttons/CustomButton'
import { serverUrl } from '../../../config.mjs'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [contactNumber, setContactNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (error) setError('')
    switch (name) {
      case 'contactNumber':
        setContactNumber(value)
        break
      case 'password':
        setPassword(value)
        break
      default:
        break
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!contactNumber || !password) {
      setError('All fields are required')
      return
    }
    setError('')
    try {
      const response = await axios.post(
        `${serverUrl}/login`,
        { contactNumber, password },
        { headers: { 'Content-Type': 'application/json' } }
      )
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('userName', response.data.user.name)
        localStorage.setItem('userRole', response.data.user.role)
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
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>
            Sign in with your contact number and password to continue to your workspace.
          </p>
        </header>

        {error && (
          <p className={styles.alertError} role="alert">
            {error}
          </p>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-contactNumber">
              Contact Number
            </label>
            <input
              id="login-contactNumber"
              name="contactNumber"
              type="tel"
              autoComplete="tel"
              className={styles.input}
              placeholder="Enter your contact number"
              value={contactNumber}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={styles.input}
              placeholder="Enter your password"
              value={password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.footer}>
            <CustomButton text="Sign in" style={styles.submitBtn} />
          </div>
        </form>

        <p className={styles.signupPrompt}>
          Don&apos;t have an account?
          <Link to="/signup" className={styles.signupLink}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}