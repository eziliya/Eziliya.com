# Database Migration Guide - Add createdByRole to Existing Forms

## Problem
Existing forms in the database don't have the `createdByRole` field, which causes:
- Forms showing up in wrong user profiles
- Cross-role visibility issues
- Technical Engineers seeing Valuer forms and vice versa

## Solution
Run the migration script to update all existing forms with the correct `createdByRole` based on their creator's user role.

## How to Run the Migration

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Run the Migration Script
```bash
node src/scripts/migrateFormRoles.mjs
```

### Step 3: Verify the Results
The script will output:
- Number of forms found without `createdByRole`
- Each form being updated with its role
- Total success and failure counts

Example output:
```
Connected to MongoDB
Found 5 forms without createdByRole
✓ Updated form 66a1b2c3d4e5f6g7h8i9j0k1 with role: valuer
✓ Updated form 66a1b2c3d4e5f6g7h8i9j0k2 with role: technical-engineer
✓ Updated form 66a1b2c3d4e5f6g7h8i9j0k3 with role: valuer
✓ Updated form 66a1b2c3d4e5f6g7h8i9j0k4 with role: technical-engineer
✓ Updated form 66a1b2c3d4e5f6g7h8i9j0k5 with role: valuer

=== Migration Complete ===
Total forms processed: 5
Successfully updated: 5
Failed: 0
Disconnected from MongoDB
```

## What the Script Does

1. **Connects to MongoDB** using your config
2. **Finds all forms** without `createdByRole` field
3. **For each form**:
   - Looks up the user who created it
   - Gets the user's role
   - Updates the form with `createdByRole = user.role`
4. **Reports results** - success and failure counts

## After Migration

Once the migration is complete:
- ✅ Technical Engineers will only see their own forms
- ✅ Valuers will only see their own forms
- ✅ No cross-role visibility
- ✅ Complete data isolation

## Troubleshooting

### Error: "User not found or has no role"
**Cause**: Form has a userId that doesn't exist in the users collection, or the user has no role assigned.
**Solution**: 
- Check if the user exists in the database
- Ensure all users have a role assigned
- Manually update the form if needed

### Error: "Form has no userId"
**Cause**: Form was created without a userId (shouldn't happen with current code).
**Solution**: Manually assign a userId to the form or delete it if it's invalid.

### Error: Connection issues
**Cause**: MongoDB connection string is incorrect or database is not running.
**Solution**: 
- Check your `.env` file for correct MongoDB URL
- Ensure MongoDB is running
- Verify network connectivity

## Manual Database Update (Alternative)

If you prefer to update directly in MongoDB:

```javascript
// Connect to your MongoDB
use your_database_name;

// Update all forms without createdByRole
// You'll need to do this for each user individually
db.ausmallfinanceforms.updateMany(
  { 
    userId: ObjectId("USER_ID_HERE"),
    createdByRole: { $exists: false }
  },
  { 
    $set: { createdByRole: "valuer" } // or "technical-engineer", etc.
  }
);
```

## Verification

After running the migration, verify the results:

```javascript
// Check how many forms have createdByRole
db.ausmallfinanceforms.countDocuments({ createdByRole: { $exists: true } });

// Check forms by role
db.ausmallfinanceforms.countDocuments({ createdByRole: "valuer" });
db.ausmallfinanceforms.countDocuments({ createdByRole: "technical-engineer" });

// Check forms still missing createdByRole
db.ausmallfinanceforms.countDocuments({ createdByRole: { $exists: false } });
```

## Important Notes

- ⚠️ **Backup your database** before running the migration
- ⚠️ Run this script only **once**
- ⚠️ The script is **idempotent** - safe to run multiple times
- ✅ New forms will automatically have `createdByRole` set
- ✅ No code changes needed after migration

## Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your MongoDB connection
3. Ensure all users have valid roles
4. Check the backend logs for query details