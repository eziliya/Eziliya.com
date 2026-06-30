import React, { useState, useEffect } from 'react'
import styles from './Home.module.css'
import Navbar from '../components/nav/Navbar.jsx'
import { useNavigate, Link } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    
    const userStr = localStorage.getItem('user')
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const user = JSON.parse(userStr)
        setUser(user)
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Clear invalid data and redirect to login
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        navigate('/login')
      }
    } else {
      navigate('/login')
    }
  }, [navigate])

  // Role mapping for comparison
  const roleMapping = {
    'valuer': 'valuer',
    'salesteam': 'salesteam',
    'office-engineer': 'officeengineer',
    'site-engineer': 'siteengineer',
    'technical-engineer': 'technicalengineer'
  }

  // Check if user is eligible for a role
  const isEligible = (roleKey) => {
    if (!user || !user.role) return false
    // Normalize user role: remove spaces and hyphens, convert to lowercase
    const userRole = user.role.toLowerCase().replace(/[\s-]+/g, '')
    const requiredRole = roleMapping[roleKey]
    return userRole === requiredRole
  }

  // Render role card with eligibility check
  const RoleCard = ({ roleKey, icon, title, description, path }) => {
    const eligible = isEligible(roleKey)
    
    if (eligible) {
      return (
        <Link to={path} className={styles.roleCard}>
          <div className={styles.roleIcon}>{icon}</div>
          <h3>{title}</h3>
          <p>{description}</p>
        </Link>
      )
    }
    
    return (
      <div className={`${styles.roleCard} ${styles.roleCardDisabled}`}>
        <div className={styles.roleIcon}>{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
        <div className={styles.notEligible}>
          <span className={styles.lockIcon}>🔒</span>
          <span>You are not eligible for this role</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.homeContainer}>
      <Navbar />
      
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to Eziliya Report Management System</h1>
        {user && <p className={styles.welcomeText}>Hello, {user.name || user.email}!</p>}
        
        <div className={styles.roleSection}>
          <h2 className={styles.sectionTitle}>Select Your Role</h2>
          <p className={styles.sectionDescription}>Choose your role to access the appropriate reporting tools</p>
          
          <div className={styles.roleGrid}>
            <RoleCard
              roleKey="valuer"
              icon="📊"
              title="Valuer"
              description="Create technical valuation reports"
              path="/role/valuer"
            />

            <RoleCard
              roleKey="salesteam"
              icon="💼"
              title="Sales Team"
              description="Initiate loan applications and reports"
              path="/role/salesteam"
            />

            <RoleCard
              roleKey="office-engineer"
              icon="🏢"
              title="Office Engineer"
              description="Manage technical documentation"
              path="/role/office-engineer"
            />

            <RoleCard
              roleKey="site-engineer"
              icon="🏗️"
              title="Site Engineer"
              description="Conduct site inspections"
              path="/role/site-engineer"
            />

            <RoleCard
              roleKey="technical-engineer"
              icon="⚙️"
              title="Technical Engineer"
              description="Perform technical assessments"
              path="/role/technical-engineer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}


