// VORTITOUR Analytics System
// Handles event tracking, data collection, and reporting

class VortitourAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        this.isInitialized = false;
        this.currentTour = null;
        this.currentScene = null;
        this.userAgent = navigator.userAgent;
        this.screenResolution = `${screen.width}x${screen.height}`;
        this.viewportSize = this.getViewportSize();
        this.deviceType = this.getDeviceType();
        this.location = null;
    }

    // Initialize analytics system
    async init() {
        if (this.isInitialized) return;

        try {
            // Get user location (optional)
            await this.getUserLocation();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Track session start
            this.trackEvent('session_start', {
                user_agent: this.userAgent,
                screen_resolution: this.screenResolution,
                viewport_size: this.viewportSize,
                device_type: this.deviceType,
                location: this.location
            });

            this.isInitialized = true;
            console.log('Analytics system initialized');

        } catch (error) {
            console.error('Failed to initialize analytics:', error);
        }
    }

    // Generate unique session ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get viewport size
    getViewportSize() {
        return `${window.innerWidth}x${window.innerHeight}`;
    }

    // Detect device type
    getDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
            return 'mobile';
        } else if (/tablet|ipad/i.test(userAgent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    // Get user location (with permission)
    async getUserLocation() {
        try {
            if (!navigator.geolocation) {
                console.log('Geolocation not supported');
                return;
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 5000,
                    enableHighAccuracy: false
                });
            });

            // Get approximate location using IP geolocation service
            try {
                const response = await fetch('https://ipapi.co/json/');
                const locationData = await response.json();
                
                this.location = {
                    country: locationData.country_name,
                    city: locationData.city,
                    region: locationData.region,
                    timezone: locationData.timezone
                };
            } catch (error) {
                console.log('Could not get location data:', error);
            }

        } catch (error) {
            console.log('Geolocation permission denied or failed:', error);
        }
    }

    // Setup global event listeners
    setupEventListeners() {
        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden');
            } else {
                this.trackEvent('page_visible');
            }
        });

        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.viewportSize = this.getViewportSize();
                this.trackEvent('viewport_resize', {
                    new_size: this.viewportSize
                });
            }, 250);
        });

        // Page unload
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
        });

        // Error tracking
        window.addEventListener('error', (event) => {
            this.trackEvent('javascript_error', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
        });

        // Click tracking
        document.addEventListener('click', (event) => {
            this.trackClick(event);
        });

        // Scroll tracking
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackScroll();
            }, 250);
        });
    }

    // Track generic event
    async trackEvent(eventType, metadata = {}) {
        const event = {
            session_id: this.sessionId,
            event_type: eventType,
            timestamp: new Date().toISOString(),
            tour_id: this.currentTour,
            scene_id: this.currentScene,
            user_agent: this.userAgent,
            ip_address: null, // Will be set server-side
            country: this.location?.country,
            city: this.location?.city,
            metadata: {
                ...metadata,
                viewport_size: this.viewportSize,
                device_type: this.deviceType,
                page_url: window.location.href,
                referrer: document.referrer
            }
        };

        // Add to local events array
        this.events.push(event);

        // Send to server if Supabase is available
        if (window.VortitourSupabase && window.VortitourSupabase.isInitialized) {
            try {
                await window.VortitourSupabase.trackEvent(event);
            } catch (error) {
                console.error('Failed to track event:', error);
                // Store locally for retry
                this.storeEventLocally(event);
            }
        } else {
            // Store locally if no backend connection
            this.storeEventLocally(event);
        }

        console.log('Event tracked:', eventType, metadata);
    }

    // Store event locally for later sync
    storeEventLocally(event) {
        try {
            const storedEvents = JSON.parse(localStorage.getItem('vortitour_analytics_events') || '[]');
            storedEvents.push(event);
            
            // Keep only last 100 events to prevent storage overflow
            if (storedEvents.length > 100) {
                storedEvents.splice(0, storedEvents.length - 100);
            }
            
            localStorage.setItem('vortitour_analytics_events', JSON.stringify(storedEvents));
        } catch (error) {
            console.error('Failed to store event locally:', error);
        }
    }

    // Sync locally stored events
    async syncStoredEvents() {
        if (!window.VortitourSupabase || !window.VortitourSupabase.isInitialized) {
            return;
        }

        try {
            const storedEvents = JSON.parse(localStorage.getItem('vortitour_analytics_events') || '[]');
            
            if (storedEvents.length === 0) return;

            console.log(`Syncing ${storedEvents.length} stored events...`);

            for (const event of storedEvents) {
                try {
                    await window.VortitourSupabase.trackEvent(event);
                } catch (error) {
                    console.error('Failed to sync event:', error);
                    break; // Stop syncing if there's an error
                }
            }

            // Clear stored events after successful sync
            localStorage.removeItem('vortitour_analytics_events');
            console.log('Stored events synced successfully');

        } catch (error) {
            console.error('Failed to sync stored events:', error);
        }
    }

    // Tour-specific tracking methods
    async trackTourLoad(tourId, metadata = {}) {
        this.currentTour = tourId;
        await this.trackEvent('tour_load', {
            tour_id: tourId,
            ...metadata
        });

        // Increment tour views
        if (window.VortitourSupabase && window.VortitourSupabase.isInitialized) {
            try {
                await window.VortitourSupabase.incrementTourViews(tourId);
            } catch (error) {
                console.error('Failed to increment tour views:', error);
            }
        }
    }

    async trackSceneEnter(sceneId, metadata = {}) {
        // Track scene exit for previous scene
        if (this.currentScene && this.currentScene !== sceneId) {
            await this.trackSceneExit(this.currentScene);
        }

        this.currentScene = sceneId;
        this.sceneStartTime = Date.now();

        await this.trackEvent('scene_enter', {
            scene_id: sceneId,
            ...metadata
        });
    }

    async trackSceneExit(sceneId, metadata = {}) {
        const duration = this.sceneStartTime ? Date.now() - this.sceneStartTime : 0;

        await this.trackEvent('scene_exit', {
            scene_id: sceneId,
            duration: Math.round(duration / 1000), // Duration in seconds
            ...metadata
        });
    }

    async trackHotspotClick(hotspotId, hotspotType, metadata = {}) {
        await this.trackEvent('hotspot_click', {
            hotspot_id: hotspotId,
            hotspot_type: hotspotType,
            scene_id: this.currentScene,
            ...metadata
        });
    }

    async trackVRModeEnter(metadata = {}) {
        await this.trackEvent('vr_mode_enter', {
            scene_id: this.currentScene,
            ...metadata
        });
    }

    async trackVRModeExit(metadata = {}) {
        await this.trackEvent('vr_mode_exit', {
            scene_id: this.currentScene,
            ...metadata
        });
    }

    async trackFullscreenEnter(metadata = {}) {
        await this.trackEvent('fullscreen_enter', {
            scene_id: this.currentScene,
            ...metadata
        });
    }

    async trackFullscreenExit(metadata = {}) {
        await this.trackEvent('fullscreen_exit', {
            scene_id: this.currentScene,
            ...metadata
        });
    }

    // UI interaction tracking
    trackClick(event) {
        const element = event.target;
        const tagName = element.tagName.toLowerCase();
        const className = element.className;
        const id = element.id;
        const text = element.textContent?.trim().substring(0, 100);

        // Only track meaningful clicks
        if (['button', 'a', 'input'].includes(tagName) || 
            className.includes('btn') || 
            className.includes('clickable')) {
            
            this.trackEvent('ui_click', {
                element_tag: tagName,
                element_id: id,
                element_class: className,
                element_text: text,
                position_x: event.clientX,
                position_y: event.clientY
            });
        }
    }

    trackScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

        this.trackEvent('page_scroll', {
            scroll_position: scrollTop,
            scroll_percent: scrollPercent,
            page_height: document.documentElement.scrollHeight
        });
    }

    // Performance tracking
    async trackPerformance(metadata = {}) {
        if (!window.performance) return;

        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        const performanceData = {
            page_load_time: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : null,
            dom_content_loaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart) : null,
            first_paint: paint.find(p => p.name === 'first-paint')?.startTime || null,
            first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
            ...metadata
        };

        await this.trackEvent('performance', performanceData);
    }

    // Session tracking
    async trackSessionEnd() {
        const sessionDuration = Date.now() - this.startTime;

        await this.trackEvent('session_end', {
            session_duration: Math.round(sessionDuration / 1000), // Duration in seconds
            events_count: this.events.length,
            final_scene: this.currentScene,
            final_tour: this.currentTour
        });

        // Sync any remaining stored events
        await this.syncStoredEvents();
    }

    // Analytics data retrieval methods
    async getAnalyticsData(tourId, filters = {}) {
        if (!window.VortitourSupabase || !window.VortitourSupabase.isInitialized) {
            throw new Error('Analytics backend not available');
        }

        return await window.VortitourSupabase.getAnalytics(tourId, filters);
    }

    async getAnalyticsSummary(tourId, period = '30d') {
        if (!window.VortitourSupabase || !window.VortitourSupabase.isInitialized) {
            throw new Error('Analytics backend not available');
        }

        return await window.VortitourSupabase.getAnalyticsSummary(tourId, period);
    }

    // Analytics reporting methods
    generateReport(data, type = 'summary') {
        switch (type) {
            case 'summary':
                return this.generateSummaryReport(data);
            case 'detailed':
                return this.generateDetailedReport(data);
            case 'export':
                return this.generateExportReport(data);
            default:
                throw new Error('Unknown report type');
        }
    }

    generateSummaryReport(data) {
        const totalEvents = data.length;
        const uniqueSessions = new Set(data.map(event => event.session_id)).size;
        const eventTypes = this.groupBy(data, 'event_type');
        const countries = this.groupBy(data, 'country');
        const devices = this.groupBy(data.filter(e => e.metadata?.device_type), e => e.metadata.device_type);

        return {
            overview: {
                total_events: totalEvents,
                unique_sessions: uniqueSessions,
                date_range: {
                    start: data.length > 0 ? data[data.length - 1].timestamp : null,
                    end: data.length > 0 ? data[0].timestamp : null
                }
            },
            event_types: Object.entries(eventTypes).map(([type, events]) => ({
                type,
                count: events.length,
                percentage: Math.round((events.length / totalEvents) * 100)
            })),
            geographic: Object.entries(countries).map(([country, events]) => ({
                country: country || 'Unknown',
                count: events.length,
                percentage: Math.round((events.length / totalEvents) * 100)
            })),
            devices: Object.entries(devices).map(([device, events]) => ({
                device: device || 'Unknown',
                count: events.length,
                percentage: Math.round((events.length / totalEvents) * 100)
            }))
        };
    }

    generateDetailedReport(data) {
        const summary = this.generateSummaryReport(data);
        
        // Add time-based analysis
        const hourlyData = this.groupEventsByHour(data);
        const dailyData = this.groupEventsByDay(data);
        
        // Add user journey analysis
        const sessions = this.groupBy(data, 'session_id');
        const userJourneys = Object.entries(sessions).map(([sessionId, events]) => {
            return this.analyzeUserJourney(events);
        });

        return {
            ...summary,
            temporal: {
                hourly: hourlyData,
                daily: dailyData
            },
            user_journeys: userJourneys,
            performance: this.analyzePerformance(data),
            engagement: this.analyzeEngagement(data)
        };
    }

    generateExportReport(data) {
        // Generate CSV-friendly format
        return data.map(event => ({
            timestamp: event.timestamp,
            session_id: event.session_id,
            event_type: event.event_type,
            tour_id: event.tour_id,
            scene_id: event.scene_id,
            country: event.country,
            city: event.city,
            device_type: event.metadata?.device_type,
            viewport_size: event.metadata?.viewport_size,
            user_agent: event.user_agent
        }));
    }

    // Helper methods for data analysis
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const value = typeof key === 'function' ? key(item) : item[key];
            groups[value] = groups[value] || [];
            groups[value].push(item);
            return groups;
        }, {});
    }

    groupEventsByHour(data) {
        const hourlyGroups = this.groupBy(data, event => {
            const date = new Date(event.timestamp);
            return date.getHours();
        });

        return Array.from({ length: 24 }, (_, hour) => ({
            hour,
            count: hourlyGroups[hour]?.length || 0
        }));
    }

    groupEventsByDay(data) {
        const dailyGroups = this.groupBy(data, event => {
            const date = new Date(event.timestamp);
            return date.toISOString().split('T')[0];
        });

        return Object.entries(dailyGroups).map(([date, events]) => ({
            date,
            count: events.length
        })).sort((a, b) => a.date.localeCompare(b.date));
    }

    analyzeUserJourney(sessionEvents) {
        const sortedEvents = sessionEvents.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        const journey = {
            session_id: sessionEvents[0].session_id,
            start_time: sortedEvents[0].timestamp,
            end_time: sortedEvents[sortedEvents.length - 1].timestamp,
            duration: this.calculateDuration(sortedEvents[0].timestamp, sortedEvents[sortedEvents.length - 1].timestamp),
            events_count: sessionEvents.length,
            scenes_visited: new Set(sessionEvents.filter(e => e.scene_id).map(e => e.scene_id)).size,
            hotspots_clicked: sessionEvents.filter(e => e.event_type === 'hotspot_click').length,
            vr_mode_used: sessionEvents.some(e => e.event_type === 'vr_mode_enter'),
            device_type: sessionEvents[0].metadata?.device_type
        };

        return journey;
    }

    analyzePerformance(data) {
        const performanceEvents = data.filter(e => e.event_type === 'performance');
        
        if (performanceEvents.length === 0) {
            return { message: 'No performance data available' };
        }

        const loadTimes = performanceEvents
            .map(e => e.metadata?.page_load_time)
            .filter(time => time !== null && time !== undefined);

        return {
            average_load_time: loadTimes.length > 0 ? Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length) : null,
            samples_count: loadTimes.length
        };
    }

    analyzeEngagement(data) {
        const sessions = this.groupBy(data, 'session_id');
        const sessionAnalysis = Object.values(sessions).map(events => {
            const duration = this.calculateDuration(
                events[events.length - 1].timestamp,
                events[0].timestamp
            );
            return {
                duration,
                events_count: events.length,
                scenes_visited: new Set(events.filter(e => e.scene_id).map(e => e.scene_id)).size
            };
        });

        const avgDuration = sessionAnalysis.reduce((sum, s) => sum + s.duration, 0) / sessionAnalysis.length;
        const avgEventsPerSession = sessionAnalysis.reduce((sum, s) => sum + s.events_count, 0) / sessionAnalysis.length;
        const avgScenesPerSession = sessionAnalysis.reduce((sum, s) => sum + s.scenes_visited, 0) / sessionAnalysis.length;

        return {
            average_session_duration: Math.round(avgDuration),
            average_events_per_session: Math.round(avgEventsPerSession),
            average_scenes_per_session: Math.round(avgScenesPerSession * 10) / 10,
            total_sessions: sessionAnalysis.length
        };
    }

    calculateDuration(startTime, endTime) {
        return Math.round((new Date(endTime) - new Date(startTime)) / 1000);
    }

    // Utility methods
    getCurrentSession() {
        return {
            session_id: this.sessionId,
            start_time: this.startTime,
            current_tour: this.currentTour,
            current_scene: this.currentScene,
            events_count: this.events.length
        };
    }

    getStoredEventsCount() {
        try {
            const storedEvents = JSON.parse(localStorage.getItem('vortitour_analytics_events') || '[]');
            return storedEvents.length;
        } catch (error) {
            return 0;
        }
    }

    clearStoredEvents() {
        localStorage.removeItem('vortitour_analytics_events');
    }

    // Export data as CSV
    exportToCSV(data, filename = 'vortitour_analytics.csv') {
        const csvData = this.generateExportReport(data);
        const headers = Object.keys(csvData[0] || {});
        
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => headers.map(header => 
                JSON.stringify(row[header] || '')
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Create global instance
window.VortitourAnalytics = new VortitourAnalytics();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VortitourAnalytics;
}

