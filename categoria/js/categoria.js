// Importar las clases necesarias desde archivos compartidos
import { firebaseConfig, WHATSAPP_NUMBER, APP_CONFIG } from '../../shared/config.js';
import { SharedUtils } from '../../shared/utils.js';
import { CART_CONFIG, CartUtils, CartSync } from '../../shared/cartConfig.js';
import { firebaseService } from '../../shared/firebaseService.js';

// Gestor de carrito optimizado para la página de categorías
class CategoryCartManager {
    constructor() {
        this.cart = CartSync.loadCart();
        this.cartCount = document.getElementById('cartCount');
        this.toast = document.getElementById('toast');
        this.updateUI();
    }
    
    updateUI() {
        if (this.cartCount) {
            this.cartCount.textContent = CartUtils.getTotalItems(this.cart);
        }
    }
    
    addToCart(name, price, image) {
        const existingItem = CartUtils.findItemByName(this.cart, name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            const newItem = CART_CONFIG.createCartItem(name, price, image);
            if (CartUtils.validateCartItem(newItem)) {
                this.cart.push(newItem);
            }
        }
          CartSync.saveCart(this.cart);
        this.updateUI();
        SharedUtils.showToast('Producto agregado al carrito', this.toast);
    }
}

// Clase principal para la página de categorías
class CategoryApp {
    constructor() {
        this.db = null;
        this.currentCategory = null;
        this.allProducts = [];
        this.filteredProducts = [];
        this.cartManager = new CategoryCartManager();
        
        this.initializeApp();
    }    async initializeApp() {
        try {
            this.currentCategory = this.getCategoryFromUrl();
            await firebaseService.initialize();
            this.db = firebaseService.db;
            await this.loadProducts();
            this.setupUI();
            this.setupEventListeners();
            console.log('✅ CategoryApp initialized successfully!');
        } catch (error) {
            console.error('Error initializing category app:', error);
        }
    }

    getCategoryFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('cat');
        
        if (!category) {
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('cat', 'todas');
            window.history.replaceState({}, '', newUrl.toString());
            return 'todas';
        }
        
        let decodedCategory;
        try {
            decodedCategory = decodeURIComponent(category);
        } catch (error) {
            console.error('Error decoding category parameter:', error);
            decodedCategory = category;
        }
        
        // Mapeo de categorías normalizadas
        const categoryMappings = {
            'audifonos': 'Audífonos',
            'audífonos': 'Audífonos',
            'parlantes': 'Parlantes',
            'fundas para parlantes': 'Fundas para parlantes',
            'funda para audifonos': 'Funda para audífonos',
            'funda para audífonos': 'Funda para audífonos',
            'almohadillas para audifonos': 'Almohadillas para audífonos',
            'almohadillas para audífonos': 'Almohadillas para audífonos',
            'fundas para amazon kindle': 'Fundas para Amazon Kindle',
            'todas': 'todas'
        };
        
