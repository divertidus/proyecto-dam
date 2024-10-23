// paginas/seleccionar-usuario/seleccionar-usuario.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButton } from '@ionic/angular/standalone';
import { UserListComponent } from "../../componentes/usuario/user-list/user-list.component";
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { GestionUsuariosComponent } from "../../componentes/usuario/gestion-usuarios/gestion-usuarios.component";
import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-seleccionar-usuario',
  templateUrl: './seleccionar-usuario.page.html',
  styleUrls: ['./seleccionar-usuario.page.scss'],
  standalone: true,
  imports: [IonButton, IonFooter, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, UserListComponent, GestionUsuariosComponent]
})
export class SeleccionarUsuarioPage implements OnInit {


  usuarios: Usuario[] = []; // Variable que almacena la lista de usuarios obtenida de la base de datos.
  usuarioLogeado: Usuario | null = null; // Almacena el usuario que está actualmente logueado.

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
  ) {

  }

  ngOnInit() {
    this.cargarUsuarios();  // No es necesario cargar usuarios aquí
  }

  ionViewWillEnter() {
    this.cargarUsuarios(); // Recarga la lista de usuarios cuando la vista está activa
  }

  async cargarUsuarios(): Promise<void> {
    try {
      this.usuarios = await this.usuarioService.obtenerUsuarios(); // Llama al servicio de base de datos para obtener todos los usuarios.
    } catch (err) {
      console.error('Error cargando usuarios:', err); // Manejo de errores.
    }
  }

  irCrearUsuario() {
    console.log('click')
    this.router.navigate(['/crear-usuario']); // Redirigir a la página de creación de usuario
  }

  irAdministrarUsuarios() {
    console.log('click')
    this.router.navigate(['/administrar-usuarios']); // Redirigir a la página de creación de usuario
  }

}
