// Gestión de imágenes y zoom
export class ImageManager {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.elements = {
            zoomModal: document.getElementById('zoomModal'),
            zoomImage: document.getElementById('zoomImage'),
            zoomClose: document.getElementById('zoomClose'),
            zoomPrev: document.getElementById('zoomPrev'),
            zoomNext: document.getElementById('zoomNext')
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        // Hacer funciones disponibles globalmente
        window.showImage = (index) => this.showImage(index);
        window.openZoom = (index) => this.openZoom(index);
    }

    bindEvents() {
        if (this.elements.zoomClose) {
            this.elements.zoomClose.onclick = () => this.closeZoom();
        }
        
        if (this.elements.zoomPrev) {
            this.elements.zoomPrev.onclick = () => this.navigate(-1);
        }
        
        if (this.elements.zoomNext) {
            this.elements.zoomNext.onclick = () => this.navigate(1);
        }

        // Cerrar modal al hacer click fuera
        if (this.elements.zoomModal) {
            this.elements.zoomModal.onclick = (e) => {
                if (e.target === this.elements.zoomModal) {
                    this.closeZoom();
                }
            };
        }

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (this.elements.zoomModal && this.elements.zoomModal.classList.contains('active')) {
                if (e.key === 'Escape') this.closeZoom();
                if (e.key === 'ArrowLeft') this.navigate(-1);
                if (e.key === 'ArrowRight') this.navigate(1);
            }
        });
    }

    setImages(imageArray) {
        this.images = imageArray.filter(img => img); // Filtrar imágenes vacías
        if (this.images.length === 0) {
            this.images = ['https://via.placeholder.com/500?text=Sin+imagen'];
        }
        this.currentIndex = 0;
    }

    showImage(index) {
        if (this.images.length === 0) return;
        
        this.currentIndex = Math.max(0, Math.min(index, this.images.length - 1));
        
        const mainImg = document.getElementById('mainImage');
        if (mainImg) {
            mainImg.src = this.images[this.currentIndex];
            
            // Actualizar thumbnails
            document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
                thumb.classList.toggle('active', i === this.currentIndex);
            });
        }
    }

    openZoom(index = this.currentIndex) {
        if (this.images.length === 0) return;
        
        this.currentIndex = Math.max(0, Math.min(index, this.images.length - 1));
        
        if (this.elements.zoomImage) {
            this.elements.zoomImage.src = this.images[this.currentIndex];
        }
        
        if (this.elements.zoomModal) {
            this.elements.zoomModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Mostrar/ocultar botones de navegación
        this.updateNavigationButtons();
    }

    closeZoom() {
        if (this.elements.zoomModal) {
            this.elements.zoomModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    navigate(direction) {
        if (this.images.length <= 1) return;
        
        this.currentIndex = (this.currentIndex + direction + this.images.length) % this.images.length;
        
        if (this.elements.zoomImage) {
            this.elements.zoomImage.src = this.images[this.currentIndex];
        }
        
        this.showImage(this.currentIndex);
    }

    updateNavigationButtons() {
        const showNavigation = this.images.length > 1;
        
        if (this.elements.zoomPrev) {
            this.elements.zoomPrev.style.display = showNavigation ? 'block' : 'none';
        }
        
        if (this.elements.zoomNext) {
            this.elements.zoomNext.style.display = showNavigation ? 'block' : 'none';
        }
    }

    generateThumbnailsHTML() {
        if (this.images.length <= 1) return '';
        
        return `
            <div class="thumbnails">
                ${this.images.map((img, i) => `
                    <img src="${img}" alt="Imagen ${i+1}" 
                         class="thumbnail ${i === 0 ? 'active' : ''}" 
                         onclick="showImage(${i})">
                `).join('')}
            </div>
        `;
    }

    getMainImage() {
        return this.images[0] || 'https://via.placeholder.com/500?text=Sin+imagen';
    }
}
