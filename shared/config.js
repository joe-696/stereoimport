// Configuración central compartida para toda la aplicación
export const firebaseConfig = {
    apiKey: "AIzaSyD5aX2lbcqvhAgG8EsJQf_MPH4tHZ5QH6Y",
    authDomain: "sagitariojbl1.firebaseapp.com",
    projectId: "sagitariojbl1",
    storageBucket: "sagitariojbl1.firebasestorage.app",
    messagingSenderId: "424267774202",
    appId: "1:424267774202:web:0be71a6adeacfe434f3143"
};

// Número de WhatsApp para pedidos
export const WHATSAPP_NUMBER = '51931292396';

// URLs de navegación
export const NAVIGATION_URLS = {
    HOME: 'https://stereoimport.com/',
    PRODUCTS: '../productos/',
    SHOW: '../show/',
    CATEGORIA: '../categoria/',
    CHECKOUT: '../checkout/'
};

// Configuración de la aplicación
export const APP_CONFIG = {
    NAME: 'Stereo Importaciones',
    VERSION: '1.0.0',
    DEBUG: false, // Cambiar a false en producción
    CURRENCY: 'S/',
    DEFAULT_IMAGE: 'https://via.placeholder.com/250',
    firebaseConfig: firebaseConfig
};
