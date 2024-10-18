// email-password-auth.provider.ts

import { Usuario } from '../models/usuario.model';
import { AuthProvider } from './authProvider';

export class EmailPasswordAuthProvider implements AuthProvider {

    async login(credentials: { email: string; password: string }): Promise<Usuario> {
          // Genera un id temporal o de prueba para el usuario
        const idGenerado = this.generarId();
        // Aquí implementar la lógica real para autenticar al usuario
        // Esto es solo un ejemplo para propósitos de demostración
        // Retorna un usuario simulado
          // Retorna un usuario simulado con todos los campos requeridos
        return {
            id: idGenerado,  // Asigna el id generado
            nombre: 'Usuario Email',
            email: credentials.email,
            timestamp: new Date().toISOString() // Este timestamp refleja el momento del inicio de sesión
        };
    }

    async logout(): Promise<void> {
        // Implementar aquí la lógica para cerrar sesión
    }

    getUsuarioLogeado(): Usuario | null {
        // Implementar aquí la lógica para obtener el usuario logueado
        return null; // Retorna null hasta que se implemente la lógica real
    }
    private generarId(): string {
        // Generar un id único. Aquí puedes usar cualquier método para generar el id
        return Math.random().toString(36).substr(2, 9); // Ejemplo de id generado con Math.random
    }
}