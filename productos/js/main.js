import { firebaseConfig, WHATSAPP_NUMBER, APP_CONFIG } from './config.js';
import { Utils } from './utils.js';
import { CartManager } from './cart.js';
import { ProductManager } from './products.js';
import { firebaseService } from '../../shared/firebaseService.js';

// Main Application Class
class StereoImportApp {
    constructor() {
        this.cartManager = null;
        this.productManager = null;
        this.db = null;
        this.initializeApp();
    }

    async initializeApp() {
        try {
            console.log('🚀 Initializing Stereo Import App...');
            
            // Initialize Firebase using shared service
            await firebaseService.initialize();
            this.db = firebaseService.db;
            
            // Initialize managers
            this.initializeManagers();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Initialize UI
            this.initializeUI();
            
            console.log('✅ App initialized successfully!');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Error al cargar la aplicación');
        }
    }

    initializeManagers() {
        this.cartManager = new CartManager();
        this.productManager = new ProductManager();
    }

    async loadInitialData() {
        try {
            await this.productManager.loadProducts();
            this.cartManager.updateCartDOM();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Error al cargar productos');
        }
    }

    showError(message) {
        const productsSection = document.getElementById('productsSection');
        if (productsSection) {
            productsSection.innerHTML = `
                <div class="error-message">
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }    initializeUI() {
        // Set target _top for links and forms
        Utils.setTargetTop();
        
        // Initialize banner image rotation
        this.initializeBannerRotation();
        
        // Initialize scroll reveal
        Utils.revealOnScroll();
    }

    initializeBannerRotation() {
        const bannerImages = document.querySelectorAll('.banner__image-container img');
        if (bannerImages.length > 0) {
            let currentImageIndex = 0;
            bannerImages[0].classList.add('banner__image--active');
            
            setInterval(() => {
                bannerImages[currentImageIndex].classList.remove('banner__image--active');
                currentImageIndex = (currentImageIndex + 1) % bannerImages.length;
                bannerImages[currentImageIndex].classList.add('banner__image--active');
            }, 5000);
        }
    }    setupEventListeners() {
        // Setup product manager event listeners
        if (this.productManager) {
            this.productManager.setupEventListeners();
        }

        // Setup cart manager event listeners
        if (this.cartManager) {
            this.cartManager.setupEventListeners();
        }        // Handle scroll reveal
        window.addEventListener('scroll', () => Utils.revealOnScroll());
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StereoImportApp();
});
