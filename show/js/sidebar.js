// Sidebar Menu Manager
export class SidebarManager {
    constructor() {
        this.elements = {
            menuToggle: document.getElementById('menuToggle'),
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            sidebarClose: document.getElementById('sidebarClose')
        };
        
        this.init();
    }
    
    init() {
        // Verificar que los elementos existen antes de continuar
        if (!this.elements.menuToggle) {
            console.warn('Menu toggle button not found');
            return;
        }
        
        if (!this.elements.sidebar) {
            console.warn('Sidebar not found');
            return;
        }
        
        this.bindEvents();
        this.setupDropdowns();
        
        console.log('Sidebar initialized successfully');
    }
    
    bindEvents() {
        // Abrir menú
        if (this.elements.menuToggle) {
            this.elements.menuToggle.addEventListener('click', () => {
                this.openSidebar();
            });
        }
        
        // Cerrar menú
        if (this.elements.sidebarClose) {
            this.elements.sidebarClose.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // Cerrar al hacer click en overlay
        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isSidebarOpen()) {
                this.closeSidebar();
            }
        });
        
        // Prevenir scroll del body cuando el sidebar está abierto
        this.elements.sidebar?.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        });
    }
    
    setupDropdowns() {
        // Configurar dropdowns de categorías
        const dropdownToggles = document.querySelectorAll('.sidebar-dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDropdown(toggle);
            });
        });
    }
    
    openSidebar() {
        if (this.elements.sidebar && this.elements.sidebarOverlay && this.elements.menuToggle) {
            this.elements.sidebar.classList.add('active');
            this.elements.sidebarOverlay.classList.add('active');
            this.elements.menuToggle.classList.add('active');
            
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
            
            // Foco en el sidebar para accesibilidad
            this.elements.sidebar.focus();
        }
    }
    
    closeSidebar() {
        if (this.elements.sidebar && this.elements.sidebarOverlay && this.elements.menuToggle) {
            this.elements.sidebar.classList.remove('active');
            this.elements.sidebarOverlay.classList.remove('active');
            this.elements.menuToggle.classList.remove('active');
            
            // Restaurar scroll del body
            document.body.style.overflow = '';
            
            // Devolver foco al botón hamburguesa
            this.elements.menuToggle.focus();
        }
    }
    
    toggleDropdown(toggle) {
        const targetId = toggle.getAttribute('data-target');
        const submenu = document.getElementById(targetId);
        
        if (submenu) {
            const isActive = submenu.classList.contains('active');
            
            // Cerrar otros dropdowns
            document.querySelectorAll('.sidebar-submenu.active').forEach(menu => {
                if (menu !== submenu) {
                    menu.classList.remove('active');
                }
            });
            
            document.querySelectorAll('.sidebar-dropdown-toggle.active').forEach(btn => {
                if (btn !== toggle) {
                    btn.classList.remove('active');
                }
            });
            
            // Toggle el dropdown actual
            if (isActive) {
                submenu.classList.remove('active');
                toggle.classList.remove('active');
            } else {
                submenu.classList.add('active');
                toggle.classList.add('active');
            }
        }
    }
    
    isSidebarOpen() {
        return this.elements.sidebar?.classList.contains('active') || false;
    }
      // Método para cerrar sidebar al navegar (opcional)
    handleNavigation() {
        // Cerrar sidebar al hacer click en cualquier link
        const sidebarLinks = document.querySelectorAll('.sidebar-link[href], .sidebar-sublink[href]');
        
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Si es un enlace a categorías, manejar la navegación correctamente
                const href = link.getAttribute('href');
                if (href && href.includes('categoria')) {
                    // Permitir que el navegador maneje la navegación naturalmente
                    // pero cerrar el sidebar después de un pequeño delay
                    setTimeout(() => {
                        this.closeSidebar();
                    }, 100);
                } else {
                    // Para otros enlaces, cerrar inmediatamente
                    setTimeout(() => {
                        this.closeSidebar();
                    }, 100);
                }
            });
        });
    }
    
    // Método para agregar categorías dinámicamente (opcional)
    addCategory(categoryName, categoryUrl) {
        const submenu = document.getElementById('categorias');
        if (submenu) {
            const listItem = document.createElement('li');
            listItem.className = 'sidebar-submenu-item';
            
            const link = document.createElement('a');
            link.href = categoryUrl;
            link.className = 'sidebar-sublink';
            link.target = '_top';
            link.innerHTML = `<span>${categoryName}</span>`;
            
            listItem.appendChild(link);
            submenu.appendChild(listItem);
            
            // Reagregar event listener para navegación
            link.addEventListener('click', () => {
                setTimeout(() => {
                    this.closeSidebar();
                }, 100);
            });
        }
    }
    
    // Método para responsive handling
    handleResize() {
        window.addEventListener('resize', () => {
            // Cerrar sidebar en cambios de orientación en móvil
            if (window.innerWidth > 768 && this.isSidebarOpen()) {
                this.closeSidebar();
            }
        });
    }
}

// Función de utilidad para URL encoding de categorías
export function createCategoryUrl(categoryName) {
    // Usar encodeURIComponent para manejar correctamente caracteres especiales
    const encodedCategory = encodeURIComponent(categoryName);
    return `../categoria/?cat=${encodedCategory}`;
}

// Función para crear enlaces de navegación seguros
export function createCategoryLink(categoryName, displayText) {
    const url = createCategoryUrl(categoryName);
    return `<a href="${url}" class="sidebar-sublink" target="_top"><span>${displayText}</span></a>`;
}

// La inicialización se maneja desde app.js para evitar duplicados
// document.addEventListener('DOMContentLoaded', () => {
//     const sidebarManager = new SidebarManager();
//     sidebarManager.handleNavigation();
//     sidebarManager.handleResize();
//     
//     // Hacer disponible globalmente si es necesario
//     window.sidebarManager = sidebarManager;
// });
