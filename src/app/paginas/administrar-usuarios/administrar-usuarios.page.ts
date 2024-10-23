import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import { IonToolbar, IonTitle, IonContent, IonButton, IonLabel, IonListHeader, IonItem, IonList } from "@ionic/angular/standalone";

@Component({
  selector: 'app-administrar-usuarios',
  templateUrl: './administrar-usuarios.page.html',
  styleUrls: ['./administrar-usuarios.page.scss'],
  standalone: true,
  imports: [IonList, IonItem, IonListHeader, IonLabel, IonButton, IonContent, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AdministrarUsuariosPage implements OnInit {

  usuarios: Usuario[] = [];
  usuario: Usuario = { _id: '', entidad: 'usuario', nombre: '', email: '', timestamp: '' };
  usuarioEnEdicion = false;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private alertController: AlertController // Inyectamos AlertController
  ) { }

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

  // Método para editar un usuario usando un alert
  async editarUsuario(usuario: Usuario) {
    const alert = await this.alertController.create({
      header: 'Editar Usuario',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: usuario.nombre,
          placeholder: 'Nombre'
        },
        {
          name: 'email',
          type: 'email',
          value: usuario.email,
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Edición cancelada');
          }
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.nombre && data.email) {
              usuario.nombre = data.nombre;
              usuario.email = data.email;
              try {
                await this.usuarioService.actualizarUsuario(usuario);
                console.log('Usuario actualizado con éxito');
                this.cargarUsuarios();  // Recargamos la lista después de actualizar
              } catch (error) {
                console.error('Error actualizando usuario:', error);
              }
            } else {
              console.error('Faltan datos para actualizar el usuario.');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  salir() {
    this.router.navigate(['..']); // Navega a la página anterior
  }
}
