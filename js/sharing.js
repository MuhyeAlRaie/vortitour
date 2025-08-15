// VORTITOUR Sharing and Embedding System
// Handles tour sharing, social media integration, and embed code generation

class VortitourSharing {
    constructor() {
        this.baseUrl = window.location.origin;
        this.socialPlatforms = {
            facebook: {
                name: 'Facebook',
                icon: 'facebook',
                color: '#1877f2',
                shareUrl: 'https://www.facebook.com/sharer/sharer.php?u='
            },
            twitter: {
                name: 'Twitter',
                icon: 'twitter',
                color: '#1da1f2',
                shareUrl: 'https://twitter.com/intent/tweet?url='
            },
            linkedin: {
                name: 'LinkedIn',
                icon: 'linkedin',
                color: '#0077b5',
                shareUrl: 'https://www.linkedin.com/sharing/share-offsite/?url='
            },
            whatsapp: {
                name: 'WhatsApp',
                icon: 'whatsapp',
                color: '#25d366',
                shareUrl: 'https://wa.me/?text='
            },
            telegram: {
                name: 'Telegram',
                icon: 'telegram',
                color: '#0088cc',
                shareUrl: 'https://t.me/share/url?url='
            },
            email: {
                name: 'Email',
                icon: 'envelope',
                color: '#6c757d',
                shareUrl: 'mailto:?subject=Check out this virtual tour&body='
            }
        };
        this.embedSizes = {
            small: { width: 400, height: 300 },
            medium: { width: 800, height: 600 },
            large: { width: 1200, height: 800 },
            fullscreen: { width: '100%', height: '100vh' }
        };
    }

    // Generate tour sharing URL
    generateTourUrl(tourId, options = {}) {
        const baseUrl = `${this.baseUrl}/pages/viewer.html?tour=${tourId}`;
        const params = new URLSearchParams();

        // Add optional parameters
        if (options.scene) params.append('scene', options.scene);
        if (options.autoplay) params.append('autoplay', 'true');
        if (options.vr) params.append('vr', 'true');
        if (options.fullscreen) params.append('fullscreen', 'true');
        if (options.hideUI) params.append('hideUI', 'true');
        if (options.lang) params.append('lang', options.lang);
        if (options.theme) params.append('theme', options.theme);

        // Add tracking parameters
        if (options.source) params.append('utm_source', options.source);
        if (options.medium) params.append('utm_medium', options.medium);
        if (options.campaign) params.append('utm_campaign', options.campaign);

        const queryString = params.toString();
        return queryString ? `${baseUrl}&${queryString}` : baseUrl;
    }

    // Generate embed code
    generateEmbedCode(tourId, options = {}) {
        const {
            width = this.embedSizes.medium.width,
            height = this.embedSizes.medium.height,
            autoplay = false,
            hideUI = false,
            allowFullscreen = true,
            responsive = true,
            theme = 'light',
            lang = 'en'
        } = options;

        const embedUrl = this.generateTourUrl(tourId, {
            autoplay,
            hideUI,
            lang,
            theme,
            source: 'embed',
            medium: 'iframe'
        });

        const iframeAttributes = [
            `src="${embedUrl}"`,
            `width="${width}"`,
            `height="${height}"`,
            'frameborder="0"',
            'scrolling="no"'
        ];

        if (allowFullscreen) {
            iframeAttributes.push('allowfullscreen');
            iframeAttributes.push('webkitallowfullscreen');
            iframeAttributes.push('mozallowfullscreen');
        }

        let embedCode = `<iframe ${iframeAttributes.join(' ')}></iframe>`;

        // Add responsive wrapper if requested
        if (responsive && width !== '100%') {
            const aspectRatio = (parseInt(height) / parseInt(width)) * 100;
            embedCode = `
<div style="position: relative; width: 100%; height: 0; padding-bottom: ${aspectRatio.toFixed(2)}%;">
    <iframe 
        src="${embedUrl}"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        frameborder="0" 
        scrolling="no"
        ${allowFullscreen ? 'allowfullscreen webkitallowfullscreen mozallowfullscreen' : ''}
    ></iframe>
</div>`.trim();
        }

        return embedCode;
    }

