// google-auth.provider.ts

import { Usuario } from '../models/usuario.model';
import { AuthProvider } from './authProvider';
import { CommonModule } from '@angular/common';


export class GoogleAuthProvider implements AuthProvider {

    async login(): Promise<Usuario> {
           // Genera un id temporal o de prueba para el usuario
           const idGenerado = this.generarId();
        // Implementar la lógica para autenticar con Google
        // Retorna un usuario simulado
        return {
            id: idGenerado,  // Asigna el id generado
            nombre: 'Usuario Google',
            email: 'user@google.com',
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