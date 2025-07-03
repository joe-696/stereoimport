// Configuration Module
const Config = {
    // Site Information
    site: {
        name: 'Stereo Import',
        description: 'Especialistas en audio profesional desde 2018',
        url: 'https://stereoimport.com',
        email: 'stereo.import@gmail.com',
        phone: '+51931292396',
        address: {
            street: 'CC Polvos Azules, Av. José Galvez 250',
            city: 'La Victoria',
            region: 'Lima',
            country: 'Perú',
            countryCode: 'PE'
        }
    },

    // Social Media Links
    social: {
        facebook: 'https://www.facebook.com/profile.php?id=100063727397781&mibextid=ZbWKwL',
        instagram: 'https://www.instagram.com/stereoimport/',
        tiktok: 'https://www.tiktok.com/@stereo.import',
        whatsapp: 'https://wa.me/51931292396'
    },

    // Business Hours
    hours: {
        monday: { open: '12:00', close: '20:00' },
        tuesday: { open: '12:00', close: '20:00' },
        wednesday: { open: '12:00', close: '20:00' },
        thursday: { open: '12:00', close: '20:00' },
        friday: { open: '12:00', close: '20:00' },
        saturday: { open: '12:00', close: '20:00' },
        sunday: { closed: true }
    },

    // Animation Settings
    animations: {
        duration: {
            fast: 200,
            normal: 300,
            slow: 600
        },
        easing: {
            default: 'cubic-bezier(0.4, 0, 0.2, 1)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        },
        reducedMotion: false
    },

    // Performance Settings
    performance: {
        lazyLoadOffset: 100,
        throttleDelay: 100,
        debounceDelay: 300,
        cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
        preloadImages: [
            'https://i.ibb.co/0yxnGWwy/image-removebg-preview-34.png',
            'https://i.ibb.co/QvmH51jQ/image.png',
            'https://i.ibb.co/Q3jwMrsz/image.png',
            'https://i.ibb.co/Zz4XNsZn/image.png'
        ]
    },

    // Analytics Settings
    analytics: {
        enabled: true,
        trackClicks: true,
        trackScroll: true,
        trackForms: true,
        trackErrors: true,
        scrollDepthMarkers: [25, 50, 75, 90, 100],
        sessionTimeout: 30 * 60 * 1000 // 30 minutes
    },

    // API Endpoints
    api: {
        baseUrl: 'https://api.stereoimport.com',
        endpoints: {
            contact: '/contact',
            newsletter: '/newsletter',
            products: '/products',
            analytics: '/analytics'
        },
        timeout: 10000,
        retries: 3
    },

    // Feature Flags
    features: {
        serviceWorker: true,
        pushNotifications: false,
        darkMode: false,
        cookies: true,
        analytics: true,
        lazyLoading: true,
        infiniteScroll: false,
        search: false
    },

    // Responsive Breakpoints
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        wide: 1400
    },

    // Error Messages
    messages: {
        errors: {
            generic: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
            network: 'Error de conexión. Verifica tu internet.',
            timeout: 'La solicitud ha tardado demasiado. Inténtalo de nuevo.',
            notFound: 'No se encontró el recurso solicitado.',
            validation: 'Por favor, verifica que todos los campos sean correctos.'
        },
        success: {
            generic: '¡Operación completada exitosamente!',
            contact: '¡Mensaje enviado! Te contactaremos pronto.',
            newsletter: '¡Te has suscrito exitosamente!'
        },
        loading: {
            generic: 'Cargando...',
            sending: 'Enviando...',
            processing: 'Procesando...'
        }
    },

    // Image Settings
    images: {
        lazy: true,
        placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcmdhbmRvLi4uPC90ZXh0Pjwvc3ZnPg==',
        errorPlaceholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjhmOCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==',
        formats: ['webp', 'avif', 'jpg', 'png'],
        sizes: {
            thumbnail: 150,
            small: 300,
            medium: 600,
            large: 1200,
            xlarge: 1920
        }
    },

    // Security Settings
    security: {
        csp: {
            enabled: false,
            reportOnly: true
        },
        sanitize: {
            enabled: true,
            allowedTags: ['b', 'i', 'em', 'strong', 'a'],
            allowedAttributes: ['href', 'title']
        }
    }
};

// Environment Detection
Config.environment = (() => {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.')) {
        return 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
        return 'staging';
    } else {
        return 'production';
    }
})();

// Apply environment-specific settings
if (Config.environment === 'development') {
    Config.analytics.enabled = false;
    Config.features.serviceWorker = false;
    Config.api.baseUrl = 'http://localhost:3000/api';
} else if (Config.environment === 'staging') {
    Config.api.baseUrl = 'https://staging-api.stereoimport.com';
}

// Check for reduced motion preference
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Config.animations.reducedMotion = true;
    Config.animations.duration.fast = 0;
    Config.animations.duration.normal = 0;
    Config.animations.duration.slow = 0;
}

// Utility functions for config access
Config.get = function(path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], this);
};

Config.set = function(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, this);
    target[lastKey] = value;
};

Config.isMobile = function() {
    return window.innerWidth <= this.breakpoints.mobile;
};

Config.isTablet = function() {
    return window.innerWidth > this.breakpoints.mobile && window.innerWidth <= this.breakpoints.tablet;
};

Config.isDesktop = function() {
    return window.innerWidth > this.breakpoints.desktop;
};

Config.getDeviceType = function() {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
};

// Export configuration
window.Config = Config;

// Log environment info in development
if (Config.environment === 'development') {
    console.log('🔧 Stereo Import Configuration:', Config);
    console.log('📱 Device Type:', Config.getDeviceType());
    console.log('🌍 Environment:', Config.environment);
}
