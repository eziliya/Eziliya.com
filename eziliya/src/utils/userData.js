// Local storage key for registered users
const REGISTERED_USERS_KEY = 'registeredUsers'

// Load registered users from localStorage
const loadRegisteredUsers = () => {
  try {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error loading registered users:', error)
    return {}
  }
}

// Save registered users to localStorage
const saveRegisteredUsers = (users) => {
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
  } catch (error) {
    console.error('Error saving registered users:', error)
  }
}

// Initialize with default users and merge with stored users
const defaultUsers = {

}

// Merge default users with stored users
const storedUsers = loadRegisteredUsers()
export const CONTACT_PROFILE_MAP = { ...defaultUsers, ...storedUsers }

// Role to route mapping
export const ROLE_ROUTE_MAP = {
  'salesteam': '/role/salesteam',
  'valuer': '/role/valuer',
  'office-engineer': '/role/office-engineer',
  'site-engineer': '/role/site-engineer',
  'technical-engineer': '/role/technical-engineer',
}

// Function to register a new user
export const registerUser = (MobileRegisterNumber, name, role, password) => {
  // Check if user already exists
  if (CONTACT_PROFILE_MAP[MobileRegisterNumber]) {
    return { success: false, message: 'Mobile Register Number already registered' }
  }
  
  // Add new user to the profile map
  CONTACT_PROFILE_MAP[MobileRegisterNumber] = {
    name,
    role,
    password
  }
  
  // Save to localStorage for persistence
  saveRegisteredUsers(CONTACT_PROFILE_MAP)
  
  return { success: true, message: 'User registered successfully' }
}

// Function to update user password
export const updateUserPassword = (MobileRegisterNumber, newPassword) => {
  if (CONTACT_PROFILE_MAP[MobileRegisterNumber]) {
    CONTACT_PROFILE_MAP[MobileRegisterNumber].password = newPassword
    // Save to localStorage
    saveRegisteredUsers(CONTACT_PROFILE_MAP)
    return true
  }
  return false
}

// Function to get user profile
export const getUserProfile = (MobileRegisterNumber) => {
  return CONTACT_PROFILE_MAP[MobileRegisterNumber] || null
}

// Function to verify password
export const verifyPassword = (MobileRegisterNumber, password) => {
  const profile = CONTACT_PROFILE_MAP[MobileRegisterNumber]
  return profile && profile.password === password
}

// Made with Bob
