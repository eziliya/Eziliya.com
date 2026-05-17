import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Siteengineer.module.css'
import ReportWorkflow from '../../../components/report/ReportWorkflow'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function Siteengineer() {
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportCounts();
  }, []);

  const fetchReportCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch completed reports count
      const completedResponse = await fetch(`${API_BASE_URL}/completed-reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (completedResponse.ok) {
        const completedData = await completedResponse.json();
        setCompletedCount(completedData.reports?.length || 0);
      }

      // Fetch pending reports count
      const pendingResponse = await fetch(`${API_BASE_URL}/pending-reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingCount(pendingData.reports?.length || 0);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch report counts:', err);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Site Engineer Profile</h1>
      </div>

      <div className={styles.profileSection}>
        <h2>Welcome, Site Engineer</h2>
        <p>As a Site Engineer, you conduct site visits and add field inspection details to reports from Office Engineers.</p>
        
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
          <p>Manage your reports and site inspections:</p>
          <div className={styles.actionButtons}>
            <button
              className={styles.selectBankBtn}
              onClick={() => navigate('/site-engineer/reports')}
            >
              📋 My Reports
            </button>
            <button
              className={styles.selectBankBtn}
              onClick={() => navigate('/select-banks')}
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
        </div>

        {showWorkflow && (
          <div className={styles.workflowSection}>
            <ReportWorkflow userRole="site-engineer" />
          </div>
        )}

        <div className={styles.infoSection}>
          <h3>Your Responsibilities:</h3>
          <ul>
            <li>Review reports submitted by Office Engineers</li>
            <li>Conduct on-site property inspections</li>
            <li>Take photographs and measurements</li>
            <li>Verify property boundaries and specifications</li>
            <li>Assess construction quality and progress</li>
            <li>Add detailed site inspection data to existing reports</li>
            <li>Submit completed reports to Valuers</li>
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
            <div className={`${styles.flowStep} ${styles.activeStep}`}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Site Engineer (You)</h4>
                <p>Add field inspection data and site photographs</p>
              </div>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowStep}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Valuer</h4>
                <p>Reviews all data and creates final valuation report</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Made with Bob
