// VORTITOUR Cloudinary Client Integration
// Handles media uploads and transformations

class VortitourCloudinary {
    constructor() {
        this.cloudName = null;
        this.uploadPresets = {};
        this.widgets = {};
        this.isInitialized = false;
    }

    // Initialize Cloudinary client
    init() {
        if (this.isInitialized) return;

        const config = window.VORTITOUR_CONFIG;
        if (!config || !config.cloudinary.cloudName) {
            console.warn('Cloudinary configuration missing');
            return false;
        }

        this.cloudName = config.cloudinary.cloudName;
        this.uploadPresets = config.cloudinary.uploadPresets;

        // Load Cloudinary widget script if not already loaded
        if (!window.cloudinary) {
            this.loadCloudinaryScript();
        } else {
            this.setupWidgets();
        }

        this.isInitialized = true;
        console.log('Cloudinary client initialized');
        return true;
    }

    // Load Cloudinary upload widget script
    loadCloudinaryScript() {
        const script = document.createElement('script');
        script.src = 'https://upload-widget.cloudinary.com/global/all.js';
        script.onload = () => {
            this.setupWidgets();
        };
        document.head.appendChild(script);
    }

    // Setup upload widgets
    setupWidgets() {
        if (!window.cloudinary) {
            console.error('Cloudinary widget not loaded');
            return;
        }

        // Panorama upload widget
        this.widgets.panorama = cloudinary.createUploadWidget({
            cloudName: this.cloudName,
            uploadPreset: this.uploadPresets.panoramas,
            sources: ['local', 'url'],
            multiple: false,
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png'],
            maxFileSize: 52428800, // 50MB
            maxImageWidth: 4096,
            maxImageHeight: 2048,
            cropping: false,
            folder: 'vortitour/panoramas',
            tags: ['vortitour', 'panorama'],
            context: {
                caption: 'Panoramic image for virtual tour'
            },
            styles: {
                palette: {
                    window: '#FFFFFF',
                    windowBorder: '#90A0B3',
                    tabIcon: '#007bff',
                    menuIcons: '#5A616A',
                    textDark: '#000000',
                    textLight: '#FFFFFF',
                    link: '#007bff',
                    action: '#FF620C',
                    inactiveTabIcon: '#0E2F5A',
                    error: '#F44235',
                    inProgress: '#0078FF',
                    complete: '#20B832',
                    sourceBg: '#E4EBF1'
                },
                fonts: {
                    default: null,
                    "'Fira Sans', sans-serif": {
                        url: 'https://fonts.googleapis.com/css?family=Fira+Sans',
                        active: true
                    }
                }
            }
        }, (error, result) => {
            this.handleUploadResult('panorama', error, result);
        });

        // Depth map upload widget
        this.widgets.depthMap = cloudinary.createUploadWidget({
            cloudName: this.cloudName,
            uploadPreset: this.uploadPresets.depthMaps,
            sources: ['local', 'url'],
            multiple: false,
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png'],
            maxFileSize: 10485760, // 10MB
            maxImageWidth: 1024,
            maxImageHeight: 512,
            cropping: false,
            folder: 'vortitour/depth_maps',
            tags: ['vortitour', 'depth_map'],
            context: {
                caption: 'Depth map for virtual tour'
            }
        }, (error, result) => {
            this.handleUploadResult('depthMap', error, result);
        });

        // General media upload widget
        this.widgets.media = cloudinary.createUploadWidget({
            cloudName: this.cloudName,
            uploadPreset: this.uploadPresets.media,
            sources: ['local', 'url', 'camera'],
            multiple: true,
            resourceType: 'auto',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mp3', 'wav'],
            maxFileSize: 104857600, // 100MB
            folder: 'vortitour/media',
            tags: ['vortitour', 'media'],
            context: {
                caption: 'Media for virtual tour'
            }
        }, (error, result) => {
            this.handleUploadResult('media', error, result);
        });

        console.log('Cloudinary widgets initialized');
    }

    // Handle upload results
    handleUploadResult(widgetType, error, result) {
        if (error) {
            console.error(`${widgetType} upload error:`, error);
            this.dispatchUploadEvent('error', { widgetType, error });
            return;
        }

        if (result && result.event === 'success') {
            console.log(`${widgetType} upload success:`, result.info);
            this.dispatchUploadEvent('success', { 
                widgetType, 
                result: result.info,
                url: result.info.secure_url,
                publicId: result.info.public_id
            });
        }

        // Handle other events
        if (result && result.event) {
            this.dispatchUploadEvent(result.event, { widgetType, result });
        }
    }

    // Dispatch upload events
    dispatchUploadEvent(eventType, data) {
        window.dispatchEvent(new CustomEvent(`vortitour:upload-${eventType}`, {
            detail: data
        }));
    }

    // Open upload widget
    openUploadWidget(type = 'media', options = {}) {
        if (!this.widgets[type]) {
            console.error(`Upload widget '${type}' not found`);
            return;
        }

        // Update widget options if provided
        if (Object.keys(options).length > 0) {
            this.widgets[type].update(options);
        }

        this.widgets[type].open();
    }

