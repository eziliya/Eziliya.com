# Engineer Caption Component Documentation

## Overview
The `EngineerCaption` component is a professional, reusable React component designed to display engineer/valuer credentials in a formal document format, similar to official consultancy letterheads and professional profiles.

## Features
- ✅ Professional header with company logo and branding
- ✅ Comprehensive engineer/valuer details display
- ✅ Registration and certification information
- ✅ Office addresses and contact details
- ✅ Education qualifications table
- ✅ Experience summary
- ✅ Fully responsive design
- ✅ Print-friendly styling
- ✅ Customizable with props
- ✅ Modern CSS with gradients and shadows

## Component Location
```
src/
  components/
    engineer-caption/
      EngineerCaption.jsx          # Main component
      EngineerCaption.module.css   # Styling
```

## Usage Example

### Basic Usage
```jsx
import EngineerCaption from './components/engineer-caption/EngineerCaption';

function MyPage() {
  return (
    <div>
      <EngineerCaption />
    </div>
  );
}
```

### Custom Data Usage
```jsx
import EngineerCaption from './components/engineer-caption/EngineerCaption';

function MyPage() {
  const engineerData = {
    companyName: "YOUR CONSULTANCY NAME",
    logoText: "YourLogo",
    tagline: "CONSULTANCY",
    engineerName: "ENGG. YOUR NAME B.E (CIVIL)",
    registrationNo: "Reg.No. YOUR/REG/NUMBER",
    email: "your.email@example.com",
    mobile: "MB.NO. 1234567890",
    firmName: "M/S. YOUR FIRM NAME",
    services: "Property Valuer's & Civil Engineering Services",
    proprietorName: "Mr. YOUR NAME",
    qualification: "Bachelor of engineering (Civil)",
    iovRegNo: "IV/NA/SELE/F XXXXX/XXXX",
    wealthTaxReg: "Income Tax Reg. No. YOUR/TAX/REG/NUMBER",
    panNo: "ABCDE1234F",
    gstRegNo: "27AF XXXXXXXXX",
    udyamAadhar: "UDYAM-XX XX XXXXXXX",
    natureOfServices: "Property Valuers, Real-estate Advisors & Civil Engineering Services",
    officeAddresses: [
      "Your primary office address here",
      "Your secondary office address here"
    ],
    totalExperience: "Your experience description here...",
    educationQualifications: [
      { 
        examination: "S.S.C.", 
        college: "School Name", 
        grade: "XX.XX%", 
        passingYear: "Month Year" 
      },
      { 
        examination: "H.S.C.", 
        college: "College Name", 
        grade: "XX.XX%", 
        passingYear: "Month Year" 
      },
      { 
        examination: "B.E CIVIL", 
        college: "University Name", 
        grade: "Grade", 
        passingYear: "Month Year" 
      }
    ]
  };

  return (
    <div>
      <EngineerCaption {...engineerData} />
    </div>
  );
}
```

## Props Reference

| Prop Name | Type | Default | Description |
|-----------|------|---------|-------------|
| `companyName` | string | "SHRIKRISHNA CONSULTANCY" | Main company/consultancy name |
| `logoText` | string | "ShriKrishna" | Logo text display |
| `tagline` | string | "CONSULTANCY" | Company tagline |
| `engineerName` | string | "ENGG. PANKAJ SUDAM BAGUL B.E (CIVIL)" | Engineer's full name with qualification |
| `registrationNo` | string | "Reg.No. NSK/CCIT/34AB/PSB/337/42/CT-I/2020-21" | Registration number |
| `email` | string | "shrikrishnaconsultancy210@gmail.com" | Contact email |
| `mobile` | string | "MB.NO. 9730566537" | Mobile number |
| `firmName` | string | "M/S. SHRIKRISHNA CONSULTANCY" | Firm name |
| `services` | string | "Property Valuer's & Civil Engineering Services" | Services offered |
| `proprietorName` | string | "Mr. PANKAJ SUDAM BAGUL" | Proprietor name |
| `qualification` | string | "Bachelor of engineering (Civil)" | Educational qualification |
| `iovRegNo` | string | "IV/NA/SELE/F 28853/5825" | IOV registration number |
| `wealthTaxReg` | string | "Income Tax Reg. No. NSK/CCIT/34AB/PSB/337/42/CAT I/2020 2021" | Wealth tax registration |
| `panNo` | string | "AFNPB2850B" | PAN number |
| `gstRegNo` | string | "27AF TFS1217F1ZU" | GST registration number |
| `udyamAadhar` | string | "UDYAM-MH 09 0068606" | Udyam Aadhar/MSME number |
| `natureOfServices` | string | "Property Valuers, Real-estate Advisors & Civil Engineering Services" | Nature of services |
| `officeAddresses` | array | [address1, address2] | Array of office addresses |
| `totalExperience` | string | Experience description | Experience description |
| `educationQualifications` | array | [{examination, college, grade, passingYear}] | Array of education details |

