const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary');

// Configure Cloudinary (only if credentials are provided)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

// Support both multer-storage-cloudinary v2 (flat properties) and v3/v4 (nested in params)
const storage = CloudinaryStorage({
    cloudinary: require('cloudinary'),
    // v2 flat configuration
    folder: 'sdmcet_certificates',
    allowedFormats: ['jpg', 'png', 'jpeg', 'pdf'],
    resourceType: 'auto',
    // v3/v4 nested configuration
    params: {
        folder: 'sdmcet_certificates',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
        resource_type: 'auto'
    }
});

module.exports = {
    cloudinary,
    storage
};
