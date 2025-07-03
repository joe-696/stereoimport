// Script de prueba para las animaciones del carrito
console.log('🧪 Iniciando pruebas de animaciones del carrito');

// Función para simular agregar producto al carrito
window.testCartAnimations = function() {
    console.log('🧪 Ejecutando prueba de animaciones del carrito');
    
    // Crear un producto de prueba
    const testProduct = document.createElement('div');
    testProduct.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 200px;
        height: 200px;
        background: white;
        border: 2px solid #4ecdc4;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        transform: translate(-50%, -50%);
        font-family: Arial, sans-serif;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    `;
    testProduct.innerHTML = `
        <div>
            <img src="https://via.placeholder.com/80x80/4ecdc4/white?text=TEST" style="border-radius: 8px; margin-bottom: 10px;">
            <div style="font-size: 14px; font-weight: bold;">Producto de Prueba</div>
            <div style="font-size: 12px; color: #666;">S/99.99</div>
        </div>
    `;
    
    document.body.appendChild(testProduct);
    
    // Simular botón del carrito
    const cartButton = document.querySelector('[id*="cart"]') || document.createElement('div');
    if (!cartButton.parentNode) {
        cartButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #4ecdc4;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            z-index: 1001;
        `;
        cartButton.innerHTML = '🛒';
        document.body.appendChild(cartButton);
    }
    
    // Inicializar animaciones si no existen
    if (typeof CartAnimations !== 'undefined') {
        const animations = new CartAnimations();
        
        // Ejecutar animación después de un breve delay
        setTimeout(() => {
            animations.animateAddToCart(
                testProduct, 
                'Producto de Prueba', 
                'https://via.placeholder.com/80x80/4ecdc4/white?text=TEST', 
                cartButton
            );
            
            // Limpiar después de 5 segundos
            setTimeout(() => {
                if (testProduct.parentNode) {
                    testProduct.parentNode.removeChild(testProduct);
                }
                if (!document.querySelector('[id*="cart"]') && cartButton.parentNode) {
                    cartButton.parentNode.removeChild(cartButton);
                }
            }, 5000);
        }, 500);
        
        console.log('✅ Prueba de animaciones ejecutada correctamente');
    } else {
        console.error('❌ CartAnimations no disponible para pruebas');
        // Limpiar elementos de prueba
        setTimeout(() => {
            if (testProduct.parentNode) {
                testProduct.parentNode.removeChild(testProduct);
            }
        }, 2000);
    }
};

// Agregar botón de prueba en modo desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            const testButton = document.createElement('button');
            testButton.textContent = '🧪 Probar Animaciones';
            testButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 9999;
                background: #e74c3c;
                color: white;
                border: none;
                padding: 12px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
            `;
            testButton.onclick = window.testCartAnimations;
            document.body.appendChild(testButton);
            
            console.log('🧪 Botón de prueba agregado (solo en desarrollo)');
        }, 1000);
    });
}
