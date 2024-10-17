// user-selection-auth.provider.ts

import { UserDocument } from '../interfaces/interfaces'; // Importa la interfaz del documento de usuario
import { AuthProvider } from './authProvider';


export class ElegirUserAuthProvider implements AuthProvider {
    private selectedUser: UserDocument | null = null;
  
    // Método para seleccionar un usuario
    selectUser(user: UserDocument): void {
      this.selectedUser = user; // Almacena el usuario seleccionado
    }
  
    // Método para iniciar sesión
    async login(): Promise<UserDocument> {
      if (!this.selectedUser) {
        throw new Error('No hay usuario seleccionado'); // Lanza un error si no hay usuario
      }
      return this.selectedUser; // Devuelve el usuario seleccionado como usuario logueado
    }
  
    async logout(): Promise<void> {
      this.selectedUser = null; // Limpia el usuario seleccionado
    }
  
    getLoggedInUser(): UserDocument | null {
      return this.selectedUser; // Retorna el usuario seleccionado
    }
  }