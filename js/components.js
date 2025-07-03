// Component Manager - Sistema de gestión de componentes
class ComponentManager {
    constructor() {
        this.components = new Map();
        this.observers = new Map();
        this.initialized = false;
    }

    // Registrar un nuevo componente
    registerComponent(name, componentClass, options = {}) {
        if (this.components.has(name)) {
            console.warn(`Component ${name} already registered`);
            return;
        }

        this.components.set(name, {
            class: componentClass,
            options,
            instances: new Set()
        });

        console.log(`✅ Component registered: ${name}`);
    }

    // Inicializar un componente
    initComponent(name, selector, config = {}) {
        const component = this.components.get(name);
        if (!component) {
            console.error(`Component ${name} not found`);
            return null;
        }

        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            console.warn(`No elements found for selector: ${selector}`);
            return null;
        }

        const instances = [];
        elements.forEach(element => {
            const instance = new component.class(element, {
                ...component.options,
                ...config
            });
            component.instances.add(instance);
            instances.push(instance);
        });

        return instances.length === 1 ? instances[0] : instances;
    }

    // Destruir instancias de un componente
    destroyComponent(name) {
        const component = this.components.get(name);
        if (!component) return;

        component.instances.forEach(instance => {
            if (typeof instance.destroy === 'function') {
                instance.destroy();
            }
        });

        component.instances.clear();
        console.log(`🗑️ Component destroyed: ${name}`);
    }

    // Obtener instancias de un componente
    getComponent(name) {
        const component = this.components.get(name);
        return component ? Array.from(component.instances) : [];
    }

    // Inicializar todos los componentes automáticamente
    autoInit() {
        if (this.initialized) return;

        // Detectar componentes por atributos data-component
        document.querySelectorAll('[data-component]').forEach(element => {
            const componentName = element.getAttribute('data-component');
            const config = this.parseConfig(element.getAttribute('data-config'));
            
            this.initComponent(componentName, `[data-component="${componentName}"]`, config);
        });

        this.initialized = true;
        console.log('🚀 All components auto-initialized');
    }

    // Parsear configuración desde atributo
    parseConfig(configString) {
        if (!configString) return {};
        
        try {
            return JSON.parse(configString);
        } catch (e) {
            console.warn('Invalid component config:', configString);
            return {};
        }
    }

    // Crear observer para lazy loading de componentes
    createLazyObserver(selector, componentName, config = {}) {
        if (this.observers.has(selector)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.initComponent(componentName, selector, config);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll(selector).forEach(element => {
            observer.observe(element);
        });

        this.observers.set(selector, observer);
    }
}

// Componente Base
class BaseComponent {
    constructor(element, options = {}) {
        this.element = element;
        this.options = options;
        this.isDestroyed = false;
        
        this.init();
    }

    init() {
        // Override en componentes hijos
    }

    destroy() {
        this.isDestroyed = true;
        this.element = null;
        this.options = null;
    }

    emit(eventName, data = {}) {
        const event = new CustomEvent(eventName, {
            detail: data,
            bubbles: true
        });
        this.element.dispatchEvent(event);
    }

    on(eventName, handler) {
        this.element.addEventListener(eventName, handler);
    }

    off(eventName, handler) {
        this.element.removeEventListener(eventName, handler);
    }
}

// Componente de Contador Animado
class AnimatedCounter extends BaseComponent {
    init() {
        this.target = parseInt(this.element.getAttribute('data-target')) || 0;
        this.duration = this.options.duration || 2000;
        this.isVisible = false;
        
        this.setupObserver();
    }

    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isVisible) {
                    this.isVisible = true;
                    this.animate();
                    observer.unobserve(this.element);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.element);
    }

    animate() {
        const start = 0;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            if (this.isDestroyed) return;
            
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (this.target - start) * easeOut);
            
            this.updateDisplay(current);
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                this.updateDisplay(this.target);
                this.emit('counter:complete', { value: this.target });
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    updateDisplay(value) {
        if (this.target >= 1000) {
            this.element.textContent = value.toLocaleString() + '+';
        } else if (this.target === 98) {
            this.element.textContent = value + '%';
        } else {
            this.element.textContent = value;
        }
    }
}

// Componente de Imagen Lazy
class LazyImage extends BaseComponent {
    init() {
        this.src = this.element.getAttribute('data-src');
        this.placeholder = this.options.placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';
        
        this.setupPlaceholder();
        this.setupObserver();
    }

    setupPlaceholder() {
        if (!this.element.src) {
            this.element.src = this.placeholder;
        }
    }

    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage();
                    observer.unobserve(this.element);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(this.element);
    }

    loadImage() {
        if (!this.src) return;

        const img = new Image();
        img.onload = () => {
            this.element.src = this.src;
            this.element.classList.add('loaded');
            this.emit('image:loaded', { src: this.src });
        };
        img.onerror = () => {
            this.element.classList.add('error');
            this.emit('image:error', { src: this.src });
        };
        img.src = this.src;
    }
}

// Componente de Modal
class Modal extends BaseComponent {
    init() {
        this.isOpen = false;
        this.backdrop = null;
        
        this.setupTriggers();
        this.setupKeyboard();
    }

    setupTriggers() {
        const triggers = document.querySelectorAll(`[data-modal="${this.element.id}"]`);
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        });

        // Close buttons
        this.element.querySelectorAll('[data-close]').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.close());
        });
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.element.style.display = 'flex';
        this.createBackdrop();
        
        // Animation
        requestAnimationFrame(() => {
            this.element.classList.add('show');
        });

        document.body.style.overflow = 'hidden';
        this.emit('modal:open');
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.element.classList.remove('show');
        
        setTimeout(() => {
            this.element.style.display = 'none';
            this.removeBackdrop();
        }, 300);

        document.body.style.overflow = '';
        this.emit('modal:close');
    }

    createBackdrop() {
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'modal-backdrop';
        this.backdrop.addEventListener('click', () => this.close());
        document.body.appendChild(this.backdrop);
    }

    removeBackdrop() {
        if (this.backdrop) {
            this.backdrop.remove();
            this.backdrop = null;
        }
    }
}

// Inicializar el sistema de componentes
const componentManager = new ComponentManager();

// Registrar componentes
componentManager.registerComponent('counter', AnimatedCounter);
componentManager.registerComponent('lazy-image', LazyImage);
componentManager.registerComponent('modal', Modal);

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    componentManager.autoInit();
    
    // Inicializar contadores en elementos con clase stat-number
    componentManager.initComponent('counter', '.stat-number');
    
    // Inicializar lazy loading en imágenes
    componentManager.initComponent('lazy-image', 'img[data-src]');
});

// Exportar para uso global
window.ComponentManager = ComponentManager;
window.BaseComponent = BaseComponent;
window.componentManager = componentManager;