        const normalizedKey = decodedCategory.toLowerCase();        return categoryMappings[normalizedKey] || decodedCategory;
    }

    async loadProducts() {
        try {
            this.allProducts = await firebaseService.getProducts();
            console.log(`✅ ${this.allProducts.length} productos cargados`);
            this.filterProductsByCategory();
        } catch (error) {
            console.error('Error loading products:', error);            this.showConnectionError();
        }
    }

    showConnectionError() {
        const productsSection = document.getElementById('productsSection');
        if (productsSection) {
            productsSection.innerHTML = `
                <div class="connection-error">
                    <i class="fas fa-wifi" style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;"></i>
                    <h3>Error de conexión</h3>
                    <p>No se pudo conectar a la base de datos.</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        <i class="fas fa-refresh"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }
    
    showNoDataError() {
        const productsSection = document.getElementById('productsSection');
        if (productsSection) {
            productsSection.innerHTML = `
                <div class="firebase-error">
                    <i class="fas fa-database" style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;"></i>
                    <h3>Base de datos vacía</h3>
                    <p>No se encontraron productos en la base de datos.</p>
                    <p><strong>Proyecto:</strong> ${firebaseConfig.projectId}</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        <i class="fas fa-refresh"></i> Reintentar
                    </button>
                </div>
            `;        }
    }

    filterProductsByCategory() {
        if (this.currentCategory === 'todas') {
            this.filteredProducts = this.allProducts;
        } else {
            const normalizedTarget = SharedUtils.normalizeText(this.currentCategory.trim());
            
            this.filteredProducts = this.allProducts.filter(product => {
                // Campos de categoría posibles
                const categoryFields = [
                    product.categoria, product.category, product.type,
                    product.clase, product.tag, product.grupo
                ].filter(field => field?.trim());
                
                // 1. Coincidencia exacta en campos de categoría
                if (categoryFields.some(field => SharedUtils.normalizeText(field) === normalizedTarget)) {
                    return true;
                }
                
                // 2. Coincidencia parcial lógica para fundas y accesorios específicos
                if (categoryFields.some(field => {
                    const normalized = SharedUtils.normalizeText(field);
                    if (normalizedTarget.includes('funda') && normalized.includes('funda')) {
                        return (normalizedTarget.includes('parlante') && normalized.includes('parlante')) ||
                               (normalizedTarget.includes('audifono') && normalized.includes('audifono')) ||
                               (normalizedTarget.includes('kindle') && normalized.includes('kindle'));
                    }
                    return normalizedTarget.includes('almohadilla') && normalized.includes('almohadilla');
                })) {
                    return true;
                }
                
                // 3. Búsqueda por palabras clave en título
                const productTitle = SharedUtils.normalizeText(product.title || '');
                const keywordSets = {
                    'parlantes': ['parlante', 'speaker', 'jbl'],
                    'audifonos': ['audifono', 'headphone', 'beats', 'sony'],
                    'funda para audifonos': ['funda', 'vincha', 'audifono'],
                    'fundas para parlantes': ['funda', 'parlante'],
                    'almohadillas para audifonos': ['almohadilla', 'gel', 'audifono'],
                    'fundas para amazon kindle': ['kindle', 'amazon']
                };
                
                const keywords = keywordSets[normalizedTarget];
                return keywords && keywords.every(keyword => productTitle.includes(keyword));
            });
        }
          this.renderProducts();
    }

    setupUI() {
        // Actualizar título y breadcrumb
        const categoryTitle = document.getElementById('categoryTitle');
        const currentCategoryElement = document.getElementById('currentCategory');
        const categoryDescription = document.getElementById('categoryDescription');
        
        // Usar un nombre de display más limpio
        const displayName = this.getCategoryDisplayName(this.currentCategory);
        
        if (categoryTitle) {
            categoryTitle.textContent = displayName;
        }
        
        if (currentCategoryElement) {
            currentCategoryElement.textContent = displayName;
        }
        
        if (categoryDescription) {
            const count = this.filteredProducts.length;
            categoryDescription.textContent = `${count} producto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''} en ${displayName}`;
        }
        
        // Actualizar título de la página y URL
        const pageTitle = `${displayName} - Stereo Importaciones`;
        document.title = pageTitle;
        
        // Asegurar que la URL tenga el parámetro correcto
        const currentUrl = new URL(window.location);
        if (currentUrl.searchParams.get('cat') !== this.currentCategory) {
            currentUrl.searchParams.set('cat', this.currentCategory);
            window.history.replaceState({ category: this.currentCategory }, pageTitle, currentUrl.toString());
        }
        
        this.updateDebugInfo();
    }
    
    getCategoryDisplayName(category) {
        const displayNames = {
            'todas': 'Todos los productos',
            'Parlantes': 'Parlantes',
            'Audífonos': 'Audífonos',
            'Fundas para parlantes': 'Fundas para parlantes',
            'Funda para audífonos': 'Fundas para audífonos',
            'Almohadillas para audífonos': 'Almohadillas para audífonos',
            'Fundas para Amazon Kindle': 'Fundas para Amazon Kindle'
        };
        
        return displayNames[category] || category;
    }
    
    updateDebugInfo() {
        // Actualizar información de debug en la página
        const currentUrlDisplay = document.getElementById('currentUrlDisplay');
        const currentCatParam = document.getElementById('currentCatParam');
        const activeCategoryDisplay = document.getElementById('activeCategoryDisplay');
        
        if (currentUrlDisplay) {
            currentUrlDisplay.textContent = window.location.href;
        }
        
        if (currentCatParam) {
            const urlParams = new URLSearchParams(window.location.search);
            currentCatParam.textContent = urlParams.get('cat') || 'no especificado';
        }
        
        if (activeCategoryDisplay) {
            activeCategoryDisplay.textContent = this.currentCategory;
        }
    }
    
    renderProducts() {
        const productsSection = document.getElementById('productsSection');
        if (!productsSection) return;
        
        // Limpiar contenido
        productsSection.innerHTML = '';
        
        if (this.filteredProducts.length === 0) {
            productsSection.innerHTML = `
                <div class="no-results">
                    <i class="no-results__icon fas fa-search"></i>
                    <h3 class="no-results__title">No se encontraron productos</h3>
                    <p class="no-results__description">No hay productos disponibles en esta categoría.</p>
                    <a href="https://stereoimport.com/" class="btn btn-primary" target="_top">
                        <i class="fas fa-arrow-left"></i> Volver al inicio
                    </a>
                </div>
            `;
            return;
        }
        
        this.filteredProducts.forEach(product => {
            const { id, image = 'https://via.placeholder.com/250', title, price, promotionalPrice, categoria } = product;
            const finalPrice = promotionalPrice && promotionalPrice > 0 ? promotionalPrice : price;
            const hasPromo = promotionalPrice && promotionalPrice > 0;
            
            const priceHTML = hasPromo
                ? `<div class="product__price-container">
                     <span class="product__original-price">S/${Number(price).toFixed(2)}</span>
                     <span class="product__promotional-price">S/${Number(promotionalPrice).toFixed(2)}</span>
                   </div>`
                : `<p class="product__regular-price">S/${Number(price).toFixed(2)}</p>`;
            
            const productEl = document.createElement('div');
            productEl.className = 'product';
            productEl.setAttribute('data-id', id);
            
            productEl.innerHTML = `
                <div class="product__image-container">
                    <img src="${image}" alt="${title}" class="product__image" loading="lazy">
                    ${hasPromo ? '<span class="product__discount-badge">Oferta</span>' : ''}
                    <div class="product__view-details"><i class="fas fa-search-plus"></i></div>
                </div>
                <div class="product__content">
                    <h3 class="product__title">${title}</h3>
                    ${priceHTML}
                </div>
                <button class="product__add-to-cart" data-name="${title}" data-price="${finalPrice}" data-image="${image}">
                    <i class="fas fa-cart-plus"></i> Agregar
                </button>
            `;
            
            productsSection.appendChild(productEl);
        });
          this.setupUI(); // Actualizar contadores
    }

    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);            });
        }

        // Escuchar cambios en la URL (para navegación con botones del navegador)
        window.addEventListener('popstate', (e) => {
            const newCategory = this.getCategoryFromUrl();
            if (newCategory !== this.currentCategory) {
                this.currentCategory = newCategory;
                this.filterProductsByCategory();
                this.setupUI();
            }
        });
        
        // Eventos de productos
        const productsSection = document.getElementById('productsSection');
        if (productsSection) {
            productsSection.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product');
                if (!productCard) return;
                
                // Agregar al carrito
                if (e.target.closest('.product__add-to-cart')) {
                    e.stopPropagation();
                    const button = e.target.closest('.product__add-to-cart');
                    const name = button.dataset.name;
                    const price = Number(button.dataset.price);
                    const image = button.dataset.image;
                    
                    this.cartManager.addToCart(name, price, image);
                    return;
                }
                
                // Ver detalles del producto
                const productId = productCard.dataset.id;
                if (productId) {
                    window.open(`../show/show.html?id=${productId}`, '_top');
                }
            });
        }
        
        // Manejar enlaces de categoría para actualizar dinámicamente
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href*="?cat="]');
            if (link && link.getAttribute('href').startsWith('?cat=')) {
                e.preventDefault();
                const url = new URL(link.href, window.location.origin + window.location.pathname);
                const newCategory = url.searchParams.get('cat');
                if (newCategory && newCategory !== this.currentCategory) {
                    this.changeCategory(newCategory);
                }
            }        });
    }

    handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.filterProductsByCategory();
            return;
        }
          const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
        
        // Primero filtrar por categoría actual, luego por búsqueda
        let productsToSearch = this.allProducts;
        
        if (this.currentCategory !== 'todas') {
            const normalizedTarget = SharedUtils.normalizeText(this.currentCategory);
            
            productsToSearch = this.allProducts.filter(product => {
                const possibleCategoryFields = [
                    product.categoria,
                    product.category, 
                    product.type,
                    product.clase,
                    product.tag,
                    product.grupo
                ].map(field => field ? String(field).trim() : '');
                
                return possibleCategoryFields.some(categoryValue => {
                    if (!categoryValue) return false;
                    const normalizedCategory = SharedUtils.normalizeText(categoryValue);
                    return normalizedCategory === normalizedTarget || 
                           normalizedCategory.includes(normalizedTarget) ||
                           normalizedTarget.includes(normalizedCategory);
                });
            });
        }
        
        // Aplicar búsqueda de texto sobre los productos filtrados por categoría
        this.filteredProducts = productsToSearch.filter(product => {
            const title = SharedUtils.normalizeText(product.title || '');
            const description = SharedUtils.normalizeText(product.description || '');
            const searchText = `${title} ${description}`;
            
            return searchTerms.some(term => searchText.includes(SharedUtils.normalizeText(term)));
        });
          this.renderProducts();
    }

    // Función para cambiar de categoría dinámicamente
    changeCategory(newCategory) {
        this.currentCategory = newCategory;
        
        // Actualizar URL
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('cat', newCategory);
        window.history.pushState({ category: newCategory }, '', newUrl.toString());
        
        // Filtrar productos y actualizar UI
        this.filterProductsByCategory();
        this.setupUI();
        
        // Actualizar información de debug
        this.updateDebugInfo();
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new CategoryApp();
});

// CSS adicional para breadcrumb
const breadcrumbStyles = `
<style>
.breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.breadcrumb a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.3s ease;
}

.breadcrumb a:hover {
    color: var(--secondary-color);
}

.breadcrumb-separator {
    color: var(--text-muted);
}

.category-description {
    text-align: center;
    color: var(--text-secondary);
    margin: 10px 0 0 0;
    font-size: 1rem;
}

.no-results {
    text-align: center;
    padding: 60px 20px;
    grid-column: 1 / -1;
}

.no-results .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    padding: 12px 24px;
    background: var(--gradient-primary);
    color: white;
    text-decoration: none;
    border-radius: var(--radius-xl);
    transition: transform 0.3s ease;
}

.no-results .btn:hover {
    transform: translateY(-2px);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', breadcrumbStyles);


