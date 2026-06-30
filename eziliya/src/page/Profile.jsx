import React, { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/nav/Navbar.jsx'
import { serverUrl } from '../../config.mjs'
import styles from './Profile.module.css'

function authHeaders() {
  const token = localStorage.getItem('token')
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  }
}

function authHeadersMultipart() {
  const token = localStorage.getItem('token')
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'multipart/form-data',
  }
}

function readLocalUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function formatRole(role) {
  if (!role) return '—'
  if (role === 'sideengineer') return 'Side engineer'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function initialFromName(name) {
  if (!name || typeof name !== 'string') return '?'
  const p = name.trim().split(/\s+/)
  if (p.length >= 2) {
    return (p[0][0] + p[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const fileInputRef = useRef(null)

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    const cached = readLocalUser()
    if (cached) {
      setUser(cached)
      setLoading(false)
    }

    const userId = cached?._id
    if (!userId) {
      setLoading(false)
      setError('No user id in session. Sign in again.')
      return
    }

    // Try to fetch fresh data from server, but don't fail if server is unavailable
    try {
      const res = await axios.get(`${serverUrl}/getUser/${userId}`, {
        headers: authHeaders(),
      })
      const fresh = res.data.user
      setUser(fresh)
      localStorage.setItem('user', JSON.stringify(fresh))
      setError('') // Clear any previous errors on success
    } catch (err) {
      if (err.response?.status === 401) {
        // Only redirect on 401 if we don't have cached data
        if (!cached) {
          navigate('/login', { replace: true })
          return
        }
        // If we have cached data, just show a warning
        console.warn('Session may have expired, showing cached profile data')
      }
      // Don't show error if we have cached data - just log it
      if (cached) {
        console.log('Using cached profile data. Server sync failed:', err.message)
      } else {
        setError(
          err.response?.data?.message ??
            'Could not load profile. Please check if the backend server is running.'
        )
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB')
      return
    }

    setUploadingPhoto(true)
    setError('')
    setUploadSuccess('')

    try {
      const formData = new FormData()
      formData.append('profilePhoto', file)

      const res = await axios.post(
        `${serverUrl}/uploadProfilePhoto/${user._id}`,
        formData,
        { headers: authHeadersMultipart() }
      )

      // Update user with new photo URL
      const updatedUser = { ...user, profilePhoto: res.data.profilePhoto }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUploadSuccess('Profile photo updated successfully!')
      
      // Reload profile to ensure we have the latest data
      setTimeout(() => loadProfile(), 500)
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(''), 3000)
    } catch (err) {
      setError(
        err.response?.data?.message ?? 'Failed to upload profile photo. Please try again.'
      )
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!user?.profilePhoto) return
    
    if (!window.confirm('Are you sure you want to remove your profile photo?')) {
      return
    }

    setUploadingPhoto(true)
    setError('')
    setUploadSuccess('')

    try {
      await axios.delete(
        `${serverUrl}/removeProfilePhoto/${user._id}`,
        { headers: authHeaders() }
      )

      // Update user without photo
      const updatedUser = { ...user, profilePhoto: null }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUploadSuccess('Profile photo removed successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(''), 3000)
    } catch (err) {
      setError(
        err.response?.data?.message ?? 'Failed to remove profile photo. Please try again.'
      )
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (!user && !loading) {
    return (
      <>
        <Navbar />
        <div className={styles.page}>
          <div className={styles.inner}>
            <div className={styles.headerBlock}>
              <h1 className={styles.title}>Profile</h1>
            </div>
            {error && (
              <p className={styles.bannerError} role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </>
    )
  }

  const created = user?.createdAt
    ? new Date(user.createdAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—'

  const updated = user?.updatedAt
    ? new Date(user.updatedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—'

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.headerBlock}>
            <h1 className={styles.title}>Your profile</h1>
            <p className={styles.subtitle}>
              Account details from your workspace. This page refreshes from the
              server when you open it.
            </p>
          </div>

          {error && (
            <p className={styles.bannerError} role="alert">
              {error}
            </p>
          )}

          {uploadSuccess && (
            <p className={styles.bannerSuccess} role="alert">
              {uploadSuccess}
            </p>
          )}

          <div className={styles.card}>
            <div className={styles.hero}>
              <div className={styles.avatarWrapper}>
                <div className={styles.avatar} aria-hidden>
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user?.name || 'Profile'}
                      className={styles.avatarImage}
                      onError={(e) => {
                        console.error('Image failed to load:', user.profilePhoto);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => console.log('Image loaded successfully:', user.profilePhoto)}
                    />
                  ) : (
                    initialFromName(user?.name)
                  )}
                </div>
                {console.log('Profile Photo URL:', user?.profilePhoto)}
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={handlePhotoClick}
                  disabled={uploadingPhoto}
                  title="Upload profile photo"
                  aria-label="Upload profile photo"
                >
                  {uploadingPhoto ? (
                    <span className={styles.uploadSpinner} />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={styles.uploadIcon}
                    >
                      <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18a.75.75 0 01-.75.75H6.75A.75.75 0 016 18v-1.62c0-1.17.68-2.25 1.76-2.73 1.17-.51 2.61-.9 4.24-.9z" />
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                {user?.profilePhoto && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    title="Remove profile photo"
                    aria-label="Remove profile photo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={styles.removeIcon}
                    >
                      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handlePhotoChange}
                  className={styles.fileInput}
                  aria-label="Profile photo file input"
                />
              </div>
              <div className={styles.heroText}>
                <p className={styles.displayName}>{user?.name ?? '—'}</p>
                <p className={styles.emailPreview}>
                  {user?.mobileNumber ?? user?.mobileRegisterNumber ?? user?.contactNumber ?? '—'}
                </p>
                <span className={styles.rolePill}>{formatRole(user?.role)}</span>
              </div>
            </div>

            <dl className={styles.list}>
              <div className={styles.row}>
                <dt className={styles.dt}>Full name</dt>
                <dd className={styles.dd}>{user?.name ?? '—'}</dd>
              </div>
              <div className={styles.row}>
                <dt className={styles.dt}>Mobile Number</dt>
                <dd className={styles.dd}>
                  {user?.mobileNumber ?? user?.mobileRegisterNumber ?? user?.contactNumber ?? '—'}
                </dd>
              </div>
              <div className={styles.row}>
                <dt className={styles.dt}>Role</dt>
                <dd className={styles.dd}>{formatRole(user?.role)}</dd>
              </div>
              <div className={styles.row}>
                <dt className={styles.dt}>Member since</dt>
                <dd className={styles.dd}>{created}</dd>
              </div>
              <div className={styles.row}>
                <dt className={styles.dt}>Last updated</dt>
                <dd className={styles.dd}>{updated}</dd>
              </div>
            </dl>

            <div className={styles.footer}>
              <p className={styles.refreshNote}>
                {loading && (
                  <>
                    <span className={styles.spinner} aria-hidden />
                    Syncing with server…
                  </>
                )}
                {!loading && 'Profile is up to date.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}