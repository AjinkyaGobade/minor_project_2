const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Override DNS server to bypass local network / ISP blocks
dns.setServers(['8.8.8.8']);

const cleanup = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('ERROR: MONGODB_URI environment variable is not set.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        
        console.log('Connecting to database...');
        
        // Find certifications that were uploaded locally (fileUrl starting with /uploads)
        const oldCerts = await db.collection('certifications')
            .find({ fileUrl: { $regex: '^\/uploads' } })
            .toArray();
            
        console.log(`Found ${oldCerts.length} old certificates uploaded locally.`);
        
        if (oldCerts.length === 0) {
            console.log('No old local certificates found. Nothing to delete.');
            process.exit(0);
        }

        // Delete them
        const result = await db.collection('certifications').deleteMany({
            fileUrl: { $regex: '^\/uploads' }
        });
        
        console.log(`Successfully deleted ${result.deletedCount} old local certificates from the database.`);
        process.exit(0);
    } catch (err) {
        console.error('ERROR during cleanup:', err);
        process.exit(1);
    }
};

cleanup();
