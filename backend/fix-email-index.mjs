import mongoose from 'mongoose';
import { config } from './config.mjs';

const fixEmailIndex = async () => {
    try {
        await mongoose.connect(config.mongoDB);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const collection = db.collection('users');
        
        // List all indexes
        console.log('\nCurrent indexes:');
        const indexes = await collection.indexes();
        console.log(indexes);
        
        // Drop the email_1 index if it exists
        try {
            await collection.dropIndex('email_1');
            console.log('\n✅ Successfully dropped email_1 index');
        } catch (error) {
            if (error.code === 27) {
                console.log('\n⚠️  email_1 index does not exist');
            } else {
                throw error;
            }
        }
        
        // List indexes after dropping
        console.log('\nIndexes after fix:');
        const indexesAfter = await collection.indexes();
        console.log(indexesAfter);
        
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixEmailIndex();

// Made with Bob
