# AWS S3 Setup Guide for Eziliya Application

## Quick Start - Get Your AWS Credentials

### Step 1: Create AWS Account
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the registration process
4. Verify your email and phone number

### Step 2: Create IAM User
1. Log into AWS Console
2. Go to **IAM** (Identity and Access Management)
3. Click **Users** → **Add users**
4. Enter username: `eziliya-app-user`
5. Select **Access key - Programmatic access**
6. Click **Next: Permissions**

### Step 3: Set Permissions
1. Click **Attach existing policies directly**
2. Search and select: **AmazonS3FullAccess**
3. Click **Next: Tags** (optional)
4. Click **Next: Review**
5. Click **Create user**

### Step 4: Save Credentials
⚠️ **IMPORTANT**: This is your only chance to see the secret key!

You'll see:
```
Access key ID: AKIA...
Secret access key: wJalrXUtn...
```

**Copy both values immediately!**

### Step 5: Create S3 Bucket
1. Go to **S3** service in AWS Console
2. Click **Create bucket**
3. Bucket name: `eziliya`
4. Region: **Asia Pacific (Mumbai) ap-south-1**
5. Uncheck "Block all public access"
6. Check "I acknowledge..."
7. Click **Create bucket**

### Step 6: Configure Bucket Policy
1. Click on your `eziliya` bucket
2. Go to **Permissions** tab
3. Scroll to **Bucket policy**
4. Click **Edit**
5. Paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::eziliya/*"
        }
    ]
}
```

6. Click **Save changes**

### Step 7: Configure CORS
1. Still in **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Click **Edit**
4. Paste this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

5. Click **Save changes**

### Step 8: Update Backend .env File
1. Open `backend/.env`
2. Replace the placeholder values:

```env
PORT=8080
mongoDB=mongodb+srv://your-connection-string
secretMessage=Eziliya.com
accesekey=AKIA...YOUR_ACTUAL_ACCESS_KEY
secretAccesekey=wJalrXUtn...YOUR_ACTUAL_SECRET_KEY
region=ap-south-1
```

3. Save the file

### Step 9: Test the Setup
1. Restart your backend server:
```bash
cd backend
npm run dev
```

2. Try submitting a form with files
3. Check the terminal for upload logs:
```
📤 Uploading file to S3: eziliya/sales-team/documents/aadhar/...
✅ File uploaded successfully: https://eziliya.s3.ap-south-1.amazonaws.com/...
```

4. Verify in AWS Console:
   - Go to S3 → eziliya bucket
   - You should see folders: `eziliya/sales-team/...`
   - Click on a file to verify it's accessible

## Security Best Practices

### ✅ DO:
- Keep credentials in `.env` file (never commit to git)
- Use IAM user with minimal permissions
- Enable MFA on AWS account
- Rotate access keys regularly
- Monitor S3 usage in AWS Console

### ❌ DON'T:
- Commit `.env` to version control
- Share credentials in chat/email
- Use root account credentials
- Give full admin access
- Leave unused buckets public

## Cost Estimation

### Free Tier (First 12 months):
- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests

### After Free Tier:
- Storage: ~$0.023 per GB/month
- PUT requests: $0.005 per 1,000 requests
- GET requests: $0.0004 per 1,000 requests

**Estimated monthly cost for small app**: $1-5

## Troubleshooting

### Error: "Access Denied"
**Solution**: Check IAM user has S3 permissions

### Error: "Bucket does not exist"
**Solution**: Verify bucket name is exactly `eziliya`

### Error: "Invalid security token"
**Solution**: Check credentials in .env are correct

### Error: "CORS policy blocked"
**Solution**: Configure CORS in S3 bucket settings

### Files upload but can't access
**Solution**: Check bucket policy allows public read

## Alternative: Use Different Bucket Name

If `eziliya` is taken, use a different name:

1. Create bucket with unique name: `eziliya-yourname-2024`
2. Update `uploadfile.mjs`:
```javascript
const uploadparams = {
    Bucket: "eziliya-yourname-2024",  // Change here
    // ... rest of config
};
```

## Monitoring Usage

### Check S3 Usage:
1. AWS Console → S3
2. Click on bucket name
3. Go to **Metrics** tab
4. View storage, requests, and data transfer

### Set Up Billing Alerts:
1. AWS Console → Billing
2. Click **Budgets**
3. Create budget: $5/month
4. Set email alert at 80% threshold

## Getting Help

### AWS Support:
- Free tier: Community forums
- Developer: $29/month
- Business: $100/month

### Documentation:
- AWS S3 Docs: https://docs.aws.amazon.com/s3/
- IAM Docs: https://docs.aws.amazon.com/iam/

### Common Issues:
- Check AWS Service Health Dashboard
- Review CloudWatch logs
- Test with AWS CLI: `aws s3 ls s3://eziliya/`

## Next Steps

After setup is complete:
1. ✅ Test file upload from frontend
2. ✅ Verify files appear in S3 bucket
3. ✅ Check MongoDB has S3 URLs saved
4. ✅ Test file access from browser
5. ✅ Monitor costs in AWS Console

---

**Setup Time**: ~15-20 minutes
**Difficulty**: Beginner-friendly
**Cost**: Free tier available

Need help? Check the main documentation: `AWS_UPLOAD_SYSTEM_DOCUMENTATION.md`