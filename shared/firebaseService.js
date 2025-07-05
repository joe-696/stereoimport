// Servicio Firebase compartido
import { firebaseConfig } from './config.js';

export class FirebaseService {
    constructor() {
        this.db = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            console.log('🔄 Firebase already initialized');
            return this.db;
        }
        
        try {
            console.log('🚀 Initializing Firebase service...');
            
            // Verificar si Firebase ya está cargado
            if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
                console.log('✅ Firebase SDK already loaded, using existing instance');
                this.db = firebase.firestore();
                this.initialized = true;
                return this.db;
            }

            // Cargar Firebase SDK dinámicamente
            console.log('📦 Loading Firebase SDK...');
            await this.loadFirebaseSDK();
            
            console.log('⚙️ Initializing Firebase app...');
            // Inicializar Firebase
            const app = firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this.initialized = true;
            
            console.log('✅ Firebase initialized successfully');
            console.log('🔧 Firebase config:', { 
                projectId: firebaseConfig.projectId,
                authDomain: firebaseConfig.authDomain 
            });
            
            return this.db;
        } catch (error) {
            console.error('❌ Error initializing Firebase:', error);
            console.error('❌ Firebase config:', firebaseConfig);
            throw new Error(`Failed to initialize Firebase: ${error.message}`);
        }
    }

    async loadFirebaseSDK() {
        console.log('📥 Loading Firebase App SDK...');
        // Cargar Firebase App
        await this.loadScript('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
        console.log('✅ Firebase App SDK loaded');
        
        console.log('📥 Loading Firestore SDK...');
        // Cargar Firestore
        await this.loadScript('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js');
        console.log('✅ Firestore SDK loaded');
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
            throw new Error('Firebase not initialized. Call initialize() first.');
        }

        console.log('🔍 Searching for products in Firebase collections...');
        const possibleCollections = ['productos', 'products', 'items', 'product'];
        
        for (const collectionName of possibleCollections) {
            try {
                console.log(`🔎 Checking collection: ${collectionName}`);
                const testSnapshot = await this.db.collection(collectionName).limit(1).get();
                if (!testSnapshot.empty) {
                    console.log(`✅ Found products in collection: ${collectionName}`);
                    const snapshot = await this.db.collection(collectionName).get();
                    const products = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    console.log(`📦 Retrieved ${products.length} products from ${collectionName}`);
                    return products;
                }
            } catch (error) {
                console.warn(`⚠️ Error checking collection ${collectionName}:`, error.message);
                continue;
            }
        }
        
        throw new Error(`No products found in any of these collections: ${possibleCollections.join(', ')}`);
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

    async getCategories() {
        if (!this.db) {
            throw new Error('Firebase not initialized');
        }

        try {
            console.log('🔍 Getting categories from Firebase...');
            const snapshot = await this.db.collection('categories').get();
            
            const categories = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(category => category.active === true) // Filtrar en cliente
                .sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Ordenar en cliente
            
            console.log(`✅ Loaded ${categories.length} active categories`);
            return categories;
        } catch (error) {
            console.error('❌ Error getting categories:', error);
            throw error;
        }
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
