// Gestor de autenticación
import { APP_CONFIG } from './config.js';
import { Utils } from './utils.js';

export class AuthManager {
    constructor(auth) {
        this.auth = auth;
        this.authorizedEmails = APP_CONFIG.AUTHORIZED_EMAILS;
    }

    

    // Inicializar verificación de autenticación
    async initializeAuth(onAuthSuccess) {
        const authResult = await this.checkAuthentication();
        
        if (authResult.isAuthenticated) {
            document.body.style.display = 'flex';
            if (onAuthSuccess) {
                onAuthSuccess(authResult.user);
            }
        } else {
            this.handleUnauthorizedAccess();
        }
    }
}
