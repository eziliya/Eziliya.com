import mongoose from 'mongoose';
import { config } from './config.mjs';

const checkUsers = async () => {
    try {
        await mongoose.connect(config.mongoDB);
        console.log('Connected to MongoDB\n');
        
        const db = mongoose.connection.db;
        const collection = db.collection('users');
        
        // Count total users
        const count = await collection.countDocuments();
        console.log(`Total users in database: ${count}\n`);
        
        // Get all users
        const users = await collection.find({}).toArray();
        
        console.log('All users with contact numbers:');
        console.log('================================\n');
        
        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Contact Number: ${user.contactNumber}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Created: ${user.createdAt}`);
            console.log(`  Active: ${user.isActive}`);
            console.log('');
        });
        
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkUsers();


