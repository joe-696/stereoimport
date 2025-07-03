# Stereo Importaciones - Show Product

## Estructura del Proyecto

Este proyecto ha sido modularizado para mejorar la mantenibilidad y escalabilidad del código.

### Estructura de Archivos

```
show/
├── show.html              # Archivo HTML principal
├── js/                    # Módulos JavaScript
│   ├── app.js            # Clase principal de la aplicación
│   ├── config.js         # Configuración y constantes
│   ├── utils.js          # Utilidades generales
│   ├── cart.js           # Gestión del carrito
│   ├── imageManager.js   # Gestión de imágenes y zoom
│   ├── firebaseService.js # Servicio de Firebase
│   ├── productManager.js # Gestión de productos
│   └── checkout.js       # Gestión del checkout
├── css/                   # Estilos CSS modulares
│   ├── variables.css     # Variables CSS y reset
│   ├── header.css        # Estilos del header
│   ├── product.css       # Estilos del producto
│   ├── buttons.css       # Estilos de botones
│   ├── modals.css        # Estilos de modales
│   ├── components.css    # Componentes generales
│   └── utilities.css     # Clases utilitarias
└── README.md             # Este archivo
```

## Módulos JavaScript

### 1. app.js
**Propósito**: Clase principal que inicializa y coordina todos los módulos.
- Instancia todos los managers
- Configura event listeners globales
- Gestiona la inicialización de la aplicación

### 2. config.js
**Propósito**: Configuración centralizada y constantes.
- Configuración de Firebase
- URLs y constantes de la aplicación
- Selectores CSS centralizados

### 3. utils.js
**Propósito**: Funciones utilitarias reutilizables.
- Formateo de precios y textos
- Validaciones
- Gestión de toasts
- Utilidades para WhatsApp y URLs

### 4. cart.js (CartManager)
**Propósito**: Gestión completa del carrito de compras.
- Agregar/eliminar productos
- Actualizar cantidades
- Persistencia en localStorage
- Renderizado de la interfaz del carrito

### 5. imageManager.js (ImageManager)
**Propósito**: Gestión de imágenes y funcionalidad de zoom.
- Manejo de múltiples imágenes
- Modal de zoom con navegación
- Thumbnails y navegación por teclado

### 6. firebaseService.js (FirebaseService)
**Propósito**: Interfaz con Firebase Firestore.
- Obtener productos
- Obtener productos relacionados
- Manejo de errores de conexión

### 7. productManager.js (ProductManager)
**Propósito**: Gestión de la visualización de productos.
- Renderizado de productos
- Productos relacionados
- Integración con otros módulos

### 8. checkout.js (CheckoutManager)
**Propósito**: Gestión del proceso de compra.
- Formulario de checkout
- Validaciones
- Generación de mensajes para WhatsApp

## Estilos CSS

### Variables CSS (variables.css)
- Variables de colores, fuentes y espaciado
- Reset básico y estilos base
- Sistema de design consistente

### Módulos CSS especializados
- **header.css**: Estilos del encabezado
- **product.css**: Estilos de la página de producto
- **buttons.css**: Estilos de botones y elementos interactivos
- **modals.css**: Estilos de modales y overlays
- **components.css**: Componentes reutilizables
- **utilities.css**: Clases utilitarias para espaciado, colores, etc.

## Ventajas de la Modularización

### Mantenibilidad
- Cada módulo tiene una responsabilidad específica
- Fácil localización y corrección de errores
- Código más legible y documentado

### Escalabilidad
- Fácil agregar nuevas funcionalidades
- Módulos independientes y reutilizables
- Posibilidad de testing unitario

### Reutilización
- Módulos pueden ser reutilizados en otros proyectos
- CSS modular permite personalización fácil
- Servicios independientes (Firebase, etc.)

### Performance
- Carga modular permite optimizaciones futuras
- CSS específico por funcionalidad
- Mejor gestión de memoria

## Uso

### Desarrollo
1. Todos los archivos CSS se cargan en orden en `show.html`
2. El JavaScript se inicializa desde `app.js` como módulo ES6
3. Cada módulo importa solo sus dependencias necesarias

### Agregar Nueva Funcionalidad

#### Nuevo módulo JS:
```javascript
// js/newFeature.js
export class NewFeature {
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.init();
    }
    
    init() {
        // Inicialización
    }
}
```

#### Nuevo CSS:
```css
/* css/newFeature.css */
.new-feature {
    /* Estilos usando variables CSS */
    color: var(--primary-color);
}
```

### Integración:
```javascript
// En app.js
import { NewFeature } from './newFeature.js';

class ShowApp {
    constructor() {
        // ...otros módulos
        this.newFeature = new NewFeature(dependencies);
    }
}
```

## Consideraciones Técnicas

- **ES6 Modules**: Uso de import/export para modularidad
- **CSS Custom Properties**: Variables CSS para consistencia
- **Event Delegation**: Gestión eficiente de eventos
- **Separation of Concerns**: Cada módulo maneja una responsabilidad
- **Mobile First**: Diseño responsive desde el inicio

## Futuros Mejoramientos

1. **Bundle de producción**: Usar webpack/rollup para optimización
2. **TypeScript**: Agregar tipos para mejor desarrollo
3. **Testing**: Unit tests para cada módulo
4. **Service Worker**: Cache para mejor performance
5. **Component Library**: Extraer componentes reutilizables
