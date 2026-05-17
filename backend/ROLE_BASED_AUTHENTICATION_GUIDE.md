# Role-Based Authentication & Profile Management Guide

## Overview
This system implements role-based authentication that displays only the appropriate profile and permissions based on the user's role. Each role has specific access rights and can only view their designated profile information.

## Available Roles
- `admin` - Full system access
- `valuer` - Property valuation specialist
- `site-engineer` - On-site inspection and technical assessment
- `technical-engineer` - Technical report review and approval
- `office-engineer` - Report creation and management
- `sales-team` - Client management and sales operations

## Authentication Flow

### 1. User Registration
**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "valuer",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "valuer",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2026-05-02T04:43:18.589Z"
  }
}
```

### 2. User Login
**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "valuer",
    "phone": "+1234567890",
    "isActive": true
  }
}
```

### 3. Get Role-Specific Profile
**Endpoint:** `GET /profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response for Valuer:**
```json
{
  "message": "Profile retrieved successfully",
  "profile": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "valuer",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2026-05-02T04:43:18.589Z",
    "profileType": "Valuer Profile",
    "description": "Property valuation specialist",
    "permissions": [
      "View assigned valuation reports",
      "Submit valuation reports",
      "Update property valuations",
      "Access valuation history"
    ],
    "accessibleRoutes": [
      "/pending-reports",
      "/completed-reports",
      "/submit-valuer/:reportId",
      "/report/:reportId"
    ]
  }
}
```

**Response for Site Engineer:**
```json
{
  "message": "Profile retrieved successfully",
  "profile": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "site-engineer",
    "phone": "+1234567891",
    "isActive": true,
    "createdAt": "2026-05-02T04:43:18.589Z",
    "profileType": "Site Engineer Profile",
    "description": "On-site inspection and technical assessment",
    "permissions": [
      "View assigned site visits",
      "Start site visits",
      "Submit site inspection reports",
      "Upload site photos and documents",
      "Access visit history"
    ],
    "accessibleRoutes": [
      "/site-engineer/pending-visits",
      "/site-engineer/in-progress-visits",
      "/site-engineer/completed-visits",
      "/site-engineer/start-visit/:reportId",
      "/submit-site-engineer/:reportId"
    ]
  }
}
```

## Role-Specific Permissions

### Valuer Profile
- **Description:** Property valuation specialist
- **Permissions:**
  - View assigned valuation reports
  - Submit valuation reports
  - Update property valuations
  - Access valuation history
- **Accessible Routes:**
  - `/pending-reports`
  - `/completed-reports`
  - `/submit-valuer/:reportId`
  - `/report/:reportId`

### Site Engineer Profile
- **Description:** On-site inspection and technical assessment
- **Permissions:**
  - View assigned site visits
  - Start site visits
  - Submit site inspection reports
  - Upload site photos and documents
  - Access visit history
- **Accessible Routes:**
  - `/site-engineer/pending-visits`
  - `/site-engineer/in-progress-visits`
  - `/site-engineer/completed-visits`
  - `/site-engineer/start-visit/:reportId`
  - `/submit-site-engineer/:reportId`

### Technical Engineer Profile
- **Description:** Technical report review and approval
- **Permissions:**
  - View technical reports
  - Upload technical reports
  - Download technical reports
  - Review technical assessments
- **Accessible Routes:**
  - `/technical-reports`
  - `/technical-reports/upload`
  - `/technical-reports/download/:reportId`

### Office Engineer Profile
- **Description:** Report creation and management
- **Permissions:**
  - Create new reports
  - View all reports
  - Update reports
  - Submit office engineer reports
  - Assign reports to site engineers
- **Accessible Routes:**
  - `/create`
  - `/getreports`
  - `/mycreatedreports`
  - `/updatereport/:reportId`
  - `/submit-office-engineer/:reportId`

### Sales Team Profile
- **Description:** Client management and sales operations
- **Permissions:**
  - View client reports
  - Create AU Small Finance forms
  - View AU Small Finance reports
  - Track report status
- **Accessible Routes:**
  - `/ausmall-finance-form/create`
  - `/ausmall-finance-form/all`
  - `/ausmall-finance-form/:formId`
  - `/ausmall-finance-final-report/all`

### Admin Profile
- **Description:** Full system access and management
- **Permissions:**
  - Full system access
  - User management
  - All report operations
  - System configuration
- **Accessible Routes:** All routes (*)

## Authorization Middleware

### Available Middleware Functions

1. **authenticate** - Verifies JWT token
2. **authorize** - Admin-only access
3. **authorizeRoles(...roles)** - Custom role-based access
4. **authorizeValuer** - Valuer and Admin access
5. **authorizeSiteEngineer** - Site Engineer and Admin access
6. **authorizeTechnicalEngineer** - Technical Engineer and Admin access
7. **authorizeOfficeEngineer** - Office Engineer and Admin access
8. **authorizeSalesTeam** - Sales Team and Admin access

### Usage Examples

```javascript
// Protect route with authentication only
router.get("/profile", authenticate, getUserProfile);

