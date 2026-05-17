import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './salesteam.module.css'
import ReportWorkflow from '../../../components/report/ReportWorkflow'
import TechnicalReportsView from './TechnicalReportsView'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function Salesteam() {
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [reportStats, setReportStats] = useState({
    pending: 0,
    completed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportStats();
  }, []);

  const fetchReportStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all reports
      const response = await fetch(`${API_BASE_URL}/getreports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const reports = data.reports || [];
        
        const pending = reports.filter(r => r.workflowStatus !== 'completed').length;
        const completed = reports.filter(r => r.workflowStatus === 'completed').length;
        
        setReportStats({
          pending,
          completed,
          total: reports.length
        });
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
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
        <p>As a Sales Team member, you can initiate loan applications and create reports for various banks.</p>
        
        {/* Report Statistics */}
        <div className={styles.statsSection}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3>{loading ? '...' : reportStats.total}</h3>
              <p>Total Reports</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statContent}>
              <h3>{loading ? '...' : reportStats.pending}</h3>
              <p>In Progress</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <h3>{loading ? '...' : reportStats.completed}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        <div className={styles.actionSection}>
          <h3>Quick Actions</h3>
          <div className={styles.buttonGroup}>
            <Link to="/salesteam/form" className={styles.primaryBtn}>
              📝 Create Customer Application
            </Link>
          </div>
        </div>

        <div className={styles.workflowToggle}>
          <button
            className={styles.toggleBtn}
            onClick={() => setShowWorkflow(!showWorkflow)}
          >
            {showWorkflow ? 'Hide' : 'Show'} Valuation Reports
          </button>
        </div>

        {showWorkflow && (
          <div className={styles.workflowSection}>
            <ReportWorkflow userRole="sales-team" />
            
            <div className={styles.technicalReportsSection}>
              <TechnicalReportsView />
            </div>
          </div>
        )}

        <div className={styles.infoSection}>
          <h3>Your Responsibilities:</h3>
          <ul>
            <li>Initiate customer loan applications</li>
            <li>Collect customer information and documents</li>
            <li>Submit applications to banks</li>
            <li>Follow up on application status</li>
            <li>Maintain customer relationships</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


