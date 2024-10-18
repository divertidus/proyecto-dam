// service/usuario.service.ts
import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(private databaseService: DatabaseService) { }

  // Agregar un nuevo usuario
  async agregarUsuario(nombre: string, email: string, imagenPerfil?: string) {
    return this.databaseService.addUsuario(nombre, email, imagenPerfil);
  }

  // Obtener todos los usuarios
  async obtenerUsuarios() {
    return this.databaseService.getAllUsers();
  }

  // Obtener un usuario específico
  async obtenerUsuario(nombre: string) {
    const query = {
      selector: { nombre: { $eq: nombre } } // Puedes cambiar el selector según lo que necesites
    };
    return this.databaseService.getUsuario(query);
  }

  // Actualizar un usuario
  async actualizarUsuario(usuario: any) {
    return this.databaseService.updateUsuario(usuario);
  }

  // Eliminar un usuario
  async eliminarUsuario(usuario: any) {
    return this.databaseService.deleteUsuario(usuario);
  }
}