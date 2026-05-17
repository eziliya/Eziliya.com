# Profile Photo Upload API Guide

This guide explains how to use the profile photo upload functionality in the Eziliya backend system.

## Overview

The profile photo upload feature allows users to:
- Upload a profile photo (stored in AWS S3)
- Delete their profile photo
- Retrieve profile photo URLs
- Automatic deletion of old photos when uploading new ones

## Features

✅ **Secure Upload**: Only authenticated users can upload/delete photos
✅ **Image Validation**: Accepts only JPEG, PNG, GIF, and WebP formats
✅ **Size Limit**: Maximum 5MB per image
✅ **AWS S3 Storage**: Photos stored in `eziliyareport/eziliya/profile-photos/`
✅ **Auto Cleanup**: Old photos automatically deleted when new ones are uploaded
✅ **Permission Control**: Users can only manage their own photos (admins can manage all)

## Database Schema Update

The User model now includes a `profilePhoto` field:

```javascript
{
  name: String,
  contactNumber: String,
  password: String,
  role: String,
  phone: String,
  profilePhoto: String,  // NEW: URL to profile photo in S3
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### 1. Upload Profile Photo

**Endpoint:** `POST /uploadProfilePhoto/:userId`

**Authentication:** Required (JWT token)

**Authorization:** User can upload their own photo, or admin can upload for any user

**Content-Type:** `multipart/form-data`

**Request Parameters:**
- `userId` (URL parameter): The ID of the user

**Request Body:**
- `profilePhoto` (file): Image file (JPEG, PNG, GIF, or WebP)

**Example Request (JavaScript/Fetch):**
```javascript
const formData = new FormData();
formData.append('profilePhoto', fileInput.files[0]);

const response = await fetch(`http://localhost:3000/uploadProfilePhoto/${userId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
```

**Example Request (cURL):**
```bash
curl -X POST \
  http://localhost:3000/uploadProfilePhoto/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePhoto=@/path/to/image.jpg"
```

**Success Response (200):**
```json
{
  "message": "Profile photo uploaded successfully",
  "profilePhoto": "https://eziliyareport.s3.amazonaws.com/eziliya/profile-photos/1234567890-image.jpg",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "contactNumber": "9876543210",
    "role": "valuer",
    "phone": "9876543210",
    "profilePhoto": "https://eziliyareport.s3.amazonaws.com/eziliya/profile-photos/1234567890-image.jpg",
    "isActive": true
  }
}
```

**Error Responses:**

400 - No file uploaded:
```json
{
  "message": "No file uploaded. Please select an image file."
}
```

400 - Invalid file type:
```json
{
  "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
}
```

400 - File too large:
```json
{
  "message": "File size exceeds 5MB limit"
}
```

403 - Permission denied:
```json
{
  "message": "You don't have permission to update this user's profile photo"
}
```

404 - User not found:
```json
{
  "message": "User not found"
}
```

---

### 2. Delete Profile Photo

**Endpoint:** `DELETE /deleteProfilePhoto/:userId`

**Authentication:** Required (JWT token)

**Authorization:** User can delete their own photo, or admin can delete for any user

**Request Parameters:**
- `userId` (URL parameter): The ID of the user

**Example Request (JavaScript/Fetch):**
```javascript
const response = await fetch(`http://localhost:3000/deleteProfilePhoto/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

**Example Request (cURL):**
```bash
curl -X DELETE \
  http://localhost:3000/deleteProfilePhoto/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "message": "Profile photo deleted successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "contactNumber": "9876543210",
    "role": "valuer",
    "phone": "9876543210",
    "profilePhoto": "",
    "isActive": true
  }
}
```

**Error Responses:**

403 - Permission denied:
```json
{
  "message": "You don't have permission to delete this user's profile photo"
}
```

404 - User not found:
```json
{
  "message": "User not found"
}
```

404 - No photo to delete:
```json
{
  "message": "No profile photo to delete"
}
```

---

### 3. Get Profile Photo

**Endpoint:** `GET /getProfilePhoto/:userId`

**Authentication:** Not required (Public endpoint)

**Request Parameters:**
- `userId` (URL parameter): The ID of the user

**Example Request (JavaScript/Fetch):**
```javascript
const response = await fetch(`http://localhost:3000/getProfilePhoto/${userId}`);
const data = await response.json();
```

**Example Request (cURL):**
```bash
curl -X GET http://localhost:3000/getProfilePhoto/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "message": "Profile photo retrieved successfully",
  "profilePhoto": "https://eziliyareport.s3.amazonaws.com/eziliya/profile-photos/1234567890-image.jpg",
  "userName": "John Doe"
}
```

**Response when no photo:**
```json
{
  "message": "Profile photo retrieved successfully",
  "profilePhoto": null,
  "userName": "John Doe"
}
```

**Error Response:**

404 - User not found:
```json
{
  "message": "User not found"
}
```

---

## Frontend Integration Examples

### React Component Example

```jsx
import React, { useState } from 'react';

