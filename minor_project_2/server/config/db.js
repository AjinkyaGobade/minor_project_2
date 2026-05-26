const mongoose = require('mongoose');
const dns = require('dns');

// Override default DNS servers to use Google's public DNS
// This fixes "querySrv ECONNREFUSED _mongodb._tcp.cluster..." errors
// caused by local networks or ISPs blocking/failing SRV record lookups.
dns.setServers(['8.8.8.8']);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            family: 4 // Forces IPv4 instead of IPv6 to prevent DNS resolution errors
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
