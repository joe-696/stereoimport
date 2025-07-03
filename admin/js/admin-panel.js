// Panel de Administración Principal - Stereo Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC7z-xRMGHbwg1w_zXFGvO8Dn_nOJoaQBY",
    authDomain: "stereo-import.firebaseapp.com",
    projectId: "stereo-import",
    storageBucket: "stereo-import.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.selectedProducts = new Set();
        this.editingProduct = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthState();
    }

    bindEvents() {
        // Auth events
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Product form
        document.getElementById('productForm').addEventListener('submit', (e) => this.handleProductSubmit(e));
        
        // Search and filters
        document.getElementById('searchProducts').addEventListener('input', (e) => this.filterProducts());
        document.getElementById('filterCategory').addEventListener('change', (e) => this.filterProducts());
        
        // Select all checkbox
        document.getElementById('selectAll').addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        
        // Image upload
        document.getElementById('imageUploadArea').addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });
        document.getElementById('imageInput').addEventListener('change', (e) => this.handleImageUpload(e));
        
        // CSV upload
        document.getElementById('csvUploadArea').addEventListener('click', () => {
            document.getElementById('csvInput').click();
        });
        document.getElementById('csvInput').addEventListener('change', (e) => this.handleCSVUpload(e));
        
        // Drag and drop for images
        this.setupDragAndDrop();
    }

    // Authentication
    checkAuthState() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = user;
                this.showAdminPanel();
                this.loadDashboardData();
            } else {
                this.showAuthContainer();
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            this.showLoading();
            await signInWithEmailAndPassword(auth, email, password);
            this.showToast('Inicio de sesión exitoso', 'success');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            this.showToast('Error al iniciar sesión: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleLogout() {
        try {
            await signOut(auth);
            this.showToast('Sesión cerrada', 'success');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            this.showToast('Error al cerrar sesión', 'error');
        }
    }

    showAuthContainer() {
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }

    showAdminPanel() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('userEmail').textContent = this.currentUser.email;
    }

    // Tab Navigation
    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        
        // Load tab-specific data
        switch (tabName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'add-product':
                this.resetProductForm();
                break;
        }
    }

    // Dashboard
    async loadDashboardData() {
        try {
            this.showLoading();
            const products = await this.fetchProducts();
            
            // Calculate stats
            const totalProducts = products.length;
            const categories = [...new Set(products.map(p => p.category))];
            const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
            const lowStock = products.filter(p => (p.stock || 0) < 5).length;
            
            // Update dashboard stats
            document.getElementById('totalProducts').textContent = totalProducts;
            document.getElementById('totalCategories').textContent = categories.length;
            document.getElementById('totalStock').textContent = totalStock;
            document.getElementById('lowStock').textContent = lowStock;
            
            // Load recent activity
            this.loadRecentActivity();
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showToast('Error al cargar el dashboard', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadRecentActivity() {
        try {
            const activityList = document.getElementById('recentActivity');
            activityList.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-plus-circle"></i>
                    <span>Producto agregado: Parlante Bluetooth</span>
                    <small>Hace 2 horas</small>
                </div>
                <div class="activity-item">
                    <i class="fas fa-edit"></i>
                    <span>Producto actualizado: Audífonos Sony</span>
                    <small>Hace 4 horas</small>
                </div>
                <div class="activity-item">
                    <i class="fas fa-trash"></i>
                    <span>Producto eliminado: Altavoz dañado</span>
                    <small>Ayer</small>
                </div>
            `;
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    // Products Management
    async fetchProducts() {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const products = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                products.push({...data, id: docSnap.id});
            });
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async loadProducts() {
        try {
            this.showLoading();
            this.products = await this.fetchProducts();
            this.filteredProducts = [...this.products];
            this.renderProducts();
            this.updateCategoryFilter();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showToast('Error al cargar productos', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderProducts() {
        const tbody = document.getElementById('productsTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);
        
        tbody.innerHTML = '';
        
        pageProducts.forEach(product => {
            const row = this.createProductRow(product);
            tbody.appendChild(row);
        });
        
        this.renderPagination();
        this.updateBulkActions();
    }

    createProductRow(product) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="product-checkbox" data-id="${product.id}">
            </td>
            <td>
                <div class="product-image">
                    <img src="${product.image1 || 'placeholder.svg'}" alt="${product.title}" 
                         onerror="this.src='placeholder.svg'">
                </div>
            </td>
            <td>
                <div class="product-info">
                    <h4>${product.title}</h4>
                    <p>${product.brand || ''}</p>
                    <small>${product.sagitario || ''}</small>
                </div>
            </td>
            <td>
                <span class="category-badge">${product.category}</span>
            </td>
            <td>
                <div class="price-info">
                    <span class="current-price">S/ ${product.price}</span>
                    ${product.promotionalPrice ? `<span class="promo-price">S/ ${product.promotionalPrice}</span>` : ''}
                </div>
            </td>
            <td>
                <span class="stock-badge ${(product.stock || 0) < 5 ? 'low' : ''}">${product.stock || 0}</span>
            </td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${product.active !== false ? 'checked' : ''} 
                           onchange="adminPanel.toggleProductStatus('${product.id}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="adminPanel.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Add checkbox event
        row.querySelector('.product-checkbox').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedProducts.add(product.id);
            } else {
                this.selectedProducts.delete(product.id);
            }
            this.updateBulkActions();
        });
        
        return row;
    }

    filterProducts() {
        const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
        const categoryFilter = document.getElementById('filterCategory').value;
        
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = !searchTerm || 
                product.title.toLowerCase().includes(searchTerm) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
                (product.sagitario && product.sagitario.toLowerCase().includes(searchTerm));
            
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });
        
        this.currentPage = 1;
        this.renderProducts();
    }

    updateCategoryFilter() {
        const select = document.getElementById('filterCategory');
        const categories = [...new Set(this.products.map(p => p.category))];
        
        // Clear existing options except "All"
        select.innerHTML = '<option value="">Todas las categorías</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        html += `<button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="adminPanel.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                 </button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="adminPanel.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += `<span class="pagination-dots">...</span>`;
            }
        }
        
        // Next button
        html += `<button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="adminPanel.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                 </button>`;
        
        pagination.innerHTML = html;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderProducts();
        }
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.product-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const productId = checkbox.dataset.id;
            if (checked) {
                this.selectedProducts.add(productId);
            } else {
                this.selectedProducts.delete(productId);
            }
        });
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        if (this.selectedProducts.size > 0) {
            bulkActions.style.display = 'flex';
        } else {
            bulkActions.style.display = 'none';
        }
    }

    // Product CRUD Operations
    async handleProductSubmit(e) {
        e.preventDefault();
        
        try {
            this.showLoading();
            
            const formData = this.getProductFormData();
            
            if (this.editingProduct) {
                await this.updateProduct(this.editingProduct, formData);
                this.showToast('Producto actualizado exitosamente', 'success');
            } else {
                await this.addProduct(formData);
                this.showToast('Producto agregado exitosamente', 'success');
            }
            
            this.resetProductForm();
            this.loadProducts();
            
        } catch (error) {
            console.error('Error saving product:', error);
            this.showToast('Error al guardar producto: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    getProductFormData() {
        return {
            title: document.getElementById('productTitle').value,
            brand: document.getElementById('productBrand').value,
            description: document.getElementById('productDescription').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            promotionalPrice: parseFloat(document.getElementById('productPromoPrice').value) || null,
            stock: parseInt(document.getElementById('productStock').value) || 0,
            sagitario: document.getElementById('productTitle').value + ' - ' + document.getElementById('productBrand').value,
            active: true
        };
    }

    async addProduct(productData) {
        // Upload images first
        const imageUrls = await this.uploadProductImages();
        
        // Add image URLs to product data
        imageUrls.forEach((url, index) => {
            productData[`image${index + 1}`] = url;
        });
        
        await addDoc(collection(db, "products"), productData);
    }

    async updateProduct(productId, productData) {
        // Upload new images if any
        const imageUrls = await this.uploadProductImages();
        
        // Add new image URLs to product data
        imageUrls.forEach((url, index) => {
            productData[`image${index + 1}`] = url;
        });
        
        await updateDoc(doc(db, "products", productId), productData);
    }

    async deleteProduct(productId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            return;
        }
        
        try {
            this.showLoading();
            await deleteDoc(doc(db, "products", productId));
            this.showToast('Producto eliminado exitosamente', 'success');
            this.loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showToast('Error al eliminar producto', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async toggleProductStatus(productId, active) {
        try {
            await updateDoc(doc(db, "products", productId), { active });
            this.showToast(`Producto ${active ? 'activado' : 'desactivado'}`, 'success');
        } catch (error) {
            console.error('Error updating product status:', error);
            this.showToast('Error al actualizar estado del producto', 'error');
        }
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        this.editingProduct = productId;
        this.populateProductForm(product);
        this.switchTab('add-product');
        
        // Update form title
        document.getElementById('formTitle').textContent = 'Editar Producto';
        document.getElementById('submitButtonText').textContent = 'Actualizar Producto';
    }

    populateProductForm(product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productTitle').value = product.title || '';
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productPromoPrice').value = product.promotionalPrice || '';
        document.getElementById('productStock').value = product.stock || 0;
        
        // Load existing images
        this.loadExistingImages(product);
    }

    loadExistingImages(product) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';
        
        for (let i = 1; i <= 5; i++) {
            const imageUrl = product[`image${i}`];
            if (imageUrl) {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'image-item';
                imageDiv.innerHTML = `
                    <img src="${imageUrl}" alt="Imagen ${i}">
                    <button type="button" class="remove-image" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                preview.appendChild(imageDiv);
            }
        }
    }

    resetProductForm() {
        this.editingProduct = null;
        document.getElementById('productForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('formTitle').textContent = 'Agregar Nuevo Producto';
        document.getElementById('submitButtonText').textContent = 'Guardar Producto';
    }

    // Image Upload
    async uploadProductImages() {
        const imageInput = document.getElementById('imageInput');
        const files = Array.from(imageInput.files);
        const uploadPromises = [];
        
        files.forEach((file, index) => {
            const imageRef = ref(storage, `products/${Date.now()}_${index}_${file.name}`);
            uploadPromises.push(
                uploadBytes(imageRef, file).then(() => getDownloadURL(imageRef))
            );
        });
        
        try {
            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Error uploading images:', error);
            throw new Error('Error al subir imágenes');
        }
    }

    handleImageUpload(e) {
        const files = Array.from(e.target.files);
        const preview = document.getElementById('imagePreview');
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageDiv = document.createElement('div');
                    imageDiv.className = 'image-item';
                    imageDiv.innerHTML = `
                        <img src="${e.target.result}" alt="Vista previa">
                        <button type="button" class="remove-image" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    preview.appendChild(imageDiv);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('imageUploadArea');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('drag-over'), false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            document.getElementById('imageInput').files = files;
            this.handleImageUpload({target: {files}});
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Bulk Operations
    async bulkDelete() {
        if (this.selectedProducts.size === 0) return;
        
        if (!confirm(`¿Estás seguro de que deseas eliminar ${this.selectedProducts.size} productos?`)) {
            return;
        }
        
        try {
            this.showLoading();
            const deletePromises = Array.from(this.selectedProducts).map(id => 
                deleteDoc(doc(db, "products", id))
            );
            
            await Promise.all(deletePromises);
            this.selectedProducts.clear();
            this.showToast('Productos eliminados exitosamente', 'success');
            this.loadProducts();
        } catch (error) {
            console.error('Error in bulk delete:', error);
            this.showToast('Error al eliminar productos', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async bulkToggleStatus() {
        if (this.selectedProducts.size === 0) return;
        
        try {
            this.showLoading();
            const updatePromises = Array.from(this.selectedProducts).map(id => {
                const product = this.products.find(p => p.id === id);
                const newStatus = !product.active;
                return updateDoc(doc(db, "products", id), { active: newStatus });
            });
            
            await Promise.all(updatePromises);
            this.selectedProducts.clear();
            this.showToast('Estado de productos actualizado', 'success');
            this.loadProducts();
        } catch (error) {
            console.error('Error in bulk status toggle:', error);
            this.showToast('Error al actualizar productos', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // CSV Upload
    handleCSVUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        this.processCSVFile(file);
    }

    async processCSVFile(file) {
        try {
            this.showLoading();
            const text = await file.text();
            const rows = text.split('\n').map(row => row.split(','));
            const headers = rows[0];
            const dataRows = rows.slice(1);
            
            const products = dataRows.map(row => {
                const product = {};
                headers.forEach((header, index) => {
                    product[header.trim()] = row[index]?.trim();
                });
                return product;
            }).filter(product => product.title); // Filter empty rows
            
            await this.bulkAddProducts(products);
            
        } catch (error) {
            console.error('Error processing CSV:', error);
            this.showToast('Error al procesar archivo CSV', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async bulkAddProducts(products) {
        let successCount = 0;
        let errorCount = 0;
        
        for (const productData of products) {
            try {
                await addDoc(collection(db, "products"), {
                    ...productData,
                    price: parseFloat(productData.price) || 0,
                    stock: parseInt(productData.stock) || 0,
                    active: true
                });
                successCount++;
            } catch (error) {
                console.error('Error adding product:', error);
                errorCount++;
            }
        }
        
        document.getElementById('successCount').textContent = successCount;
        document.getElementById('errorCount').textContent = errorCount;
        document.getElementById('uploadResults').style.display = 'block';
        
        this.showToast(`${successCount} productos agregados, ${errorCount} errores`, 'info');
        this.loadProducts();
    }

    downloadTemplate() {
        const csvContent = 'title,brand,description,category,price,promotionalPrice,stock\n' +
                          'Parlante Bluetooth,Sony,Parlante inalámbrico con excelente calidad,Parlantes,299.90,249.90,10\n' +
                          'Audífonos Gaming,Logitech,Audífonos para gaming con micrófono,Audífonos,159.90,,5';
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_productos.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Modal functions for onclick handlers
    closeEditModal() {
        document.getElementById('editProductModal').classList.remove('show');
    }

    closeDeleteModal() {
        document.getElementById('confirmDeleteModal').classList.remove('show');
    }

    // Utility Functions
    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="toast-progress"></div>
        `;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
        
        // Add animation
        setTimeout(() => toast.classList.add('show'), 100);
    }
}

// Global functions for onclick handlers
window.refreshProducts = () => window.adminPanel.loadProducts();
window.adminPanel = new AdminPanel();

// Export for potential module use
export default AdminPanel;
