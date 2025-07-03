import { Utils } from './utils.js';
import { firebaseService } from '../../shared/firebaseService.js';

// Product Management Class
export class ProductManager {
    constructor() {
        this.allProducts = [];
        this.productsSection = document.getElementById('productsSection');
        this.searchInput = document.getElementById('searchInput');
        this.searchSuggestions = document.getElementById('searchSuggestions');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.searchTimeout = null;
        this.cartManager = null; // Referencia al CartManager
    }

    // Establecer referencia al CartManager
    setCartManager(cartManager) {
        this.cartManager = cartManager;
        console.log('🔗 CartManager linked to ProductManager');
    }

    // Show skeleton loading
    showSkeleton() {
        if (this.productsSection) {
            this.productsSection.innerHTML = '';
            for (let i = 0; i < 8; i++) {
                const skeletonCard = document.createElement('div');
                skeletonCard.className = 'product skeleton';                skeletonCard.innerHTML = `
                    <div class="skeleton__image" style="height: 180px; background-color: #e0e0e0; margin-bottom:10px; border-radius: 4px;"></div> 
                    <div class="skeleton__text" style="height: 20px; background-color: #e0e0e0; margin-bottom:8px; border-radius: 4px;"></div>
                    <div class="skeleton__text skeleton__text--small" style="height: 15px; width: 70%; background-color: #e0e0e0; margin-bottom:10px; border-radius: 4px;"></div> 
                    <div class="skeleton__button" style="height: 40px; background-color: #e0e0e0; border-radius: 4px;"></div>
                `;
                this.productsSection.appendChild(skeletonCard);
            }
        }
    }

    // Render products
    renderProducts(products) {
        if (!this.productsSection) return;
        
        this.productsSection.innerHTML = '';
        
        if (products.length === 0) {            this.productsSection.innerHTML = `
                <div class="no-results">
                    <i class="no-results__icon fas fa-search"></i>
                    <h3 class="no-results__title">No se encontraron productos</h3>
                    <p class="no-results__description">Intenta con otros términos de búsqueda o explora todas las categorías.</p>
                </div>
            `;
            return;
        }

        products.forEach((product) => {
            const { id, image = 'https://via.placeholder.com/250', title, price, promotionalPrice } = product;
            const finalPrice = promotionalPrice && promotionalPrice > 0 ? promotionalPrice : price;
            const hasPromo = promotionalPrice && promotionalPrice > 0;
              const priceHTML = hasPromo
                ? `<div class="product__price-container"><span class="product__original-price">S/${Number(price).toFixed(2)}</span><span class="product__promotional-price">S/${Number(promotionalPrice).toFixed(2)}</span></div>`
                : `<p class="product__regular-price">S/${Number(price).toFixed(2)}</p>`;
                
            const productEl = document.createElement('div');
            productEl.className = 'product';
            productEl.setAttribute('data-id', id);
            
            // Asegurar que los datos del botón están correctos
            const cleanTitle = String(title || '').replace(/"/g, '&quot;');
            const cleanImage = String(image || 'https://via.placeholder.com/250');
            const cleanPrice = Number(finalPrice || 0);
            
            console.log('🏷️ Rendering product:', { cleanTitle, cleanPrice, cleanImage }); // Debug log
            
            productEl.innerHTML = `
                <div class="product__image-container">
                    <img src="${cleanImage}" alt="${cleanTitle}" class="product__image" loading="lazy">
                    ${hasPromo ? '<span class="product__discount-badge">Oferta</span>' : ''}
                    <div class="product__view-details"><i class="fas fa-search-plus" aria-hidden="true"></i></div>
                </div>
                <div class="product__content">
                    <h3 class="product__title">${cleanTitle}</h3>
                    ${priceHTML}
                </div>
                <button class="product__add-to-cart" data-name="${cleanTitle}" data-price="${cleanPrice}" data-image="${cleanImage}" aria-label="Agregar ${cleanTitle} al carrito">
                    <i class="fas fa-cart-plus" aria-hidden="true"></i> Agregar
                </button>
            `;
            this.productsSection.appendChild(productEl);
        });
    }

    // Apply filters
    applyFilters() {
        const searchText = this.searchInput ? this.searchInput.value : "";
        const selectedCategory = this.categoryFilter ? this.categoryFilter.value.toLowerCase() : "";
        let filteredProducts = this.allProducts;
        
        if (searchText) {
            filteredProducts = Utils.fuzzySearch(searchText, filteredProducts);
        }
        
        if (selectedCategory) {
            filteredProducts = filteredProducts.filter(product => 
                product.category?.toLowerCase() === selectedCategory
            );
        }
        
        this.renderProducts(filteredProducts);
    }

    // Show suggestions
    showSuggestions(query) {
        if (!query || query.length < 2) {
            if (this.searchSuggestions) {
                this.searchSuggestions.style.display = 'none';
            }
            return;
        }

        const suggestions = Utils.fuzzySearch(query, this.allProducts)
            .slice(0, 5)
            .map(product => product.title);        if (suggestions.length > 0 && this.searchSuggestions) {
            this.searchSuggestions.innerHTML = suggestions
                .map(suggestion => `<div class="search__suggestion-item">${suggestion}</div>`)
                .join('');
            this.searchSuggestions.style.display = 'block';
        } else if (this.searchSuggestions) {
            this.searchSuggestions.style.display = 'none';
        }
    }    // Load products from Firebase
    async loadProducts() {
        this.showSkeleton();
        try {
            this.allProducts = await firebaseService.getProducts();
            console.log(`✅ Loaded ${this.allProducts.length} products`);
            this.applyFilters();
        } catch (error) {
            console.error("Error al cargar productos:", error);
            if (this.productsSection) {
                this.productsSection.innerHTML = `
                    <div class="error-message">
                        <h3>Error al cargar productos</h3>
                        <p>No se pudieron cargar los productos. Por favor, inténtalo más tarde.</p>
                        <button onclick="window.location.reload()" class="btn btn-primary">
                            Reintentar
                        </button>
                    </div>
                `;
            }
        }
    }    // Navigate to product detail
    navigateToProductDetail(productId) {
        window.top.location.href = `../show/show.html?id=${productId}`;
    }

    // Local search for products
    searchProductsLocally(query) {
        if (!query || query.trim() === '') {
            return this.allProducts;
        }

        const lowerCaseQuery = query.toLowerCase();
        return this.allProducts.filter(product => {
            const titleMatch = product.title?.toLowerCase().includes(lowerCaseQuery);
            const categoryMatch = product.category?.toLowerCase().includes(lowerCaseQuery);
            return titleMatch || categoryMatch;
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                const query = e.target.value;

                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    const filteredProducts = this.searchProductsLocally(query);
                    this.renderProducts(filteredProducts);
                    this.showSuggestions(query);
                }, 200);
            });

