import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/nav/Navbar';
import styles from './SiteEngineerReports.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function SiteEngineerReports() {
  const [activeTab, setActiveTab] = useState('drafts');
  const [drafts, setDrafts] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Fetch draft reports
      const draftResponse = await fetch(`${API_BASE_URL}/ausmall-finance-form/all?status=draft&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (draftResponse.ok) {
        const draftData = await draftResponse.json();
        setDrafts(draftData.forms || []);
      }

      // Fetch submitted reports
      const submittedResponse = await fetch(`${API_BASE_URL}/ausmall-finance-form/all?status=submitted&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (submittedResponse.ok) {
        const submittedData = await submittedResponse.json();
        setSubmitted(submittedData.forms || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      alert('Error loading reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditReport = (formId) => {
    navigate('/ausmallfinanceform', { state: { formId } });
  };

  const handleViewReport = (formId) => {
    navigate('/ausmallfinance-report', { state: { formId } });
  };

  const handleDeleteReport = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/ausmall-finance-form/${formId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Report deleted successfully');
        fetchReports();
      } else {
        alert('Failed to delete report');
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert('Error deleting report');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderReportCard = (report, isDraft = true) => {
    // Extract applicant name from various possible field names
    const applicantName = report.applicantName ||
                         report.applicantsName ||
                         report.ApplicantsNames ||
                         report.currentOwnerSellerName ||
                         report.NameofCurrentOwnerSeller ||
                         'Unnamed Report';
    
    // Extract property address from various possible field names
    const propertyAddress = report.propertyAddress ||
                           report.addressAsPerTRF ||
                           report.AddressAsperTRF ||
                           report.addressAsPerActualSite ||
                           report.AddressasperActualAtsite ||
                           'N/A';
    
    // Extract loan amount from various possible field names
    const loanAmount = report.loanAmount || report.LoanAmount || null;
    
    return (
      <div key={report._id} className={styles.reportCard}>
        <div className={styles.reportHeader}>
          <h4>{applicantName}</h4>
          <span className={`${styles.statusBadge} ${styles[report.status]}`}>
            {report.status}
          </span>
        </div>
        <div className={styles.reportDetails}>
         <p><strong>Property Address:</strong> {propertyAddress}</p>           
          <p><strong>Loan Amount:</strong> {loanAmount ? `₹${loanAmount.toLocaleString('en-IN')}` : 'N/A'}</p>
          <p><strong>Created:</strong> {formatDate(report.createdAt)}</p>
          <p><strong>Last Updated:</strong> {formatDate(report.updatedAt)}</p>
        </div>
        <div className={styles.reportActions}>
          {isDraft ? (
            <>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteReport(report._id)}
              >
                🗑️ Delete
              </button>
              <button
                className={styles.editBtn}
                onClick={() => handleEditReport(report._id)}
              >
                📝 Edit
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.viewBtn}
                onClick={() => handleViewReport(report._id)}
              >
                👁️ View
              </button>
              <button
                className={styles.editBtn}
                onClick={() => handleEditReport(report._id)}
              >
                📝 Edit
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          ← Back
        </button>
        <h1 className={styles.pageTitle}>My Reports</h1>
        <button
          className={styles.createBtn}
          onClick={() => navigate('/select-banks')}
        >
          + Create New Report
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'drafts' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('drafts')}
        >
          📋 Drafts ({drafts.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'submitted' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('submitted')}
        >
          ✅ Submitted ({submitted.length})
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading reports...</p>
          </div>
        ) : (
          <>
            {activeTab === 'drafts' && (
              <div className={styles.reportsSection}>
                {drafts.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyIcon}>📋</p>
                    <h3>No Draft Reports</h3>
                    <p>You haven't saved any draft reports yet.</p>
                    <button
                      className={styles.createNewBtn}
                      onClick={() => navigate('/select-banks')}
                    >
                      Create Your First Report
                    </button>
                  </div>
                ) : (
                  <div className={styles.reportsGrid}>
                    {drafts.map(report => renderReportCard(report, true))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submitted' && (
              <div className={styles.reportsSection}>
                {submitted.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyIcon}>✅</p>
                    <h3>No Submitted Reports</h3>
                    <p>You haven't submitted any reports yet.</p>
                    <button
                      className={styles.createNewBtn}
                      onClick={() => navigate('/select-banks')}
                    >
                      Create and Submit a Report
                    </button>
                  </div>
                ) : (
                  <div className={styles.reportsGrid}>
                    {submitted.map(report => renderReportCard(report, false))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.refreshSection}>
        <button
          className={styles.refreshBtn}
          onClick={fetchReports}
          disabled={loading}
        >
          {loading ? '⟳ Loading...' : '↻ Refresh Reports'}
        </button>
        </div>
      </div>
    </>
  );
}

// Made with Bob