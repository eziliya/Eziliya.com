import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './technicalengineer.module.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function Technicalengineer() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [propertyAddress, setPropertyAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [applicantName, setApplicantName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    } else {
      alert('Please upload a PDF file only');
    }
  };

  const handleSubmitReport = async () => {
    if (!uploadedFile) {
      alert('Please select a PDF file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        setIsUploading(false);
        return;
      }

      const userName = localStorage.getItem('userName') || 'Technical Engineer';
      
     

      const response = await fetch(`${API_BASE_URL}/technical-reports/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        alert('Technical report uploaded successfully!');
        setUploadedFile(null);
        setPropertyAddress('');
        setBankName('');
        setApplicantName('');
      } else {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        alert(`Upload failed (${response.status}): ${error.message}`);
      }
    } catch (error) {
      alert('Error uploading report: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Technical Engineer Profile</h1>
        <Link to="/" className={styles.homeLink}>Home</Link>
      </div>

      <div className={styles.profileSection}>
        <h2>Welcome, Technical Engineer</h2>
        <p>As a Technical Engineer, you can perform technical assessments and create comprehensive reports for various banks.</p>
        
        <div className={styles.actionSection}>
          <h3>Create Report</h3>
          <p>Select a bank to create a technical assessment report:</p>
          <Link to="/select-banks" className={styles.selectBankBtn}>
            Select Bank Template
          </Link>
        </div>

        <div className={styles.uploadSection}>
          <h3>Upload Technical Report</h3>
          <p>Upload your completed technical assessment report (PDF format):</p>
          
          <div className={styles.uploadContainer}>
            

         

            <input
              type="file"
              id="technicalReportUpload"
              accept=".pdf"
              onChange={handleFileUpload}
              className={styles.fileInput}
            />
            <label htmlFor="technicalReportUpload" className={styles.fileLabel}>
              {uploadedFile ? uploadedFile.name : 'Choose PDF File'}
            </label>
            
            {uploadedFile && (
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>
                  📄 {uploadedFile.name}
                </span>
                <span className={styles.fileSize}>
                  ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
            
            <button
              onClick={handleSubmitReport}
              disabled={!uploadedFile || isUploading}
              className={styles.uploadButton}
            >
              {isUploading ? 'Uploading...' : 'Upload Report'}
            </button>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h3>Your Responsibilities:</h3>
          <ul>
            <li>Conduct technical property assessments</li>
            <li>Evaluate structural integrity</li>
            <li>Review construction specifications</li>
            <li>Verify compliance with building codes</li>
            <li>Prepare detailed technical reports</li>
            <li>Provide recommendations and risk assessments</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
