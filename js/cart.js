import { SharedUtils } from '../shared/utils.js';
import { CART_CONFIG, CartUtils, CartSync } from '../shared/cartConfig.js';

// Cart Management for Index Page
export class CartManager {
    constructor() {
        // Usar configuración compartida
        this.cart = CartSync.loadCart();
        this.cartItemsContainer = document.getElementById('cartItems');
        this.cartCount = document.getElementById('cartCount');
        this.cartTotal = document.getElementById('cartTotal');
        this.toast = document.getElementById('toast');
        
        this.initializeElements();
    }

    initializeElements() {
        this.cartModal = document.getElementById('cartModal');
        this.cartModalOverlay = document.getElementById('cartModalOverlay');
        this.cartButton = document.getElementById('cartButton');
        this.closeCartBtn = document.getElementById('closeCartBtn');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        this.checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
        this.closeCheckoutModalBtn = document.getElementById('closeCheckoutModalBtn');
        this.checkoutForm = document.getElementById('checkoutForm');
        
        // Sincronización entre pestañas/páginas
        this.setupStorageSync();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Actualizar UI inicial
        this.updateCartDOM();
    }

    // Configurar sincronización de localStorage entre páginas
    setupStorageSync() {
        CartSync.setupSyncListener((newCart) => {
            this.cart = newCart;
            this.updateCartDisplay(); // Usar método que no guarda
            this.updateCartTotal();
            if (this.cartCount) {
                this.cartCount.textContent = CartUtils.getTotalItems(this.cart);
            }
        });
    }

    // Save cart to localStorage and update UI
    saveCartToLocalStorage() {
        CartSync.saveCart(this.cart);
        if (this.cartCount) {
            this.cartCount.textContent = CartUtils.getTotalItems(this.cart);
        }
        this.updateCartTotal();
    }

    // Update cart total
    updateCartTotal() {
        const total = CartUtils.calculateTotal(this.cart);
        if (this.cartTotal) {
            this.cartTotal.textContent = total.toFixed(2);
        }
    }

