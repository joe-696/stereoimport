// Configuración compartida del carrito para sincronización entre páginas
export const CART_CONFIG = {
    STORAGE_KEY: 'stereo-import-cart',
    
    createCartItem: (name, price, image, quantity = 1) => ({
        id: Date.now() + Math.random(),
        name: String(name).trim(),
        price: Number(price),
        image: String(image),
        quantity: Number(quantity),
        addedAt: new Date().toISOString()
    }),
    
    EVENTS: {
        CART_UPDATED: 'stereoImportCartUpdated'
    }
};

// Utilidades del carrito optimizadas
export const CartUtils = {
    calculateTotal: (cart) => cart.reduce((total, item) => total + (item.price * item.quantity), 0),
    getTotalItems: (cart) => cart.reduce((total, item) => total + item.quantity, 0),
    findItemByName: (cart, name) => cart.find(item => item.name === name),
    validateCartItem: (item) => item?.name?.length > 0 && item?.price >= 0 && item?.quantity > 0
};

// Clase simplificada para sincronización del carrito
export class CartSync {
    static saveCart(cart) {
        try {
            localStorage.setItem(CART_CONFIG.STORAGE_KEY, JSON.stringify(cart));
            window.dispatchEvent(new CustomEvent(CART_CONFIG.EVENTS.CART_UPDATED, {
                detail: { cart, timestamp: Date.now() }
            }));
            return true;
        } catch (error) {
            console.error('Error saving cart:', error);
            return false;
        }
    }
    
    static loadCart() {
        try {
            const cartData = localStorage.getItem(CART_CONFIG.STORAGE_KEY);
            return cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }
    
    static setupSyncListener(callback) {
        // Sincronización entre pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === CART_CONFIG.STORAGE_KEY && e.newValue) {
                callback(JSON.parse(e.newValue));
            }
        });
        
        // Sincronización en la misma página
        window.addEventListener(CART_CONFIG.EVENTS.CART_UPDATED, (e) => {
            if (e.detail?.cart) callback(e.detail.cart);
        });
    }
}
