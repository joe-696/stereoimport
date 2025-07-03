// Gestor de productos
import { Utils } from './utils.js';
import { ImageManager } from './imageManager.js';

export class ProductManager {
    constructor(db) {
        this.db = db;
        this.products = [];
        this.imageManager = new ImageManager();
    }

    // Cargar productos desde Firestore
    async loadProducts() {
        try {
            const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
            const querySnapshot = await getDocs(collection(this.db, "products"));
            
            this.products = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                this.products.push({...data, id: docSnap.id});
            });
            
            return this.products;
        } catch (error) {
            console.error("Error al cargar productos:", error);
            Utils.showToast("Error al cargar productos.", true);
            return [];
        }
    }

    // Agregar nuevo producto
    async addProduct(productData, imageContainer) {
        try {
            const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
            
            // Validar datos
            const validation = Utils.validateProductData(
                productData.sagitario,
                productData.title,
                productData.description,
                productData.price,
                productData.category
            );

            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            // Procesar imágenes
            const validImageUrls = await this.imageManager.processImages(imageContainer);
            
            // Preparar objeto de producto
            const newProduct = {
                sagitario: productData.sagitario,
                title: productData.title,
                description: productData.description,
                price: productData.price,
                category: productData.category,
            };
            
            // Agregar precio promocional si existe
            if (!isNaN(productData.promotionalPrice) && productData.promotionalPrice > 0) {
                newProduct.promotionalPrice = productData.promotionalPrice;
            }
            
            // Agregar URLs de imágenes
            this.imageManager.assignImageUrls(newProduct, validImageUrls);

            // Guardar en Firestore
            await addDoc(collection(this.db, "products"), newProduct);
            Utils.showToast("Producto agregado con éxito.");
            
            return { success: true };
        } catch (error) {
            console.error("Error al agregar producto:", error);
            throw error;
        }
    }

    // Eliminar producto
    async deleteProduct(id) {
        if (!confirm("¿Deseas eliminar este producto?")) {
            return;
        }

        try {
            const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
            await deleteDoc(doc(this.db, "products", id));
            Utils.showToast("Producto eliminado con éxito.");
            return { success: true };
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            Utils.showToast("Error al eliminar el producto: " + error.message, true);
            throw error;
        }
    }

    // Actualizar producto
    async updateProduct(id, productData, imagesToRemove, newImageContainer) {
        try {
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
            
            // Validar datos
            const validation = Utils.validateProductData(
                productData.sagitario,
                productData.title,
                productData.description,
                productData.price,
                productData.category
            );

            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            // Obtener producto actual
            const currentProduct = this.products.find(p => p.id === id);
            if (!currentProduct) {
                throw new Error("Producto no encontrado");
            }

            // Preparar datos actualizados
            let updatedData = {
                sagitario: productData.sagitario,
                title: productData.title,
                description: productData.description,
                price: productData.price,
                category: productData.category,
            };

            // Manejo del precio promocional
            if (!isNaN(productData.promotionalPrice) && productData.promotionalPrice > 0) {
                updatedData.promotionalPrice = productData.promotionalPrice;
            } else {
                updatedData.promotionalPrice = null;
            }
            
            // Procesar eliminaciones de imágenes
            for (const item of imagesToRemove) {
                updatedData[item.key] = null;
            }
            
            // Subir nuevas imágenes
            const validNewImageUrls = await this.imageManager.processImages(newImageContainer);
            
            // Obtener imágenes actuales que no fueron eliminadas
            const currentImages = [];
            for (let i = 1; i <= this.imageManager.maxImages; i++) {
                const imgKey = i === 1 ? 'image' : `image${i}`;
                
                if (currentProduct[imgKey] && !imagesToRemove.some(item => item.key === imgKey)) {
                    currentImages.push({key: imgKey, url: currentProduct[imgKey]});
                }
            }
            
            // Reorganizar imágenes
            let nextImageIndex = 1;
            
            // Preservar imágenes actuales
            currentImages.forEach(img => {
                const keyToUse = nextImageIndex === 1 ? 'image' : `image${nextImageIndex}`;
                updatedData[keyToUse] = img.url;
                nextImageIndex++;
            });
            
            // Agregar nuevas imágenes
            validNewImageUrls.forEach(url => {
                const keyToUse = nextImageIndex === 1 ? 'image' : `image${nextImageIndex}`;
                updatedData[keyToUse] = url;
                nextImageIndex++;
            });

            // Actualizar documento
            await updateDoc(doc(this.db, "products", id), updatedData);
            Utils.showToast("Producto actualizado con éxito.");
            
            return { success: true };
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            throw error;
        }
    }

    // Obtener producto por ID
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }
}
