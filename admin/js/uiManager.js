// Gestor de interfaz de usuario
import { Utils } from './utils.js';
import { ImageManager } from './imageManager.js';

export class UIManager {
    constructor() {
        this.imageManager = new ImageManager();
        this.currentEditId = null;
        this.imagesToRemove = [];
        this.initializeElements();
    }

    // Inicializar elementos del DOM
    initializeElements() {
        // Elementos del formulario principal
        this.productForm = {
            sagitario: document.getElementById('productSagitario'),
            title: document.getElementById('productTitle'),
            description: document.getElementById('productDescripcion'),
            price: document.getElementById('productPrecio'),
            promotionalPrice: document.getElementById('productPromocionalPrecio'),
            category: document.getElementById('productCategoria')
        };

        this.imageUploadsContainer = document.getElementById('imageUploadsContainer');
        this.addImageBtn = document.getElementById('addImageBtn');
        this.addProductBtn = document.getElementById('addProductBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.productTableBody = document.querySelector('#productTable tbody');

        // Elementos del modal de edición
        this.editModal = document.getElementById('editModal');
        this.editForm = {
            sagitario: document.getElementById('editSagitario'),
            title: document.getElementById('editTitle'),
            description: document.getElementById('editDescripcion'),
            price: document.getElementById('editPrecio'),
            promotionalPrice: document.getElementById('editPromocionalPrecio'),
            category: document.getElementById('editCategoria')
        };

        this.editImageUploadsContainer = document.getElementById('editImageUploadsContainer');
        this.currentImagesContainer = document.getElementById('currentImagesContainer');
        this.addEditImageBtn = document.getElementById('addEditImageBtn');
        this.saveChangesBtn = document.getElementById('saveChangesBtn');
        this.closeEditModalBtn = document.getElementById('closeEditModalBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');

        // Modal de imagen ampliada
        this.imageModal = document.getElementById('imageModal');
        this.enlargedImage = document.getElementById('enlargedImage');
        this.closeImageModal = document.getElementById('closeImageModal');
    }

    // Configurar eventos iniciales
    setupInitialEvents() {
        // Configurar cargador de imágenes principal
        this.setupImageUploader();
        
        // Configurar cargador de imágenes de edición
        this.setupEditImageUploader();
        
        // Configurar eventos del modal
        this.setupModalEvents();
        
        // Botón de ver productos
        const viewProductsBtn = document.getElementById('viewProductsBtn');
        viewProductsBtn?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Configurar cargador de imágenes principal
    setupImageUploader() {
        this.imageUploadsContainer.innerHTML = '';
        this.imageManager.addImageInput(this.imageUploadsContainer);
        
        this.addImageBtn.addEventListener('click', () => {
            const totalInputs = this.imageUploadsContainer.querySelectorAll('.image-item').length;
            if (totalInputs < this.imageManager.maxImages) {
                this.imageManager.addImageInput(this.imageUploadsContainer);
            } else {
                Utils.showToast(`Máximo ${this.imageManager.maxImages} imágenes permitidas`, true);
            }
        });
    }

    // Configurar cargador de imágenes de edición
    setupEditImageUploader() {
        this.addEditImageBtn.addEventListener('click', () => {
            const totalInputs = this.editImageUploadsContainer.querySelectorAll('.image-item').length;
            const totalCurrentImages = this.currentImagesContainer.querySelectorAll('img').length;
            
            if (totalInputs + totalCurrentImages < this.imageManager.maxImages) {
                this.imageManager.addImageInput(this.editImageUploadsContainer);
            } else {
                Utils.showToast(`Máximo ${this.imageManager.maxImages} imágenes permitidas`, true);
            }
        });
    }

    // Configurar eventos del modal
    setupModalEvents() {
        this.closeEditModalBtn.addEventListener('click', () => this.closeEditModal());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        
        this.closeImageModal.addEventListener('click', () => {
            this.imageModal.classList.remove('open');
        });
    }

    // Renderizar tabla de productos
    renderProductTable(products) {
        this.productTableBody.innerHTML = '';
        
        if (products.length === 0) {
            this.productTableBody.innerHTML = "<tr><td colspan='8' style='text-align:center;'>No hay productos disponibles.</td></tr>";
            return;
        }
        
        products.forEach(prod => {
            const tr = document.createElement('tr');
            
            const sagitario = prod.sagitario || '<em>Sin marca</em>';
            const title = prod.title || '<em>Sin título</em>';
            const description = Utils.formatDescription(prod.description);
            const price = Utils.formatPrice(prod.price);
            const promotionalPrice = Utils.formatPrice(prod.promotionalPrice);
            const category = prod.category || '<em>Sin categoría</em>';
            
            // Crear galería de imágenes
            const imageUrls = this.imageManager.getProductImageUrls(prod);
            let imageGallery = '<div class="image-gallery">';
            
            if (imageUrls.length > 0) {
                imageUrls.forEach(url => {
                    imageGallery += `<img src="${url}" alt="Imagen del producto" data-full-url="${url}" class="product-image">`;
                });
            } else {
                imageGallery += '<em>Sin imágenes</em>';
            }
            
            imageGallery += '</div>';
            
            tr.innerHTML = `
                <td>${sagitario}</td>
                <td>${title}</td>
                <td style="white-space:pre-wrap;">${description}</td>
                <td>${price}</td>
                <td>${promotionalPrice}</td>
                <td>${category}</td>
                <td>${imageGallery}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${prod.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-btn" data-id="${prod.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                </td>
            `;
            
            this.productTableBody.appendChild(tr);
        });

        // Configurar eventos de la tabla
        this.setupTableEvents();
    }

    // Configurar eventos de la tabla
    setupTableEvents() {
        // Eventos de editar y eliminar
        this.productTableBody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                if (this.onEditProduct) {
                    this.onEditProduct(id);
                }
            });
        });

        this.productTableBody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (this.onDeleteProduct) {
                    this.onDeleteProduct(id);
                }
            });
        });
        
        // Eventos de ampliar imagen
        this.productTableBody.querySelectorAll('.product-image').forEach(img => {
            img.addEventListener('click', function() {
                const fullUrl = this.getAttribute('data-full-url');
                document.getElementById('enlargedImage').src = fullUrl;
                document.getElementById('imageModal').classList.add('open');
            });
        });
    }

    // Obtener datos del formulario principal
    getFormData() {
        return {
            sagitario: this.productForm.sagitario.value.trim(),
            title: this.productForm.title.value.trim(),
            description: this.productForm.description.value.trim(),
            price: parseFloat(this.productForm.price.value.trim()),
            promotionalPrice: parseFloat(this.productForm.promotionalPrice.value.trim()),
            category: this.productForm.category.value
        };
    }

    // Obtener datos del formulario de edición
    getEditFormData() {
        return {
            sagitario: this.editForm.sagitario.value.trim(),
            title: this.editForm.title.value.trim(),
            description: this.editForm.description.value.trim(),
            price: parseFloat(this.editForm.price.value.trim()),
            promotionalPrice: parseFloat(this.editForm.promotionalPrice.value.trim()),
            category: this.editForm.category.value.trim()
        };
    }

    // Limpiar formulario principal
    clearMainForm() {
        Utils.clearForm(Object.values(this.productForm));
        this.imageUploadsContainer.innerHTML = '';
        this.imageManager.addImageInput(this.imageUploadsContainer);
        this.errorMessage.style.display = 'none';
    }

    // Mostrar error en formulario
    showFormError(message) {
        this.errorMessage.style.display = 'block';
        this.errorMessage.textContent = message;
    }

    // Abrir modal de edición
    openEditModal(product) {
        this.currentEditId = product.id;
        
        // Llenar formulario
        this.editForm.sagitario.value = product.sagitario || '';
        this.editForm.title.value = product.title || '';
        this.editForm.description.value = product.description || '';
        this.editForm.price.value = product.price !== undefined ? product.price : '';
        this.editForm.promotionalPrice.value = product.promotionalPrice !== undefined ? product.promotionalPrice : '';
        this.editForm.category.value = product.category || '';

        // Resetear contenedores de imagen
        this.editImageUploadsContainer.innerHTML = '';
        this.currentImagesContainer.innerHTML = '';
        this.imagesToRemove = [];
        
        // Mostrar imágenes actuales
        this.displayCurrentImages(product);
        
        // Abrir modal
        this.editModal.classList.add('open');
    }

    // Mostrar imágenes actuales en modal de edición
    displayCurrentImages(product) {
        const imageUrls = this.imageManager.getProductImageUrls(product);
        
        imageUrls.forEach(url => {
            const imgEl = document.createElement('img');
            imgEl.src = url;
            imgEl.setAttribute('data-url', url);
            imgEl.title = "Clic para quitar esta imagen";
            
            imgEl.addEventListener('click', () => {
                // Encontrar la clave de la imagen
                let imageKey = null;
                for (let i = 1; i <= this.imageManager.maxImages; i++) {
                    const key = i === 1 ? 'image' : `image${i}`;
                    if (product[key] === url) {
                        imageKey = key;
                        break;
                    }
                }
                
                if (imageKey) {
                    this.imagesToRemove.push({key: imageKey, url});
                    imgEl.remove();
                    Utils.showToast('Imagen marcada para eliminación', false);
                }
            });
            
            this.currentImagesContainer.appendChild(imgEl);
        });
    }

    // Cerrar modal de edición
    closeEditModal() {
        this.editModal.classList.remove('open');
        this.currentEditId = null;
        this.imagesToRemove = [];
    }

    // Configurar callbacks
    setCallbacks(callbacks) {
        this.onAddProduct = callbacks.onAddProduct;
        this.onEditProduct = callbacks.onEditProduct;
        this.onDeleteProduct = callbacks.onDeleteProduct;
        this.onSaveEdit = callbacks.onSaveEdit;
    }

    // Configurar eventos de botones principales
    setupMainEvents() {
        this.addProductBtn.addEventListener('click', async () => {
            if (this.onAddProduct) {
                const originalText = this.addProductBtn.innerHTML;
                Utils.setButtonLoading(this.addProductBtn, true, originalText);
                
                try {
                    await this.onAddProduct();
                } finally {
                    Utils.setButtonLoading(this.addProductBtn, false, originalText);
                }
            }
        });

        this.saveChangesBtn.addEventListener('click', async () => {
            if (this.onSaveEdit) {
                const originalText = this.saveChangesBtn.innerHTML;
                Utils.setButtonLoading(this.saveChangesBtn, true, originalText);
                
                try {
                    await this.onSaveEdit(this.currentEditId, this.imagesToRemove);
                } finally {
                    Utils.setButtonLoading(this.saveChangesBtn, false, originalText);
                }
            }
        });
    }
}
