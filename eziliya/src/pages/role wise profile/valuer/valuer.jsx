import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styles from './valuer.module.css'
import ReportWorkflow from '../../../components/report/ReportWorkflow'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function Valuer() {
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showAuSmallForms, setShowAuSmallForms] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [auSmallForms, setAuSmallForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formsLoading, setFormsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportCounts();
    fetchAuSmallForms();
  }, []);

  const fetchReportCounts = async () => {
    try {
      // Get counts from localStorage (client-side only, no backend)
      const savedForms = localStorage.getItem('auSmallFinanceForms');
      if (savedForms) {
        const forms = JSON.parse(savedForms);
        const completed = forms.filter(form => form.status === 'submitted' || form.status === 'completed');
        const pending = forms.filter(form => form.status === 'draft' || form.status === 'pending');
        setCompletedCount(completed.length);
        setPendingCount(pending.length);
      } else {
        setCompletedCount(0);
        setPendingCount(0);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch report counts:', err);
      setCompletedCount(0);
      setPendingCount(0);
      setLoading(false);
    }
  };

  const fetchAuSmallForms = async () => {
    setFormsLoading(true);
    try {
      // Check localStorage for saved forms (client-side only, no backend)
      const savedForms = localStorage.getItem('auSmallFinanceForms');
      if (savedForms) {
        const forms = JSON.parse(savedForms);
        setAuSmallForms(forms.filter(form => form.status === 'draft'));
      } else {
        setAuSmallForms([]);
      }
    } catch (err) {
      console.error('Failed to fetch AU Small Finance forms:', err);
      setAuSmallForms([]);
    } finally {
      setFormsLoading(false);
    }
  };

  const handleContinueForm = (formId) => {
    navigate('/ausmallfinanceform', { state: { formId } });
  };

  const handleDeleteForm = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      // Delete from localStorage (client-side only, no backend)
      const savedForms = localStorage.getItem('auSmallFinanceForms');
      if (savedForms) {
        const forms = JSON.parse(savedForms);
        const updatedForms = forms.filter(form => form._id !== formId);
        localStorage.setItem('auSmallFinanceForms', JSON.stringify(updatedForms));
        alert('Draft deleted successfully');
        fetchAuSmallForms(); // Refresh the list
      }
    } catch (err) {
      console.error('Failed to delete form:', err);
      alert('Error deleting draft');
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Valuer Profile</h1>
        <Link to="/" className={styles.homeLink}>Home</Link>
      </div>

      <div className={styles.profileSection}>
        <h2>Welcome, Valuer</h2>
        <p>As a Valuer, you review complete reports from Office and Site Engineers and create final valuation reports.</p>
        
        {/* Report Statistics */}
        <div className={styles.statsSection}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📋</div>
            <div className={styles.statContent}>
              <h3>{loading ? '...' : pendingCount}</h3>
              <p>Pending Reports</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <h3>{loading ? '...' : completedCount}</h3>
              <p>Completed Reports</p>
            </div>
          </div>
        </div>

        <div className={styles.actionSection}>
          <h3>Quick Actions</h3>
          <p>Manage your reports and create new valuations:</p>
          <div className={styles.actionButtons}>
            <button
              className={styles.selectBankBtn}
              onClick={() => navigate('/valuer/reports')}
            >
              📋 My Reports
            </button>
            <button
              className={styles.selectBankBtn}
              onClick={() => navigate('/valuer/select-bank')}
            >
              ➕ Create New Report
            </button>
          </div>
        </div>

        <div className={styles.workflowToggle}>
          <button
            className={styles.toggleBtn}
            onClick={() => setShowWorkflow(!showWorkflow)}
          >
            {showWorkflow ? 'Hide' : 'Show'} Pending Reports & Workflow
          </button>
          <button
            className={styles.toggleBtn}
            onClick={() => setShowAuSmallForms(!showAuSmallForms)}
          >
            {showAuSmallForms ? 'Hide' : 'Show'} AU Small Finance Drafts ({auSmallForms.length})
          </button>
        </div>

        {showWorkflow && (
          <div className={styles.workflowSection}>
            <ReportWorkflow userRole="valuer" />
          </div>
        )}

        {showAuSmallForms && (
          <div className={styles.auSmallFormsSection}>
            <div className={styles.sectionHeader}>
              <h3>AU Small Finance - Saved Drafts</h3>
              <button
                className={styles.refreshBtn}
                onClick={fetchAuSmallForms}
                disabled={formsLoading}
              >
                {formsLoading ? '⟳ Loading...' : '↻ Refresh'}
              </button>
            </div>
            {formsLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading forms...</p>
              </div>
            ) : auSmallForms.length === 0 ? (
              <div className={styles.noFormsContainer}>
                <p className={styles.noForms}>📋 No saved drafts found.</p>
                <p className={styles.noFormsHint}>Create a new AU Small Finance form and click "Save Draft" to see it here.</p>
                <button
                  className={styles.createNewBtn}
                  onClick={() => navigate('/select-banks')}
                >
                  + Create New Form
                </button>
              </div>
            ) : (
              <div className={styles.formsGrid}>
                {auSmallForms.map((form) => (
                  <div key={form._id} className={styles.formCard}>
                    <div className={styles.formHeader}>
                      <h4>{form.applicantName}</h4>
                      <span className={`${styles.statusBadge} ${styles[form.status]}`}>
                        {form.status}
                      </span>
                    </div>
                    <div className={styles.formDetails}>
                      <p><strong>Property:</strong> {form.propertyAddress}</p>
                      <p><strong>Loan Amount:</strong> ₹{form.loanAmount?.toLocaleString('en-IN') || 'N/A'}</p>
                      <p><strong>Created:</strong> {formatDate(form.createdAt)}</p>
                      <p><strong>Last Updated:</strong> {formatDate(form.updatedAt)}</p>
                    </div>
                    <div className={styles.formActions}>
                      <button
                        className={styles.continueBtn}
                        onClick={() => handleContinueForm(form._id)}
                      >
                        Continue Editing
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteForm(form._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.infoSection}>
          <h3>Your Responsibilities:</h3>
          <ul>
            <li>Review reports from Office and Site Engineers</li>
            <li>Analyze property details and site inspection data</li>
            <li>Conduct final property valuations</li>
            <li>Prepare comprehensive technical valuation reports</li>
            <li>Create final reports combining all data</li>
            <li>Submit completed reports to banks</li>
            <li>Maintain accuracy and compliance with regulations</li>
          </ul>
        </div>

        <div className={styles.workflowInfo}>
          <h3>Report Workflow:</h3>
          <div className={styles.flowSteps}>
            <div className={styles.flowStep}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Office Engineer</h4>
                <p>Creates initial report with property details</p>
              </div>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowStep}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Site Engineer</h4>
                <p>Adds field inspection data and photographs</p>
              </div>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={`${styles.flowStep} ${styles.activeStep}`}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Valuer (You)</h4>
                <p>Review all data and create final valuation report</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


