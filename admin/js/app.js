// Aplicación principal
import { firebaseConfig } from './config.js';
import { AuthManager } from './authManager.js';
import { ProductManager } from './productManager.js';
import { UIManager } from './uiManager.js';
import { Utils } from './utils.js';

class AdminApp {
    constructor() {
        this.initializeFirebase();
        this.authManager = new AuthManager(this.auth);
        this.productManager = new ProductManager(this.db);
        this.uiManager = new UIManager();
    }

    // Inicializar Firebase
    async initializeFirebase() {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js");
        const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js");
        const { getFirestore } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
        const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js");

        this.app = initializeApp(firebaseConfig);
        this.analytics = getAnalytics(this.app);
        this.db = getFirestore(this.app);
        this.auth = getAuth(this.app);
    }

    // Inicializar aplicación
    async initialize() {
        await this.initializeFirebase();
        
        // Actualizar referencias después de inicializar Firebase
        this.authManager = new AuthManager(this.auth);
        this.productManager = new ProductManager(this.db);
        
        // Configurar callbacks del UI
        this.uiManager.setCallbacks({
            onAddProduct: () => this.handleAddProduct(),
            onEditProduct: (id) => this.handleEditProduct(id),
            onDeleteProduct: (id) => this.handleDeleteProduct(id),
            onSaveEdit: (id, imagesToRemove) => this.handleSaveEdit(id, imagesToRemove)
        });

        // Configurar eventos iniciales
        this.uiManager.setupInitialEvents();
        this.uiManager.setupMainEvents();

        // Verificar autenticación
        await this.authManager.initializeAuth(async (user) => {
            await this.loadAndDisplayProducts();
        });
    }

    // Manejar agregar producto
    async handleAddProduct() {
        try {
            const formData = this.uiManager.getFormData();
            
            await this.productManager.addProduct(formData, this.uiManager.imageUploadsContainer);
            
            this.uiManager.clearMainForm();
            await this.loadAndDisplayProducts();
            
        } catch (error) {
            this.uiManager.showFormError(error.message);
        }
    }

    // Manejar editar producto
    async handleEditProduct(id) {
        const product = this.productManager.getProductById(id);
        if (product) {
            this.uiManager.openEditModal(product);
        }
    }

    // Manejar eliminar producto
    async handleDeleteProduct(id) {
        try {
            await this.productManager.deleteProduct(id);
            await this.loadAndDisplayProducts();
        } catch (error) {
            // Error ya manejado en productManager
        }
    }

    // Manejar guardar edición
    async handleSaveEdit(id, imagesToRemove) {
        if (!id) return;
        
        try {
            const formData = this.uiManager.getEditFormData();
            
            await this.productManager.updateProduct(
                id, 
                formData, 
                imagesToRemove, 
                this.uiManager.editImageUploadsContainer
            );
            
            this.uiManager.closeEditModal();
            await this.loadAndDisplayProducts();
            
        } catch (error) {
            Utils.showToast("Error al actualizar el producto: " + error.message, true);
        }
    }

    // Cargar y mostrar productos
    async loadAndDisplayProducts() {
        const products = await this.productManager.loadProducts();
        this.uiManager.renderProductTable(products);
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    const app = new AdminApp();
    await app.initialize();
});
