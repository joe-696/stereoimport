import { CartManager } from './cart.js';
import { ImageManager } from './imageManager.js';
import { firebaseService } from '../../shared/firebaseService.js';
import { ProductManager } from './productManager.js';
import { CheckoutManager } from './checkout.js';
import { SidebarManager } from './sidebar.js';
import { SharedUtils } from '../../shared/utils.js';

// Clase principal de la aplicación
class ShowApp {
    constructor() {
        this.firebaseService = firebaseService;
        this.cartManager = new CartManager();
        this.imageManager = new ImageManager();
        this.sidebarManager = new SidebarManager();
        this.productManager = new ProductManager(this.firebaseService, this.imageManager, this.cartManager);
        this.checkoutManager = new CheckoutManager(this.cartManager);
        
        this.init();
    }

    init() {
        this.setupLinkTargets();
        
        // Cargar producto cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', () => {
            const productId = SharedUtils.getUrlParam('id');
            this.productManager.loadProduct(productId);
        });
    }

    setupLinkTargets() {
        // Asegurar que todos los enlaces abran en la ventana principal
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('a[href]').forEach(link => {
                if (!link.hasAttribute('target')) {
                    link.setAttribute('target', '_top');
                }
            });
            
            // Capturar formularios para que también se envíen en la ventana principal
            document.querySelectorAll('form').forEach(form => {
                if (!form.hasAttribute('target')) {
                    form.setAttribute('target', '_top');
                }
            });
        });
    }
}

// Inicializar la aplicación
export default ShowApp;
