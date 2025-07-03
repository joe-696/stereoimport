// Utilidades compartidas para toda la aplicación
export class SharedUtils {
    // Normalizar texto (eliminar tildes y caracteres especiales)
    static normalizeText(text) {
        return text.toLowerCase()
            .replace(/[áàâã]/g, 'a')
            .replace(/[éèê]/g, 'e')
            .replace(/[íìî]/g, 'i')
            .replace(/[óòôõ]/g, 'o')
            .replace(/[úùû]/g, 'u')
            .replace(/[ñ]/g, 'n')
            .replace(/[ç]/g, 'c');
    }

    // Mostrar toast notification
    static showToast(message, toastElement) {
        if (toastElement) {
            toastElement.textContent = message;
            toastElement.classList.add('toast--show');
            setTimeout(() => toastElement.classList.remove('toast--show'), 3000);
        }
    }    // Formatear precio
    static formatPrice(price, currency = '') {
        if (currency) {
            return `${currency}${Number(price).toFixed(2)}`;
        }
        return Number(price).toFixed(2);
    }

    // Validar email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar DNI peruano
    static isValidDNI(dni) {
        return /^\d{8}$/.test(dni.trim());
    }

    // Validar celular peruano
    static isValidPhone(phone) {
        return /^\d{9}$/.test(phone.trim());
    }

    // Crear URL con parámetros
    static createUrlWithParams(baseUrl, params) {
        const url = new URL(baseUrl, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    }

    // Obtener parámetro de URL
    static getUrlParam(paramName, defaultValue = null) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(paramName) || defaultValue;
    }

    // Debounce function para búsquedas
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Scroll suave al elemento
    static smoothScrollTo(element, offset = 0) {
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Lazy loading de imágenes
    static setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // Construir mensaje de WhatsApp
    static buildWhatsAppMessage(data, cart) {
        let message = `Hola, Stereo Importaciones. Quisiera realizar el siguiente pedido:\n\n🛍️ *PRODUCTOS EN CARRITO:* (${cart.length})\n`;
        
        cart.forEach(item => {
            message += `  - ${item.name} (x${item.quantity || 1}) - S/${(Number(item.price) * (item.quantity || 1)).toFixed(2)}\n`;
        });
        
        const totalPedido = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
        message += `\n💰 *TOTAL DEL PEDIDO: S/${totalPedido.toFixed(2)}*\n`;
        
        if (data) {
            message += `\n👤 *DATOS DEL CLIENTE:*\n`;
            message += `  Nombre: ${data.nombre}\n  DNI: ${data.dni}\n  Celular: ${data.celular}\n  Dirección: ${data.direccion}\n`;
            message += `\n💳 *MÉTODO DE PAGO:*\n  ${data.metodoPago}\n`;
            message += `\n🚚 *MÉTODO DE ENVÍO:*\n  `;
            
            if (data.envio === 'provincia') {
                message += `Provincia - Agencia: ${data.agenciaEnvio}\n`;
            } else {
                message += `Contra Entrega (Lima Metropolitana)\n`;
            }
        }
          message += `\nEspero su pronta confirmación. ¡Gracias!`;
        return encodeURIComponent(message);
    }

    // Reveal sections on scroll
    static revealOnScroll() {
        document.querySelectorAll('.animated-section').forEach(section => {
            if (section) {
                const sectionTop = section.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                if (sectionTop < windowHeight - 80) {
                    section.classList.add('visible');
                }
            }
        });
    }

    // Set target _top for all links and forms
    static setTargetTop() {
        document.querySelectorAll('a[href]').forEach(link => {
            if (!link.hasAttribute('target')) {
                link.setAttribute('target', '_top');            }
        });
        
        document.querySelectorAll('form').forEach(form => {
            if (!form.hasAttribute('target')) {
                form.setAttribute('target', '_top');
            }
        });
    }

    // Sanitizar string para uso en HTML
    static sanitizeString(str) {
        return str.replace(/'/g, "\\'");
    }

    // Formatear descripción con markdown básico
    static formatDescription(desc) {
        if (!desc) return '<p>No hay descripción disponible.</p>';
        
        return desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .split('\n')
                  .map(line => line.trim())
                  .filter(line => line)
                  .map(line => line.startsWith('- ') ? `<li>${line.slice(2)}</li>` : `<p>${line}</p>`)
                  .join('');
    }

    // Crear enlace de WhatsApp
    static createWhatsAppLink(message, phone = '51931292396') {
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }

    // Validar DNI
    static validateDNI(dni) {
        return /^\d{8}$/.test(dni);
    }

    // Validar teléfono
    static validatePhone(phone) {
        return /^\d{9}$/.test(phone);
    }

    // Establecer título de página
    static setPageTitle(title) {
        document.title = `${title} - Stereo Importaciones`;
    }

    // Mostrar toast con elemento automático
    static showToast(message, duration = 3000) {
        const toastElement = document.getElementById('toast');
        if (toastElement) {
            toastElement.textContent = message;
            toastElement.classList.add('toast--show');
            setTimeout(() => toastElement.classList.remove('toast--show'), duration);
        }
    }
}
