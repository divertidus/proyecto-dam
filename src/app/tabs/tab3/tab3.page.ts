import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { ToolbarLoggedComponent } from 'src/app/componentes/toolbar-logged/toolbar-logged.component';


@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule,ToolbarLoggedComponent]  // Importamos los módulos necesarios
})
export class Tab3Page implements OnInit {

  usuarios: Usuario[] = [];
  usuario: Usuario = { _id: '', entidad: 'usuario', nombre: '', email: '', timestamp: '' };
  usuarioEnEdicion = false;

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit() {
    this.cargarUsuarios();  // Cargar los usuarios al iniciar la página
  }

  // Método para cargar todos los usuarios
  async cargarUsuarios() {
    try {
      this.usuarios = await this.usuarioService.obtenerUsuarios();  // Obtenemos los usuarios desde el servicio
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  }

  // Método para guardar (crear o actualizar) un usuario
  async guardarUsuario() {
    if (!this.usuario.nombre || !this.usuario.email) {
      console.log('Por favor ingresa un nombre y un email');
      return;
    }

    if (this.usuarioEnEdicion) {
      // Actualizamos el usuario
      try {
        await this.usuarioService.actualizarUsuario(this.usuario);
        console.log('Usuario actualizado con éxito');
        this.usuarioEnEdicion = false;  // Salimos del modo edición
      } catch (error) {
        console.error('Error actualizando usuario:', error);
      }
    } else {
      // Agregamos un nuevo usuario
      try {
        await this.usuarioService.agregarUsuario(this.usuario);
        console.log('Usuario añadido con éxito');
      } catch (error) {
        console.error('Error agregando usuario:', error);
      }
    }

    // Limpiamos el formulario y recargamos la lista de usuarios
    this.usuario = { _id: '', entidad: 'usuario', nombre: '', email: '', timestamp: '' };
    this.cargarUsuarios();
  }

  // Método para eliminar un usuario
  async eliminarUsuario(usuario: Usuario) {
    try {
      await this.usuarioService.eliminarUsuario(usuario);
      console.log('Usuario eliminado con éxito');
      this.cargarUsuarios();  // Recargamos la lista después de eliminar
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  }

  // Método para editar un usuario
  editarUsuario(usuario: Usuario) {
    this.usuario = { ...usuario };  // Copiamos los datos del usuario al formulario
    this.usuarioEnEdicion = true;  // Activamos el modo edición
  }
}