    // Update cart DOM without saving
    updateCartDisplay() {
        if (!this.cartItemsContainer) return;
        
        this.cartItemsContainer.innerHTML = '';
        
        if (this.cart.length === 0) {
            this.cartItemsContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
        } else {
            this.cart.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item__image" loading="lazy">
                    <div class="cart-item__info">
                        <p class="cart-item__name"><strong>${item.name}</strong></p>
                        <p class="cart-item__price">S/${Number(item.price).toFixed(2)}</p>
                        <div class="cart-item__quantity">
                            <button class="cart-item__quantity-btn decrease-quantity" data-index="${index}" aria-label="Disminuir cantidad">-</button>
                            <span>${item.quantity || 1}</span>
                            <button class="cart-item__quantity-btn increase-quantity" data-index="${index}" aria-label="Aumentar cantidad">+</button>
                        </div>
                    </div>
                    <button class="cart-item__remove" data-index="${index}" aria-label="Eliminar ${item.name}">×</button>
                `;
                this.cartItemsContainer.appendChild(cartItem);
            });
        }
    }

    // Update cart DOM and save
    updateCartDOM() {
        this.updateCartDisplay();
        this.saveCartToLocalStorage();
    }

    // Add item to cart
    addToCart(name, price, image) {
        console.log('🛒 Adding to cart:', { name, price, image });
        
        const existingItem = CartUtils.findItemByName(this.cart, name);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log('📦 Updated existing item quantity:', existingItem.quantity);
        } else {
            const newItem = CART_CONFIG.createCartItem(name, price, image);
            if (CartUtils.validateCartItem(newItem)) {
                this.cart.push(newItem);
                console.log('✅ Added new item to cart:', newItem);
            } else {
                console.error('❌ Invalid cart item:', newItem);
                return;
            }
        }
        
        this.updateCartDOM();
        SharedUtils.showToast("Producto agregado al carrito!", this.toast);
    }

    // Remove item from cart
    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateCartDOM();
        SharedUtils.showToast("Producto removido del carrito!", this.toast);
    }

    // Change quantity
    changeQuantity(index, delta) {
        if (this.cart[index]) {
            this.cart[index].quantity = (this.cart[index].quantity || 1) + delta;
            
            if (this.cart[index].quantity <= 0) {
                this.removeFromCart(index);
            } else {
                this.updateCartDOM();
            }
        }
    }

    // Toggle cart modal
    toggleCart() {
        if (this.cartModal && this.cartModalOverlay) {
            const isOpen = this.cartModalOverlay.classList.contains('cart-modal-overlay--open');
            if (isOpen) {
                this.closeCart();
            } else {
                this.cartModalOverlay.classList.add('cart-modal-overlay--open');
                this.cartModal.classList.add('cart-modal--open');
            }
        }
    }

    // Close cart modal
    closeCart() {
        if (this.cartModal && this.cartModalOverlay) {
            this.cartModal.classList.remove('cart-modal--open');
            this.cartModalOverlay.classList.remove('cart-modal-overlay--open');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Cart button
        if (this.cartButton) {
            this.cartButton.addEventListener('click', () => this.toggleCart());
        }

        // Close cart button
        if (this.closeCartBtn) {
            this.closeCartBtn.addEventListener('click', () => this.closeCart());
        }

        // Overlay click (close when clicking outside modal)
        if (this.cartModalOverlay) {
            this.cartModalOverlay.addEventListener('click', (e) => {
                if (e.target === this.cartModalOverlay) {
                    this.closeCart();
                }
            });
        }

        // Cart items interactions
        if (this.cartItemsContainer) {
            this.cartItemsContainer.addEventListener('click', (e) => {
                const target = e.target;
                const index = parseInt(target.dataset.index);

                if (target.classList.contains('cart-item__remove')) {
                    this.removeFromCart(index);
                } else if (target.classList.contains('increase-quantity')) {
                    this.changeQuantity(index, 1);
                } else if (target.classList.contains('decrease-quantity')) {
                    this.changeQuantity(index, -1);
                }
            });
        }

        // Checkout button
        if (this.checkoutBtn) {
            this.checkoutBtn.addEventListener('click', () => {
                if (this.cart.length === 0) {
                    SharedUtils.showToast('No hay productos en el carrito.', this.toast);
                    return;
                }
                this.closeCart();
                if (this.checkoutModalOverlay) {
                    this.checkoutModalOverlay.classList.add('checkout-modal-overlay--open');
                }
            });
        }

        // Close checkout modal
        if (this.closeCheckoutModalBtn) {
            this.closeCheckoutModalBtn.addEventListener('click', () => {
                if (this.checkoutModalOverlay) {
                    this.checkoutModalOverlay.classList.remove('checkout-modal-overlay--open');
                }
            });
        }

        // Setup checkout form
        this.setupCheckoutForm();

        // Setup radio button change handlers
        this.setupShippingHandlers();
    }

    // Setup shipping radio handlers
    setupShippingHandlers() {
        const radioButtons = document.querySelectorAll('input[name="envio"]');
        const agenciaContainer = document.getElementById('agenciaEnvioContainer');
        
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'provincia' && agenciaContainer) {
                    agenciaContainer.style.display = 'block';
                } else if (agenciaContainer) {
                    agenciaContainer.style.display = 'none';
                }
            });
        });
    }

    // Setup checkout form
    setupCheckoutForm() {
        if (this.checkoutForm) {
            this.checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const nombre = document.getElementById('nombre').value.trim();
                const dni = document.getElementById('dni').value.trim();
                const celular = document.getElementById('celular').value.trim();
                const direccion = document.getElementById('direccion').value.trim();
                const metodoPago = document.getElementById('metodoPago').value;
                const envioRadio = document.querySelector('input[name="envio"]:checked');
                const agenciaEnvio = document.getElementById('agenciaEnvio').value;

                // Validaciones
                if (!nombre || !dni || !celular || !direccion || !metodoPago || !envioRadio) {
                    alert('Por favor, completa todos los campos obligatorios.');
                    return;
                }

                if (envioRadio.value === 'provincia' && !agenciaEnvio) {
                    alert('Por favor, selecciona una agencia de envío para provincia.');
                    return;
                }

                // Construir mensaje de WhatsApp
                let message = `Hola, quiero realizar una compra.%0A%0A*Productos:*%0A`;
                this.cart.forEach(item => {
                    message += `- ${item.name} (x${item.quantity}) por S/${Number(item.price * item.quantity).toFixed(2)}%0A`;
                });

                const total = CartUtils.calculateTotal(this.cart);
                message += `%0A*Total: S/${total.toFixed(2)}*%0A%0A`;
                message += `*Datos del Cliente:*%0A`;
                message += `Nombre: ${nombre}%0A`;
                message += `DNI: ${dni}%0A`;
                message += `Celular: ${celular}%0A`;
                message += `Dirección: ${direccion}%0A`;
                message += `Método de Pago: ${metodoPago}%0A`;
                message += `Envío: ${envioRadio.value === 'contraentrega' ? 'Contra Entrega (Lima)' : 'Provincia'}`;
                
                if (envioRadio.value === 'provincia' && agenciaEnvio) {
                    message += `%0AAgencia: ${agenciaEnvio}`;
                }

                // Abrir WhatsApp
                window.open(`https://wa.me/51931292396?text=${message}`, '_blank');

                // Limpiar carrito
                this.cart = [];
                this.updateCartDOM();

                // Cerrar modales
                if (this.checkoutModalOverlay) {
                    this.checkoutModalOverlay.classList.remove('checkout-modal-overlay--open');
                }

                SharedUtils.showToast('¡Compra finalizada! Redirigiendo a WhatsApp...', this.toast);
            });
        }
    }

    // Get cart data
    getCart() {
        return this.cart;
    }
}
