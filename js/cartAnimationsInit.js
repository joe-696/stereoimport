// Inicializador global para las animaciones del carrito
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Inicializando sistema de animaciones del carrito');
    
    // Verificar si el CSS de animaciones está cargado
    const checkAnimationCSS = () => {
        const testElement = document.createElement('div');
        testElement.className = 'cart-toast';
        testElement.style.visibility = 'hidden';
        testElement.style.position = 'absolute';
        document.body.appendChild(testElement);
        
        const styles = window.getComputedStyle(testElement);
        const hasAnimations = styles.transition && styles.transition !== 'all 0s ease 0s';
        
        document.body.removeChild(testElement);
        
        if (!hasAnimations) {
            console.warn('⚠️  CSS de animaciones del carrito no cargado correctamente');
        } else {
            console.log('✅ CSS de animaciones del carrito cargado correctamente');
        }
        
        return hasAnimations;
    };
    
    // Esperar un poco antes de verificar para asegurar que el CSS se cargue
    setTimeout(checkAnimationCSS, 100);
    
    // Agregar eventos globales para mejorar la experiencia
    document.body.addEventListener('click', function(e) {
        // Agregar efecto de ondas a todos los botones de agregar al carrito
        if (e.target.closest('.product__add-to-cart, .add-to-cart-btn, [data-action="add-to-cart"]')) {
            const button = e.target.closest('.product__add-to-cart, .add-to-cart-btn, [data-action="add-to-cart"]');
            
            // Crear efecto de onda
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: rippleEffect 0.6s linear;
                pointer-events: none;
                z-index: 1000;
            `;
            
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            // Asegurar que el botón tenga posición relativa
            const originalPosition = button.style.position;
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            
            button.appendChild(ripple);
            
            // Limpiar después de la animación
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
                if (!originalPosition) {
                    button.style.position = '';
                }
            }, 600);
        }
    });
    
    // Agregar estilos de animación de ondas si no existen
    if (!document.getElementById('ripple-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation-styles';
        style.textContent = `
            @keyframes rippleEffect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('🎬 Sistema de animaciones del carrito inicializado correctamente');
});
