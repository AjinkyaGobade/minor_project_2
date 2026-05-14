const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary');

// Configure Cloudinary (only if credentials are provided)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

// multer-storage-cloudinary v2 uses 'params' key
const storage = CloudinaryStorage({
    cloudinary: cloudinary,
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
