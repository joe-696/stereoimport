// Analytics Module
class Analytics {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
        this.pageViews = 0;
        
        this.init();
    }

    init() {
        this.trackPageView();
        this.trackSessionTime();
        this.trackUserInteractions();
    }

    // Track page view
    trackPageView() {
        this.pageViews++;
        this.trackEvent('Page', 'view', window.location.pathname);
        
        // Track device and browser info
        this.trackEvent('Device', 'type', Utils.getDeviceType());
        this.trackEvent('Browser', 'info', this.getBrowserInfo());
    }

    // Track custom events
    trackEvent(category, action, label = '', value = null) {
        const event = {
            category,
            action,
            label,
            value,
            timestamp: Date.now(),
            page: window.location.pathname
        };

        this.events.push(event);
        
        // Log to console for debugging
        console.log(`📊 Analytics: ${category} - ${action}`, label ? `- ${label}` : '');

        // Send to your analytics service (Google Analytics, etc.)
        this.sendToAnalytics(event);
    }

    // Send to analytics service
    sendToAnalytics(event) {
        // Example for Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', event.action, {
                event_category: event.category,
                event_label: event.label,
                value: event.value
            });
        }

        // Example for custom analytics endpoint
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(event)
        // }).catch(err => console.warn('Analytics error:', err));
    }

    // Track session time
    trackSessionTime() {
        window.addEventListener('beforeunload', () => {
            const sessionTime = Date.now() - this.sessionStart;
            this.trackEvent('Session', 'duration', 'seconds', Math.round(sessionTime / 1000));
        });
    }

    // Track user interactions
    trackUserInteractions() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button');
            if (target) {
                const elementType = target.tagName.toLowerCase();
                const elementText = target.textContent.trim().substring(0, 50);
                const elementClass = target.className;
                
                if (elementClass.includes('hero-cta')) {
                    this.trackEvent('CTA', 'click', 'Hero Button');
                } else if (elementClass.includes('products-float')) {
                    this.trackEvent('CTA', 'click', 'Products Float');
                } else if (elementClass.includes('whatsapp-float')) {
                    this.trackEvent('Contact', 'click', 'WhatsApp Float');
                } else if (elementClass.includes('social-link')) {
                    this.trackEvent('Social', 'click', this.getSocialPlatform(target));
                } else if (elementType === 'a') {
                    this.trackEvent('Link', 'click', elementText);
                } else if (elementType === 'button') {
                    this.trackEvent('Button', 'click', elementText);
                }
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formId = form.id || form.className || 'unknown';
            this.trackEvent('Form', 'submit', formId);
        });

        // Track scroll depth
        this.trackScrollDepth();
    }

    // Track scroll depth
    trackScrollDepth() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 90, 100];
        const tracked = new Set();

        const trackScroll = Utils.throttle(() => {
            const scrollPercent = Utils.getScrollPercentage();
            maxScroll = Math.max(maxScroll, scrollPercent);

            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    this.trackEvent('Scroll', 'depth', `${milestone}%`);
                }
            });
        }, 1000);

        window.addEventListener('scroll', trackScroll);
    }

    // Get social platform from link
    getSocialPlatform(element) {
        const href = element.href || '';
        const className = element.className || '';
        
        if (href.includes('facebook') || className.includes('facebook')) return 'Facebook';
        if (href.includes('instagram') || className.includes('instagram')) return 'Instagram';
        if (href.includes('tiktok') || className.includes('tiktok')) return 'TikTok';
        if (href.includes('whatsapp') || className.includes('whatsapp')) return 'WhatsApp';
        
        return 'Unknown';
    }

    // Get browser info
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        else if (ua.includes('Opera')) browser = 'Opera';
        
        return browser;
    }

    // Get analytics summary
    getSummary() {
        return {
            totalEvents: this.events.length,
            pageViews: this.pageViews,
            sessionDuration: Date.now() - this.sessionStart,
            events: this.events
        };
    }
}

// Initialize analytics
const analytics = new Analytics();

// Export for global use
window.Analytics = Analytics;
window.analytics = analytics;
