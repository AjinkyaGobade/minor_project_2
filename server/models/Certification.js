const mongoose = require('mongoose');

const certificationSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        title: { type: String, required: true },
        issuingOrganization: { type: String, required: true },
        issueDate: { type: Date, required: true },
        expiryDate: { type: Date },
        certificateId: { type: String },
        fileUrl: { type: String, required: true },
        platform: { type: String }, 
        status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

const Certification = mongoose.model('Certification', certificationSchema);
module.exports = Certification;
