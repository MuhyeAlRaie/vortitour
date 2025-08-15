// VORTITOUR Main Application
// Handles routing, authentication, and core functionality

class VortitourApp {
    constructor() {
        this.currentUser = null;
        this.supabase = null;
        this.currentPage = this.getCurrentPage();
        this.isInitialized = false;
    }

    // Initialize the application
    async init() {
        if (this.isInitialized) return;

        try {
            console.log('Initializing VORTITOUR App...');
            
            // Initialize Supabase
            this.initializeSupabase();
            
            // Check authentication
            await this.checkAuth();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Initialize page-specific functionality
            this.initializePage();
            
            this.isInitialized = true;
            console.log('VORTITOUR App initialized successfully');
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.showError('Failed to initialize application');
        }
    }

    // Initialize Supabase client
    initializeSupabase() {
        if (typeof supabase === 'undefined') {
            console.warn('Supabase not loaded, using demo mode');
            return;
        }

        const config = window.VORTITOUR_CONFIG;
        if (!config || !config.supabase.url || !config.supabase.anonKey) {
            console.warn('Supabase configuration missing, using demo mode');
            return;
        }

        try {
            this.supabase = supabase.createClient(
                config.supabase.url,
                config.supabase.anonKey
            );
            console.log('Supabase client initialized');
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
        }
    }

