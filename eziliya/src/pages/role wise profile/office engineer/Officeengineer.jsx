import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Officeengineer.module.css'
import ReportWorkflow from '../../../components/report/ReportWorkflow'

export default function OfficeEngineer() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (

    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Office Engineer Profile</h1>
        <Link to="/" className={styles.homeLink}>Home</Link>
      </div>

      <div className={styles.profileSection}>
        <h2>Welcome, Office Engineer</h2>
        <p>As an Office Engineer, you can create technical valuation reports and manage documentation for various banks.</p>

        <div className={styles.actionSection}>
          <h3>Create New Report</h3>
          <p>Select a bank template to create a new report:</p>
          <div className={styles.actionButtons}>
            <Link to="/select-banks" className={styles.selectBankBtn}>
              Select Bank Template
            </Link>
          </div>
        </div>

        <div className={styles.workflowToggle}>
          <button
            className={styles.toggleBtn}
            onClick={() => setShowWorkflow(!showWorkflow)}
          >
            {showWorkflow ? 'Hide' : 'Show'} My Reports & Workflow
          </button>
        </div>

        {showWorkflow && (
          <div className={styles.workflowSection}>
            <ReportWorkflow userRole="office-engineer" />
          </div>
        )}

        <div className={styles.infoSection}>
          <h3>Your Responsibilities:</h3>
          <ul>
            <li>Review technical documentation</li>
            <li>Prepare technical valuation reports</li>
            <li>Verify property details and measurements</li>
            <li>Submit reports to site engineers for field verification</li>
            <li>Ensure compliance with bank requirements</li>
          </ul>
        </div>

        <div className={styles.workflowInfo}>
          <h3>Report Workflow:</h3>
          <div className={styles.flowSteps}>
            <div className={styles.flowStep}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Office Engineer (You)</h4>
                <p>Create and submit initial report with property details</p>
              </div>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowStep}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Site Engineer</h4>
                <p>Conducts field inspection and adds site details</p>
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


