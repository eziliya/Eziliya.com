import React, { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'
import logo from '../../assets/Eziliyatech.png'

const baseItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Profile', path: '/profile' },
  { name: 'Create Report', path: '/select-banks' },
]

function navItemsForUser() {
  let user = null
  try {
    const raw = localStorage.getItem('user')
    user = raw ? JSON.parse(raw) : null
  } catch {
    user = null
  }
  if (user?.role === 'valuer') {
    return [
      ...baseItems,
      { name: 'My Reports', path: '/valuer/reports' },
    ]
  }
  if (user?.role === 'site-engineer') {
    return [
      ...baseItems,
      { name: 'My Reports', path: '/site-engineer/reports' },
    ]
  }
  if (user?.role === 'technical-engineer') {
    return [
      ...baseItems,
      { name: 'My Reports', path: '/technical-engineer/reports' },
    ]
  }
  if (user?.role === 'sales-team') {
    return [
      { name: 'Dashboard', path: '/' },
      { name: 'Profile', path: '/profile' },
      { name: 'Create Customer Application', path: '/salesteam/form' },
    ]
  }
  return baseItems
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const items = navItemsForUser()
  const [menuOpen, setMenuOpen] = useState(false)
  
  // Check if user is sales team
  const isSalesTeam = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user?.role === 'sales-team'
    } catch {
      return false
    }
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [menuOpen])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 767) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogout = () => {
    setMenuOpen(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  const navEndMatch = (path) => path === '/' || path === '/reports'

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="Home">
          <img src={logo} alt="EZiliyaTech" className={styles.logo} />
          <span className={styles.brandText}></span>
        </Link>

        <nav
          className={styles.desktopNav}
          aria-label="Main"
        >
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.linkActive : '']
                  .filter(Boolean)
                  .join(' ')
              }
              end={navEndMatch(item.path)}
            >
              {item.name}
            </NavLink>
          ))}
          {!isSalesTeam() && (
            <>
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.link} ${styles.emailLink}`}
                aria-label="Open Gmail"
                title="Open Gmail"
              >
                📧 Gmail
              </a>
              <a
                href="https://web.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.link} ${styles.whatsappLink}`}
                aria-label="Open WhatsApp"
                title="Open WhatsApp"
              >
                💬 WhatsApp
              </a>
            </>
          )}
          <button
            type="button"
            className={`${styles.link} ${styles.linkLogout} ${styles.logoutBtn}`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={styles.srOnly}>
            {menuOpen ? 'Close menu' : 'Open menu'}
          </span>
          <span className={styles.hamburger} aria-hidden>
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
          </span>
        </button>
      </div>

      <div
        className={`${styles.backdrop} ${menuOpen ? styles.backdropOpen : ''}`}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />

      <div
        id="main-menu"
        className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ''}`}
        aria-label="Main navigation"
      >
        <nav className={styles.mobileLinks}>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [styles.linkMobile, isActive ? styles.linkMobileActive : '']
                  .filter(Boolean)
                  .join(' ')
              }
              end={navEndMatch(item.path)}
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
          {!isSalesTeam() && (
            <>
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.linkMobile} ${styles.emailLinkMobile}`}
                aria-label="Open Gmail"
                title="Open Gmail"
                onClick={() => setMenuOpen(false)}
              >
                📧 Gmail
              </a>
              <a
                href="https://web.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.linkMobile} ${styles.whatsappLinkMobile}`}
                aria-label="Open WhatsApp"
                title="Open WhatsApp"
                onClick={() => setMenuOpen(false)}
              >
                💬 WhatsApp
              </a>
            </>
          )}
          <button
            type="button"
            className={`${styles.linkMobile} ${styles.linkMobileLogout}`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}