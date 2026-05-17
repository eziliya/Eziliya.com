import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ReportWorkflow.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function ReportWorkflow({ userRole }) {
  const [pendingReports, setPendingReports] = useState([]);
  const [completedReports, setCompletedReports] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch pending reports
      const pendingResponse = await fetch(`${API_BASE_URL}/pending-reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingReports(pendingData.reports || []);
      }

      // Fetch completed reports
      const completedResponse = await fetch(`${API_BASE_URL}/completed-reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (completedResponse.ok) {
        const completedData = await completedResponse.json();
        setCompletedReports(completedData.reports || []);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reports');
      setLoading(false);
    }
  };

  const handleReportClick = (report) => {
    // Navigate to appropriate form based on user role and report status
    if (userRole === 'office-engineer') {
      navigate('/select-banks', { state: { reportId: report._id } });
    } else if (userRole === 'site-engineer') {
      navigate('/select-banks', { state: { reportId: report._id, reportData: report } });
    } else if (userRole === 'valuer') {
      navigate('/select-banks', { state: { reportId: report._id, reportData: report } });
    } else if (userRole === 'sales-team') {
      // Sales team can view report details
      navigate(`/report-view/${report._id}`);
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

  const getStatusBadge = (status) => {
    const statusMap = {
      'draft': { label: 'Draft', class: styles.statusDraft },
      'office_engineer_pending': { label: 'Office Engineer', class: styles.statusOffice },
      'site_engineer_pending': { label: 'Site Engineer', class: styles.statusSite },
      'valuer_pending': { label: 'Valuer', class: styles.statusValuer },
      'completed': { label: 'Completed', class: styles.statusCompleted }
    };
    
    const statusInfo = statusMap[status] || { label: status, class: '' };
    return <span className={`${styles.statusBadge} ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return <div className={styles.loading}>Loading reports...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.workflowContainer}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Reports ({pendingReports.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'completed' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed Reports ({completedReports.length})
        </button>
      </div>

      <div className={styles.reportsContent}>
        {activeTab === 'pending' && (
          <div className={styles.reportsList}>
            {pendingReports.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No pending reports</p>
              </div>
            ) : (
              pendingReports.map((report) => (
                <div key={report._id} className={styles.reportCard}>
                  <div className={styles.reportHeader}>
                    <h3>{report.taskTitle}</h3>
                    {getStatusBadge(report.workflowStatus)}
                  </div>
                  <div className={styles.reportDetails}>
                    <p><strong>Bank:</strong> {report.bankName || 'Not specified'}</p>
                    <p><strong>Property Type:</strong> {report.propertyType}</p>
                    <p><strong>Address:</strong> {report.address}</p>
                    <p><strong>Created:</strong> {formatDate(report.createdAt)}</p>
                    {report.adminInstructions && (
                      <p><strong>Instructions:</strong> {report.adminInstructions}</p>
                    )}
                  </div>
                  <button 
                    className={styles.actionButton}
                    onClick={() => handleReportClick(report)}
                  >
                    Process Report
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className={styles.reportsList}>
            {completedReports.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No completed reports</p>
              </div>
            ) : (
              completedReports.map((report) => (
                <div key={report._id} className={styles.reportCard}>
                  <div className={styles.reportHeader}>
                    <h3>{report.taskTitle}</h3>
                    {getStatusBadge(report.workflowStatus)}
                  </div>
                  <div className={styles.reportDetails}>
                    <p><strong>Bank:</strong> {report.bankName || 'Not specified'}</p>
                    <p><strong>Property Type:</strong> {report.propertyType}</p>
                    <p><strong>Address:</strong> {report.address}</p>
                    <p><strong>Completed:</strong> {formatDate(report.completedAt)}</p>
                    <p><strong>Office Engineer:</strong> {formatDate(report.officeEngineerSubmittedAt)}</p>
                    <p><strong>Site Engineer:</strong> {formatDate(report.siteEngineerSubmittedAt)}</p>
                    <p><strong>Valuer:</strong> {formatDate(report.valuerSubmittedAt)}</p>
                  </div>
                  <button 
                    className={styles.viewButton}
                    onClick={() => navigate(`/report-view/${report._id}`)}
                  >
                    View Full Report
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