## Education Qualifications Object Structure
```javascript
{
  examination: "B.E CIVIL",      // Examination name
  college: "NMU JALGOAN",        // College/University name
  grade: "A+ Grade",             // Grade or percentage
  passingYear: "May 2000"        // Passing year
}
```

## Styling Features

### Header Section
- Professional gradient background
- Company logo with circular design
- Three-column layout (Logo | Company Name | Engineer Details)
- Responsive design that stacks on mobile

### Title Section
- Blue gradient background
- White text with yellow subtitle
- Centered alignment
- Professional appearance

### Details Table
- Two-column grid layout
- Clear label-value pairs
- Bordered rows
- Responsive single-column on mobile

### Education Table
- Professional table design
- Blue header with white text
- Alternating row colors
- Hover effects
- Fully responsive with horizontal scroll on mobile

## Responsive Breakpoints
- **Desktop**: Full three-column header layout
- **Tablet (1024px)**: Stacked header sections
- **Mobile (768px)**: Single column layout, smaller fonts
- **Small Mobile (480px)**: Optimized for small screens

## Print Styling
The component includes print-specific CSS that:
- Removes shadows for clean printing
- Maintains borders for structure
- Prevents page breaks inside the component
- Optimizes layout for paper

## Integration with Existing Project

### Step 1: Import the Component
```jsx
import EngineerCaption from '../../../components/engineer-caption/EngineerCaption';
```

### Step 2: Add to Your Page
```jsx
<EngineerCaption {...yourData} />
```

### Step 3: Add Print Functionality (Optional)
```jsx
<button onClick={() => window.print()}>
  Print Caption
</button>
```

## Example Page
A complete example implementation is available at:
```
src/pages/role wise profile/valuer/ValuerCaptionExample.jsx
```

This example page demonstrates:
- Full component usage with sample data
- Props documentation
- Print functionality
- Usage instructions

## Customization Tips

### Change Colors
Edit `EngineerCaption.module.css`:
```css
/* Change header gradient */
.header {
  background: linear-gradient(to bottom, #your-color 0%, #your-color 100%);
}

/* Change company name color */
.companyName {
  color: #your-color;
}

/* Change title section background */
.titleSection {
  background: linear-gradient(135deg, #your-color 0%, #your-color 100%);
}
```

### Modify Layout
The component uses CSS Grid for the details table:
```css
.tableRow {
  grid-template-columns: 250px 1fr; /* Adjust first column width */
}
```

### Add Custom Sections
You can extend the component by adding new sections in the JSX:
```jsx
<div className={styles.customSection}>
  <h3>Your Custom Section</h3>
  {/* Your content */}
</div>
```

## Browser Compatibility
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Performance
- Lightweight component (~10KB)
- No external dependencies
- Fast rendering
- Optimized CSS

## Best Practices
1. **Data Validation**: Validate data before passing to component
2. **Responsive Testing**: Test on multiple screen sizes
3. **Print Testing**: Always test print layout before production
4. **Accessibility**: Ensure text contrast meets WCAG standards
5. **Data Privacy**: Don't hardcode sensitive information

## Common Use Cases
1. **Valuer Profiles**: Display valuer credentials on profile pages
2. **Report Headers**: Use as header in technical reports
3. **Certificates**: Generate professional certificates
4. **Business Cards**: Digital business card format
5. **PDF Generation**: Include in PDF reports

## Troubleshooting

### Issue: Layout breaks on mobile
**Solution**: Check that parent container doesn't have fixed width

### Issue: Print layout incorrect
**Solution**: Use `@media print` CSS and test with browser print preview

### Issue: Colors not matching
**Solution**: Verify CSS module is imported correctly

### Issue: Data not displaying
**Solution**: Check that props are passed correctly and data structure matches

## Future Enhancements
- [ ] Add signature section
- [ ] Include QR code generation
- [ ] Add photo upload capability
- [ ] Export to PDF functionality
- [ ] Multiple language support
- [ ] Theme customization options

## Support
For issues or questions, refer to the example page or check the component source code.

## License
Part of the Eziliya project.

---
**Created by**: Bob
**Last Updated**: 2026-04-28