const ProfilePhotoUpload = ({ userId, token }) => {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await fetch(`http://localhost:3000/uploadProfilePhoto/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setPhotoUrl(data.profilePhoto);
        alert('Profile photo uploaded successfully!');
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your profile photo?')) return;

    try {
      const response = await fetch(`http://localhost:3000/deleteProfilePhoto/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setPhotoUrl('');
        alert('Profile photo deleted successfully!');
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete photo');
    }
  };

  return (
    <div className="profile-photo-upload">
      {photoUrl && (
        <div className="photo-preview">
          <img src={photoUrl} alt="Profile" style={{ width: 150, height: 150, borderRadius: '50%' }} />
          <button onClick={handleDelete}>Delete Photo</button>
        </div>
      )}
      
      <div className="upload-section">
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && <p>Uploading...</p>}
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;
```

### Display Profile Photo

```jsx
const ProfilePhoto = ({ userId }) => {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`http://localhost:3000/getProfilePhoto/${userId}`);
        const data = await response.json();
        setPhotoUrl(data.profilePhoto);
      } catch (error) {
        console.error('Error fetching photo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <img
      src={photoUrl || '/default-avatar.png'}
      alt="Profile"
      style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
    />
  );
};
```

---

## File Validation

### Accepted File Types
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### File Size Limit
- Maximum: 5MB (5,242,880 bytes)

### Validation Errors
The API will reject files that:
- Are not image files
- Exceed the 5MB size limit
- Have invalid MIME types

---

## AWS S3 Storage Structure

Profile photos are stored in AWS S3 with the following structure:

```
eziliyareport (bucket)
└── eziliya/
    └── profile-photos/
        ├── 1715774400000-john_doe.jpg
        ├── 1715774500000-jane_smith.png
        └── ...
```

**Naming Convention:**
- Format: `{timestamp}-{sanitized-filename}`
- Example: `1715774400000-profile_photo.jpg`

**File Permissions:**
- ACL: `public-read`
- Files are publicly accessible via their URLs

---

## Security Considerations

1. **Authentication Required**: Upload and delete operations require valid JWT token
2. **Authorization Check**: Users can only manage their own photos (except admins)
3. **File Type Validation**: Only image files are accepted
4. **Size Limit**: 5MB maximum to prevent abuse
5. **Sanitized Filenames**: Special characters removed to prevent injection attacks
6. **Unique Filenames**: Timestamp prefix prevents filename collisions

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (invalid input, file type, or size)
- `401`: Unauthorized (invalid or missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found (user or photo doesn't exist)
- `500`: Internal server error

---

## Testing

### Test Upload with Postman

1. Create a new POST request to `http://localhost:3000/uploadProfilePhoto/{userId}`
2. Add Authorization header: `Bearer YOUR_JWT_TOKEN`
3. In Body tab, select `form-data`
4. Add key `profilePhoto` with type `File`
5. Select an image file
6. Send request

### Test with cURL

```bash
# Upload photo
curl -X POST \
  http://localhost:3000/uploadProfilePhoto/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePhoto=@/path/to/image.jpg"

# Delete photo
curl -X DELETE \
  http://localhost:3000/deleteProfilePhoto/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get photo (no auth required)
curl -X GET \
  http://localhost:3000/getProfilePhoto/507f1f77bcf86cd799439011
```

---

## Troubleshooting

### Common Issues

**Issue: "Invalid file type" error**
- Solution: Ensure file is JPEG, PNG, GIF, or WebP format

**Issue: "File size exceeds 5MB limit"**
- Solution: Compress or resize image before uploading

**Issue: "You don't have permission"**
- Solution: Verify you're uploading to your own userId or have admin role

**Issue: "S3 Upload failed"**
- Solution: Check AWS credentials in config.mjs and .env file

**Issue: Old photo not deleted**
- Solution: Check S3 permissions and bucket configuration

---

## Best Practices

1. **Image Optimization**: Compress images before upload to reduce file size
2. **Aspect Ratio**: Use square images (1:1) for best display
3. **Error Handling**: Always handle upload errors gracefully in frontend
4. **Loading States**: Show loading indicators during upload/delete operations
5. **Default Images**: Provide fallback images when user has no profile photo
6. **Caching**: Consider caching profile photo URLs to reduce API calls

---

## Future Enhancements

Potential improvements for the profile photo feature:

- [ ] Image cropping/resizing on upload
- [ ] Multiple photo sizes (thumbnail, medium, large)
- [ ] Image compression before S3 upload
- [ ] Progress tracking for large uploads
- [ ] Batch upload support
- [ ] Photo moderation/approval workflow
- [ ] CDN integration for faster delivery

---

## Support

For issues or questions about the profile photo upload feature:
- Check the error messages in API responses
- Review the console logs for detailed error information
- Verify AWS S3 credentials and permissions
- Ensure multer is properly installed (`npm install multer`)

---

**Last Updated:** 2026-05-15
**Version:** 1.0.0