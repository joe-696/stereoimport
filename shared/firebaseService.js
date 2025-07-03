// Servicio Firebase compartido
import { firebaseConfig } from './config.js';

export class FirebaseService {
    constructor() {
        this.db = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return this.db;
        
        try {
            // Verificar si Firebase ya está cargado
            if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
                this.db = firebase.firestore();
                this.initialized = true;
                return this.db;
            }

            // Cargar Firebase SDK dinámicamente
            await this.loadFirebaseSDK();            // Inicializar Firebase
            const app = firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this.initialized = true;
            
            return this.db;
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            throw error;
        }
    }

    async loadFirebaseSDK() {
        // Cargar Firebase App
        await this.loadScript('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
        
        // Cargar Firestore
        await this.loadScript('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js');
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Verificar si el script ya está cargado
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }

    async getProducts() {
        if (!this.db) {
            throw new Error('Firebase not initialized');
        }

        const possibleCollections = ['productos', 'products', 'items', 'product'];
        
        for (const collectionName of possibleCollections) {
            try {
                const testSnapshot = await this.db.collection(collectionName).limit(1).get();
                if (!testSnapshot.empty) {
                    const snapshot = await this.db.collection(collectionName).get();
                    return snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                }
            } catch (error) {
                continue;
            }
        }
        
        throw new Error('No products collection found');
    }

    async getProductById(productId) {
        if (!this.db) {
            throw new Error('Firebase not initialized');
        }

        const possibleCollections = ['productos', 'products', 'items', 'product'];
        
        for (const collectionName of possibleCollections) {
            try {
                const doc = await this.db.collection(collectionName).doc(productId).get();
                if (doc.exists) {
                    return {
                        id: doc.id,
                        ...doc.data()
                    };
                }
            } catch (error) {
                continue;
            }
        }
        
        return null;
    }

    async getRelatedProducts(category, excludeId, limit = 6) {
        if (!this.db) {
            throw new Error('Firebase not initialized');
        }

        const possibleCollections = ['productos', 'products', 'items', 'product'];
        
        for (const collectionName of possibleCollections) {
            try {
                const testSnapshot = await this.db.collection(collectionName).limit(1).get();
                if (!testSnapshot.empty) {
                    let query = this.db.collection(collectionName);
                    
                    // Filtrar por categoría si se proporciona
                    if (category) {
                        query = query.where('category', '==', category);
                    }
                    
                    const snapshot = await query.limit(limit + 5).get(); // Traer más para filtrar excludeId
                    
                    const products = snapshot.docs
                        .map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }))
                        .filter(product => product.id !== excludeId) // Excluir el producto actual
                        .slice(0, limit); // Limitar la cantidad final
                    
                    return products;
                }
            } catch (error) {
                continue;
            }
        }
        
        return [];
    }
}

// Instancia singleton
export const firebaseService = new FirebaseService();
