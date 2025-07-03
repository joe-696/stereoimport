import { SharedUtils } from '../../shared/utils.js';
import { CART_CONFIG, CartUtils, CartSync } from '../../shared/cartConfig.js';

// Gestión del carrito de compras
export class CartManager {
    constructor() {
        // Usar configuración compartida
        this.cart = CartSync.loadCart();
        this.elements = {
            cartBtn: document.getElementById('cartBtn'),
            cartCount: document.getElementById('cartCount'),
            cartModal: document.getElementById('cartModal'),
            cartItems: document.getElementById('cartItems'),
            cartTotal: document.getElementById('cartTotal'),
            checkoutBtn: document.getElementById('checkoutBtn'),
            cartClose: document.getElementById('cartClose')
        };
        
        this.init();
    }

    init() {
        this.updateUI();
        this.bindEvents();
        this.setupStorageSync();
        // Hacer disponible globalmente para onclick handlers
        window.removeFromCart = (index) => this.removeItem(index);
    }

    // Configurar sincronización de localStorage entre páginas
    setupStorageSync() {
        CartSync.setupSyncListener((newCart) => {
            this.cart = newCart;
            this.updateUI();
        });
    }

    bindEvents() {
        if (this.elements.cartBtn) {
            this.elements.cartBtn.onclick = () => this.openModal();
        }
        
        if (this.elements.cartClose) {
            this.elements.cartClose.onclick = () => this.closeModal();
        }
        
        if (this.elements.checkoutBtn) {
            this.elements.checkoutBtn.onclick = () => this.proceedToCheckout();
        }

        // Cerrar modal al hacer click fuera
        if (this.elements.cartModal) {
            this.elements.cartModal.onclick = (e) => {
                if (e.target === this.elements.cartModal) {
                    this.closeModal();
                }
            };
        }
    }    addItem(name, price, image) {
        const existingItem = CartUtils.findItemByName(this.cart, name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            const newItem = CART_CONFIG.createCartItem(name, price, image);
            if (CartUtils.validateCartItem(newItem)) {
                this.cart.push(newItem);
            }
        }
        
        this.updateUI();
        this.render();
        SharedUtils.showToast('Producto agregado al carrito');
    }

    removeItem(index) {
        if (index >= 0 && index < this.cart.length) {
            this.cart.splice(index, 1);
            this.updateUI();
            this.render();
            SharedUtils.showToast('Producto eliminado');
        }
    }    updateUI() {        const totalItems = CartUtils.getTotalItems(this.cart);
        const totalPrice = CartUtils.calculateTotal(this.cart);
        
        if (this.elements.cartCount) {
            this.elements.cartCount.textContent = totalItems;
        }
        
        if (this.elements.cartTotal) {
            this.elements.cartTotal.textContent = SharedUtils.formatPrice(totalPrice);
        }
        
        CartSync.saveCart(this.cart);
    }

    render() {
        if (!this.elements.cartItems) return;
        
        if (this.cart.length === 0) {
            this.elements.cartItems.innerHTML = '<p>Tu carrito está vacío.</p>';
        } else {
            this.elements.cartItems.innerHTML = this.cart.map((item, index) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <p><strong>${item.name}</strong></p>
                        <p>S/${SharedUtils.formatPrice(item.price)} x${item.quantity || 1}</p>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${index})">×</button>
                </div>
            `).join('');
        }
    }

    openModal() {
        if (this.elements.cartModal) {
            this.elements.cartModal.classList.add('active');
            this.render();
        }
    }

    closeModal() {
        if (this.elements.cartModal) {
            this.elements.cartModal.classList.remove('active');
        }
    }

    proceedToCheckout() {
        if (this.cart.length === 0) {
            SharedUtils.showToast('El carrito está vacío');
            return;
        }
        
        this.closeModal();
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            checkoutModal.classList.add('active');
        }
    }

    getCart() {
        return this.cart;
    }

    clearCart() {
        this.cart = [];
        this.updateUI();
        this.render();
    }
}
