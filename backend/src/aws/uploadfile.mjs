import { config } from "../../config.mjs";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Log AWS configuration (without exposing full credentials)
console.log("🔧 AWS S3 Configuration:");
console.log("   Region:", config.region);
console.log("   Access Key:", config.secretKey ? `${config.secretKey.substring(0, 8)}...` : "MISSING");
console.log("   Secret Key:", config.secretAccesekey ? "***configured***" : "MISSING");
console.log("   Bucket: eziliyareport");

// Validate AWS credentials
if (!config.secretKey || !config.secretAccesekey || !config.region) {
    console.error("❌ AWS credentials are missing! Check your .env file.");
    throw new Error("AWS credentials not configured properly");
}

// Configure AWS SDK v3 S3 Client with enhanced settings
const s3Client = new S3Client({
    region: config.region,
    credentials: {
        accessKeyId: config.secretKey,
        secretAccessKey: config.secretAccesekey
    },
    // Explicit endpoint configuration for better reliability
    endpoint: `https://s3.${config.region}.amazonaws.com`,
    // Force path style for compatibility
    forcePathStyle: false,
    // Increase timeout for slow networks
    requestHandler: {
        requestTimeout: 30000, // 30 seconds
        httpsAgent: {
            maxSockets: 50,
            keepAlive: true
        }
    },
    // Retry configuration
    maxAttempts: 3,
    retryMode: "adaptive"
});

console.log("✅ S3 Client initialized successfully");

/**
 * Upload a file to AWS S3
 * @param {Object} file - Multer file object with buffer and originalname
 * @param {String} folder - Optional folder path in S3 bucket (e.g., 'sales-team', 'final-reports')
 * @returns {Promise<String>} - Returns the public URL of the uploaded file
 */
const uploadfile = async (file, folder = 'general') => {
    try {
        // Validate file object
        if (!file) {
            throw new Error("File object is required");
        }
        
        if (!file.buffer) {
            throw new Error("Invalid file object: buffer is missing");
        }
        
        if (!file.originalname) {
            throw new Error("Invalid file object: originalname is missing");
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
        const uploadParams = {
            Bucket: "eziliyareport",
            Key: `eziliyareports/${folder}/${uniqueFilename}`,
            Body: file.buffer,
            ContentType: contentType,
            // ACL removed - bucket has Block Public Access enabled
            Metadata: {
                'original-name': file.originalname,
                'upload-timestamp': timestamp.toString()
            }
        };

        console.log(`📤 Uploading file to S3: ${uploadParams.Key}`);
        console.log(`   Size: ${(file.buffer.length / 1024).toFixed(2)} KB`);
        console.log(`   Type: ${contentType}`);
        console.log(`   Bucket: ${uploadParams.Bucket}`);
        console.log(`   Region: ${config.region}`);

        // Upload to S3 using AWS SDK v3 with retry logic
        const command = new PutObjectCommand(uploadParams);
        
        let lastError;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`   Attempt ${attempt}/3...`);
                await s3Client.send(command);
                
                // Construct the public URL
                const fileUrl = `https://${uploadParams.Bucket}.s3.${config.region}.amazonaws.com/${uploadParams.Key}`;

                console.log(`✅ File uploaded successfully: ${fileUrl}`);
                return fileUrl;
            } catch (error) {
                lastError = error;
                console.error(`   ❌ Attempt ${attempt} failed:`, error.message);
                
                if (attempt < 3) {
                    // Wait before retrying (exponential backoff)
                    const waitTime = Math.pow(2, attempt) * 1000;
                    console.log(`   ⏳ Waiting ${waitTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
        
        // All attempts failed
        throw lastError;
    } catch (error) {
        console.error("❌ S3 Upload Error:", {
            code: error.code || error.name,
            message: error.message,
            region: config.region,
            bucket: "eziliyareport",
            file: file?.originalname,
            endpoint: `https://s3.${config.region}.amazonaws.com`
        });
        
        // Provide more helpful error messages
        let errorMessage = error.message;
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            errorMessage = `Network error: Cannot reach AWS S3. Please check your internet connection and DNS settings. Original error: ${error.message}`;
        } else if (error.code === 'InvalidAccessKeyId') {
            errorMessage = 'Invalid AWS Access Key. Please check your credentials in .env file.';
        } else if (error.code === 'SignatureDoesNotMatch') {
            errorMessage = 'Invalid AWS Secret Key. Please check your credentials in .env file.';
        } else if (error.code === 'NoSuchBucket') {
            errorMessage = 'S3 bucket "eziliyareport" does not exist or is not accessible.';
        }
        
        throw new Error(`S3 Upload failed: ${errorMessage}`);
    }
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
            Bucket: "eziliyareport",
            Key: key
        };

        console.log(`🗑️  Deleting file from S3: ${key}`);

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);

        console.log(`✅ File deleted successfully: ${key}`);
        return true;
    } catch (error) {
        console.error("❌ Error deleting file from S3:", error);
        throw error;
    }
};

/**
 * Generate a pre-signed URL for accessing a private S3 object
 * @param {String} fileUrl - The S3 URL of the file
 * @param {Number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<String>} - Returns a pre-signed URL
 */
export const getPresignedUrl = async (fileUrl, expiresIn = 3600) => {
    if (!fileUrl) {
        return null;
    }

    try {
        // Extract key from URL
        const urlParts = fileUrl.split('.com/');
        if (urlParts.length < 2) {
            console.error("Invalid S3 URL format:", fileUrl);
            return fileUrl; // Return original URL if parsing fails
        }
        
        const key = urlParts[1];

        const command = new GetObjectCommand({
            Bucket: "eziliyareport",
            Key: key
        });

        // Generate pre-signed URL that expires in specified time
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        
        console.log(`🔗 Generated pre-signed URL for: ${key} (expires in ${expiresIn}s)`);
        return presignedUrl;
    } catch (error) {
        console.error("❌ Error generating pre-signed URL:", error);
        return fileUrl; // Return original URL as fallback
    }
};

export default uploadfile;

// Made with Bob
