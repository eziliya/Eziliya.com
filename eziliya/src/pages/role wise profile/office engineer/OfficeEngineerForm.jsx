import React, { useState } from 'react';
import styles from './OfficeEngineerForm.module.css';

export default function OfficeEngineerForm({ onSubmit, onCancel, initialData = {} }) {
  const [formData, setFormData] = useState({
    valuationAgency: initialData.valuationAgency || '',
    dateOfTechnicalInitiation: initialData.dateOfTechnicalInitiation || '',
    applicantNames: initialData.applicantNames || '',
    transactionType: initialData.transactionType || '',
    addressAsPerLegalDocuments: initialData.addressAsPerLegalDocuments || '',
    
    // Direction as per Legal Documents
    directionEast: initialData.directionEast || '',
    directionWest: initialData.directionWest || '',
    directionNorth: initialData.directionNorth || '',
    directionSouth: initialData.directionSouth || '',
    
    // Direction as per Documents/Plan
    planDirectionEast: initialData.planDirectionEast || '',
    planDirectionWest: initialData.planDirectionWest || '',
    planDirectionNorth: initialData.planDirectionNorth || '',
    planDirectionSouth: initialData.planDirectionSouth || '',
    
    totalAreaSqft: initialData.totalAreaSqft || '',
    legalAreaSqft: initialData.legalAreaSqft || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.valuationAgency.trim()) {
      newErrors.valuationAgency = 'Valuation Agency is required';
    }
    if (!formData.dateOfTechnicalInitiation) {
      newErrors.dateOfTechnicalInitiation = 'Date of Technical Initiation is required';
    }
    if (!formData.applicantNames.trim()) {
      newErrors.applicantNames = 'Applicant Name(s) is required';
    }
    if (!formData.transactionType.trim()) {
      newErrors.transactionType = 'Transaction Type is required';
    }
    if (!formData.addressAsPerLegalDocuments.trim()) {
      newErrors.addressAsPerLegalDocuments = 'Address is required';
    }
    if (!formData.totalAreaSqft || formData.totalAreaSqft <= 0) {
      newErrors.totalAreaSqft = 'Valid Total Area is required';
    }
    if (!formData.legalAreaSqft || formData.legalAreaSqft <= 0) {
      newErrors.legalAreaSqft = 'Valid Legal Area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2>Office Engineer Technical Report Form</h2>
        <p>Fill in the technical details for property valuation</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Information Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="valuationAgency">Name of Valuation Agency *</label>
            <input
              type="text"
              id="valuationAgency"
              name="valuationAgency"
              value={formData.valuationAgency}
              onChange={handleChange}
              className={errors.valuationAgency ? styles.inputError : ''}
              placeholder="Enter valuation agency name"
            />
            {errors.valuationAgency && <span className={styles.error}>{errors.valuationAgency}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dateOfTechnicalInitiation">Date of Technical Initiation *</label>
            <input
              type="date"
              id="dateOfTechnicalInitiation"
              name="dateOfTechnicalInitiation"
              value={formData.dateOfTechnicalInitiation}
              onChange={handleChange}
              className={errors.dateOfTechnicalInitiation ? styles.inputError : ''}
            />
            {errors.dateOfTechnicalInitiation && <span className={styles.error}>{errors.dateOfTechnicalInitiation}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="applicantNames">Applicant/s Name/s *</label>
            <input
              type="text"
              id="applicantNames"
              name="applicantNames"
              value={formData.applicantNames}
              onChange={handleChange}
              className={errors.applicantNames ? styles.inputError : ''}
              placeholder="Enter applicant name(s)"
            />
            {errors.applicantNames && <span className={styles.error}>{errors.applicantNames}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="transactionType">Transaction Type *</label>
            <select
              id="transactionType"
              name="transactionType"
              value={formData.transactionType}
              onChange={handleChange}
              className={errors.transactionType ? styles.inputError : ''}
            >
              <option value="">Select Transaction Type</option>
              <option value="Purchase">Purchase</option>
              <option value="Mortgage">Mortgage</option>
              <option value="Refinance">Refinance</option>
              <option value="Construction">Construction</option>
              <option value="Lease">Lease</option>
              <option value="Other">Other</option>
            </select>
            {errors.transactionType && <span className={styles.error}>{errors.transactionType}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="addressAsPerLegalDocuments">Address as per Legal Documents *</label>
            <textarea
              id="addressAsPerLegalDocuments"
              name="addressAsPerLegalDocuments"
              value={formData.addressAsPerLegalDocuments}
              onChange={handleChange}
              className={errors.addressAsPerLegalDocuments ? styles.inputError : ''}
              placeholder="Enter complete address as per legal documents"
              rows="3"
            />
            {errors.addressAsPerLegalDocuments && <span className={styles.error}>{errors.addressAsPerLegalDocuments}</span>}
          </div>
        </div>

        {/* Direction as per Legal Documents */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Direction as per Legal Documents</h3>
          
          <div className={styles.directionGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="directionEast">East</label>
              <input
                type="text"
                id="directionEast"
                name="directionEast"
                value={formData.directionEast}
                onChange={handleChange}
                placeholder="e.g., Road, Plot No., etc."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="directionWest">West</label>
              <input
                type="text"
                id="directionWest"
                name="directionWest"
                value={formData.directionWest}
                onChange={handleChange}
                placeholder="e.g., Road, Plot No., etc."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="directionNorth">North</label>
              <input
                type="text"
                id="directionNorth"
                name="directionNorth"
                value={formData.directionNorth}
                onChange={handleChange}
                placeholder="e.g., Road, Plot No., etc."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="directionSouth">South</label>
              <input
                type="text"
                id="directionSouth"
                name="directionSouth"
                value={formData.directionSouth}
                onChange={handleChange}
                placeholder="e.g., Road, Plot No., etc."
              />
            </div>
          </div>
        </div>

        {/* Direction as per Documents/Plan */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Direction as per Documents/Plan Plot Area</h3>
          
          <div className={styles.directionGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="planDirectionEast">East</label>
              <input
                type="text"
                id="planDirectionEast"
                name="planDirectionEast"
                value={formData.planDirectionEast}
                onChange={handleChange}
                placeholder="e.g.,sq. ft.,sq meters,only"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="planDirectionWest">West</label>
              <input
                type="text"
                id="planDirectionWest"
                name="planDirectionWest"
                value={formData.planDirectionWest}
                onChange={handleChange}
                placeholder="e.g.,sq. ft.,sq meters,only"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="planDirectionNorth">North</label>
              <input
                type="text"
                id="planDirectionNorth"
                name="planDirectionNorth"
                value={formData.planDirectionNorth}
                onChange={handleChange}
                placeholder="e.g.,sq. ft.,sq meters,only"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="planDirectionSouth">South</label>
              <input
                type="text"
                id="planDirectionSouth"
                name="planDirectionSouth"
                value={formData.planDirectionSouth}
                onChange={handleChange}
                placeholder="e.g.,sq. ft.,sq meters,only"
              />
            </div>
          </div>
        </div>

        {/* Area Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Area Information</h3>
          
          <div className={styles.areaGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="totalAreaSqft">Total Area in Sqft *</label>
              <input
                type="number"
                id="totalAreaSqft"
                name="totalAreaSqft"
                value={formData.totalAreaSqft}
                onChange={handleChange}
                className={errors.totalAreaSqft ? styles.inputError : ''}
                placeholder="Enter total area"
                min="0"
                step="0.01"
              />
              {errors.totalAreaSqft && <span className={styles.error}>{errors.totalAreaSqft}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="legalAreaSqft">Legal Area as per Docs in Sqft *</label>
              <input
                type="number"
                id="legalAreaSqft"
                name="legalAreaSqft"
                value={formData.legalAreaSqft}
                onChange={handleChange}
                className={errors.legalAreaSqft ? styles.inputError : ''}
                placeholder="Enter legal area"
                min="0"
                step="0.01"
              />
              {errors.legalAreaSqft && <span className={styles.error}>{errors.legalAreaSqft}</span>}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn}>
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}

