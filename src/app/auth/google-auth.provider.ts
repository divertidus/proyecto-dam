// google-auth.provider.ts

import { UserDocument } from '../interfaces/interfaces'; // Importa la interfaz del documento de usuario
import { AuthProvider } from './authProvider';
import { CommonModule } from '@angular/common';


export class GoogleAuthProvider implements AuthProvider {
    async login(): Promise<UserDocument> {
        // Implementar la lógica para autenticar con Google
        // Retorna un usuario simulado
        return {
            name: 'Usuario Google',
            email: 'user@google.com',
            timestamp: new Date().toISOString() // Este timestamp refleja el momento del inicio de sesión
        };
    }

    async logout(): Promise<void> {
        // Implementar aquí la lógica para cerrar sesión
    }

    getLoggedInUser(): UserDocument | null {
        // Implementar aquí la lógica para obtener el usuario logueado
        return null; // Retorna null hasta que se implemente la lógica real
    }
}