    // Check authentication status
    async checkAuth() {
        if (!this.supabase) return;

        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session) {
                this.currentUser = session.user;
                console.log('User authenticated:', this.currentUser.email);
                
                // Listen for auth changes
                this.supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_OUT') {
                        this.currentUser = null;
                        this.handleSignOut();
                    } else if (event === 'SIGNED_IN') {
                        this.currentUser = session.user;
                        this.handleSignIn();
                    }
                });
            } else {
                console.log('No active session');
                // Check if we're on a protected page
                if (this.isProtectedPage()) {
                    this.redirectToLogin();
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }

    // Handle sign in
    handleSignIn() {
        console.log('User signed in:', this.currentUser.email);
        
        // Redirect to dashboard if on login page
        if (this.currentPage === 'login') {
            this.redirectToDashboard();
        }
        
        // Update UI
        this.updateAuthUI();
    }

    // Handle sign out
    handleSignOut() {
        console.log('User signed out');
        
        // Redirect to login if on protected page
        if (this.isProtectedPage()) {
            this.redirectToLogin();
        }
        
        // Update UI
        this.updateAuthUI();
    }

    // Update authentication UI
    updateAuthUI() {
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.user_metadata?.full_name || 
                                         this.currentUser.email.split('@')[0];
        }
    }

    // Setup global event listeners
    setupGlobalEventListeners() {
        // Smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    const modal = bootstrap.Modal.getInstance(openModal);
                    if (modal) modal.hide();
                }
            }
            
            // Ctrl/Cmd + K for search (future feature)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // Open search modal
                console.log('Search shortcut triggered');
            }
        });

        // Handle logout clicks
        document.addEventListener('click', async (e) => {
            if (e.target.closest('#logout-btn')) {
                e.preventDefault();
                await this.signOut();
            }
        });

        // Handle form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.classList.contains('vortitour-form')) {
                e.preventDefault();
                this.handleFormSubmit(form);
            }
        });
    }

    // Initialize page-specific functionality
    initializePage() {
        switch (this.currentPage) {
            case 'landing':
                this.initializeLandingPage();
                break;
            case 'login':
                this.initializeLoginPage();
                break;
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'editor':
                this.initializeEditor();
                break;
            case 'viewer':
                this.initializeViewer();
                break;
            case 'analytics':
                this.initializeAnalytics();
                break;
            case 'settings':
                this.initializeSettings();
                break;
            default:
                console.log('No specific initialization for page:', this.currentPage);
        }
    }

    // Initialize landing page
    initializeLandingPage() {
        console.log('Initializing landing page');
        
        // Add scroll effects
        this.setupScrollEffects();
        
        // Setup demo functionality
        window.startDemo = () => {
            window.open('pages/viewer.html?demo=true', '_blank');
        };
    }

    // Initialize login page
    initializeLoginPage() {
        console.log('Initializing login page');
        
        // If already authenticated, redirect to dashboard
        if (this.currentUser) {
            this.redirectToDashboard();
            return;
        }
        
        // Setup login form handlers
        this.setupLoginForms();
    }

    // Initialize dashboard
    initializeDashboard() {
        console.log('Initializing dashboard');
        
        if (!this.currentUser) {
            this.redirectToLogin();
            return;
        }
        
        // Load dashboard data
        this.loadDashboardData();
    }

    // Initialize editor
    initializeEditor() {
        console.log('Initializing editor');
        
        if (!this.currentUser) {
            this.redirectToLogin();
            return;
        }
        
        // Get tour ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const tourId = urlParams.get('tour');
        
        if (!tourId) {
            this.redirectToDashboard();
            return;
        }
        
        // Initialize tour editor
        this.initializeTourEditor(tourId);
    }

    // Initialize viewer
    initializeViewer() {
        console.log('Initializing viewer');
        
        const urlParams = new URLSearchParams(window.location.search);
        const tourId = urlParams.get('tour');
        const sceneId = urlParams.get('scene');
        const lang = urlParams.get('lang');
        const demo = urlParams.get('demo');
        
        // Set language if specified
        if (lang && ['en', 'ar'].includes(lang)) {
            window.VortitourI18n.setLanguage(lang);
        }
        
        // Initialize VR viewer
        if (demo === 'true') {
            this.initializeDemoViewer();
        } else if (tourId) {
            this.initializeVRViewer(tourId, sceneId);
        } else {
            this.show404();
        }
    }

    // Initialize analytics
    initializeAnalytics() {
        console.log('Initializing analytics');
        
        if (!this.currentUser) {
            this.redirectToLogin();
            return;
        }
        
        // Load analytics data
        this.loadAnalyticsData();
    }

    // Initialize settings
    initializeSettings() {
        console.log('Initializing settings');
        
        if (!this.currentUser) {
            this.redirectToLogin();
            return;
        }
        
        // Load user settings
        this.loadUserSettings();
    }

    // Setup scroll effects for landing page
    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe feature cards
        document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
            observer.observe(card);
        });
    }

    // Setup login form handlers
    setupLoginForms() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(loginForm);
            });
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup(signupForm);
            });
        }
        
        // Magic link button
        const magicLinkBtn = document.getElementById('magic-link-btn');
        if (magicLinkBtn) {
            magicLinkBtn.addEventListener('click', () => {
                this.handleMagicLink();
            });
        }
    }

    // Handle login form submission
    async handleLogin(form) {
        if (!this.supabase) {
            this.showError('Authentication service not available');
            return;
        }

        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = window.VortitourI18n.t('auth.loggingIn');
            submitBtn.disabled = true;

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.showSuccess('Login successful');
            this.redirectToDashboard();

        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Handle signup form submission
    async handleSignup(form) {
        if (!this.supabase) {
            this.showError('Authentication service not available');
            return;
        }

        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const fullName = formData.get('fullName');
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = window.VortitourI18n.t('auth.signingUp');
            submitBtn.disabled = true;

            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;

            this.showSuccess('Account created successfully. Please check your email for verification.');

        } catch (error) {
            console.error('Signup error:', error);
            this.showError('Signup failed: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Handle magic link authentication
    async handleMagicLink() {
        if (!this.supabase) {
            this.showError('Authentication service not available');
            return;
        }

        const email = document.getElementById('email')?.value;
        if (!email) {
            this.showError('Please enter your email address');
            return;
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin + '/pages/dashboard.html'
                }
            });

            if (error) throw error;

            this.showSuccess('Magic link sent to your email');

        } catch (error) {
            console.error('Magic link error:', error);
            this.showError('Failed to send magic link: ' + error.message);
        }
    }

    // Sign out user
    async signOut() {
        if (!this.supabase) return;

        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.showSuccess('Signed out successfully');
            this.redirectToLogin();
            
        } catch (error) {
            console.error('Sign out error:', error);
            this.showError('Failed to sign out');
        }
    }

    // Load dashboard data
    async loadDashboardData() {
        // This would load real data from Supabase
        // For now, show demo data
        console.log('Loading dashboard data...');
        
        // Simulate loading
        setTimeout(() => {
            this.renderDashboard({
                totalTours: 5,
                publishedTours: 3,
                totalViews: 1250,
                thisMonthViews: 340,
                recentTours: [
                    { id: 1, title: 'Modern Apartment', views: 450, published: true },
                    { id: 2, title: 'Office Space', views: 320, published: true },
                    { id: 3, title: 'Retail Store', views: 280, published: false }
                ]
            });
        }, 1000);
    }

    // Render dashboard content
    renderDashboard(data) {
        const content = document.getElementById('content');
        if (!content) return;

        content.innerHTML = `
            <div class="container-fluid py-4">
                <div class="row">
                    <div class="col-12">
                        <h1 class="h3 mb-4" data-i18n="dashboard.welcome">Welcome back</h1>
                    </div>
                </div>
                
                <!-- Stats Cards -->
                <div class="row mb-4">
                    <div class="col-lg-3 col-md-6 mb-3">
                        <div class="stat-card p-3 rounded">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="h2 mb-0">${data.totalTours}</h3>
                                    <p class="mb-0" data-i18n="dashboard.totalTours">Total Tours</p>
                                </div>
                                <i class="bi bi-collection fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-3 col-md-6 mb-3">
                        <div class="stat-card p-3 rounded">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="h2 mb-0">${data.publishedTours}</h3>
                                    <p class="mb-0" data-i18n="dashboard.publishedTours">Published Tours</p>
                                </div>
                                <i class="bi bi-globe fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-3 col-md-6 mb-3">
                        <div class="stat-card p-3 rounded">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="h2 mb-0">${data.totalViews}</h3>
                                    <p class="mb-0" data-i18n="dashboard.totalViews">Total Views</p>
                                </div>
                                <i class="bi bi-eye fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-3 col-md-6 mb-3">
                        <div class="stat-card p-3 rounded">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="h2 mb-0">${data.thisMonthViews}</h3>
                                    <p class="mb-0" data-i18n="dashboard.thisMonth">This Month</p>
                                </div>
                                <i class="bi bi-calendar-month fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Tours -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0" data-i18n="dashboard.recentTours">Recent Tours</h5>
                                <a href="pages/editor.html" class="btn btn-primary">
                                    <i class="bi bi-plus me-2"></i>
                                    <span data-i18n="dashboard.createNewTour">Create New Tour</span>
                                </a>
                            </div>
                            <div class="card-body">
                                ${data.recentTours.length > 0 ? `
                                    <div class="row">
                                        ${data.recentTours.map(tour => `
                                            <div class="col-lg-4 col-md-6 mb-3">
                                                <div class="tour-card">
                                                    <div class="tour-card-image">
                                                        <i class="bi bi-image fs-1"></i>
                                                    </div>
                                                    <div class="p-3">
                                                        <h6 class="mb-2">${tour.title}</h6>
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <small class="text-muted">${tour.views} views</small>
                                                            <span class="badge ${tour.published ? 'bg-success' : 'bg-secondary'}">
                                                                ${tour.published ? 'Published' : 'Draft'}
                                                            </span>
                                                        </div>
                                                        <div class="mt-2">
                                                            <button class="btn btn-sm btn-outline-primary me-2">
                                                                <i class="bi bi-pencil"></i>
                                                            </button>
                                                            <button class="btn btn-sm btn-outline-secondary me-2">
                                                                <i class="bi bi-eye"></i>
                                                            </button>
                                                            <button class="btn btn-sm btn-outline-info">
                                                                <i class="bi bi-share"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div class="text-center py-5">
                                        <i class="bi bi-collection fs-1 text-muted mb-3"></i>
                                        <h5 data-i18n="dashboard.noTours">No tours yet</h5>
                                        <p class="text-muted" data-i18n="dashboard.createFirstTour">Create your first virtual tour</p>
                                        <a href="pages/editor.html" class="btn btn-primary">
                                            <i class="bi bi-plus me-2"></i>
                                            <span data-i18n="dashboard.createNewTour">Create New Tour</span>
                                        </a>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update translations
        window.VortitourI18n.updateTranslatableElements();
    }

    // Initialize demo viewer
    initializeDemoViewer() {
        console.log('Initializing demo viewer');
        
        const content = document.getElementById('content');
        if (!content) return;

        content.innerHTML = `
            <div class="vr-viewer-container">
                <div class="vr-controls">
                    <button class="vr-control-btn" title="Home">
                        <i class="bi bi-house"></i>
                    </button>
                    <button class="vr-control-btn" title="Information">
                        <i class="bi bi-info-circle"></i>
                    </button>
                    <button class="vr-control-btn" title="Fullscreen">
                        <i class="bi bi-fullscreen"></i>
                    </button>
                </div>
                
                <div class="demo-viewer d-flex align-items-center justify-content-center h-100">
                    <div class="text-center text-white">
                        <i class="bi bi-play-circle fs-1 mb-3"></i>
                        <h3>Demo Virtual Tour</h3>
                        <p>This is a demonstration of the VORTITOUR viewer</p>
                        <button class="btn btn-primary" onclick="window.close()">
                            Close Demo
                        </button>
                    </div>
                </div>
                
                <button class="vr-mode-button" title="VR Mode">
                    <i class="bi bi-headset-vr"></i>
                </button>
            </div>
        `;
    }

    // Utility methods
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        const pageMap = {
            'index.html': 'landing',
            '': 'landing',
            'login.html': 'login',
            'dashboard.html': 'dashboard',
            'editor.html': 'editor',
            'viewer.html': 'viewer',
            'analytics.html': 'analytics',
            'settings.html': 'settings'
        };
        
        return pageMap[filename] || 'unknown';
    }

    isProtectedPage() {
        return ['dashboard', 'editor', 'analytics', 'settings'].includes(this.currentPage);
    }

    redirectToLogin() {
        if (this.currentPage !== 'login') {
            window.location.href = 'login.html';
        }
    }

    redirectToDashboard() {
        if (this.currentPage !== 'dashboard') {
            window.location.href = 'dashboard.html';
        }
    }

    show404() {
        const content = document.getElementById('content');
        if (content) {
            content.innerHTML = `
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-md-6 text-center py-5">
                            <h1 class="display-1 fw-bold text-primary">404</h1>
                            <h2 class="mb-4">Page Not Found</h2>
                            <p class="text-muted mb-4">The page you're looking for doesn't exist.</p>
                            <a href="index.html" class="btn btn-primary">Go Home</a>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Notification methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'danger');
    }

    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Create toast notification
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${type} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi bi-${this.getIconForType(type)} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        // Add toast
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = toastContainer.lastElementChild;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        // Remove toast element after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    getIconForType(type) {
        const icons = {
            success: 'check-circle',
            danger: 'exclamation-triangle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Create global instance
window.VortitourApp = new VortitourApp();

