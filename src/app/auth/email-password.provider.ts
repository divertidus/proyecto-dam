// email-password-auth.provider.ts

import { UserDocument } from '../interfaces/interfaces'; // Importa la interfaz del documento de usuario
import { AuthProvider } from './authProvider';

export class EmailPasswordAuthProvider implements AuthProvider {
    async login(credentials: { email: string; password: string }): Promise<UserDocument> {
        // Aquí implementar la lógica real para autenticar al usuario
        // Esto es solo un ejemplo para propósitos de demostración
        // Retorna un usuario simulado
        return {
            name: 'Usuario Email',
            email: credentials.email,
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