    // Generate social media sharing URLs
    generateSocialShareUrls(tourId, tourData = {}) {
        const tourUrl = this.generateTourUrl(tourId, {
            source: 'social',
            medium: 'share'
        });

        const {
            title = 'Check out this amazing virtual tour!',
            description = 'Experience this immersive 360° virtual tour.',
            hashtags = ['VirtualTour', 'VR', '360Tour']
        } = tourData;

        const encodedUrl = encodeURIComponent(tourUrl);
        const encodedTitle = encodeURIComponent(title);
        const encodedDescription = encodeURIComponent(description);
        const encodedHashtags = encodeURIComponent(hashtags.join(' '));

        return {
            facebook: `${this.socialPlatforms.facebook.shareUrl}${encodedUrl}`,
            twitter: `${this.socialPlatforms.twitter.shareUrl}${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`,
            linkedin: `${this.socialPlatforms.linkedin.shareUrl}${encodedUrl}`,
            whatsapp: `${this.socialPlatforms.whatsapp.shareUrl}${encodedTitle} ${encodedUrl}`,
            telegram: `${this.socialPlatforms.telegram.shareUrl}${encodedUrl}&text=${encodedTitle}`,
            email: `${this.socialPlatforms.email.shareUrl}${encodedTitle} - ${encodedDescription} ${encodedUrl}`
        };
    }

    // Open social sharing window
    openSocialShare(platform, url) {
        const windowFeatures = 'width=600,height=400,scrollbars=yes,resizable=yes';
        window.open(url, `share_${platform}`, windowFeatures);
    }

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    // Generate QR code for tour URL
    generateQRCode(tourId, options = {}) {
        const tourUrl = this.generateTourUrl(tourId, {
            source: 'qr',
            medium: 'mobile',
            ...options
        });

        // Using QR Server API for QR code generation
        const qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/';
        const qrParams = new URLSearchParams({
            size: options.size || '200x200',
            data: tourUrl,
            format: options.format || 'png',
            bgcolor: options.bgcolor || 'ffffff',
            color: options.color || '000000',
            margin: options.margin || '10'
        });

        return `${qrApiUrl}?${qrParams.toString()}`;
    }

