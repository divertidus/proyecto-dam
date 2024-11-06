import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButton, IonSpinner, IonAlert, IonIcon, IonAvatar } from '@ionic/angular/standalone';
import { UserListComponent } from "../../componentes/usuario/user-list/user-list.component";
import { Router } from '@angular/router';

import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/services/database/usuario.service';
import { DatabaseService } from 'src/app/services/database/database.service';
import { Subscription } from 'rxjs';
import { ReiniciarDatosService } from 'src/app/services/reiniciar-datos.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-seleccionar-usuario',
  templateUrl: './seleccionar-usuario.page.html',
  styleUrls: ['./seleccionar-usuario.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonIcon, IonAlert, IonSpinner, IonButton, IonFooter, IonContent, IonHeader,
    IonTitle, IonToolbar, CommonModule, FormsModule, UserListComponent],
  providers: [AlertController]
})
export class SeleccionarUsuarioPage implements OnInit {

  usuarios: Usuario[] = []; // Variable que almacena la lista de usuarios obtenida de la base de datos.
  usuarioLogeado: Usuario | null = null; // Almacena el usuario que está actualmente logueado.
  isLoading: boolean = false;  // Bandera para indicar si los datos están cargando
  private usuariosSubscription: Subscription;

  constructor(
    private databaseService: DatabaseService,
    private usuarioService: UsuarioService,
    private router: Router,
    private reiniciarDatosService: ReiniciarDatosService,
    private alertController: AlertController
  ) {
    console.log('Instancia de DatabaseService:', this.databaseService);
    if (typeof this.databaseService.obtenerBaseDatos === 'function') {
      console.log('Método obtenerBaseDatos existe');
    } else {
      console.error('Método obtenerBaseDatos no existe o no es una función');
    }
  }

  ngOnInit() {
    // Suscribirse al Observable de usuarios
    this.usuariosSubscription = this.usuarioService.usuarios$.subscribe((usuarios) => {
      this.usuarios = usuarios;
      this.isLoading = false;
    });
    this.usuarioService.cargarUsuarios(); // Inicializar carga
  }

  ionViewWillEnter() {
    this.cargarUsuarios(); // Recarga la lista de usuarios cuando la vista está activa
  }

  ngOnDestroy() {
    if (this.usuariosSubscription) {
      this.usuariosSubscription.unsubscribe();
    }
  }

  // Método para mostrar una alerta de confirmación antes de reiniciar la base de datos
  async reiniciarBaseDatos() {
    const alert = await this.alertController.create({
      header: 'Confirmar Reinicio',
      message: '¿Estás seguro de que quieres reiniciar la base de datos? Esta acción eliminará todos los datos.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Reinicio de base de datos cancelado');
          },
        },
        {
          text: 'Aceptar',
          handler: async () => {
            this.isLoading = true;
            try {
              await this.reiniciarDatosService.reiniciarYInicializarDatos(); // Método sin verificación
              console.log('Base de datos reiniciada y datos inicializados.');
              this.cargarUsuarios(); // Recargar los usuarios después del reinicio
            } catch (error) {
              console.error('Error al reiniciar la base de datos:', error);
            } finally {
              this.isLoading = false;
            }
          },
        },
      ],
    });

    await alert.present();
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
