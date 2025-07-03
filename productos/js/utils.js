// Import shared utilities and extend with productos-specific functions
import { SharedUtils } from '../../shared/utils.js';

export class Utils extends SharedUtils {
    // Form validation
    static validateCheckoutForm() {
        const dniInput = document.getElementById('dni');
        const celularInput = document.getElementById('celular');
        const nombreInput = document.getElementById('nombre');
        const direccionInput = document.getElementById('direccion');
        const metodoPagoInput = document.getElementById('metodoPago');

        if (!nombreInput || !nombreInput.value.trim()) {
            alert('El nombre es requerido.');
            return false;
        }
        
        if (!dniInput || !/^\d{8}$/.test(dniInput.value.trim())) {
            alert('El DNI debe tener exactamente 8 dígitos.');
            return false;
        }
        
        if (!celularInput || !/^\d{9}$/.test(celularInput.value.trim())) {
            alert('El número de celular debe tener exactamente 9 dígitos.');
            return false;
        }
        
        if (!direccionInput || !direccionInput.value.trim()) {
            alert('La dirección es requerida.');
            return false;
        }
        
        if (!metodoPagoInput || !metodoPagoInput.value) {
            alert('Seleccione un método de pago.');
            return false;
        }
        
        const envioChecked = document.querySelector('input[name="envio"]:checked');
        const agenciaEnvioSelect = document.getElementById('agenciaEnvio');
        
        if (envioChecked && envioChecked.value === 'provincia' && agenciaEnvioSelect && !agenciaEnvioSelect.value) {
            alert('Por favor, selecciona una agencia de envío para provincia.');
            return false;
        }
        
        return true;
    }

    // Build WhatsApp message
    static buildWhatsAppMessage(data, cart) {
        let message = `Hola, Stereo Importaciones. Quisiera realizar el siguiente pedido:\n\n🛍️ *PRODUCTOS EN CARRITO:* (${cart.length})\n`;
        
        cart.forEach(item => {
            message += `  - ${item.name} (x${item.quantity || 1}) - S/${(Number(item.price) * (item.quantity || 1)).toFixed(2)}\n`;
        });
        
        const totalPedido = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
        message += `\n💰 *TOTAL DEL PEDIDO: S/${totalPedido.toFixed(2)}*\n`;
        message += `\n👤 *DATOS DEL CLIENTE:*\n`;
        message += `  Nombre: ${data.nombre}\n  DNI: ${data.dni}\n  Celular: ${data.celular}\n  Dirección: ${data.direccion}\n`;
        message += `\n💳 *MÉTODO DE PAGO:*\n  ${data.metodoPago}\n`;
        message += `\n🚚 *MÉTODO DE ENVÍO:*\n  `;
        
        if (data.envio === 'provincia') {
            message += `Provincia - Agencia: ${data.agenciaEnvio}\n`;
        } else {
            message += `Contra Entrega (Lima Metropolitana)\n`;
        }
        
        message += `\nEspero su pronta confirmación. ¡Gracias!`;
        return encodeURIComponent(message);
    }

    // Set target _top for all links and forms
    static setTargetTop() {
        document.querySelectorAll('a[href]').forEach(link => {
            if (!link.hasAttribute('target')) {
                link.setAttribute('target', '_top');
            }
        });
        
        document.querySelectorAll('form').forEach(form => {
            if (!form.hasAttribute('target')) {
                form.setAttribute('target', '_top');
            }
        });
    }

    // Flying animation to cart
    static flyToCart(imgElement, cartButton, callback) {
        if (!imgElement || !cartButton) {
            if (callback) callback();
            return;
        }

        const rect = imgElement.getBoundingClientRect();
        const cartRect = cartButton.getBoundingClientRect();
        const flyingImg = imgElement.cloneNode(true);
        
        flyingImg.className = 'flying-img';
        flyingImg.style.top = `${rect.top}px`;
        flyingImg.style.left = `${rect.left}px`;
        
        document.body.appendChild(flyingImg);
        
        requestAnimationFrame(() => {
            flyingImg.style.transform = `translate(${cartRect.left - rect.left + (cartRect.width / 2)}px, ${cartRect.top - rect.top + (cartRect.height / 2)}px) scale(0.1)`;
            flyingImg.style.opacity = '0.5';
        });
        
        flyingImg.addEventListener('transitionend', () => {
            if (flyingImg.parentNode) flyingImg.remove();
            if (callback) callback();
        }, { once: true });
    }
}
