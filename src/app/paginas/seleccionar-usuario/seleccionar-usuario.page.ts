import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { UserListComponent } from "../../componentes/usuario/user-list/user-list.component";
import { Router } from '@angular/router';
import { GestionUsuariosComponent } from "../../componentes/usuario/gestion-usuarios/gestion-usuarios.component";
import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/services/database/usuario.service';
import { DatabaseService } from 'src/app/services/database/database.service';

@Component({
  selector: 'app-seleccionar-usuario',
  templateUrl: './seleccionar-usuario.page.html',
  styleUrls: ['./seleccionar-usuario.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonButton, IonFooter, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, UserListComponent, GestionUsuariosComponent]
})
export class SeleccionarUsuarioPage implements OnInit {


  usuarios: Usuario[] = []; // Variable que almacena la lista de usuarios obtenida de la base de datos.
  usuarioLogeado: Usuario | null = null; // Almacena el usuario que está actualmente logueado.
  isLoading: boolean = false;  // Bandera para indicar si los datos están cargando

  constructor(
    private databaseService: DatabaseService,
    private usuarioService: UsuarioService,
    private router: Router,
  ) {

  }

  ngOnInit() {
    // this.cargarUsuarios();  // No es necesario cargar usuarios aquí
    console.log('se muestra pantalla')
  }

  ionViewWillEnter() {
    this.cargarUsuarios(); // Recarga la lista de usuarios cuando la vista está activa
  }

  // Método para reiniciar la base de datos
  async reiniciarBaseDatos() {
    const confirmacion = confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.');
    if (confirmacion) {
      await this.databaseService.eliminarBaseDatos();
      console.log('Base de datos reiniciada');
    }
  }

  async cargarUsuarios(): Promise<void> {
    this.isLoading = true; // Mostrar el spinner mientras se cargan los usuarios
    try {
      this.usuarios = await this.usuarioService.obtenerUsuarios();
      console.log('Usuarios cargados:', this.usuarios);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      this.isLoading = false; // Ocultar el spinner cuando finalice la carga
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
