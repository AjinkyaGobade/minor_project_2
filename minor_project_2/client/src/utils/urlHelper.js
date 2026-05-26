import axios from 'axios';

/**
 * Resolves a file URL. If the URL is relative (e.g. '/uploads/...'),
 * it prepends the Axios defaults baseURL to ensure it reaches the backend.
 * If the URL is already absolute (e.g. Cloudinary starting with 'http'), it returns it as-is.
 * @param {string} url - The URL to resolve
 * @returns {string} The fully qualified URL
 */
export const getFullFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Ensure we don't end up with double slashes if baseURL ends with '/' and url starts with '/'
    const baseUrl = axios.defaults.baseURL || 'http://localhost:5000';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${cleanBaseUrl}${cleanUrl}`;
};
