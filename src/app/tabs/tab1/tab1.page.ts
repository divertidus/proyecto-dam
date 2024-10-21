// 1. Componente Tab1 (src/app/tab1/tab1.page.ts)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';
import { UserFormComponent } from "../../componentes/user-form/user-form.component";
import { UserListComponent } from "../../componentes/user-list/user-list.component";
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';


@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, UserFormComponent, UserListComponent]
})
export class Tab1Page {

  usuarios: Usuario[] = []; // Variable que almacena la lista de usuarios obtenida de la base de datos.
  usuarioLogeado: Usuario | null = null; // Almacena el usuario que está actualmente logueado.

  // Constructor del componente, que inyecta el servicio de base de datos (dbService) y el de autenticación (authService).
  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router) {
    this.cargarUsuarios(); // Al inicializar el componente, se cargan los usuarios desde la base de datos.

    // Obtiene el usuario actualmente logueado desde el servicio de autenticación y lo guarda en la variable 'loggedInUser'.
    this.usuarioLogeado = this.authService.getUsuarioLogeado();
  }

  // Método que carga todos los usuarios desde la base de datos.
  async cargarUsuarios(): Promise<void> {
    try {
      this.usuarios = await this.usuarioService.obtenerUsuarios(); // Llama al servicio de base de datos para obtener todos los usuarios.
    } catch (err) {
      console.error('Error cargando usuarios:', err); // Manejo de errores.
    }
  }

  // Método que se ejecuta cuando un nuevo usuario es añadido, recargando la lista de usuarios.
  manejadorUsuarioAdded(): void {
    this.cargarUsuarios(); // Se vuelve a cargar la lista de usuarios después de añadir uno nuevo.
  }

  // Método para mostrar el usuario logueado. 
  // Este método actualiza la variable 'loggedInUser' cada vez que se llama, obteniendo el valor actual del servicio de autenticación.
  mostrarUsuarioLogeado(): string {
    this.usuarioLogeado = this.authService.getUsuarioLogeado(); // Actualiza el usuario logueado llamando al servicio.

    // Retorna el nombre del usuario logueado o un mensaje por defecto si no hay ningún usuario logueado.
    return this.usuarioLogeado ? `Usuario: ${this.usuarioLogeado.nombre}` : 'Nadie está logueado';
  }

  // Método para cerrar sesión.
  logout(): void {
    this.authService.logout(); // Llama al método logout del servicio de autenticación.
    this.usuarioLogeado = null; // Limpia la referencia del usuario logueado en este componente.
    this.router.navigate(['/seleccionar-usuario'])
  }
}