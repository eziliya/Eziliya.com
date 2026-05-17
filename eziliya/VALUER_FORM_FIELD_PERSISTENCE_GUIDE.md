# Valuer Form Field Persistence Guide

## Issue
When editing a saved draft in AU Small Finance form, most form fields appear empty even though the data is saved in the database.

## Root Cause
The form has 100+ input fields, but most don't have a `value` attribute. React controlled components need both:
1. `value={formData.fieldName}` - to display data
2. `onChange={handleChange}` - to update data

Currently, most fields only have `onChange` but no `value`.

## Current Status
✅ **Fixed Fields** (showing saved data):
- nameOfvaluationAgency
- dateOfTechnicalInitiation
- applicantsName
- dateOfSiteVisit
- requestFrom
- dateOfReportRelease
- proposalIdApplicationNo
- transactionType
- branchNameId
- requestedFrom
- currentOwnerSellerName
- personMetAtSiteName

❌ **Remaining Fields** (not showing saved data):
- All other 80+ fields in the form

## Solution Options

### Option 1: Add value to all fields manually (Time-consuming)
For each input, add:
```javascript
<input 
  name="fieldName"
  value={formData.fieldName || formData.AlternativeFieldName || ''}
  onChange={handleChange}
/>
```

### Option 2: Use defaultValue (Quick fix, but not ideal)
Change inputs to use `defaultValue` instead of `value`:
```javascript
<input 
  name="fieldName"
  defaultValue={formData.fieldName || ''}
  onChange={handleChange}
/>
```

**Pros**: Quick to implement, fields will show saved data
**Cons**: Not a true controlled component, may have edge cases

### Option 3: Create a custom Input component (Best practice)
```javascript
const FormInput = ({ name, type = "text", ...props }) => (
  <input
    type={type}
    name={name}
    value={formData[name] || formData[name.charAt(0).toUpperCase() + name.slice(1)] || ''}
    onChange={handleChange}
    {...props}
  />
);
```

## Recommended Action

**For immediate fix**: Use Option 2 (defaultValue) for remaining fields
**For long-term**: Refactor to Option 3 (custom component)

## Implementation Steps

1. Search for all `<input` tags without `value` attribute
2. Add `value={formData.fieldName || ''}` to each
3. Handle field name variations (camelCase vs PascalCase)
4. Test save and edit functionality

## Testing Checklist

- [ ] Fill form with data
- [ ] Click "Save Draft"
- [ ] Navigate to "My Reports"
- [ ] Click "Edit" on the draft
- [ ] Verify ALL fields show saved data
- [ ] Modify some fields
- [ ] Save again
- [ ] Edit again to verify updates persisted

## Field Name Mapping

The database stores fields in PascalCase, but form uses camelCase:
- `nameOfvaluationAgency` → `NameofvaluationAgency`
- `dateOfTechnicalInitiation` → `DateofTechnicalInitiation`
- `applicantsName` → `ApplicantsNames`

Always check both variations when adding value attributes.