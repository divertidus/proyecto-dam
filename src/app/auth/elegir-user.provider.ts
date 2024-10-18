// user-selection-auth.provider.ts

 // Importa la interfaz del documento de usuario
import { Usuario } from '../models/usuario.model';
import { AuthProvider } from './authProvider';


export class ProveedorSeleccionUsuario implements AuthProvider {
  private usuarioSeleccionado: Usuario | null = null;

  // Método para seleccionar un usuario
  elegirUsuario(user: Usuario): void {
    this.usuarioSeleccionado = user; // Almacena el usuario seleccionado
  }

  // Método para iniciar sesión
  async login(): Promise<Usuario> {
    if (!this.usuarioSeleccionado) {
      throw new Error('No hay usuario seleccionado'); // Lanza un error si no hay usuario
    }
    return this.usuarioSeleccionado; // Devuelve el usuario seleccionado como usuario logueado
  }

  async logout(): Promise<void> {
    this.usuarioSeleccionado = null; // Limpia el usuario seleccionado
  }

  getUsuarioLogeado(): Usuario | null {
    return this.usuarioSeleccionado; // Retorna el usuario seleccionado
  }
}