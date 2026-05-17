import React, { useState, useEffect } from 'react';
import styles from './TechnicalReportsView.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function TechnicalReportsView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTechnicalReports();
  }, []);

  const fetchTechnicalReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/technical-reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Failed to fetch technical reports (${response.status})`);
      }
      setLoading(false);
    } catch (err) {
      setError('Error loading technical reports: ' + err.message);
      setLoading(false);
    }
  };

  const handleDownload = async (reportId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/technical-reports/download/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // In a real implementation, this would trigger actual file download
        // For now, we'll show the download URL
        window.open(data.downloadUrl, '_blank');
        alert(`Download initiated: ${fileName}`);
      } else {
        alert('Failed to download report');
      }
    } catch (error) {
      alert('Error downloading report');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading technical reports...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Technical Engineer Reports</h3>
      
      {reports.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No technical reports available</p>
        </div>
      ) : (
        <div className={styles.reportsList}>
          {reports.map((report) => (
            <div key={report._id} className={styles.reportCard}>
              <div className={styles.reportIcon}>📄</div>
              <div className={styles.reportInfo}>
                <h4 className={styles.reportTitle}>{report.fileName || 'Technical Report'}</h4>
                <p className={styles.reportMeta}>
                  <span>Uploaded by: {report.uploadedBy || 'Technical Engineer'}</span>
                  <span>Date: {formatDate(report.uploadedAt)}</span>
                </p>
                {report.propertyAddress && (
                  <p className={styles.reportAddress}>
                    Property: {report.propertyAddress}
                  </p>
                )}
                {report.fileSize && (
                  <p className={styles.reportSize}>
                    Size: {(report.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDownload(report._id, report.fileName)}
                className={styles.downloadButton}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Made with Bob