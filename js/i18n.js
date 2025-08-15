// VORTITOUR Internationalization System
// Supports English and Arabic with RTL layout switching

class VortitourI18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('vortitour_language') || 'en';
        this.translations = this.loadTranslations();
        this.observers = [];
    }

    // Load translation data
    loadTranslations() {
        return {
            en: {
                // Navigation
                'nav.login': 'Login',
                'nav.signup': 'Sign Up',
                'nav.dashboard': 'Dashboard',
                'nav.tours': 'Tours',
                'nav.analytics': 'Analytics',
                'nav.settings': 'Settings',
                'nav.logout': 'Logout',
                'nav.profile': 'Profile',
                'nav.admin': 'Admin',

                // Hero Section
                'hero.title': 'Create Stunning 360° Virtual Tours',
                'hero.subtitle': 'Professional virtual tour platform for architectural studios and real estate professionals',
                'hero.getStarted': 'Get Started',
                'hero.viewDemo': 'View Demo',

                // Features
                'features.title': 'Powerful Features',
                'features.subtitle': 'Everything you need to create professional virtual tours',
                'features.vr.title': 'VR Ready',
                'features.vr.description': 'Full WebXR support for immersive VR experiences on any device',
                'features.bilingual.title': 'Bilingual Support',
                'features.bilingual.description': 'Full Arabic and English support with RTL layout',
                'features.analytics.title': 'Analytics',
                'features.analytics.description': 'Detailed analytics and reporting for your tours',
                'features.editor.title': 'Easy Editor',
                'features.editor.description': 'Drag-and-drop editor with intuitive hotspot placement',
                'features.sharing.title': 'Easy Sharing',
                'features.sharing.description': 'Share tours with custom URLs and embed codes',
                'features.mobile.title': 'Mobile Optimized',
                'features.mobile.description': 'Perfect experience on all devices and screen sizes',

                // Demo
                'demo.title': 'See It In Action',
                'demo.subtitle': 'Experience our virtual tour technology',

                // Pricing
                'pricing.title': 'Simple Pricing',
                'pricing.subtitle': 'Choose the plan that fits your needs',
                'pricing.free.title': 'Free',
                'pricing.pro.title': 'Professional',
                'pricing.enterprise.title': 'Enterprise',

                // Authentication
                'auth.login': 'Login',
                'auth.signup': 'Sign Up',
                'auth.email': 'Email',
                'auth.password': 'Password',
                'auth.confirmPassword': 'Confirm Password',
                'auth.fullName': 'Full Name',
                'auth.forgotPassword': 'Forgot Password?',
                'auth.resetPassword': 'Reset Password',
                'auth.magicLink': 'Send Magic Link',
                'auth.loginWithMagicLink': 'Login with Magic Link',
                'auth.alreadyHaveAccount': 'Already have an account?',
                'auth.dontHaveAccount': "Don't have an account?",
                'auth.signInButton': 'Sign In',
                'auth.signUpButton': 'Create Account',
                'auth.loggingIn': 'Signing in...',
                'auth.signingUp': 'Creating account...',
                'auth.rememberMe': 'Remember me',

                // Dashboard
                'dashboard.welcome': 'Welcome back',
                'dashboard.totalTours': 'Total Tours',
                'dashboard.publishedTours': 'Published Tours',
                'dashboard.totalViews': 'Total Views',
                'dashboard.thisMonth': 'This Month',
                'dashboard.recentTours': 'Recent Tours',
                'dashboard.createNewTour': 'Create New Tour',
                'dashboard.noTours': 'No tours yet',
                'dashboard.createFirstTour': 'Create your first virtual tour',

                // Tours
                'tours.title': 'Virtual Tours',
                'tours.create': 'Create Tour',
                'tours.edit': 'Edit Tour',
                'tours.delete': 'Delete Tour',
                'tours.publish': 'Publish',
                'tours.unpublish': 'Unpublish',
                'tours.duplicate': 'Duplicate',
                'tours.share': 'Share',
                'tours.embed': 'Embed',
                'tours.preview': 'Preview',
                'tours.tourTitle': 'Tour Title',
                'tours.tourDescription': 'Tour Description',
                'tours.tourSlug': 'URL Slug',
                'tours.coverImage': 'Cover Image',
                'tours.scenes': 'Scenes',
                'tours.hotspots': 'Hotspots',
                'tours.published': 'Published',
                'tours.draft': 'Draft',
                'tours.createdAt': 'Created',
                'tours.updatedAt': 'Updated',
                'tours.views': 'Views',

                // Editor
                'editor.title': 'Tour Editor',
                'editor.addScene': 'Add Scene',
                'editor.addHotspot': 'Add Hotspot',
                'editor.sceneTitle': 'Scene Title',
                'editor.sceneDescription': 'Scene Description',
                'editor.uploadPanorama': 'Upload Panorama',
                'editor.hotspotType': 'Hotspot Type',
                'editor.hotspotTitle': 'Hotspot Title',
                'editor.hotspotDescription': 'Hotspot Description',
                'editor.navigation': 'Navigation',
                'editor.information': 'Information',
                'editor.media': 'Media',
                'editor.link': 'Link',
                'editor.save': 'Save',
                'editor.cancel': 'Cancel',
                'editor.preview': 'Preview',

                // Viewer
                'viewer.loading': 'Loading virtual tour...',
                'viewer.enterVR': 'Enter VR',
                'viewer.exitVR': 'Exit VR',
                'viewer.fullscreen': 'Fullscreen',
                'viewer.exitFullscreen': 'Exit Fullscreen',
                'viewer.info': 'Information',
                'viewer.share': 'Share',
                'viewer.home': 'Home',

                // Share
                'share.title': 'Share Tour',
                'share.publicUrl': 'Public URL',
                'share.embedCode': 'Embed Code',
                'share.copyUrl': 'Copy URL',
                'share.copyEmbed': 'Copy Embed Code',
                'share.urlCopied': 'URL copied to clipboard',
                'share.embedCopied': 'Embed code copied to clipboard',
                'share.defaultLanguage': 'Default Language',
                'share.defaultScene': 'Default Scene',
                'share.width': 'Width',
                'share.height': 'Height',
                'share.showControls': 'Show Controls',
                'share.autoplay': 'Autoplay',

                // Analytics
                'analytics.title': 'Analytics',
                'analytics.overview': 'Overview',
                'analytics.visitors': 'Visitors',
                'analytics.pageViews': 'Page Views',
                'analytics.avgDuration': 'Average Duration',
                'analytics.bounceRate': 'Bounce Rate',
                'analytics.topTours': 'Top Tours',
                'analytics.topScenes': 'Top Scenes',
                'analytics.deviceTypes': 'Device Types',
                'analytics.countries': 'Countries',
                'analytics.referrers': 'Referrers',

                // Settings
                'settings.title': 'Settings',
                'settings.profile': 'Profile',
                'settings.organization': 'Organization',
                'settings.billing': 'Billing',
                'settings.security': 'Security',
                'settings.notifications': 'Notifications',
                'settings.language': 'Language',
                'settings.timezone': 'Timezone',

                // Common
                'common.save': 'Save',
                'common.cancel': 'Cancel',
                'common.delete': 'Delete',
                'common.edit': 'Edit',
                'common.create': 'Create',
                'common.update': 'Update',
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                'common.warning': 'Warning',
                'common.info': 'Information',
                'common.confirm': 'Confirm',
                'common.yes': 'Yes',
                'common.no': 'No',
                'common.ok': 'OK',
                'common.close': 'Close',
                'common.back': 'Back',
                'common.next': 'Next',
                'common.previous': 'Previous',
                'common.search': 'Search',
                'common.filter': 'Filter',
                'common.sort': 'Sort',
                'common.actions': 'Actions',
                'common.noData': 'No data available',
                'common.selectAll': 'Select All',
                'common.deselectAll': 'Deselect All'
            },

            ar: {
                // Navigation
                'nav.login': 'تسجيل الدخول',
                'nav.signup': 'إنشاء حساب',
                'nav.dashboard': 'لوحة التحكم',
                'nav.tours': 'الجولات',
                'nav.analytics': 'التحليلات',
                'nav.settings': 'الإعدادات',
                'nav.logout': 'تسجيل الخروج',
                'nav.profile': 'الملف الشخصي',
                'nav.admin': 'الإدارة',

                // Hero Section
                'hero.title': 'أنشئ جولات افتراضية مذهلة 360°',
                'hero.subtitle': 'منصة جولات افتراضية احترافية للاستوديوهات المعمارية ومحترفي العقارات',
                'hero.getStarted': 'ابدأ الآن',
                'hero.viewDemo': 'عرض تجريبي',

                // Features
                'features.title': 'ميزات قوية',
                'features.subtitle': 'كل ما تحتاجه لإنشاء جولات افتراضية احترافية',
                'features.vr.title': 'جاهز للواقع الافتراضي',
                'features.vr.description': 'دعم كامل لـ WebXR لتجارب الواقع الافتراضي الغامرة على أي جهاز',
                'features.bilingual.title': 'دعم ثنائي اللغة',
                'features.bilingual.description': 'دعم كامل للعربية والإنجليزية مع تخطيط RTL',
                'features.analytics.title': 'التحليلات',
                'features.analytics.description': 'تحليلات وتقارير مفصلة لجولاتك',
                'features.editor.title': 'محرر سهل',
                'features.editor.description': 'محرر بالسحب والإفلات مع وضع النقاط التفاعلية البديهي',
                'features.sharing.title': 'مشاركة سهلة',
                'features.sharing.description': 'شارك الجولات بروابط مخصصة وأكواد التضمين',
                'features.mobile.title': 'محسن للجوال',
                'features.mobile.description': 'تجربة مثالية على جميع الأجهزة وأحجام الشاشات',

                // Demo
                'demo.title': 'شاهدها في العمل',
                'demo.subtitle': 'اختبر تقنية الجولة الافتراضية لدينا',

                // Pricing
                'pricing.title': 'تسعير بسيط',
                'pricing.subtitle': 'اختر الخطة التي تناسب احتياجاتك',
                'pricing.free.title': 'مجاني',
                'pricing.pro.title': 'احترافي',
                'pricing.enterprise.title': 'مؤسسي',

                // Authentication
                'auth.login': 'تسجيل الدخول',
                'auth.signup': 'إنشاء حساب',
                'auth.email': 'البريد الإلكتروني',
                'auth.password': 'كلمة المرور',
                'auth.confirmPassword': 'تأكيد كلمة المرور',
                'auth.fullName': 'الاسم الكامل',
                'auth.forgotPassword': 'نسيت كلمة المرور؟',
                'auth.resetPassword': 'إعادة تعيين كلمة المرور',
                'auth.magicLink': 'إرسال رابط سحري',
                'auth.loginWithMagicLink': 'تسجيل الدخول بالرابط السحري',
                'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',
                'auth.dontHaveAccount': 'ليس لديك حساب؟',
                'auth.signInButton': 'تسجيل الدخول',
                'auth.signUpButton': 'إنشاء حساب',
                'auth.loggingIn': 'جاري تسجيل الدخول...',
                'auth.signingUp': 'جاري إنشاء الحساب...',
                'auth.rememberMe': 'تذكرني',

                // Dashboard
                'dashboard.welcome': 'مرحباً بعودتك',
                'dashboard.totalTours': 'إجمالي الجولات',
                'dashboard.publishedTours': 'الجولات المنشورة',
                'dashboard.totalViews': 'إجمالي المشاهدات',
                'dashboard.thisMonth': 'هذا الشهر',
                'dashboard.recentTours': 'الجولات الحديثة',
                'dashboard.createNewTour': 'إنشاء جولة جديدة',
                'dashboard.noTours': 'لا توجد جولات بعد',
                'dashboard.createFirstTour': 'أنشئ أول جولة افتراضية لك',

                // Tours
                'tours.title': 'الجولات الافتراضية',
                'tours.create': 'إنشاء جولة',
                'tours.edit': 'تحرير الجولة',
                'tours.delete': 'حذف الجولة',
                'tours.publish': 'نشر',
                'tours.unpublish': 'إلغاء النشر',
                'tours.duplicate': 'نسخ',
                'tours.share': 'مشاركة',
                'tours.embed': 'تضمين',
                'tours.preview': 'معاينة',
                'tours.tourTitle': 'عنوان الجولة',
                'tours.tourDescription': 'وصف الجولة',
                'tours.tourSlug': 'رابط الجولة',
                'tours.coverImage': 'صورة الغلاف',
                'tours.scenes': 'المشاهد',
                'tours.hotspots': 'النقاط التفاعلية',
                'tours.published': 'منشور',
                'tours.draft': 'مسودة',
                'tours.createdAt': 'تاريخ الإنشاء',
                'tours.updatedAt': 'تاريخ التحديث',
                'tours.views': 'المشاهدات',

                // Editor
                'editor.title': 'محرر الجولة',
                'editor.addScene': 'إضافة مشهد',
                'editor.addHotspot': 'إضافة نقطة تفاعلية',
                'editor.sceneTitle': 'عنوان المشهد',
                'editor.sceneDescription': 'وصف المشهد',
                'editor.uploadPanorama': 'رفع بانوراما',
                'editor.hotspotType': 'نوع النقطة التفاعلية',
                'editor.hotspotTitle': 'عنوان النقطة التفاعلية',
                'editor.hotspotDescription': 'وصف النقطة التفاعلية',
                'editor.navigation': 'تنقل',
                'editor.information': 'معلومات',
                'editor.media': 'وسائط',
                'editor.link': 'رابط',
                'editor.save': 'حفظ',
                'editor.cancel': 'إلغاء',
                'editor.preview': 'معاينة',

                // Viewer
                'viewer.loading': 'جاري تحميل الجولة الافتراضية...',
                'viewer.enterVR': 'دخول الواقع الافتراضي',
                'viewer.exitVR': 'خروج من الواقع الافتراضي',
                'viewer.fullscreen': 'ملء الشاشة',
                'viewer.exitFullscreen': 'خروج من ملء الشاشة',
                'viewer.info': 'معلومات',
                'viewer.share': 'مشاركة',
                'viewer.home': 'الرئيسية',

                // Share
                'share.title': 'مشاركة الجولة',
                'share.publicUrl': 'الرابط العام',
                'share.embedCode': 'كود التضمين',
                'share.copyUrl': 'نسخ الرابط',
                'share.copyEmbed': 'نسخ كود التضمين',
                'share.urlCopied': 'تم نسخ الرابط',
                'share.embedCopied': 'تم نسخ كود التضمين',
                'share.defaultLanguage': 'اللغة الافتراضية',
                'share.defaultScene': 'المشهد الافتراضي',
                'share.width': 'العرض',
                'share.height': 'الارتفاع',
                'share.showControls': 'إظهار عناصر التحكم',
                'share.autoplay': 'تشغيل تلقائي',

                // Analytics
                'analytics.title': 'التحليلات',
                'analytics.overview': 'نظرة عامة',
                'analytics.visitors': 'الزوار',
                'analytics.pageViews': 'مشاهدات الصفحة',
                'analytics.avgDuration': 'متوسط المدة',
                'analytics.bounceRate': 'معدل الارتداد',
                'analytics.topTours': 'أفضل الجولات',
                'analytics.topScenes': 'أفضل المشاهد',
                'analytics.deviceTypes': 'أنواع الأجهزة',
                'analytics.countries': 'البلدان',
                'analytics.referrers': 'المراجع',

                // Settings
                'settings.title': 'الإعدادات',
                'settings.profile': 'الملف الشخصي',
                'settings.organization': 'المؤسسة',
                'settings.billing': 'الفواتير',
                'settings.security': 'الأمان',
                'settings.notifications': 'الإشعارات',
                'settings.language': 'اللغة',
                'settings.timezone': 'المنطقة الزمنية',

                // Common
                'common.save': 'حفظ',
                'common.cancel': 'إلغاء',
                'common.delete': 'حذف',
                'common.edit': 'تحرير',
                'common.create': 'إنشاء',
                'common.update': 'تحديث',
                'common.loading': 'جاري التحميل...',
                'common.error': 'خطأ',
                'common.success': 'نجح',
                'common.warning': 'تحذير',
                'common.info': 'معلومات',
                'common.confirm': 'تأكيد',
                'common.yes': 'نعم',
                'common.no': 'لا',
                'common.ok': 'موافق',
                'common.close': 'إغلاق',
                'common.back': 'رجوع',
                'common.next': 'التالي',
                'common.previous': 'السابق',
                'common.search': 'بحث',
                'common.filter': 'تصفية',
                'common.sort': 'ترتيب',
                'common.actions': 'الإجراءات',
                'common.noData': 'لا توجد بيانات',
                'common.selectAll': 'تحديد الكل',
                'common.deselectAll': 'إلغاء تحديد الكل'
            }
        };
    }

    // Get translation for a key
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || key;
        
        // Replace parameters in translation
        return translation.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] || match;
        });
    }

    // Set current language
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('vortitour_language', lang);
            this.applyLanguage();
            this.notifyObservers();
        }
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Check if current language is RTL
    isRTL() {
        return this.currentLanguage === 'ar';
    }

    // Apply language settings to DOM
    applyLanguage() {
        const html = document.documentElement;
        const body = document.body;

        // Set language attribute
        html.setAttribute('lang', this.currentLanguage);
        
        // Set direction
        html.setAttribute('dir', this.isRTL() ? 'rtl' : 'ltr');
        
        // Update Bootstrap classes for RTL
        if (this.isRTL()) {
            body.classList.add('rtl');
            this.loadBootstrapRTL();
        } else {
            body.classList.remove('rtl');
            this.removeBootstrapRTL();
        }

        // Update page title
        const titleElement = document.querySelector('title');
        if (titleElement) {
            titleElement.textContent = this.t('app.title') || 'VORTITOUR - 360° Virtual Tours';
        }

        // Update all translatable elements
        this.updateTranslatableElements();
    }

    // Load Bootstrap RTL CSS
    loadBootstrapRTL() {
        const existingLink = document.querySelector('#bootstrap-rtl');
        if (!existingLink) {
            const link = document.createElement('link');
            link.id = 'bootstrap-rtl';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css';
            document.head.appendChild(link);
        }
    }

    // Remove Bootstrap RTL CSS
    removeBootstrapRTL() {
        const existingLink = document.querySelector('#bootstrap-rtl');
        if (existingLink) {
            existingLink.remove();
        }
    }

    // Update all elements with data-i18n attribute
    updateTranslatableElements() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // Update text content or placeholder
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.type === 'submit' || element.type === 'button') {
                    element.value = translation;
                } else {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        });

        // Update language toggle display
        const langDisplay = document.getElementById('current-language');
        if (langDisplay) {
            langDisplay.textContent = this.currentLanguage.toUpperCase();
        }
    }

    // Format date according to current locale
    formatDate(date, options = {}) {
        const locale = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        }).format(new Date(date));
    }

    // Format number according to current locale
    formatNumber(number, options = {}) {
        const locale = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    }

    // Get localized content from JSON field
    getLocalizedContent(content, fallbackLang = 'en') {
        if (typeof content === 'string') return content;
        if (!content || typeof content !== 'object') return '';
        
        return content[this.currentLanguage] || 
               content[fallbackLang] || 
               Object.values(content)[0] || 
               '';
    }

    // Create localized content object
    createLocalizedContent(enContent, arContent) {
        return {
            en: enContent || '',
            ar: arContent || ''
        };
    }

    // Add observer for language changes
    addObserver(callback) {
        this.observers.push(callback);
    }

    // Remove observer
    removeObserver(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    // Notify observers about language change
    notifyObservers() {
        this.observers.forEach(callback => {
            try {
                callback(this.currentLanguage, this.isRTL());
            } catch (error) {
                console.error('Error in i18n observer:', error);
            }
        });
    }

    // Initialize i18n system
    init() {
        // Apply initial language
        this.applyLanguage();

        // Setup language toggle
        this.setupLanguageToggle();

        // Setup mutation observer for dynamic content
        this.setupMutationObserver();

        console.log('VortitourI18n initialized with language:', this.currentLanguage);
    }

    // Setup language toggle functionality
    setupLanguageToggle() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#language-toggle')) {
                e.preventDefault();
                const newLang = this.currentLanguage === 'en' ? 'ar' : 'en';
                this.setLanguage(newLang);
            }
        });
    }

    // Setup mutation observer for dynamic content
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const translatableElements = node.querySelectorAll('[data-i18n]');
                            if (translatableElements.length > 0) {
                                this.updateTranslatableElements();
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Create global instance
window.VortitourI18n = new VortitourI18n();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VortitourI18n;
}

