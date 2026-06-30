import mongoose from 'mongoose';
import { config } from './config.mjs';

async function dropIndexes() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(config.mongoDB);
        console.log('✅ Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const collection = db.collection('users');
        
        // List all indexes
        const indexes = await collection.indexes();
        console.log('📋 Current indexes:', indexes.map(i => i.name));
        
        // List of problematic indexes to drop (fields not in current schema)
        const indexesToDrop = [
            'mobileRegisteredNumber_1',
            'email_1',
            'firmRegisteredMobileNumber_1',
            'isVerified_1',
            'isDeleted_1',
            'email_1_isDeleted_1',
            'contactNumber_1',
            'isActive_1',
            'createdAt_-1'
        ];
        
        // Drop each problematic index
        for (const indexName of indexesToDrop) {
            try {
                await collection.dropIndex(indexName);
                console.log(`✅ Successfully dropped index: ${indexName}`);
            } catch (err) {
                if (err.message.includes('index not found')) {
                    console.log(`ℹ️  Index ${indexName} does not exist`);
                } else {
                    console.log(`⚠️  Could not drop ${indexName}: ${err.message}`);
                }
            }
        }
        
        // List indexes after dropping
        const indexesAfter = await collection.indexes();
        console.log('📋 Indexes after cleanup:', indexesAfter.map(i => i.name));
        
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        console.log('\n🎉 Database cleanup complete! You can now register new users.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

dropIndexes();

// Made with Bob
