import { config } from "../../config.mjs";
import aws from "aws-sdk";

// Configure AWS SDK
aws.config.update({
    accessKeyId: config.secretKey,
    secretAccessKey: config.secretAccesekey,
    region: config.region
});

const s3 = new aws.S3({ apiVersion: "2006-03-01" });

/**
 * Upload a file to AWS S3
 * @param {Object} file - Multer file object with buffer and originalname
 * @param {String} folder - Optional folder path in S3 bucket (e.g., 'sales-team', 'final-reports')
 * @returns {Promise<String>} - Returns the public URL of the uploaded file
 */
const uploadfile = async (file, folder = 'general') => {
    return new Promise((resolve, reject) => {
        // Validate file object
        if (!file) {
            return reject(new Error("File object is required"));
        }
        
        if (!file.buffer) {
            return reject(new Error("Invalid file object: buffer is missing"));
        }
        
        if (!file.originalname) {
            return reject(new Error("Invalid file object: originalname is missing"));
        }

        // Sanitize filename - remove special characters and spaces
        const sanitizedFilename = file.originalname
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/_{2,}/g, '_');

        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${sanitizedFilename}`;

        // Determine content type
        const contentType = file.mimetype || 'application/octet-stream';

        // Set up S3 upload parameters
        const uploadparams = {
            ACL: "public-read",
            Bucket: "eziliyareport",
            Key: `eziliya/${folder}/${uniqueFilename}`,
            Body: file.buffer,
            ContentType: contentType,
            Metadata: {
                'original-name': file.originalname,
                'upload-timestamp': timestamp.toString()
            }
        };

        console.log(`📤 Uploading file to S3: ${uploadparams.Key}`);
        console.log(`   Size: ${(file.buffer.length / 1024).toFixed(2)} KB`);
        console.log(`   Type: ${contentType}`);

        // Upload to S3
        s3.upload(uploadparams, (err, data) => {
            if (err) {
                console.error("❌ S3 Upload Error:", {
                    code: err.code,
                    message: err.message,
                    statusCode: err.statusCode,
                    region: config.region,
                    bucket: uploadparams.Bucket,
                    key: uploadparams.Key,
                    file: file.originalname
                });
                return reject(new Error(`S3 Upload failed: ${err.message}`));
            }

            if (!data || !data.Location) {
                console.error("❌ S3 Upload Error: No location returned");
                return reject(new Error("Failed to upload file: No location returned from S3"));
            }

            console.log(`✅ File uploaded successfully: ${data.Location}`);
            resolve(data.Location);
        });
    });
};

/**
 * Upload multiple files to AWS S3
 * @param {Array} files - Array of Multer file objects
 * @param {String} folder - Optional folder path in S3 bucket
 * @returns {Promise<Array>} - Returns array of public URLs
 */
export const uploadMultipleFiles = async (files, folder = 'general') => {
    if (!files || !Array.isArray(files) || files.length === 0) {
        throw new Error("Files array is required and must not be empty");
    }

    console.log(`📤 Uploading ${files.length} files to S3...`);
    
    try {
        const uploadPromises = files.map(file => uploadfile(file, folder));
        const urls = await Promise.all(uploadPromises);
        console.log(`✅ All ${files.length} files uploaded successfully`);
        return urls;
    } catch (error) {
        console.error("❌ Error uploading multiple files:", error);
        throw error;
    }
};

/**
 * Delete a file from AWS S3
 * @param {String} fileUrl - The S3 URL of the file to delete
 * @returns {Promise<Boolean>} - Returns true if deleted successfully
 */
export const deleteFile = async (fileUrl) => {
    if (!fileUrl) {
        throw new Error("File URL is required");
    }

    try {
        // Extract key from URL
        const urlParts = fileUrl.split('.com/');
        if (urlParts.length < 2) {
            throw new Error("Invalid S3 URL format");
        }
        
        const key = urlParts[1];

        const deleteParams = {
            Bucket: "eziliya",
            Key: key
        };

        console.log(`🗑️  Deleting file from S3: ${key}`);

        await s3.deleteObject(deleteParams).promise();
        console.log(`✅ File deleted successfully: ${key}`);
        return true;
    } catch (error) {
        console.error("❌ Error deleting file from S3:", error);
        throw error;
    }
};

export default uploadfile;
