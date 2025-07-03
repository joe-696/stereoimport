import { SharedUtils } from '../../shared/utils.js';
import { WHATSAPP_NUMBER } from '../../shared/config.js';

// Gestión del checkout y formularios
export class CheckoutManager {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.elements = {
            checkoutModal: document.getElementById('checkoutModal'),
            checkoutClose: document.getElementById('checkoutClose'),
            checkoutForm: document.getElementById('checkoutForm'),
            envioRadios: document.querySelectorAll('input[name="envio"]'),
            agenciaSelect: document.getElementById('agencia')
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        if (this.elements.checkoutClose) {
            this.elements.checkoutClose.onclick = () => this.closeModal();
        }

        // Cerrar modal al hacer click fuera
        if (this.elements.checkoutModal) {
            this.elements.checkoutModal.onclick = (e) => {
                if (e.target === this.elements.checkoutModal) {
                    this.closeModal();
                }
            };
        }

        // Manejar cambio de tipo de envío
        this.elements.envioRadios.forEach(radio => {
            radio.onchange = (e) => this.handleShippingChange(e);
        });

        // Manejar envío del formulario
        if (this.elements.checkoutForm) {
            this.elements.checkoutForm.onsubmit = (e) => this.handleFormSubmit(e);
        }
    }

    handleShippingChange(e) {
        if (this.elements.agenciaSelect) {
            this.elements.agenciaSelect.style.display = 
                e.target.value === 'provincia' ? 'block' : 'none';
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Validaciones
        if (!this.validateForm(data)) {
            return;
        }

        const message = this.generateWhatsAppMessage(data);
        const whatsappUrl = SharedUtils.createWhatsAppLink(message, WHATSAPP_NUMBER);
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Limpiar carrito y cerrar modal
        this.cartManager.clearCart();
        this.closeModal();
        e.target.reset();
        
        SharedUtils.showToast('Pedido enviado a WhatsApp!');
    }

    validateForm(data) {
        if (!SharedUtils.validateDNI(data.dni)) {
            alert('DNI debe tener 8 dígitos');
            return false;
        }
        
        if (!SharedUtils.validatePhone(data.celular)) {
            alert('Celular debe tener 9 dígitos');
            return false;
        }
        
        return true;
    }

    generateWhatsAppMessage(data) {
        const cart = this.cartManager.getCart();
        
        let message = `Hola! Quiero hacer este pedido:\n\n`;
        
        // Listar productos
        cart.forEach(item => {
            const itemTotal = Number(item.price) * (item.quantity || 1);
            message += `• ${item.name} (x${item.quantity || 1}) - S/${SharedUtils.formatPrice(itemTotal)}\n`;
        });
        
        // Total
        const total = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
        message += `\nTOTAL: S/${SharedUtils.formatPrice(total)}\n\n`;
        
        // Datos del cliente
        message += `Datos:\n`;
        message += `• Nombre: ${data.nombre}\n`;
        message += `• DNI: ${data.dni}\n`;
        message += `• Celular: ${data.celular}\n`;
        message += `• Dirección: ${data.direccion}\n`;
        message += `• Envío: ${data.envio}`;
        
        if (data.envio === 'provincia' && data.agencia) {
            message += ` (${data.agencia})`;
        }
        
        message += `\n• Pago: ${data.pago}`;
        
        return message;
    }

    closeModal() {
        if (this.elements.checkoutModal) {
            this.elements.checkoutModal.classList.remove('active');
        }
    }
}
