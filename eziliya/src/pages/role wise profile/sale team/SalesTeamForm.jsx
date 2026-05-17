import React, { useState } from 'react';
import styles from './SalesTeamForm.module.css';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function SalesTeamForm() {
  const [formData, setFormData] = useState({
    firmName: '',
    propertyType: '',
    customerName: '',
    customerContactNumber: '',
    customerAlternativeContactNumber: '',
    customerAddress: '',
    propertyUnitRate: '',
    customerPayAmount: '',
    customerLoanAmount: '',
    aadharCardPhoto: null,
    panCardPhoto: null,
    saleDraftPdf: null,
    propertyValuationReportPdf: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
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
      // Create FormData object to send files and data
      const formDataToSend = new FormData();
      
      // Append all text fields
      formDataToSend.append('firmName', formData.firmName);
      formDataToSend.append('propertyType', formData.propertyType);
      formDataToSend.append('customerName', formData.customerName);
      formDataToSend.append('customerContactNumber', formData.customerContactNumber);
      formDataToSend.append('customerAlternativeContactNumber', formData.customerAlternativeContactNumber);
      formDataToSend.append('customerAddress', formData.customerAddress);
      formDataToSend.append('propertyUnitRate', formData.propertyUnitRate);
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

      // Send to backend using fetch
      const response = await fetch(`${API_BASE_URL}/sales-team-form/submit`, {
        method: 'POST',
        body: formDataToSend
        // Note: Don't set Content-Type header for FormData, browser will set it automatically with boundary
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form');
      }

      console.log('Response:', data);
      alert('Sales form submitted successfully! Form ID: ' + data.data.formId);
      
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

  const handleReset = () => {
    setFormData({
      firmName: '',
      propertyType: '',
      customerName: '',
      customerContactNumber: '',
      customerAlternativeContactNumber: '',
      customerAddress: '',
      propertyUnitRate: '',
      customerPayAmount: '',
      customerLoanAmount: '',
      aadharCardPhoto: null,
      panCardPhoto: null,
      saleDraftPdf: null,
      propertyValuationReportPdf: null
    });
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
        </section>

        {/* Customer Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Customer Information</h2>
          
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
        </section>

        {/* Financial Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Financial Information</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="propertyUnitRate" className={styles.label}>
              Property Unit Rate (₹ per sq.ft.) <span className={styles.required}>*</span>
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
              placeholder="Enter rate per sq.ft."
              required
            />
          </div>

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
        </section>

        {/* Document Uploads */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Document Uploads</h2>
          
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
              Property Valuation Report PDF File <span className={styles.required}>*</span>
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
        </section>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleReset}
            className={styles.resetButton}
            disabled={isSubmitting}
          >
            Reset Form
          </button>
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