// Protect route with admin authorization
router.post("/create", authenticate, authorize, createReport);

// Protect route with specific role authorization
router.get("/valuer-dashboard", authenticate, authorizeValuer, getValuerDashboard);

// Protect route with multiple roles
router.get("/reports", authenticate, authorizeRoles('valuer', 'site-engineer', 'admin'), getReports);
```

## Frontend Integration

### 1. Store Token After Login
```javascript
// After successful login
const response = await fetch('/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
```

### 2. Fetch User Profile
```javascript
const token = localStorage.getItem('token');

const response = await fetch('/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
const profile = data.profile;

// Display only the profile for the user's role
if (profile.role === 'valuer') {
  // Show Valuer Profile UI
  displayValuerProfile(profile);
} else if (profile.role === 'site-engineer') {
  // Show Site Engineer Profile UI
  displaySiteEngineerProfile(profile);
}
// ... handle other roles
```

### 3. Conditional Rendering Based on Role
```javascript
// React example
function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setProfile(data.profile);
  };

  if (!profile) return <div>Loading...</div>;

  // Render role-specific profile
  switch(profile.role) {
    case 'valuer':
      return <ValuerProfile profile={profile} />;
    case 'site-engineer':
      return <SiteEngineerProfile profile={profile} />;
    case 'technical-engineer':
      return <TechnicalEngineerProfile profile={profile} />;
    case 'office-engineer':
      return <OfficeEngineerProfile profile={profile} />;
    case 'sales-team':
      return <SalesTeamProfile profile={profile} />;
    case 'admin':
      return <AdminProfile profile={profile} />;
    default:
      return <DefaultProfile profile={profile} />;
  }
}
```

## Security Features

1. **JWT Token Authentication** - Secure token-based authentication
2. **Role-Based Access Control** - Users can only access routes permitted for their role
3. **Password Hashing** - Passwords are hashed using bcrypt
4. **Token Expiration** - Tokens expire after 7 days
5. **Account Status Check** - Inactive accounts cannot access the system
6. **Profile Isolation** - Each role sees only their relevant profile data

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. This resource is only accessible to: valuer, admin"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

## Testing the Implementation

### Test with cURL

1. **Register a Valuer:**
```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Valuer",
    "email": "valuer@test.com",
    "password": "password123",
    "role": "valuer"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "valuer@test.com",
    "password": "password123"
  }'
```

3. **Get Profile (use token from login response):**
```bash
curl -X GET http://localhost:8080/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Best Practices

1. **Always validate tokens** on protected routes
2. **Check user role** before displaying UI components
3. **Store tokens securely** (use httpOnly cookies in production)
4. **Implement token refresh** for better UX
5. **Log out users** by removing tokens from storage
6. **Handle expired tokens** gracefully with redirect to login

## Conclusion

This role-based authentication system ensures that:
- ✅ Valuers only see Valuer Profile
- ✅ Site Engineers only see Site Engineer Profile
- ✅ Technical Engineers only see Technical Engineer Profile
- ✅ Office Engineers only see Office Engineer Profile
- ✅ Sales Team only see Sales Team Profile
- ✅ Admins have full access to all profiles and features

Each user is restricted to their role-specific permissions and accessible routes, providing a secure and organized system.