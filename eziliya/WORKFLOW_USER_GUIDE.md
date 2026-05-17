# Report Workflow User Guide

## Quick Start Guide for Each Role

---

## 🏢 Office Engineer

### Your Role
You create initial technical reports with property details and documentation.

### How to Create and Submit a Report

1. **Login** to the system with your Office Engineer credentials

2. **Navigate to Your Profile**
   - Click on "Office Engineer" in the navigation menu
   - Or go to `/office-engineer` route

3. **Create New Report**
   - Click the **"Select Bank to Create Report"** button
   - Choose the bank from the list (e.g., Yes Bank, ICICI, Kotak, etc.)

4. **Fill Out the Form**
   - Enter applicant details (name, contact, etc.)
   - Add property information (address, type, measurements)
   - Upload required photographs:
     - Satellite map
     - Hall, Kitchen, Bedrooms
     - External photos
     - Front site and road site
     - Selfie with property and person
   - Fill technical specifications
   - Add any additional observations

5. **Submit the Report**
   - Review all information
   - Click **"Submit"** button
   - You'll see a success message
   - Report is automatically sent to Site Engineer

6. **Track Your Reports**
   - Click **"Show My Reports & Workflow"** on your profile
   - View pending and completed reports
   - See current status of each report

### What Happens Next?
✅ Your report is saved with status: **"Site Engineer Pending"**  
✅ Site Engineer receives notification to conduct field inspection  
✅ You can view the report progress in your workflow section

---

## 🏗️ Site Engineer

### Your Role
You conduct on-site inspections and add field verification data to reports created by Office Engineers.

### How to Process Pending Reports

1. **Login** to the system with your Site Engineer credentials

2. **Navigate to Your Profile**
   - Click on "Site Engineer" in the navigation menu
   - Or go to `/site-engineer` route

3. **View Pending Reports**
   - Click **"Show Pending Reports & Workflow"** button
   - You'll see all reports waiting for your inspection
   - Each report shows:
     - Property address
     - Bank name
     - Property type
     - Date created
     - Office Engineer's initial data

4. **Process a Report**
   - Click **"Process Report"** on any pending report
   - You'll be taken to the bank-specific form
   - The form will show Office Engineer's data (read-only or editable)

5. **Add Field Inspection Data**
   - Conduct your site visit
   - Add field measurements and observations
   - Upload site photographs:
     - Current property condition
     - Boundary verification photos
     - Construction quality images
     - Neighborhood photos
   - Verify Office Engineer's data
   - Add any discrepancies or additional notes

6. **Submit Your Inspection**
   - Review all field data
   - Click **"Submit"** button
   - Report is automatically sent to Valuer

7. **Track Reports**
   - View completed reports in the "Completed Reports" tab
   - See reports waiting for Valuer's final assessment

### What Happens Next?
✅ Your field data is added to the report  
✅ Report status changes to: **"Valuer Pending"**  
✅ Valuer receives the complete report for final valuation  
✅ Report appears in your completed list

---

## 💰 Valuer

### Your Role
You review complete reports (Office Engineer + Site Engineer data) and create final property valuations.

### How to Create Final Valuation

1. **Login** to the system with your Valuer credentials

2. **Navigate to Your Profile**
   - Click on "Valuer" in the navigation menu
   - Or go to `/valuer` route

3. **View Pending Reports**
   - Click **"Show Pending Reports & Workflow"** button
   - See all reports ready for valuation
   - Each report contains:
     - Office Engineer's initial assessment
     - Site Engineer's field inspection data
     - All photographs and documentation

4. **Review Complete Report**
   - Click **"Process Report"** on any pending report
   - Review Office Engineer's data
   - Review Site Engineer's field inspection
   - Analyze all photographs
   - Check measurements and specifications

5. **Create Final Valuation**
   - Add property valuation amount
   - Include market analysis
   - Add risk assessment
   - Provide recommendations
   - Note any concerns or conditions
   - Upload final valuation certificate (if required)

6. **Submit Final Report**
   - Review all valuation data
   - Click **"Submit Final Report"** button
   - Report is marked as **COMPLETED**

