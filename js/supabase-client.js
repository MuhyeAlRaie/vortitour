// VORTITOUR Supabase Client Integration
// Handles all database operations and authentication

class VortitourSupabase {
    constructor() {
        this.client = null;
        this.currentUser = null;
        this.currentSession = null;
        this.isInitialized = false;
    }

    // Initialize Supabase client
    async init() {
        if (this.isInitialized) return;

        const config = window.VORTITOUR_CONFIG;
        if (!config || !config.supabase.url || !config.supabase.anonKey) {
            console.warn('Supabase configuration missing');
            return false;
        }

        try {
            this.client = supabase.createClient(
                config.supabase.url,
                config.supabase.anonKey
            );

            // Get initial session
            const { data: { session } } = await this.client.auth.getSession();
            if (session) {
                this.currentSession = session;
                this.currentUser = session.user;
            }

            // Listen for auth changes
            this.client.auth.onAuthStateChange((event, session) => {
                this.currentSession = session;
                this.currentUser = session?.user || null;
                this.handleAuthChange(event, session);
            });

            this.isInitialized = true;
            console.log('Supabase client initialized');
            return true;

        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            return false;
        }
    }

    // Handle authentication state changes
    handleAuthChange(event, session) {
        console.log('Auth state changed:', event);
        
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('vortitour:auth-change', {
            detail: { event, session, user: session?.user }
        }));
    }

    // Authentication Methods
    async signUp(email, password, userData = {}) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });

        if (error) throw error;
        return data;
    }

    async signIn(email, password) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    async signInWithMagicLink(email, redirectTo = null) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectTo || window.location.origin + '/pages/dashboard.html'
            }
        });

        if (error) throw error;
        return data;
    }

    async signOut() {
        if (!this.client) throw new Error('Supabase not initialized');

        const { error } = await this.client.auth.signOut();
        if (error) throw error;
    }

    async resetPassword(email, redirectTo = null) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo || window.location.origin + '/pages/reset-password.html'
        });

        if (error) throw error;
        return data;
    }

    async updatePassword(newPassword) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
        return data;
    }

    // User Profile Methods
    async getUserProfile(userId = null) {
        if (!this.client) throw new Error('Supabase not initialized');

        const id = userId || this.currentUser?.id;
        if (!id) throw new Error('No user ID provided');

        const { data, error } = await this.client
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async getProfile(userId = null) {
        // Alias for getUserProfile for compatibility
        return this.getUserProfile(userId);
    }

    async updateUserProfile(updates) {
        if (!this.client) throw new Error('Supabase not initialized');
        if (!this.currentUser) throw new Error('No authenticated user');

        const { data, error } = await this.client
            .from('users')
            .update(updates)
            .eq('id', this.currentUser.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateProfile(userId, updates) {
        // Enhanced updateProfile method that can update any user's profile (with proper permissions)
        if (!this.client) throw new Error('Supabase not initialized');
        if (!this.currentUser) throw new Error('No authenticated user');

        // If no userId provided, update current user's profile
        const targetUserId = userId || this.currentUser.id;

        const { data, error } = await this.client
            .from('users')
            .update(updates)
            .eq('id', targetUserId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getUserTours(userId = null) {
        if (!this.client) throw new Error('Supabase not initialized');

        const id = userId || this.currentUser?.id;
        if (!id) throw new Error('No user ID provided');

        const { data, error } = await this.client
            .from('tours')
            .select(`
                *,
                scenes(count),
                organization:organizations(name, slug)
            `)
            .eq('created_by', id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    // Organization Methods
    async getOrganization(orgId = null) {
        if (!this.client) throw new Error('Supabase not initialized');

        let query = this.client.from('organizations').select('*');
        
        if (orgId) {
            query = query.eq('id', orgId);
        } else {
            // Get user's organization
            const profile = await this.getUserProfile();
            if (!profile.organization_id) return null;
            query = query.eq('id', profile.organization_id);
        }

        const { data, error } = await query.single();
        if (error) throw error;
        return data;
    }

    async updateOrganization(orgId, updates) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('organizations')
            .update(updates)
            .eq('id', orgId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Tour Methods
    async getTours(filters = {}) {
        if (!this.client) throw new Error('Supabase not initialized');

        let query = this.client
            .from('tours')
            .select(`
                *,
                scenes(count),
                created_by:users(full_name, email)
            `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.published !== undefined) {
            query = query.eq('published', filters.published);
        }

        if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async getTour(tourId) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('tours')
            .select(`
                *,
                scenes(*),
                hotspots(*),
                created_by:users(full_name, email),
                organization:organizations(name, slug)
            `)
            .eq('id', tourId)
            .single();

        if (error) throw error;
        return data;
    }

    async createTour(tourData) {
        if (!this.client) throw new Error('Supabase not initialized');
        if (!this.currentUser) throw new Error('No authenticated user');

        const profile = await this.getUserProfile();
        
        const { data, error } = await this.client
            .from('tours')
            .insert({
                ...tourData,
                organization_id: profile.organization_id,
                created_by: this.currentUser.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateTour(tourId, updates) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('tours')
            .update(updates)
            .eq('id', tourId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteTour(tourId) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { error } = await this.client
            .from('tours')
            .delete()
            .eq('id', tourId);

        if (error) throw error;
    }

    async publishTour(tourId, published = true) {
        return this.updateTour(tourId, { 
            published, 
            published_at: published ? new Date().toISOString() : null 
        });
    }

    async saveTour(tourData, tourId = null) {
        if (!this.client) throw new Error('Supabase not initialized');
        if (!this.currentUser) throw new Error('No authenticated user');

        try {
            // Prepare tour data with common fields
            const timestamp = new Date().toISOString();
            const processedData = {
                ...tourData,
                updated_at: timestamp
            };

            if (tourId) {
                // Update existing tour
                const { data, error } = await this.client
                    .from('tours')
                    .update(processedData)
                    .eq('id', tourId)
                    .select(`
                        *,
                        scenes(*),
                        hotspots(*),
                        created_by:users(full_name, email),
                        organization:organizations(name, slug)
                    `)
                    .single();

                if (error) throw error;

                // Track save event
                await this.trackEvent({
                    tour_id: tourId,
                    event_type: 'tour_updated',
                    user_id: this.currentUser.id,
                    metadata: {
                        fields_updated: Object.keys(processedData)
                    }
                });

                return data;
            } else {
                // Create new tour
                const profile = await this.getUserProfile();
                
                const newTourData = {
                    ...processedData,
                    organization_id: profile.organization_id,
                    created_by: this.currentUser.id,
                    created_at: timestamp,
                    status: 'draft',
                    published: false,
                    view_count: 0
                };

                const { data, error } = await this.client
                    .from('tours')
                    .insert(newTourData)
                    .select(`
                        *,
                        scenes(*),
                        hotspots(*),
                        created_by:users(full_name, email),
                        organization:organizations(name, slug)
                    `)
                    .single();

                if (error) throw error;

                // Track creation event
                await this.trackEvent({
                    tour_id: data.id,
                    event_type: 'tour_created',
                    user_id: this.currentUser.id,
                    metadata: {
                        title: data.title,
                        description: data.description
                    }
                });

                return data;
            }
        } catch (error) {
            console.error('Error saving tour:', error);
            
            // Track error event
            await this.trackEvent({
                tour_id: tourId || 'unknown',
                event_type: 'tour_save_error',
                user_id: this.currentUser.id,
                metadata: {
                    error_message: error.message,
                    operation: tourId ? 'update' : 'create'
                }
            }).catch(trackError => {
                console.error('Failed to track error event:', trackError);
            });

            throw error;
        }
    }

    // Scene Methods
    async getScenes(tourId) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('scenes')
            .select('*')
            .eq('tour_id', tourId)
            .order('position');

        if (error) throw error;
        return data;
    }

    async createScene(sceneData) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('scenes')
            .insert(sceneData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateScene(sceneId, updates) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('scenes')
            .update(updates)
            .eq('id', sceneId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteScene(sceneId) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { error } = await this.client
            .from('scenes')
            .delete()
            .eq('id', sceneId);

        if (error) throw error;
    }

    // Hotspot Methods
    async getHotspots(sceneId) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('hotspots')
            .select('*')
            .eq('scene_id', sceneId);

        if (error) throw error;
        return data;
    }

    async createHotspot(hotspotData) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('hotspots')
            .insert(hotspotData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateHotspot(hotspotId, updates) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('hotspots')
            .update(updates)
            .eq('id', hotspotId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteHotspot(hotspotId) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { error } = await this.client
            .from('hotspots')
            .delete()
            .eq('id', hotspotId);

        if (error) throw error;
    }

    // Analytics Methods
    async trackEvent(eventData) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { data, error } = await this.client
            .from('analytics')
            .insert({
                ...eventData,
                timestamp: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getAnalytics(tourId, filters = {}) {
        if (!this.client) throw new Error('Supabase not initialized');

        let query = this.client
            .from('analytics')
            .select('*')
            .eq('tour_id', tourId)
            .order('timestamp', { ascending: false });

        // Apply date filters
        if (filters.startDate) {
            query = query.gte('timestamp', filters.startDate);
        }

        if (filters.endDate) {
            query = query.lte('timestamp', filters.endDate);
        }

        if (filters.eventType) {
            query = query.eq('event_type', filters.eventType);
        }

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async getAnalyticsSummary(tourId, period = '30d') {
        if (!this.client) throw new Error('Supabase not initialized');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        const { data, error } = await this.client
            .rpc('get_analytics_summary', {
                tour_id: tourId,
                start_date: startDate.toISOString()
            });

        if (error) throw error;
        return data;
    }

    // Utility Methods
    async incrementTourViews(tourId) {
        if (!this.client) throw new Error('Supabase not initialized');

        const { error } = await this.client.rpc('increment_tour_views', {
            tour_uuid: tourId
        });

        if (error) throw error;
    }

    // Real-time subscriptions
    subscribeToTour(tourId, callback) {
        if (!this.client) return null;

        return this.client
            .channel(`tour:${tourId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'tours',
                filter: `id=eq.${tourId}`
            }, callback)
            .subscribe();
    }

    subscribeToScenes(tourId, callback) {
        if (!this.client) return null;

        return this.client
            .channel(`scenes:${tourId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'scenes',
                filter: `tour_id=eq.${tourId}`
            }, callback)
            .subscribe();
    }

    unsubscribe(subscription) {
        if (subscription && this.client) {
            this.client.removeChannel(subscription);
        }
    }

    // Helper methods
    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentSession() {
        return this.currentSession;
    }

    getClient() {
        return this.client;
    }
}

// Create global instance
window.VortitourSupabase = new VortitourSupabase();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VortitourSupabase;
}