    // Upload file programmatically
    async uploadFile(file, type = 'media', options = {}) {
        if (!this.isInitialized) {
            throw new Error('Cloudinary not initialized');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPresets[type] || this.uploadPresets.media);
        
        // Add additional options
        Object.keys(options).forEach(key => {
            formData.append(key, options[key]);
        });

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('File uploaded successfully:', result);
            
            this.dispatchUploadEvent('success', {
                widgetType: type,
                result,
                url: result.secure_url,
                publicId: result.public_id
            });

            return result;

        } catch (error) {
            console.error('Upload error:', error);
            this.dispatchUploadEvent('error', { widgetType: type, error });
            throw error;
        }
    }

    // Generate optimized image URL
    getOptimizedImageUrl(publicId, options = {}) {
        if (!publicId || !this.cloudName) return '';

        const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
        const transformations = [];

        // Quality optimization
        if (options.quality !== false) {
            transformations.push(`q_${options.quality || 'auto:good'}`);
        }

        // Format optimization
        if (options.format !== false) {
            transformations.push(`f_${options.format || 'auto'}`);
        }

        // Resize options
        if (options.width) {
            transformations.push(`w_${options.width}`);
        }

        if (options.height) {
            transformations.push(`h_${options.height}`);
        }

        if (options.crop) {
            transformations.push(`c_${options.crop}`);
        }

        // Responsive sizing
        if (options.responsive) {
            transformations.push('c_scale,w_auto,dpr_auto');
        }

        // Build URL
        const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';
        return `${baseUrl}/${transformationString}${publicId}`;
    }

    // Generate video URL
    getVideoUrl(publicId, options = {}) {
        if (!publicId || !this.cloudName) return '';

        const baseUrl = `https://res.cloudinary.com/${this.cloudName}/video/upload`;
        const transformations = [];

        // Quality optimization
        if (options.quality !== false) {
            transformations.push(`q_${options.quality || 'auto:good'}`);
        }

        // Format optimization
        if (options.format !== false) {
            transformations.push(`f_${options.format || 'auto'}`);
        }

        // Video specific options
        if (options.width) {
            transformations.push(`w_${options.width}`);
        }

        if (options.height) {
            transformations.push(`h_${options.height}`);
        }

        if (options.bitRate) {
            transformations.push(`br_${options.bitRate}`);
        }

        // Build URL
        const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';
        return `${baseUrl}/${transformationString}${publicId}`;
    }

    // Generate thumbnail URL
    getThumbnailUrl(publicId, size = 200) {
        return this.getOptimizedImageUrl(publicId, {
            width: size,
            height: size,
            crop: 'fill',
            quality: 'auto:good',
            format: 'auto'
        });
    }

    // Generate panorama-specific URL
    getPanoramaUrl(publicId, options = {}) {
        return this.getOptimizedImageUrl(publicId, {
            width: options.width || 4096,
            height: options.height || 2048,
            crop: 'limit',
            quality: options.quality || 'auto:good',
            format: options.format || 'auto'
        });
    }

    // Delete asset
    async deleteAsset(publicId, resourceType = 'image') {
        // Note: This requires server-side implementation for security
        // Client-side deletion is not recommended for production
        console.warn('Asset deletion should be implemented server-side for security');
        
        // Dispatch event for server-side handling
        this.dispatchUploadEvent('delete-request', {
            publicId,
            resourceType
        });
    }

    // Get asset details
    async getAssetDetails(publicId, resourceType = 'image') {
        try {
            const response = await fetch(`https://res.cloudinary.com/${this.cloudName}/${resourceType}/upload/${publicId}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to get asset details: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Error getting asset details:', error);
            throw error;
        }
    }

    // Create upload preset (requires admin API key - server-side only)
    createUploadPreset(presetData) {
        console.warn('Upload preset creation should be done server-side with admin API key');
        // This would typically be handled by a backend service
    }

    // Utility methods
    isValidImageFormat(file) {
        const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        return validFormats.includes(file.type);
    }

    isValidVideoFormat(file) {
        const validFormats = ['video/mp4', 'video/webm', 'video/ogg'];
        return validFormats.includes(file.type);
    }

    isValidAudioFormat(file) {
        const validFormats = ['audio/mp3', 'audio/wav', 'audio/ogg'];
        return validFormats.includes(file.type);
    }

    getFileSize(file) {
        return file.size;
    }

    isFileSizeValid(file, maxSize) {
        return file.size <= maxSize;
    }

    // Event listeners for upload progress
    onUploadProgress(callback) {
        window.addEventListener('vortitour:upload-progress', callback);
    }

    onUploadSuccess(callback) {
        window.addEventListener('vortitour:upload-success', callback);
    }

    onUploadError(callback) {
        window.addEventListener('vortitour:upload-error', callback);
    }

    // Remove event listeners
    removeEventListener(eventType, callback) {
        window.removeEventListener(`vortitour:upload-${eventType}`, callback);
    }

    // Get configuration
    getConfig() {
        return {
            cloudName: this.cloudName,
            uploadPresets: this.uploadPresets,
            isInitialized: this.isInitialized
        };
    }
}

// Create global instance
window.VortitourCloudinary = new VortitourCloudinary();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VortitourCloudinary;
}