7. **View Completed Reports**
   - Access all finalized reports
   - Download or print final reports
   - Share with banks or clients

### What Happens Next?
✅ Report is marked as **"Completed"**  
✅ Final report combines all three stages  
✅ Report is ready for bank submission  
✅ All team members can view the completed report

---

## 📊 Report Status Guide

### Status Badges Explained

| Status | Meaning | Who Can Act |
|--------|---------|-------------|
| **Draft** | Report created but not submitted | Office Engineer |
| **Site Engineer Pending** | Waiting for field inspection | Site Engineer |
| **Valuer Pending** | Waiting for final valuation | Valuer |
| **Completed** | Final report ready | All (view only) |

---

## 🔄 Complete Workflow Diagram

```
┌─────────────────┐
│ Office Engineer │
│  Creates Report │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Site Engineer  │
│ Field Inspection│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Valuer      │
│ Final Valuation │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    COMPLETED    │
│   Final Report  │
└─────────────────┘
```

---

## 📝 Tips for Each Role

### Office Engineer Tips
- ✅ Fill all required fields accurately
- ✅ Upload clear, high-quality photos
- ✅ Double-check property address and measurements
- ✅ Add detailed observations in notes section
- ✅ Verify applicant information before submission

### Site Engineer Tips
- ✅ Conduct thorough on-site inspection
- ✅ Take photos from multiple angles
- ✅ Verify all measurements physically
- ✅ Note any discrepancies from Office Engineer's report
- ✅ Check property boundaries and access
- ✅ Assess construction quality and progress

### Valuer Tips
- ✅ Review both Office and Site Engineer data carefully
- ✅ Cross-reference measurements and observations
- ✅ Consider market conditions and location
- ✅ Provide detailed justification for valuation
- ✅ Note any risks or concerns
- ✅ Ensure compliance with bank requirements

---

## ❓ Common Questions

### Q: Can I edit a report after submission?
**A:** No, once submitted, reports move to the next stage. Contact your administrator if changes are needed.

### Q: What if I don't see any pending reports?
**A:** This means no reports are currently assigned to your role. Check back later or contact the Office Engineer/previous stage.

### Q: Can I view reports from other banks?
**A:** Yes, you can view all reports assigned to you regardless of the bank.

### Q: How do I know when a report is assigned to me?
**A:** Check your profile's "Pending Reports" section regularly. (Future: Email notifications will be added)

### Q: What image formats are supported?
**A:** JPG, JPEG, PNG, and most common image formats. Images are converted to base64 for storage.

### Q: Is there a mobile app?
**A:** Currently, the system is web-based. Use a mobile browser for field work. (Future: Native mobile app planned)

### Q: Can I work offline?
**A:** No, an internet connection is required. (Future: Offline mode planned for Site Engineers)

### Q: How long are reports stored?
**A:** Reports are stored indefinitely in the database. Contact administrator for archival policies.

---

## 🆘 Troubleshooting

### Problem: Can't submit report
**Solution:**
- Check all required fields are filled
- Verify images are uploaded
- Check internet connection
- Try refreshing the page
- Clear browser cache

### Problem: Report not appearing in pending list
**Solution:**
- Refresh the page
- Check you're logged in with correct role
- Verify previous stage submitted the report
- Contact administrator

### Problem: Images not uploading
**Solution:**
- Check file size (max 5MB recommended)
- Use supported formats (JPG, PNG)
- Try a different browser
- Check internet speed

### Problem: Form data lost
**Solution:**
- Browser may have cleared cache
- Always submit reports promptly
- Don't close browser during submission
- Use "Save Draft" if available

---

## 📞 Support

For technical issues or questions:
- Contact System Administrator
- Email: support@example.com
- Phone: +91-XXXX-XXXXXX

For workflow questions:
- Refer to OFFICE_TO_SITE_ENGINEER_WORKFLOW.md
- Check WORKFLOW_SYSTEM_DOCUMENTATION.md

---

**Last Updated:** 2026-04-24  
**Version:** 1.0  
**System:** Eziliya Report Management System