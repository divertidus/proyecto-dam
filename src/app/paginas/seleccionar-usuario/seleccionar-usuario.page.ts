// paginas/seleccionar-usuario/seleccionar-usuario.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButton } from '@ionic/angular/standalone';
import { UserListComponent } from "../../componentes/user-list/user-list.component";
import { UserDocument } from 'src/app/interfaces/interfaces';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { GestionUsuariosComponent } from "../../componentes/gestion-usuarios/gestion-usuarios.component";

@Component({
  selector: 'app-seleccionar-usuario',
  templateUrl: './seleccionar-usuario.page.html',
  styleUrls: ['./seleccionar-usuario.page.scss'],
  standalone: true,
  imports: [IonButton, IonFooter, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, UserListComponent, GestionUsuariosComponent]
})
export class SeleccionarUsuarioPage implements OnInit {


  usuarios: UserDocument[] = []; // Variable que almacena la lista de usuarios obtenida de la base de datos.
  usuarioLogeado: UserDocument | null = null; // Almacena el usuario que está actualmente logueado.

  constructor(
    private dbService: DatabaseService,
    private router: Router,
  ) {
    //this.cargarUsuarios();
  }

  ngOnInit() {
    // this.cargarUsuarios();  // No es necesario cargar usuarios aquí
  }

  /*   async cargarUsuarios(): Promise<void> {
      try {
        this.usuarios = await this.dbService.getAllUsers(); // Llama al servicio de base de datos para obtener todos los usuarios.
      } catch (err) {
        console.error('Error cargando usuarios:', err); // Manejo de errores.
      }
    } */

  irCrearUsuario() {
    this.router.navigate(['/crear-usuario']); // Redirigir a la página de creación de usuario
  }

}
