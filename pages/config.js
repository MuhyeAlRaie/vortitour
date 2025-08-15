// VORTITOUR Configuration
// Replace these values with your actual Supabase and Cloudinary credentials

const VORTITOUR_CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://puvwtxeaxcaslnijkntm.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1dnd0eGVheGNhc2xuaWprbnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDc4NjcsImV4cCI6MjA3MDUyMzg2N30.RJk-z8VI3hQcZ-gzZWLbuf9IuTAeEdHL2aFIoqOacnI'
    },
    
    // Cloudinary Configuration
    cloudinary: {
        cloudName: 'dezvuqqrl',
        apiKey: '187498634689397', // Optional for unsigned uploads
        uploadPresets: {
            panoramas: 'vortitour_panoramas',
            depthMaps: 'vortitour_depth_maps',
            media: 'vortitour_media'
        }
    },
    
    // Application Settings
    app: {
        name: 'VORTITOUR',
        version: '1.0.0',
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'ar'],
        maxFileSize: {
            panorama: 52428800, // 50MB
            depthMap: 10485760,  // 10MB
            media: 104857600     // 100MB
        }
    },
    
    // Feature Flags
    features: {
        vrMode: true,
        analytics: true,
        sharing: true,
        embedding: true,
        multiLanguage: true
    },
    
    // API Endpoints (if needed for custom backend)
    api: {
        baseUrl: window.location.origin,
        endpoints: {
            analytics: '/api/analytics',
            export: '/api/export'
        }
    }
};

// Make config available globally
window.VORTITOUR_CONFIG = VORTITOUR_CONFIG;

