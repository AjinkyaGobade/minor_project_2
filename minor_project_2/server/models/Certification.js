const mongoose = require('mongoose');

const certificationSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        uploadedBy: { type: String }, // To store user name directly for easy access
        title: { type: String, required: true },
        description: { type: String },
        category: { type: String },
        provider: { type: String, required: true, default: 'Others' },
        year: { type: Number, required: true, default: new Date().getFullYear() },
        month: { type: String, required: true, default: new Date().toLocaleString('default', { month: 'short' }) },
        tags: [{ type: String }],
        fileUrl: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        adminFeedback: { type: String },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        ocrResult: {
            processed: { type: Boolean, default: false },
            isMatch: { type: Boolean },
            confidence: { type: Number },
            warnings: [{ type: String }],
            rawText: { type: String }
        }
    },
    { timestamps: true }
);

const Certification = mongoose.model('Certification', certificationSchema);
module.exports = Certification;
