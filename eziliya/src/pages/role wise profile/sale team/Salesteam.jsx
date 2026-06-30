import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './salesteam.module.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function Salesteam() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Get userId from localStorage on component mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user._id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch user's uploaded files
  const fetchUploadedFiles = async () => {
    if (!userId) {
      console.log('⚠️ No userId available, skipping fetch');
      return;
    }
    
    setLoadingFiles(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const fetchUrl = `${apiUrl}/sales-team/documents?userId=${userId}`;
      
      console.log('📡 Fetching uploaded files from:', fetchUrl);
      console.log('👤 User ID:', userId);
      console.log('🔑 Token exists:', !!token);
      
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Files fetched:', result.data?.length || result.documents?.length || 0);
        setUploadedFiles(result.data || result.documents || []);
      } else {
        console.error('❌ Response not OK:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching uploaded files:', error);
      console.error('💡 Make sure backend server is running on:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
      // Don't show error to user, just log it
    } finally {
      setLoadingFiles(false);
    }
  };

  // Fetch files when userId is available
  useEffect(() => {
    if (userId) {
      fetchUploadedFiles();
    }
  }, [userId]);

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file only');
      e.target.value = '';
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setUploading(true);

    try {
      // Get authentication token, user data, and contact number
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const MobileRegisterNumber = localStorage.getItem('MobileRegisterNumber');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        setUploading(false);
        return;
      }

      // Get userId from localStorage
      let currentUserId = userId; // From state
      if (!currentUserId && userStr) {
        try {
          const user = JSON.parse(userStr);
          currentUserId = user._id;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      if (!currentUserId && !MobileRegisterNumber) {
        alert('User identification not found. Please login again.');
        setUploading(false);
        return;
      }

      console.log('📤 Uploading with userId:', currentUserId);
      console.log('📱 Mobile Register Number:', MobileRegisterNumber);

      // Create FormData to send file with user identification
      const formData = new FormData();
      formData.append('pdfFile', file);
      formData.append('documentTitle', `Sales Team - ${file.name}`);
      formData.append('documentType', 'sales-report');
      formData.append('description', 'Sales team uploaded document');
      formData.append('uploadedBy', 'sales-team');
      
      // IMPORTANT: Add userId to associate document with user
      if (currentUserId) {
        formData.append('userId', currentUserId);
      }
      
      if (MobileRegisterNumber) {
        formData.append('MobileRegisterNumber', MobileRegisterNumber);
        formData.append('firmRegisteredMobileNumber', MobileRegisterNumber);
      }
      
      formData.append('tags', JSON.stringify(['sales-team', 'uploaded-document']));

      // Use same API base URL pattern as technical engineer
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      
      // Send to backend API with Authorization header
      const response = await fetch(`${apiUrl}/sales-team/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('PDF uploaded successfully!\nFile: ' + file.name);
        // Reset file input
        e.target.value = '';
        // Refresh uploaded files list
        fetchUploadedFiles();
      } else {
        alert(`Upload failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading PDF: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Sales Team Profile</h1>
        <Link to="/" className={styles.homeLink}>Home</Link>
      </div>

      <div className={styles.profileSection}>
        <h2>Welcome, Sales Team Member</h2>
        <p>As a Sales Team member, you can initiate loan applications and upload documents.</p>
        
        <div className={styles.actionSection}>
          <h3>Quick Actions</h3>
          <div className={styles.buttonGroup}>
            <Link
              to={userId ? `/salesteam/${userId}/form` : '/salesteam/form'}
              className={styles.primaryBtn}
            >
              📝 Create Customer Application
            </Link>
            <button
              className={styles.secondaryBtn}
              onClick={() => document.getElementById('pdfUploadInput').click()}
              disabled={uploading}
            >
              {uploading ? '⏳ Uploading...' : '📤 Upload PDF File'}
            </button>
            <input
              id="pdfUploadInput"
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={handlePdfUpload}
            />
          </div>
        </div>

        {/* My Uploaded Files Section */}
        <div className={styles.uploadedFilesSection}>
          <h3>My Uploaded Files</h3>
          {loadingFiles ? (
            <div className={styles.loading}>
              <p>Loading files...</p>
            </div>
          ) : uploadedFiles.length === 0 ? (
            <div className={styles.noFiles}>
              <p>No files uploaded yet.</p>
              <p style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
                Upload a PDF file to see it here.
              </p>
            </div>
          ) : (
            <div className={styles.filesGrid}>
              {uploadedFiles.map((file) => (
                <div key={file._id} className={styles.fileCard}>
                  <div className={styles.fileIcon}>📄</div>
                  <div className={styles.fileInfo}>
                    <h4>{file.documentTitle || file.originalFileName}</h4>
                    <p className={styles.fileName}>{file.originalFileName}</p>
                    <p className={styles.fileSize}>
                      {file.fileSizeFormatted || `${(file.fileSize / 1024).toFixed(2)} KB`}
                    </p>
                    <p className={styles.fileDate}>
                      Uploaded: {new Date(file.uploadedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className={styles.fileActions}>
                    <a
                      href={file.pdfFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewBtn}
                    >
                      👁️ View PDF
                    </a>
                    <a
                      href={file.pdfFileUrl}
                      download={file.originalFileName}
                      className={styles.downloadBtn}
                    >
                      ⬇️ Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

