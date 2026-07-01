import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './technicalengineer.module.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function Technicalengineer() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [propertyAddress, setPropertyAddress] = useState('');
  const [firmName, setFirmName] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [showWorkTasks, setShowWorkTasks] = useState(false);
  const [workTasks, setWorkTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

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

    if (!propertyAddress || !firmName || !applicantName) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        setIsUploading(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('pdfFile', uploadedFile);
      formData.append('documentTitle', `${firmName} - ${applicantName} Technical Report`);
      formData.append('documentType', 'technical-report');
      formData.append('description', `Technical assessment report for ${applicantName}`);
      formData.append('projectReference', firmName);
      formData.append('propertyAddress', propertyAddress);
      formData.append('tags', JSON.stringify([firmName.toLowerCase(), 'technical-report', applicantName.toLowerCase()]));

      const response = await fetch(`${API_BASE_URL}/technical-engineer/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Technical report uploaded successfully!');
        setUploadedFile(null);
        setPropertyAddress('');
        setFirmName('');
        setApplicantName('');
        // Reset file input
        document.getElementById('technicalReportUpload').value = '';
      } else {
        alert(`Upload failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading report: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch work tasks from sales team forms
  const fetchWorkTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await fetch(`${API_BASE_URL}/technical-engineer/work-tasks`);
      const result = await response.json();

      if (response.ok && result.success) {
        setWorkTasks(result.data);
      } else {
        alert(`Failed to load work tasks: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching work tasks:', error);
      alert('Error loading work tasks: ' + error.message);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Load work tasks when the work tasks section is opened
  useEffect(() => {
    if (showWorkTasks) {
      fetchWorkTasks();
    }
  }, [showWorkTasks]);

  // Handle viewing task details
  const handleViewTask = (task) => {
    setSelectedTask(task);
  };

  // Handle updating task status
  const handleUpdateTaskStatus = async (taskId, newStatus, remarks) => {
    try {
      const response = await fetch(`${API_BASE_URL}/technical-engineer/work-tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: remarks
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Task status updated successfully!');
        // Refresh the work tasks list
        fetchWorkTasks();
        setSelectedTask(null);
      } else {
        alert(`Failed to update status: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating status: ' + error.message);
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
        <p>As a Technical Engineer, you can perform technical assessments and create comprehensive reports for various firms.</p>
        
        <div className={styles.actionSection}>
          <h3>Quick Actions</h3>
          <div className={styles.actionButtons}>
            <button
              className={styles.selectBankBtn}
              onClick={() => navigate('/technical-engineer/reports')}
            >
              📋 My Reports
            </button>
            <Link to="/select-banks" className={styles.selectBankBtn}>
              📝 Create Report
            </Link>
            <button
              onClick={() => setShowWorkTasks(!showWorkTasks)}
              className={styles.workTaskBtn}
            >
              📋 {showWorkTasks ? 'Hide Work Tasks' : 'View Work Tasks'}
            </button>
          </div>
        </div>

        {/* Work Tasks Section */}
        {showWorkTasks && (
          <div className={styles.workTasksSection}>
            <h3>Sales Team Form Submissions - Work Tasks</h3>
            <p>Review and manage sales team form submissions assigned to technical engineers</p>

            {isLoadingTasks ? (
              <div className={styles.loading}>Loading work tasks...</div>
            ) : workTasks.length === 0 ? (
              <div className={styles.noTasks}>
                <p>No work tasks found.</p>
                <p className={styles.hint}>Work tasks will appear here when sales team forms are assigned to technical engineers.</p>
              </div>
            ) : (
              <div className={styles.tasksList}>
                <div className={styles.tasksCount}>
                  Found {workTasks.length} work task{workTasks.length !== 1 ? 's' : ''}
                </div>
                {workTasks.map((task) => (
                  <div key={task._id} className={styles.taskCard}>
                    <div className={styles.taskHeader}>
                      <h4>{task.firmName}</h4>
                      <span className={`${styles.statusBadge} ${styles[task.status]}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className={styles.taskDetails}>
                      <p><strong>Customer:</strong> {task.customerName}</p>
                      <p><strong>Contact:</strong> {task.customerContactNumber}</p>
                      <p><strong>Property Type:</strong> {task.propertyType}</p>
                      <p><strong>Address:</strong> {task.customerAddress}</p>
                      <p><strong>Loan Amount:</strong> ₹{task.customerLoanAmount?.toLocaleString()}</p>
                      <p><strong>Submitted:</strong> {new Date(task.submittedAt || task.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.taskActions}>
                      <button
                        onClick={() => handleViewTask(task)}
                        className={styles.viewBtn}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
              <div className={styles.modal} onClick={() => setSelectedTask(null)}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <h3>Work Task Details</h3>
                    <button
                      onClick={() => setSelectedTask(null)}
                      className={styles.closeBtn}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className={styles.modalBody}>
                    <div className={styles.detailSection}>
                      <h4>Firm Information</h4>
                      <p><strong>Firm Name:</strong> {selectedTask.firmName}</p>
                      <p><strong>Firm Registered Mobile Number:</strong> {selectedTask.firmRegisteredMobileNumber}</p>
                      <p><strong>Property Type:</strong> {selectedTask.propertyType}</p>
                    </div>

                    <div className={styles.detailSection}>
                      <h4>Customer Information</h4>
                      <p><strong>Name:</strong> {selectedTask.customerName}</p>
                      <p><strong>Contact:</strong> {selectedTask.customerContactNumber}</p>
                      {selectedTask.customerAlternativeContactNumber && (
                        <p><strong>Alt Contact:</strong> {selectedTask.customerAlternativeContactNumber}</p>
                      )}
                      <p><strong>Address:</strong> {selectedTask.customerAddress}</p>
                    </div>

                    <div className={styles.detailSection}>
                      <h4>Financial Details</h4>
                      <p><strong>Property Unit Rate:</strong> ₹{selectedTask.propertyUnitRate?.toLocaleString()}</p>
                      <p><strong>Property Rate Per Square Feet:</strong> ₹{selectedTask.propertyRatePerSquareFeet || selectedTask.propertyRatePerSquerFeet || selectedTask.propertyRateperSqureFeet || 'N/A'}</p>
                      <p><strong>Customer Pay Amount:</strong> ₹{selectedTask.customerPayAmount?.toLocaleString()}</p>
                      <p><strong>Loan Amount:</strong> ₹{selectedTask.customerLoanAmount?.toLocaleString()}</p>
                    
                    </div>

                    <div className={styles.detailSection}>
                      <h4>Documents</h4>
                      <div className={styles.documentLinks}>
                        <a href={selectedTask.aadharCardPhoto} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                          📄 Aadhar Card
                        </a>
                        <a href={selectedTask.panCardPhoto} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                          📄 PAN Card
                        </a>
                        <a href={selectedTask.saleDraftPdf} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                          📄 Sale Draft
                        </a>
                        <a href={selectedTask.propertyValuationReportPdf} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                          📄 Valuation Report
                        </a>
                      </div>
                    </div>


                  
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.uploadSection}>
          <h3>Upload Technical Report</h3>
          <p>Upload your completed technical assessment report (PDF format):</p>
          
          <div className={styles.uploadContainer}>
            <div className={styles.formGroup}>
              <label htmlFor="firmName">Firm Name *</label>
              <input
                type="text"
                id="firmName"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder="Enter firm name"
                className={styles.textInput}
                required
              />
            </div>

        

            <div className={styles.formGroup}>
              <label htmlFor="technicalReportUpload">Upload PDF Report *</label>
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
            </div>
            
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
              disabled={!uploadedFile || !firmName || !applicantName || !propertyAddress || isUploading}
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
