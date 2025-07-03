// Enhanced Interactive Features for Stereo Import
class InteractiveFeatures {
    constructor() {
        this.particles = [];
        this.animationId = null;
        this.init();
    }

    init() {
        this.initializeScrollReveal();
        this.initializeParticles();
        this.initializeInteractiveElements();
        this.initializePerformanceMonitoring();
    }

    // Enhanced Scroll Reveal Animation System
    initializeScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Add sequential animation delays for groups
                    if (entry.target.dataset.delay) {
                        entry.target.style.animationDelay = entry.target.dataset.delay + 'ms';
                    }
                    
                    // Add sparkle effect for special elements
                    if (entry.target.classList.contains('sparkle-on-reveal')) {
                        this.addSparkleEffect(entry.target);
                    }
                    
                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all reveal elements
        document.querySelectorAll('.reveal, .reveal-scale, .reveal-rotate').forEach((el, index) => {
            el.dataset.delay = index * 100;
            observer.observe(el);
        });
    }

    // Interactive Particles System
    initializeParticles() {
        if (window.innerWidth < 768) return; // Skip on mobile for performance

        const canvas = document.createElement('canvas');
        canvas.id = 'particles-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.3;
        `;
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const particleCount = 40;
        
        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        // Particle class
        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 10;
                this.speed = Math.random() * 1 + 0.5;
                this.size = Math.random() * 2 + 1;
                this.color = this.getRandomColor();
                this.angle = Math.random() * Math.PI * 2;
                this.spin = Math.random() * 0.02 - 0.01;
            }
            
            getRandomColor() {
                const colors = [
                    'rgba(0, 112, 211, 0.6)',
                    'rgba(64, 224, 224, 0.6)',
                    'rgba(255, 107, 107, 0.4)',
                    'rgba(81, 207, 102, 0.5)'
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            }
            
            update() {
                this.angle += this.spin;
                this.x += Math.cos(this.angle) * 0.5;
                this.y -= this.speed;
                
                if (this.y < -10) {
                    this.reset();
                }
            }
            
            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        
        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle());
        }
        
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            this.particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Enhanced Interactive Elements
    initializeInteractiveElements() {
        this.addRippleEffect();
        this.addHoverEffects();
        this.addMagneticEffect();
        this.addSoundEffects();
        this.addCursorTrail();
    }

    addRippleEffect() {
        document.querySelectorAll('.btn-interactive, .hero-cta, .brand-cta').forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    pointer-events: none;
                `;
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    addHoverEffects() {
        // Enhanced card hover effects
        document.querySelectorAll('.stat-card, .brand-card, .shipment-card').forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                card.style.transform += ' scale(1.02)';
                this.addGlowEffect(card);
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = card.style.transform.replace(' scale(1.02)', '');
                this.removeGlowEffect(card);
            });
            
            // Add parallax effect on mouse move
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                
                card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${y * -10}deg)`;
            });
        });
    }

    addMagneticEffect() {
        document.querySelectorAll('.hero-cta').forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }

    addSoundEffects() {
        // Create audio context for subtle hover sounds
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const audioCtx = new AudioContext();
        
        const createBeep = (frequency = 800, duration = 100) => {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration / 1000);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + duration / 1000);
        };

        // Add subtle hover sounds to interactive elements
        document.querySelectorAll('.hero-cta, .brand-cta').forEach(element => {
            element.addEventListener('mouseenter', () => {
                createBeep(600, 50);
            });
        });
    }

    addCursorTrail() {
        const trail = [];
        const trailLength = 10;
        
        document.addEventListener('mousemove', (e) => {
            trail.push({ x: e.clientX, y: e.clientY, life: trailLength });
            
            if (trail.length > trailLength) {
                trail.shift();
            }
            
            this.updateCursorTrail();
        });
    }

    updateCursorTrail() {
        // Remove existing trail elements
        document.querySelectorAll('.cursor-trail').forEach(el => el.remove());
        
        // Create new trail elements
        this.trail?.forEach((point, index) => {
            const trailElement = document.createElement('div');
            trailElement.className = 'cursor-trail';
            trailElement.style.cssText = `
                position: fixed;
                left: ${point.x}px;
                top: ${point.y}px;
                width: ${point.life}px;
                height: ${point.life}px;
                background: radial-gradient(circle, rgba(0, 112, 211, ${point.life / 20}), transparent);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
            `;
            
            document.body.appendChild(trailElement);
            point.life--;
        });
    }

    addSparkleEffect(element) {
        const sparkles = [];
        const sparkleCount = 8;
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: #FFD700;
                border-radius: 50%;
                animation: sparkle 1s ease-out forwards;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
            `;
            
            element.style.position = 'relative';
            element.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }
    }

    addGlowEffect(element) {
        element.style.boxShadow = '0 0 20px rgba(0, 112, 211, 0.5)';
    }

    removeGlowEffect(element) {
        element.style.boxShadow = '';
    }

    initializePerformanceMonitoring() {
        // Monitor performance and adjust effects accordingly
        let frameCount = 0;
        let fps = 60;
        let lastTime = performance.now();
        
        const monitorFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                
                // Reduce effects if performance is poor
                if (fps < 30) {
                    this.reduceEffects();
                } else if (fps > 50) {
                    this.enableEffects();
                }
            }
            
            requestAnimationFrame(monitorFPS);
        };
        
        monitorFPS();
    }

    reduceEffects() {
        // Reduce particle count and disable heavy animations
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            canvas.style.opacity = '0.1';
        }
        
        document.body.classList.add('reduced-motion');
    }

    enableEffects() {
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            canvas.style.opacity = '0.3';
        }
        
        document.body.classList.remove('reduced-motion');
    }

    // Cleanup method
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            canvas.remove();
        }
        
        document.querySelectorAll('.cursor-trail').forEach(el => el.remove());
    }
}

// Additional CSS animations
const additionalStyles = `
    @keyframes sparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    .reduced-motion * {
        animation-duration: 0.01s !important;
        transition-duration: 0.01s !important;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveFeatures();
});

// Export for use in other modules
window.InteractiveFeatures = InteractiveFeatures;
