import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './SalesTeamReportViewer.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function SalesTeamReportViewer() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFileData();
  }, [fileId]);

  const fetchFileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/sales-team/document/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file data');
      }

      const result = await response.json();
      setFileData(result.data || result.document);
    } catch (err) {
      console.error('Error fetching file:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (fileData?.pdfFileUrl) {
      const link = document.createElement('a');
      link.href = fileData.pdfFileUrl;
      link.download = fileData.originalFileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error Loading Report</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/salesteam')} className={styles.backBtn}>
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>File Not Found</h2>
          <p>The requested file could not be found.</p>
          <button onClick={() => navigate('/salesteam')} className={styles.backBtn}>
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header - Hidden in print */}
      <div className={styles.header}>
        <button onClick={() => navigate('/salesteam')} className={styles.backBtn}>
          ← Back to Profile
        </button>
        <div className={styles.actions}>
          <button onClick={handlePrint} className={styles.printBtn}>
            🖨️ Print
          </button>
          <button onClick={handleDownload} className={styles.downloadBtn}>
            ⬇️ Download
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className={styles.reportContainer}>
        <div className={styles.reportHeader}>
          <h1 className={styles.reportTitle}>Sales Team Document Report</h1>
          <div className={styles.reportMeta}>
            <p><strong>Document ID:</strong> {fileData._id}</p>
            <p><strong>Uploaded Date:</strong> {new Date(fileData.uploadedAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>

        <div className={styles.reportSection}>
          <h2 className={styles.sectionTitle}>Document Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Document Title:</span>
              <span className={styles.infoValue}>{fileData.documentTitle || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>File Name:</span>
              <span className={styles.infoValue}>{fileData.originalFileName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>File Size:</span>
              <span className={styles.infoValue}>
                {fileData.fileSizeFormatted || `${(fileData.fileSize / 1024).toFixed(2)} KB`}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Document Type:</span>
              <span className={styles.infoValue}>{fileData.documentType || 'sales-report'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Uploaded By:</span>
              <span className={styles.infoValue}>{fileData.uploadedBy || 'Sales Team'}</span>
            </div>
            {fileData.description && (
              <div className={styles.infoItem} style={{gridColumn: '1 / -1'}}>
                <span className={styles.infoLabel}>Description:</span>
                <span className={styles.infoValue}>{fileData.description}</span>
              </div>
            )}
          </div>
        </div>

        {fileData.tags && fileData.tags.length > 0 && (
          <div className={styles.reportSection}>
            <h2 className={styles.sectionTitle}>Tags</h2>
            <div className={styles.tagsList}>
              {fileData.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        <div className={styles.reportSection}>
          <h2 className={styles.sectionTitle}>Document Preview</h2>
          <div className={styles.pdfViewer}>
            <iframe
              src={fileData.pdfFileUrl}
              title="PDF Document"
              className={styles.pdfFrame}
            />
          </div>
          <div className={styles.viewerActions}>
            <a
              href={fileData.pdfFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openNewTabBtn}
            >
              🔗 Open in New Tab
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.reportFooter}>
          <p>Generated on: {new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p>Sales Team Document Management System</p>
        </div>
      </div>
    </div>
  );
}
