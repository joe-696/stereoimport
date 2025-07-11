import { Utils } from './utils.js';
import { CART_CONFIG, CartUtils, CartSync } from '../../shared/cartConfig.js';
import { CartAnimations } from '../../js/cartAnimations.js';

// Cart Management Class
export class CartManager {
    constructor() {
        // Usar configuración compartida
        this.cart = CartSync.loadCart();
        this.cartItemsContainer = document.getElementById('cartItems');
        this.cartCount = document.getElementById('cartCount');
        this.cartTotal = document.getElementById('cartTotal');
        this.toast = document.getElementById('toast');
        
        // Inicializar animaciones
        this.animations = new CartAnimations();
        
        this.initializeElements();
    }

    initializeElements() {
        this.cartModal = document.getElementById('cartModal');
        this.cartModalOverlay = document.getElementById('cartModalOverlay');
        this.cartButton = document.getElementById('cartButton');
        this.closeCartBtn = document.getElementById('closeCartBtn');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        
        // Sincronización entre pestañas/páginas
        this.setupStorageSync();
    }    // Configurar sincronización de localStorage entre páginas
    setupStorageSync() {
        CartSync.setupSyncListener((newCart) => {
            this.cart = newCart;
            this.updateCartDisplay(); // Usar método que no guarda
            this.updateCartTotal();
            if (this.cartCount) {
                this.cartCount.textContent = CartUtils.getTotalItems(this.cart);
            }
        });
    }// Save cart to localStorage and update UI
    saveCartToLocalStorage() {
        CartSync.saveCart(this.cart);
        if (this.cartCount) {
            this.cartCount.textContent = CartUtils.getTotalItems(this.cart);
        }
        this.updateCartTotal();
    }    // Update cart total
    updateCartTotal() {
        const total = CartUtils.calculateTotal(this.cart);
        if (this.cartTotal) {
            this.cartTotal.textContent = total.toFixed(2);
        }
    }    // Update cart DOM without saving
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
    }    // Add item to cart
    addToCart(name, price, image, sourceElement = null) {
        console.log('🛒 Adding to cart:', { name, price, image }); // Debug log
        
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
        
        // Activar animaciones si se proporciona el elemento fuente
        if (sourceElement) {
            const cartButton = this.cartButton || document.querySelector('[id*="cart"]');
            this.animations.animateAddToCart(sourceElement, name, image, cartButton);
        } else {
            // Fallback: solo mostrar notificación
            this.animations.showCartNotification(name, image);
        }
    }

    // Remove item from cart
    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateCartDOM();
        Utils.showToast("Producto removido del carrito!", this.toast);
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
    }    // Toggle cart modal
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

    // Clear cart
    clearCart() {
        this.cart = [];
        this.updateCartDOM();
    }

    // Get cart data
    getCart() {
        return this.cart;
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
                // Only close if click is directly on the overlay, not inside the modal
                if (e.target === this.cartModalOverlay) {
                    this.closeCart();
                }
            });
        }

        // Add to cart buttons (Event delegation for dynamically created buttons)
        // Note: Primary handling is now in ProductManager for better coordination
        document.addEventListener('click', (e) => {
            if (e.target.closest('.product__add-to-cart')) {
                const button = e.target.closest('.product__add-to-cart');
                const productSection = button.closest('#productsSection');
                
                // Only handle if not in products section (ProductManager handles those)
                if (!productSection) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const name = button.getAttribute('data-name');
                    const price = parseFloat(button.getAttribute('data-price'));
                    const image = button.getAttribute('data-image');
                    
                    console.log('🛒 CartManager - Add to cart clicked (fallback):', { name, price, image });
                    
                    if (name && !isNaN(price)) {
                        // Buscar el elemento del producto más cercano
                        const productElement = button.closest('.product, .product-card, .item') || button.parentElement;
                        this.addToCart(name, price, image, productElement);
                    } else {
                        console.error('❌ Invalid product data:', { name, price, image });
                    }
                }
            }
        });

        // Cart items interactions
        if (this.cartItemsContainer) {
            this.cartItemsContainer.addEventListener('click', (e) => {
                const target = e.target;
                const index = parseInt(target.dataset.index);                if (target.classList.contains('cart-item__remove')) {
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
                    Utils.showToast('No hay productos en el carrito.', this.toast);
                    return;
                }
                this.closeCart();                const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
                if (checkoutModalOverlay) {
                    checkoutModalOverlay.classList.add('checkout-modal-overlay--open');
                }
            });
        }
    }
}
