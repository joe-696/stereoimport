// Gestor de imágenes
import { APP_CONFIG } from './config.js';
import { Utils } from './utils.js';

export class ImageManager {
    constructor() {
        this.maxImages = APP_CONFIG.MAX_IMAGES;
        this.apiKey = APP_CONFIG.IMGBB_API_KEY;
    }

    // Comprimir imagen (mantiene original)
    async compressImage(file) {
        return new Promise((resolve) => {
            console.log(`Archivo original mantenido: ${file.name} - ${(file.size / 1024).toFixed(2)} KB`);
            resolve(file);
        });
    }

    // Subir imagen a ImgBB
    async uploadImage(file) {
        try {
            const compressedFile = await this.compressImage(file);
            
            const formData = new FormData();
            formData.append('image', compressedFile);

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${this.apiKey}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.data.url;
            } else {
                throw new Error("Error en la subida de la imagen: " + (data.error?.message || "Desconocido"));
            }
        } catch (error) {
            console.error('Error al procesar o subir la imagen:', error);
            Utils.showToast('Error al procesar o subir la imagen: ' + error.message, true);
            return null;
        }
    }

    // Agregar input de imagen
    addImageInput(container) {
        const totalInputs = container.querySelectorAll('.image-item').length;
        
        if (totalInputs >= this.maxImages) {
            Utils.showToast(`Máximo ${this.maxImages} imágenes permitidas`, true);
            return;
        }
        
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        
        const inputId = `imgFile${totalInputs + 1}`;
        
        imageItem.innerHTML = `
            <div class="form-group imgbb-upload">
                <label for="${inputId}"><i class="fas fa-file-image"></i> Imagen ${totalInputs + 1}:</label>
                <input type="file" id="${inputId}" class="image-input" accept="image/*">
                <div class="upload-preview"></div>
            </div>
            <button type="button" class="remove-image">&times;</button>
        `;
        
        container.appendChild(imageItem);
        
        // Configurar vista previa
        this.setupImagePreview(imageItem);
        
        // Configurar botón de eliminar
        this.setupRemoveButton(imageItem, container);
    }

    // Configurar vista previa de imagen
    setupImagePreview(imageItem) {
        const inputElement = imageItem.querySelector('input[type="file"]');
        const previewContainer = imageItem.querySelector('.upload-preview');
        
        inputElement.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    previewContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Vista previa">
                        <span class="file-name">${file.name} (${(file.size / 1024).toFixed(2)} KB)</span>
                    `;
                };
                
                reader.readAsDataURL(file);
            } else {
                previewContainer.innerHTML = '';
            }
        });
    }

    // Configurar botón de eliminar
    setupRemoveButton(imageItem, container) {
        const removeBtn = imageItem.querySelector('.remove-image');
        removeBtn.addEventListener('click', () => {
            container.removeChild(imageItem);
            this.renumberImageInputs(container);
        });
    }

    // Renumerar inputs de imagen
    renumberImageInputs(container) {
        const items = container.querySelectorAll('.image-item');
        items.forEach((item, index) => {
            const label = item.querySelector('label');
            const input = item.querySelector('input');
            const inputId = `imgFile${index + 1}`;
            label.htmlFor = inputId;
            input.id = inputId;
            label.innerHTML = `<i class="fas fa-file-image"></i> Imagen ${index + 1}:`;
        });
    }

    // Procesar múltiples imágenes
    async processImages(container) {
        const imageInputs = container.querySelectorAll('input[type="file"]');
        const imagePromises = [];
        
        for (const input of imageInputs) {
            if (input.files && input.files[0]) {
                imagePromises.push(this.uploadImage(input.files[0]));
            }
        }
        
        const imageUrls = await Promise.all(imagePromises);
        return imageUrls.filter(url => url !== null);
    }

    // Obtener URLs de imágenes de un producto
    getProductImageUrls(product) {
        const imageUrls = [];
        
        // Recopilar imágenes numeradas
        for (let i = 1; i <= this.maxImages; i++) {
            const imgKey = i === 1 ? 'image' : `image${i}`;
            if (product[imgKey]) {
                imageUrls.push(product[imgKey]);
            }
        }
        
        // Incluir imágenes legacy si existen
        if (product.image && !imageUrls.includes(product.image)) {
            imageUrls.push(product.image);
        }
        if (product.image2 && !imageUrls.includes(product.image2)) {
            imageUrls.push(product.image2);
        }
        if (product.image3 && !imageUrls.includes(product.image3)) {
            imageUrls.push(product.image3);
        }
        
        // Eliminar duplicados
        return [...new Set(imageUrls)];
    }

    // Asignar URLs a objeto de producto
    assignImageUrls(productObj, imageUrls) {
        imageUrls.forEach((url, index) => {
            if (index === 0) {
                productObj.image = url;
            } else {
                productObj[`image${index + 1}`] = url;
            }
        });
    }
}
