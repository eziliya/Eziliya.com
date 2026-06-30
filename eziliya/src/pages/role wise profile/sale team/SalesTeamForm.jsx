import React, { useState, useEffect } from 'react';
import styles from './SalesTeamForm.module.css';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Search functionality removed - Updated version

export default function SalesTeamForm() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firmName: '',
    firmRegisteredMobileNumber: '',
    propertyType: '',
    customerName: '',
    customerContactNumber: '',
    customerAlternativeContactNumber: '',
    customerAddress: '',
    propertyUnitRate: '',
    propertyRatePerSquareFeet: '',
    customerPayAmount: '',
    customerLoanAmount: '',
    aadharCardPhoto: null,
    panCardPhoto: null,
    saleDraftPdf: null,
    propertyValuationReportPdf: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log userId for debugging
  useEffect(() => {
    if (userId) {
      console.log('Sales Team Form - User ID from URL:', userId);
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert file to base64 data URL for images
      if (fieldName === 'aadharCardPhoto' || fieldName === 'panCardPhoto') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            [fieldName]: reader.result // Store base64 data URL
          }));
        };
        reader.readAsDataURL(file);
      } else {
        // For PDF files, store the file object
        setFormData(prev => ({
          ...prev,
          [fieldName]: file
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Debug: Log form data before submission
      console.log('Form Data before submission:', formData);
      console.log('Property Rate Per Square Feet value:', formData.propertyRatePerSquareFeet);
      
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        navigate('/login');
        return;
      }

      // Create FormData object to send files and data
      const formDataToSend = new FormData();
      
      // Append all text fields
      formDataToSend.append('firmName', formData.firmName);
      formDataToSend.append('firmRegisteredMobileNumber', formData.firmRegisteredMobileNumber);
      formDataToSend.append('propertyType', formData.propertyType);
      formDataToSend.append('customerName', formData.customerName);
      formDataToSend.append('customerContactNumber', formData.customerContactNumber);
      formDataToSend.append('customerAlternativeContactNumber', formData.customerAlternativeContactNumber);
      formDataToSend.append('customerAddress', formData.customerAddress);
      formDataToSend.append('propertyUnitRate', formData.propertyUnitRate);
      formDataToSend.append('propertyRatePerSquareFeet', formData.propertyRatePerSquareFeet);
      formDataToSend.append('customerPayAmount', formData.customerPayAmount);
      formDataToSend.append('customerLoanAmount', formData.customerLoanAmount);
      
      // Append files
      if (formData.aadharCardPhoto) {
        // If it's a base64 string, convert to blob
        if (typeof formData.aadharCardPhoto === 'string' && formData.aadharCardPhoto.startsWith('data:')) {
          const blob = await fetch(formData.aadharCardPhoto).then(r => r.blob());
          formDataToSend.append('aadharCardPhoto', blob, 'aadhar.jpg');
        }
      }
      
      if (formData.panCardPhoto) {
        if (typeof formData.panCardPhoto === 'string' && formData.panCardPhoto.startsWith('data:')) {
          const blob = await fetch(formData.panCardPhoto).then(r => r.blob());
          formDataToSend.append('panCardPhoto', blob, 'pan.jpg');
        }
      }
      
      if (formData.saleDraftPdf) {
        formDataToSend.append('saleDraftPdf', formData.saleDraftPdf);
      }
      
      if (formData.propertyValuationReportPdf) {
        formDataToSend.append('propertyValuationReportPdf', formData.propertyValuationReportPdf);
      }

      // Include userId if available from URL params
      if (userId) {
        formDataToSend.append('userId', userId);
      }

      // Send to backend using fetch with Authorization header
      const response = await fetch(`${API_BASE_URL}/sales-team-form/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type header for FormData, browser will set it automatically with boundary
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form');
      }

      console.log('Response:', data);
      alert('Sales form submitted successfully! Form ID: ' + data.data.formId);
      
      // Reset form after successful submission
      setFormData({
        firmName: '',
        firmRegisteredMobileNumber: '',
        propertyType: '',
        customerName: '',
        customerContactNumber: '',
        customerAlternativeContactNumber: '',
        customerAddress: '',
        propertyUnitRate: '',
        propertyRatePerSquareFeet: '',
        customerPayAmount: '',
        customerLoanAmount: '',
        aadharCardPhoto: null,
        panCardPhoto: null,
        saleDraftPdf: null,
        propertyValuationReportPdf: null
      });
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
      // Navigate back to sales team profile ONLY on success
      navigate('/salesteam');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form: ' + error.message);
      // DO NOT navigate on error - stay on the form page
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Sales Team - Customer Application Form</h1>
        <button 
          type="button" 
          onClick={() => navigate('/salesteam')} 
          className={styles.backButton}
        >
          Back to Profile
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        
        {/* Firm Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Firm Information</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firmName" className={styles.label}>
                Firm Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="firmName"
                name="firmName"
                value={formData.firmName}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="firmRegisteredMobileNumber" className={styles.label}>
                Firm Registered Mobile Number <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="firmRegisteredMobileNumber"
                name="firmRegisteredMobileNumber"
                value={formData.firmRegisteredMobileNumber}
                onChange={handleChange}
                className={styles.input}
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="propertyType" className={styles.label}>
                Property Type <span className={styles.required}>*</span>
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">Select Property Type</option>
                <option value="Flat">Flat</option>
                <option value="Banglow">Banglow</option>
                <option value="Row-House">Row-House</option>
                <option value="Shop">Shop</option>
                <option value="Duplex">Duplex</option>
                <option value="Office">Office</option>
                <option value="Godown">Godown</option>
                <option value="Agriculture-Land">Agriculture-Land</option>
                <option value="Plot">Plot</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
          </div>
        </section>

        {/* Customer Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Customer Information</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="customerName" className={styles.label}>
                Customer Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="customerContactNumber" className={styles.label}>
                Customer Contact Number <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="customerContactNumber"
                name="customerContactNumber"
                value={formData.customerContactNumber}
                onChange={handleChange}
                className={styles.input}
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="customerAlternativeContactNumber" className={styles.label}>
                Customer Alternative Contact Number
              </label>
              <input
                type="tel"
                id="customerAlternativeContactNumber"
                name="customerAlternativeContactNumber"
                value={formData.customerAlternativeContactNumber}
                onChange={handleChange}
                className={styles.input}
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number (optional)"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="customerAddress" className={styles.label}>
                Customer Address <span className={styles.required}>*</span>
              </label>
              <textarea
                id="customerAddress"
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                className={styles.textarea}
                rows="4"
                required
              />
            </div>
          </div>
        </section>

        {/* Financial Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Financial Information</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="propertyUnitRate" className={styles.label}>
                Property Unit Rate <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="propertyUnitRate"
                name="propertyUnitRate"
                value={formData.propertyUnitRate}
                onChange={handleChange}
                className={styles.input}
                min="0"
                step="0.01"
                placeholder="Property Unit Rate
"
                required
              />
            </div>
              <div className={styles.formGroup}>
              <label htmlFor="propertyRatePerSquareFeet" className={styles.label}>
                Property Rate Per Square Feet <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="propertyRatePerSquareFeet"
                name="propertyRatePerSquareFeet"
                value={formData.propertyRatePerSquareFeet}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter rate per sq.ft."
                required
              />
            </div>
            </div>
            <div>
            <div className={styles.formGroup}>
              <label htmlFor="customerPayAmount" className={styles.label}>
                Customer Pay Amount (₹) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="customerPayAmount"
                name="customerPayAmount"
                value={formData.customerPayAmount}
                onChange={handleChange}
                className={styles.input}
                min="0"
                step="0.01"
                placeholder="Enter amount customer will pay"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="customerLoanAmount" className={styles.label}>
                Customer Loan Amount (₹) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="customerLoanAmount"
                name="customerLoanAmount"
                value={formData.customerLoanAmount}
                onChange={handleChange}
                className={styles.input}
                min="0"
                step="0.01"
                placeholder="Enter loan amount required"
                required
              />
            </div>
            <div className={styles.formGroup}></div>
          </div>
        </section>

        {/* Document Uploads */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Document Uploads</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="aadharCardPhoto" className={styles.label}>
                Customer Aadhar Card Photo <span className={styles.required}>*</span>
              </label>
              <input
                type="file"
                id="aadharCardPhoto"
                name="aadharCardPhoto"
                onChange={(e) => handleFileChange('aadharCardPhoto', e)}
                className={styles.fileInput}
                accept="image/*"
                required
              />
              {formData.aadharCardPhoto && (
                <div className={styles.previewContainer}>
                  <img
                    src={formData.aadharCardPhoto}
                    alt="Aadhar Card Preview"
                    className={styles.imagePreview}
                  />
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="panCardPhoto" className={styles.label}>
                Customer PAN Card Photo <span className={styles.required}>*</span>
              </label>
              <input
                type="file"
                id="panCardPhoto"
                name="panCardPhoto"
                onChange={(e) => handleFileChange('panCardPhoto', e)}
                className={styles.fileInput}
                accept="image/*"
                required
              />
              {formData.panCardPhoto && (
                <div className={styles.previewContainer}>
                  <img
                    src={formData.panCardPhoto}
                    alt="PAN Card Preview"
                    className={styles.imagePreview}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="saleDraftPdf" className={styles.label}>
                Sale Draft PDF File <span className={styles.required}>*</span>
              </label>
              <input
                type="file"
                id="saleDraftPdf"
                name="saleDraftPdf"
                onChange={(e) => handleFileChange('saleDraftPdf', e)}
                className={styles.fileInput}
                accept=".pdf"
                required
              />
              {formData.saleDraftPdf && (
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>
                    📄 {formData.saleDraftPdf.name}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="propertyValuationReportPdf" className={styles.label}>
                Property Valuation Report PDF <span className={styles.required}>*</span>
              </label>
              <input
                type="file"
                id="propertyValuationReportPdf"
                name="propertyValuationReportPdf"
                onChange={(e) => handleFileChange('propertyValuationReportPdf', e)}
                className={styles.fileInput}
                accept=".pdf"
                required
              />
              {formData.propertyValuationReportPdf && (
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>
                    📄 {formData.propertyValuationReportPdf.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Made with Bob