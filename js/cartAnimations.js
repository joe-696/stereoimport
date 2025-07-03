// Módulo de animaciones del carrito de compras
export class CartAnimations {
    constructor() {
        this.activeAnimations = new Set();
        this.createToastContainer();
        this.createParticleContainer();
    }

    // Crear contenedor para notificaciones toast
    createToastContainer() {
        if (!document.getElementById('cart-toast-container')) {
            const container = document.createElement('div');
            container.id = 'cart-toast-container';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }

    // Crear contenedor para partículas
    createParticleContainer() {
        if (!document.getElementById('cart-particles-container')) {
            const container = document.createElement('div');
            container.id = 'cart-particles-container';
            container.className = 'cart-particles';
            document.body.appendChild(container);
        }
    }

    // Mostrar notificación mejorada
    showCartNotification(productName, productImage) {
        const container = document.getElementById('cart-toast-container');
        if (!container) return;

        // Crear el toast
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.innerHTML = `
            <div class="cart-toast__icon">🛒</div>
            <div class="cart-toast__content">
                <div class="cart-toast__title">¡Producto agregado!</div>
                <div class="cart-toast__message">${productName}</div>
            </div>
            <button class="cart-toast__close" aria-label="Cerrar">×</button>
        `;

        // Agregar evento para cerrar
        const closeBtn = toast.querySelector('.cart-toast__close');
        closeBtn.addEventListener('click', () => this.hideToast(toast));

        // Agregar al contenedor
        container.appendChild(toast);

        // Mostrar con animación
        requestAnimationFrame(() => {
            toast.classList.add('cart-toast--show');
        });

        // Auto-ocultar después de 4 segundos
        setTimeout(() => {
            this.hideToast(toast);
        }, 4000);

        return toast;
    }

    // Ocultar toast
    hideToast(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.remove('cart-toast--show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    }

    // Animación de producto volando al carrito
    flyProductToCart(productImageElement, cartButtonElement) {
        if (!productImageElement || !cartButtonElement) {
            console.warn('No se pudo realizar la animación: elementos no encontrados');
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            // Crear elemento volador
            const flyingElement = this.createFlyingElement(productImageElement);
            
            // Posiciones inicial y final
            const startRect = productImageElement.getBoundingClientRect();
            const endRect = cartButtonElement.getBoundingClientRect();

            // Configurar posición inicial
            flyingElement.style.left = startRect.left + 'px';
            flyingElement.style.top = startRect.top + 'px';
            flyingElement.style.width = startRect.width + 'px';
            flyingElement.style.height = startRect.height + 'px';

            // Agregar al DOM
            document.body.appendChild(flyingElement);

            // Iniciar animación
            requestAnimationFrame(() => {
                flyingElement.style.left = (endRect.left + endRect.width/2 - 20) + 'px';
                flyingElement.style.top = (endRect.top + endRect.height/2 - 20) + 'px';
                flyingElement.style.width = '40px';
                flyingElement.style.height = '40px';
                flyingElement.style.opacity = '0.3';
                flyingElement.style.transform = 'scale(0.3)';
            });

            // Limpiar después de la animación
            setTimeout(() => {
                if (flyingElement.parentNode) {
                    flyingElement.parentNode.removeChild(flyingElement);
                }
                
                // Animar botón del carrito
                this.animateCartButton(cartButtonElement);
                
                resolve();
            }, 800);
        });
    }

    // Crear elemento volador
    createFlyingElement(sourceElement) {
        const flyingElement = document.createElement('img');
        flyingElement.src = sourceElement.src || sourceElement.style.backgroundImage?.replace(/url\(['"]?([^'"]*)['"]?\)/, '$1') || '';
        flyingElement.className = 'flying-product';
        flyingElement.style.cssText = `
            position: fixed;
            z-index: 9999;
            pointer-events: none;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            object-fit: cover;
        `;
        return flyingElement;
    }

    // Animar botón del carrito
    animateCartButton(cartButton) {
        if (!cartButton) return;

        // Efecto de rebote
        cartButton.classList.add('cart-button-bounce');
        setTimeout(() => {
            cartButton.classList.remove('cart-button-bounce');
        }, 600);

        // Animar contador si existe
        const cartCount = cartButton.querySelector('[id*="cart"][id*="count"], .cart-count, .cart-counter');
        if (cartCount) {
            cartCount.classList.add('cart-count-animation');
            setTimeout(() => {
                cartCount.classList.remove('cart-count-animation');
            }, 500);
        }
    }

    // Efecto de ondas en botón agregar
    addRippleEffect(button) {
        if (!button) return;

        button.classList.add('add-to-cart-ripple');
        button.classList.add('add-to-cart-ripple--active');

        setTimeout(() => {
            button.classList.remove('add-to-cart-ripple--active');
        }, 600);
    }

    // Mostrar indicador en producto
    showProductIndicator(productElement) {
        if (!productElement) return;

        // Buscar o crear indicador
        let indicator = productElement.querySelector('.product-added-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'product-added-indicator';
            indicator.innerHTML = '✓';
            productElement.style.position = 'relative';
            productElement.appendChild(indicator);
        }

        // Mostrar indicador
        indicator.classList.add('product-added-indicator--show');

        // Ocultar después de 2 segundos
        setTimeout(() => {
            indicator.classList.remove('product-added-indicator--show');
        }, 2000);
    }

    // Efecto de brillo en producto
    addShineEffect(productElement) {
        if (!productElement) return;

        productElement.classList.add('product-highlight');
        productElement.classList.add('product-highlight--shine');

        setTimeout(() => {
            productElement.classList.remove('product-highlight--shine');
        }, 600);
    }

    // Crear partículas flotantes
    createParticles(x, y, count = 6) {
        const container = document.getElementById('cart-particles-container');
        if (!container) return;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'cart-particle';
            
            // Posición aleatoria alrededor del punto
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 40;
            
            particle.style.left = (x + offsetX) + 'px';
            particle.style.top = (y + offsetY) + 'px';
            
            // Color aleatorio
            const colors = ['#4ecdc4', '#44a08d', '#f38b4a', '#6c5ce7'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            // Delay aleatorio
            particle.style.animationDelay = (Math.random() * 0.3) + 's';
            
            container.appendChild(particle);
            
            // Eliminar después de la animación
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1500);
        }
    }

    // Animación completa cuando se agrega producto
    async animateAddToCart(productElement, productName, productImage, cartButton) {
        try {
            console.log('🎬 Iniciando animación completa del carrito');

            // 1. Efecto de ondas en el botón
            const addButton = productElement.querySelector('.product__add-to-cart, .add-to-cart-btn, [data-action="add-to-cart"]');
            if (addButton) {
                this.addRippleEffect(addButton);
            }

            // 2. Efecto de brillo en el producto
            this.addShineEffect(productElement);

            // 3. Mostrar indicador en el producto
            this.showProductIndicator(productElement);

            // 4. Crear partículas
            const rect = productElement.getBoundingClientRect();
            this.createParticles(rect.left + rect.width/2, rect.top + rect.height/2);

            // 5. Animación de vuelo al carrito (si los elementos existen)
            const productImg = productElement.querySelector('img, .product__image');
            if (productImg && cartButton) {
                await this.flyProductToCart(productImg, cartButton);
            }

            // 6. Mostrar notificación
            this.showCartNotification(productName, productImage);

            console.log('✅ Animación completa del carrito terminada');
        } catch (error) {
            console.error('❌ Error en animación del carrito:', error);
        }
    }

    // Limpiar todas las animaciones activas
    clearAllAnimations() {
        // Limpiar toasts
        const toastContainer = document.getElementById('cart-toast-container');
        if (toastContainer) {
            toastContainer.innerHTML = '';
        }

        // Limpiar partículas
        const particleContainer = document.getElementById('cart-particles-container');
        if (particleContainer) {
            particleContainer.innerHTML = '';
        }

        // Limpiar elementos voladores
        document.querySelectorAll('.flying-product').forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });

        this.activeAnimations.clear();
    }
}
