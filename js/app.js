// Core App Module
class StereoImportApp {
    constructor() {
        this.isLoaded = false;
        this.isMobileMenuOpen = false;
        this.lastScrollY = 0;
        this.ticking = false;
        
        this.init();
    }

    init() {
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }

        // Initialize when page is fully loaded
        window.addEventListener('load', () => this.onPageLoad());
    }

    onDOMReady() {
        console.log('🎵 Stereo Import DOM ready! 🔊');
        
        // Initialize components
        this.initializeHeader();
        this.initializeMobileMenu();
        this.initializeSmoothScrolling();
        this.initializeAnimations();
        this.initializeScrollReveal();
        this.initializeParticles();
        this.initializeInteractiveElements();
        this.initializeFloatingButtons();
        this.initializeKeyboardNavigation();
        this.initializeClickTracking();
        this.initializeServiceWorker();
        this.preloadResources();
        
        // Add body class for styling
        document.body.classList.add('loaded');
        
        console.log('🎵 Stereo Import initialized successfully! 🔊');
    }

    onPageLoad() {
        // Initialize page loader
        this.hidePageLoader();
        
        // Initialize stats counter
        this.initializeStatsCounter();
        
        // Initialize performance optimizations
        this.initializePerformanceOptimizations();
        
        this.isLoaded = true;
        console.log('🎵 Stereo Import fully loaded! 🔊');
    }

    hidePageLoader() {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 100);
            }, 1000);
        }
    }

    initializeHeader() {
        const header = document.getElementById('header');
        if (!header) return;

        const updateHeader = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide/show header on scroll
            if (scrollY > this.lastScrollY && scrollY > 500) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            this.lastScrollY = scrollY;
            this.ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(updateHeader);
                this.ticking = true;
            }
        });
    }

    initializeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const navMenu = document.getElementById('navMenu');
        
        if (!mobileMenu || !navMenu) return;

        mobileMenu.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const navMenu = document.getElementById('navMenu');
        const icon = mobileMenu.querySelector('i');
        
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        navMenu.classList.toggle('active');
        
        if (this.isMobileMenuOpen) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            document.body.style.overflow = 'hidden';
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            document.body.style.overflow = '';
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const navMenu = document.getElementById('navMenu');
        const icon = mobileMenu.querySelector('i');
        
        if (this.isMobileMenuOpen) {
            navMenu.classList.remove('active');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
            document.body.style.overflow = '';
            this.isMobileMenuOpen = false;
        }
    }

    initializeSmoothScrolling() {
        const header = document.getElementById('header');
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    initializeAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100); // Stagger animations
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in').forEach(el => {
            observer.observe(el);
        });

        // Initialize image lazy loading
        this.initializeImageLazyLoading();
    }

    initializeImageLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    initializeStatsCounter() {
        const statsSection = document.querySelector('.stats');
        if (!statsSection) return;

        const animateCounters = () => {
            const counters = document.querySelectorAll('.stat-number');
            
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                const increment = target / 60;
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        const value = Math.floor(current);
                        
                        if (target >= 1000) {
                            counter.textContent = value.toLocaleString() + '+';
                        } else if (target === 98) {
                            counter.textContent = value + '%';
                        } else {
                            counter.textContent = value;
                        }
                        
                        requestAnimationFrame(updateCounter);
                    } else {
                        if (target >= 1000) {
                            counter.textContent = target.toLocaleString() + '+';
                        } else if (target === 98) {
                            counter.textContent = target + '%';
                        } else {
                            counter.textContent = target;
                        }
                    }
                };
                
                updateCounter();
            });
        };

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
    }

    initializeKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
            
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    initializeClickTracking() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button');
            if (target) {
                const action = target.getAttribute('aria-label') || target.textContent.trim();
                this.trackEvent('User Interaction', 'click', action);
                
                // Add visual feedback
                target.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    target.style.transform = '';
                }, 150);
            }
        });

        // Track important interactions
        this.trackCTAClicks();
    }

    trackCTAClicks() {
        const heroCTA = document.querySelector('.hero-cta');
        const productsFloat = document.querySelector('.products-float');
        const whatsappFloat = document.querySelector('.whatsapp-float');

        if (heroCTA) {
            heroCTA.addEventListener('click', () => {
                this.trackEvent('CTA', 'click', 'Hero Products Button');
            });
        }

        if (productsFloat) {
            productsFloat.addEventListener('click', () => {
                this.trackEvent('CTA', 'click', 'Floating Products Button');
            });
        }

        if (whatsappFloat) {
            whatsappFloat.addEventListener('click', () => {
                this.trackEvent('Contact', 'click', 'WhatsApp Float');
            });
        }
    }

    trackEvent(category, action, label) {
        // Replace with your analytics implementation
        console.log(`Analytics: ${category} - ${action} - ${label}`);
        
        // Example for Google Analytics 4:
        // gtag('event', action, {
        //     event_category: category,
        //     event_label: label
        // });
    }

    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    preloadResources() {
        const preloadResources = [
            'https://i.ibb.co/0yxnGWwy/image-removebg-preview-34.png',
            'https://i.ibb.co/QvmH51jQ/image.png',
            'https://i.ibb.co/Q3jwMrsz/image.png',
            'https://i.ibb.co/Zz4XNsZn/image.png'
        ];

        preloadResources.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    initializePerformanceOptimizations() {
        // Page Visibility API
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.body.classList.add('page-hidden');
            } else {
                document.body.classList.remove('page-hidden');
            }
        });

        // Enhanced Error Handling
        window.addEventListener('error', (e) => {
            console.warn('Resource failed to load:', e.target.src || e.target.href);
        });

        // Resize optimization
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log('Window resized, layout updated');
            }, 150);
        });

        // Parallax Effects
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            
            parallaxElements.forEach(element => {
                const speed = element.getAttribute('data-parallax') || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // Enhanced scroll behavior and floating buttons
    initializeFloatingButtons() {
        const scrollTopButton = document.querySelector('.scroll-top');
        if (!scrollTopButton) return;

        const toggleScrollTopButton = () => {
            if (window.scrollY > 300) {
                scrollTopButton.classList.add('visible');
            } else {
                scrollTopButton.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', Utils.throttle(toggleScrollTopButton, 100));
        
        // Add pulse animation on first scroll
        let hasScrolled = false;
        window.addEventListener('scroll', () => {
            if (!hasScrolled && window.scrollY > 100) {
                hasScrolled = true;
                document.querySelectorAll('.floating-action').forEach(btn => {
                    btn.classList.add('pulse');
                    setTimeout(() => btn.classList.remove('pulse'), 3000);
                });
            }
        });
    }
}

// Initialize the application
const app = new StereoImportApp();
