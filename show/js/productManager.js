import { SharedUtils } from '../../shared/utils.js';
import { WHATSAPP_NUMBER } from '../../shared/config.js';

// Gestión de productos y visualización
export class ProductManager {
    constructor(firebaseService, imageManager, cartManager) {
        this.firebaseService = firebaseService;
        this.imageManager = imageManager;
        this.cartManager = cartManager;
        this.currentProduct = null;
        this.productSection = document.getElementById('productSection');
        
        this.init();
    }

    init() {
        // Hacer funciones disponibles globalmente
        window.addToCart = (name, price, image) => this.addToCart(name, price, image);
        window.askWhatsApp = () => this.askWhatsApp();
    }    async loadProduct(productId) {
        if (!productId) {
            this.showError('ID de producto no encontrado.');
            return;
        }

        try {
            this.showLoading();
            
            // Inicializar Firebase si no está ya inicializado
            await this.firebaseService.initialize();
            
            const product = await this.firebaseService.getProductById(productId);
            this.displayProduct(product);
            
            if (product && product.category) {
                this.loadRelatedProducts(product.category, product.id);
            }
        } catch (error) {
            console.error("Error:", error);
            this.showError('Error al cargar el producto.');
        }
    }

    displayProduct(product) {
        this.currentProduct = product;
        const { title, description, price, promotionalPrice, category } = product;
        
        SharedUtils.setPageTitle(title);
        
        // Preparar imágenes
        const images = this.collectProductImages(product);
        this.imageManager.setImages(images);
        
        // Calcular precios
        const finalPrice = promotionalPrice && promotionalPrice > 0 ? promotionalPrice : price;
        const hasPromo = promotionalPrice && promotionalPrice > 0;
        
        // Generar HTML
        const productHTML = this.generateProductHTML({
            title,
            description,
            price,
            finalPrice,
            hasPromo,
            category,
            images
        });
        
        this.productSection.innerHTML = productHTML;
    }

    collectProductImages(product) {
        const images = [];
        
        // Recopilar todas las imágenes del producto
        for (let i = 1; i <= 10; i++) {
            const imageKey = i === 1 ? 'image' : `image${i}`;
            const img = product[imageKey];
            if (img && !images.includes(img)) {
                images.push(img);
            }
        }
        
        return images;
    }

    generateProductHTML({ title, description, price, finalPrice, hasPromo, category, images }) {
        return `
            <a href="https://stereoimport.com/productos" class="back-btn" target="_top">
                <i class="fas fa-arrow-left"></i> Volver
            </a>
            <div class="product-detail">
                <div class="product-images">
                    <img id="mainImage" src="${this.imageManager.getMainImage()}" alt="${title}" 
                         class="main-image" onclick="openZoom()">
                    ${this.imageManager.generateThumbnailsHTML()}
                </div>
                <div class="product-info">
                    ${category ? `<span class="category">${category}</span>` : ''}
                    <h1>${title}</h1>
                    <div class="price">                        ${hasPromo ? `<span class="original">S/${SharedUtils.formatPrice(price)}</span>` : ''}
                        S/${SharedUtils.formatPrice(finalPrice)}
                    </div>
                    <div class="description">${SharedUtils.formatDescription(description)}</div>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="addToCart('${SharedUtils.sanitizeString(title)}', ${finalPrice}, '${this.imageManager.getMainImage()}')">
                            <i class="fas fa-cart-plus"></i> Agregar
                        </button>
                        <button class="btn btn-whatsapp" onclick="askWhatsApp()">
                            <i class="fab fa-whatsapp"></i> Consultar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }    async loadRelatedProducts(category, currentId) {
        try {
            await this.firebaseService.initialize();
            // Obtener todos los productos de Firebase
            const allProducts = await this.firebaseService.getProducts();
            
            // Filtrar localmente en el navegador
            const relatedProducts = allProducts
                .filter(product => 
                    product.id !== currentId && // No incluir el producto actual
                    product.category === category && // Misma categoría
                    product.active !== false // Solo productos activos
                )
                .slice(0, 6); // Máximo 6 productos relacionados
            
            if (relatedProducts.length > 0) {
                const relatedHTML = this.generateRelatedProductsHTML(relatedProducts.slice(0, 4));
                this.productSection.insertAdjacentHTML('beforeend', relatedHTML);
            }
        } catch (error) {
            console.error("Error loading related products:", error);
        }
    }

    generateRelatedProductsHTML(products) {
        return `
            <section class="related">
                <h2>También te puede interesar</h2>
                <div class="related-grid">
                    ${products.map(product => {
                        const displayPrice = product.promotionalPrice && product.promotionalPrice > 0 
                            ? product.promotionalPrice : product.price;
                        return `
                            <div class="related-card">
                                <a href="/show/show.html?id=${product.id}" target="_top">
                                    <img src="${product.image || 'https://via.placeholder.com/200'}" alt="${product.title}">
                                </a>
                                <div class="related-info">
                                    <div class="related-title">${product.title}</div>
                                    <div class="related-price">S/${SharedUtils.formatPrice(displayPrice)}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </section>
        `;
    }

    addToCart(name, price, image) {
        // Buscar el elemento del producto en la página
        const productElement = document.querySelector('.product-detail, .product-section, #productSection');
        this.cartManager.addItem(name, price, image, productElement);
    }

    askWhatsApp() {
        if (!this.currentProduct) return;
        
        const message = `Hola, me interesa: ${this.currentProduct.title}`;
        const whatsappUrl = SharedUtils.createWhatsAppLink(message, WHATSAPP_NUMBER);
        window.open(whatsappUrl, '_blank');
    }

    showLoading() {
        this.productSection.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Cargando producto...</p>
            </div>
        `;
    }

    showError(message) {
        this.productSection.innerHTML = `<p>${message}</p>`;
    }
}