            this.searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    if (this.searchSuggestions) {
                        this.searchSuggestions.style.display = 'none';
                    }
                }, 200);
            });

            this.searchInput.addEventListener('focus', () => {
                if (this.searchInput.value.length >= 2) {
                    this.showSuggestions(this.searchInput.value);
                }
            });
        }        // Search suggestions
        if (this.searchSuggestions) {
            this.searchSuggestions.addEventListener('click', (e) => {
                if (e.target.classList.contains('search__suggestion-item')) {
                    this.searchInput.value = e.target.textContent;
                    this.searchSuggestions.style.display = 'none';
                    this.applyFilters();
                }
            });
        }// Category filter - filter locally
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', (e) => {
                const selectedCategory = e.target.value;
                console.log('Category selected:', selectedCategory);
                this.applyFilters();
            });
        }

        // Product clicks - navigate to detail page OR add to cart
        if (this.productsSection) {
            this.productsSection.addEventListener('click', (e) => {
                const productElement = e.target.closest('.product');
                if (!productElement) return;

                // Handle add to cart button clicks
                if (e.target.closest('.product__add-to-cart')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const button = e.target.closest('.product__add-to-cart');
                    const name = button.getAttribute('data-name');
                    const price = parseFloat(button.getAttribute('data-price'));
                    const image = button.getAttribute('data-image');
                    
                    console.log('🛒 Product Manager - Add to cart clicked:', { name, price, image });
                    
                    if (this.cartManager && name && !isNaN(price)) {
                        this.cartManager.addToCart(name, price, image);
                    } else if (!this.cartManager) {
                        console.error('❌ CartManager not available');
                    } else {
                        console.error('❌ Invalid product data:', { name, price, image });
                    }
                    return;
                }

                // Navigate to product detail if not clicking add to cart
                const productId = productElement.getAttribute('data-id');
                if (productId) {
                    this.navigateToProductDetail(productId);
                }
            });
        }

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-container') && this.searchSuggestions) {
                this.searchSuggestions.style.display = 'none';
            }
        });
    }

    // Get all products
    getAllProducts() {
        return this.allProducts;
    }
}
