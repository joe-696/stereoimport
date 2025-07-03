// Utilidades generales
export class Utils {
    // Mostrar mensajes toast
    static showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.background = isError ? '#e53e3e' : '#2d3748';
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Cambiar estado de botón a loading
    static setButtonLoading(button, isLoading, originalText) {
        if (isLoading) {
            button.innerHTML = '<span class="loading-spinner"></span> Procesando...';
            button.disabled = true;
        } else {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    // Validar email autorizado
    static isAuthorizedEmail(email, authorizedEmails) {
        return authorizedEmails.includes(email);
    }

    // Formatear precio
    static formatPrice(price) {
        return (price !== undefined && price !== null) 
            ? `$${Number(price).toFixed(2)}` 
            : '<em>Sin precio</em>';
    }

    // Formatear descripción truncada
    static formatDescription(description, maxLength = 100) {
        if (!description) return '';
        
        if (description.length > maxLength) {
            return description.substring(0, maxLength).replace(/\n/g, '<br>') + '...';
        }
        return description.replace(/\n/g, '<br>');
    }

    // Validar datos del producto
    static validateProductData(sagitario, title, description, precio, categoria) {
        if (!sagitario || !title || !description || isNaN(precio) || precio <= 0 || !categoria) {
            return {
                isValid: false,
                message: "Por favor, completa todos los campos con datos válidos (excepto los precios promocionales y las imágenes adicionales que son opcionales)."
            };
        }
        return { isValid: true };
    }

    // Limpiar formulario
    static clearForm(formInputs) {
        formInputs.forEach(input => {
            if (input.type === 'select-one') {
                input.selectedIndex = 0;
            } else {
                input.value = '';
            }
        });
    }
}
