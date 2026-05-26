const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection.db;
    const certs = await db.collection("certifications").find().sort({createdAt: -1}).limit(1).toArray();
    console.log(certs);
    process.exit(0);
});