    // Create sharing modal
    createSharingModal(tourId, tourData = {}) {
        const modalId = `sharing-modal-${tourId}`;
        
        // Remove existing modal if present
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        const socialUrls = this.generateSocialShareUrls(tourId, tourData);
        const tourUrl = this.generateTourUrl(tourId);
        const qrCodeUrl = this.generateQRCode(tourId);

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-share me-2"></i>
                                <span data-i18n="sharing.shareTitle">Share Virtual Tour</span>
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Tour Info -->
                            <div class="row mb-4">
                                <div class="col-md-8">
                                    <h6 data-i18n="sharing.tourTitle">Tour Title</h6>
                                    <p class="text-muted">${tourData.title || 'Virtual Tour'}</p>
                                    <h6 data-i18n="sharing.tourUrl">Tour URL</h6>
                                    <div class="input-group">
                                        <input type="text" class="form-control" value="${tourUrl}" readonly id="tour-url-${tourId}">
                                        <button class="btn btn-outline-secondary" type="button" onclick="vortitourSharing.copyUrl('${tourId}')">
                                            <i class="bi bi-clipboard"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-md-4 text-center">
                                    <h6 data-i18n="sharing.qrCode">QR Code</h6>
                                    <img src="${qrCodeUrl}" alt="QR Code" class="img-fluid" style="max-width: 150px;">
                                    <div class="mt-2">
                                        <a href="${qrCodeUrl}" download="tour-qr-code.png" class="btn btn-sm btn-outline-primary">
                                            <i class="bi bi-download me-1"></i>
                                            <span data-i18n="sharing.download">Download</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <!-- Social Media Sharing -->
                            <div class="mb-4">
                                <h6 data-i18n="sharing.socialMedia">Share on Social Media</h6>
                                <div class="row g-2">
                                    ${Object.entries(this.socialPlatforms).map(([key, platform]) => `
                                        <div class="col-6 col-md-4 col-lg-2">
                                            <button class="btn btn-outline-secondary w-100 d-flex flex-column align-items-center py-3" 
                                                    onclick="vortitourSharing.shareTo('${key}', '${socialUrls[key]}')"
                                                    style="border-color: ${platform.color}; color: ${platform.color};">
                                                <i class="bi bi-${platform.icon} fs-4 mb-1"></i>
                                                <small>${platform.name}</small>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Embed Code -->
                            <div class="mb-4">
                                <h6 data-i18n="sharing.embedCode">Embed Code</h6>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label" data-i18n="sharing.embedSize">Size</label>
                                        <select class="form-select" id="embed-size-${tourId}" onchange="vortitourSharing.updateEmbedCode('${tourId}')">
                                            <option value="small">Small (400x300)</option>
                                            <option value="medium" selected>Medium (800x600)</option>
                                            <option value="large">Large (1200x800)</option>
                                            <option value="fullscreen">Fullscreen</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label" data-i18n="sharing.embedOptions">Options</label>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="embed-responsive-${tourId}" checked onchange="vortitourSharing.updateEmbedCode('${tourId}')">
                                            <label class="form-check-label" for="embed-responsive-${tourId}" data-i18n="sharing.responsive">
                                                Responsive
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="embed-autoplay-${tourId}" onchange="vortitourSharing.updateEmbedCode('${tourId}')">
                                            <label class="form-check-label" for="embed-autoplay-${tourId}" data-i18n="sharing.autoplay">
                                                Autoplay
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div class="custom-size-inputs d-none" id="custom-size-${tourId}">
                                    <div class="row mb-3">
                                        <div class="col-6">
                                            <label class="form-label" data-i18n="sharing.width">Width</label>
                                            <input type="number" class="form-control" id="embed-width-${tourId}" value="800" onchange="vortitourSharing.updateEmbedCode('${tourId}')">
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label" data-i18n="sharing.height">Height</label>
                                            <input type="number" class="form-control" id="embed-height-${tourId}" value="600" onchange="vortitourSharing.updateEmbedCode('${tourId}')">
                                        </div>
                                    </div>
                                </div>
                                <textarea class="form-control" rows="4" readonly id="embed-code-${tourId}"></textarea>
                                <div class="mt-2">
                                    <button class="btn btn-outline-secondary" onclick="vortitourSharing.copyEmbedCode('${tourId}')">
                                        <i class="bi bi-clipboard me-1"></i>
                                        <span data-i18n="sharing.copyCode">Copy Code</span>
                                    </button>
                                    <button class="btn btn-outline-primary" onclick="vortitourSharing.previewEmbed('${tourId}')">
                                        <i class="bi bi-eye me-1"></i>
                                        <span data-i18n="sharing.preview">Preview</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Advanced Options -->
                            <div class="accordion" id="advanced-options-${tourId}">
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#advanced-collapse-${tourId}">
                                            <span data-i18n="sharing.advancedOptions">Advanced Options</span>
                                        </button>
                                    </h2>
                                    <div id="advanced-collapse-${tourId}" class="accordion-collapse collapse">
                                        <div class="accordion-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label class="form-label" data-i18n="sharing.startingScene">Starting Scene</label>
                                                        <select class="form-select" id="start-scene-${tourId}">
                                                            <option value="">Default</option>
                                                            <!-- Scene options would be populated dynamically -->
                                                        </select>
                                                    </div>
                                                    <div class="form-check mb-3">
                                                        <input class="form-check-input" type="checkbox" id="hide-ui-${tourId}">
                                                        <label class="form-check-label" for="hide-ui-${tourId}" data-i18n="sharing.hideUI">
                                                            Hide UI Controls
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="mb-3">
                                                        <label class="form-label" data-i18n="sharing.theme">Theme</label>
                                                        <select class="form-select" id="theme-${tourId}">
                                                            <option value="light">Light</option>
                                                            <option value="dark">Dark</option>
                                                        </select>
                                                    </div>
                                                    <div class="form-check mb-3">
                                                        <input class="form-check-input" type="checkbox" id="enable-vr-${tourId}">
                                                        <label class="form-check-label" for="enable-vr-${tourId}" data-i18n="sharing.enableVR">
                                                            Enable VR Mode
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="common.close">Close</button>
                            <button type="button" class="btn btn-primary" onclick="vortitourSharing.generateCustomLink('${tourId}')">
                                <i class="bi bi-link-45deg me-1"></i>
                                <span data-i18n="sharing.generateLink">Generate Custom Link</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Initialize embed code
        this.updateEmbedCode(tourId);

        return modalId;
    }

    // Show sharing modal
    showSharingModal(tourId, tourData = {}) {
        const modalId = this.createSharingModal(tourId, tourData);
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();

        // Clean up modal when hidden
        document.getElementById(modalId).addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Update embed code based on options
    updateEmbedCode(tourId) {
        const sizeSelect = document.getElementById(`embed-size-${tourId}`);
        const responsiveCheck = document.getElementById(`embed-responsive-${tourId}`);
        const autoplayCheck = document.getElementById(`embed-autoplay-${tourId}`);
        const customSizeDiv = document.getElementById(`custom-size-${tourId}`);
        const embedCodeTextarea = document.getElementById(`embed-code-${tourId}`);

        if (!sizeSelect || !embedCodeTextarea) return;

        const selectedSize = sizeSelect.value;
        let width, height;

        if (selectedSize === 'custom') {
            customSizeDiv.classList.remove('d-none');
            width = document.getElementById(`embed-width-${tourId}`).value;
            height = document.getElementById(`embed-height-${tourId}`).value;
        } else {
            customSizeDiv.classList.add('d-none');
            const size = this.embedSizes[selectedSize];
            width = size.width;
            height = size.height;
        }

        const options = {
            width,
            height,
            responsive: responsiveCheck.checked,
            autoplay: autoplayCheck.checked,
            allowFullscreen: true
        };

        const embedCode = this.generateEmbedCode(tourId, options);
        embedCodeTextarea.value = embedCode;
    }

    // Copy tour URL to clipboard
    async copyUrl(tourId) {
        const urlInput = document.getElementById(`tour-url-${tourId}`);
        const success = await this.copyToClipboard(urlInput.value);
        
        if (success) {
            this.showToast('URL copied to clipboard!', 'success');
        } else {
            this.showToast('Failed to copy URL', 'error');
        }
    }

    // Copy embed code to clipboard
    async copyEmbedCode(tourId) {
        const embedCodeTextarea = document.getElementById(`embed-code-${tourId}`);
        const success = await this.copyToClipboard(embedCodeTextarea.value);
        
        if (success) {
            this.showToast('Embed code copied to clipboard!', 'success');
        } else {
            this.showToast('Failed to copy embed code', 'error');
        }
    }

    // Share to social platform
    shareTo(platform, url) {
        if (platform === 'email') {
            window.location.href = url;
        } else {
            this.openSocialShare(platform, url);
        }

        // Track sharing event
        if (window.VortitourAnalytics) {
            window.VortitourAnalytics.trackEvent('tour_shared', {
                platform,
                source: 'sharing_modal'
            });
        }
    }

    // Preview embed
    previewEmbed(tourId) {
        const embedCodeTextarea = document.getElementById(`embed-code-${tourId}`);
        const embedCode = embedCodeTextarea.value;

        const previewWindow = window.open('', 'embed_preview', 'width=900,height=700,scrollbars=yes,resizable=yes');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Embed Preview</title>
                <style>
                    body { margin: 20px; font-family: Arial, sans-serif; }
                    .preview-container { border: 1px solid #ddd; padding: 20px; }
                </style>
            </head>
            <body>
                <h3>Embed Preview</h3>
                <div class="preview-container">
                    ${embedCode}
                </div>
            </body>
            </html>
        `);
        previewWindow.document.close();
    }

    // Generate custom link with advanced options
    generateCustomLink(tourId) {
        const startScene = document.getElementById(`start-scene-${tourId}`)?.value;
        const hideUI = document.getElementById(`hide-ui-${tourId}`)?.checked;
        const theme = document.getElementById(`theme-${tourId}`)?.value;
        const enableVR = document.getElementById(`enable-vr-${tourId}`)?.checked;

        const options = {
            source: 'custom_link',
            medium: 'share'
        };

        if (startScene) options.scene = startScene;
        if (hideUI) options.hideUI = true;
        if (theme && theme !== 'light') options.theme = theme;
        if (enableVR) options.vr = true;

        const customUrl = this.generateTourUrl(tourId, options);
        
        // Update the URL input
        const urlInput = document.getElementById(`tour-url-${tourId}`);
        if (urlInput) {
            urlInput.value = customUrl;
        }

        this.showToast('Custom link generated!', 'success');
    }

    // Show toast notification
    showToast(message, type = 'info') {
        if (window.VortitourApp && window.VortitourApp.showToast) {
            window.VortitourApp.showToast(message, type);
        } else {
            // Fallback toast
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Generate sharing analytics report
    generateSharingReport(tourId, period = '30d') {
        // This would typically fetch data from analytics
        return {
            totalShares: 156,
            platforms: {
                facebook: 45,
                twitter: 32,
                linkedin: 28,
                whatsapp: 25,
                email: 18,
                telegram: 8
            },
            embedViews: 89,
            qrCodeScans: 12,
            topReferrers: [
                { source: 'facebook.com', visits: 45 },
                { source: 'twitter.com', visits: 32 },
                { source: 'linkedin.com', visits: 28 }
            ]
        };
    }

    // Track sharing events
    trackShare(tourId, platform, method = 'modal') {
        if (window.VortitourAnalytics) {
            window.VortitourAnalytics.trackEvent('tour_shared', {
                tour_id: tourId,
                platform,
                method,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Track embed views
    trackEmbedView(tourId, embedOptions = {}) {
        if (window.VortitourAnalytics) {
            window.VortitourAnalytics.trackEvent('embed_viewed', {
                tour_id: tourId,
                embed_size: embedOptions.size || 'unknown',
                embed_responsive: embedOptions.responsive || false,
                referrer: document.referrer,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Initialize sharing for embedded tours
    initEmbedTracking() {
        // Check if this is an embedded view
        const urlParams = new URLSearchParams(window.location.search);
        const isEmbed = urlParams.get('utm_source') === 'embed';
        
        if (isEmbed) {
            const tourId = urlParams.get('tour');
            if (tourId) {
                this.trackEmbedView(tourId, {
                    size: 'unknown', // Could be detected from iframe dimensions
                    responsive: false // Could be detected
                });
            }
        }
    }

    // Get sharing statistics
    getSharingStats(tourId) {
        // This would typically fetch from analytics database
        return this.generateSharingReport(tourId);
    }
}

// Create global instance
window.VortitourSharing = new VortitourSharing();

// Initialize embed tracking when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.VortitourSharing.initEmbedTracking();
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VortitourSharing;
}

