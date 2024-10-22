// 1. Componente Tab1 (src/app/tab1/tab1.page.ts)
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { UserFormComponent } from "../../componentes/usuario/user-form/user-form.component";
import { UserListComponent } from "../../componentes/usuario/user-list/user-list.component";
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { Rutina } from 'src/app/models/rutina.model';
import { RutinaService } from 'src/app/services/rutina.service';
import { Subscription } from 'rxjs';
import { ToolbarLoggedComponent } from 'src/app/componentes/toolbar-logged/toolbar-logged.component';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioService } from 'src/app/services/ejercicio.service';



@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgFor, NgIf, UserFormComponent, UserListComponent, ToolbarLoggedComponent]
})
export class Tab1Page implements OnInit, OnDestroy {
abrirModalAgregarDia(_t19: Rutina,$event: MouseEvent) {
throw new Error('Method not implemented.');
}

  usuarioLogeado: Usuario | null = null;
  rutinas: Rutina[] = [];
  ejercicios: Ejercicio[] = []; // Lista de todos los ejercicios
  rutinaExpandida: string | null = null; // Propiedad para controlar cuál rutina está expandida
  private rutinaSubscription: Subscription;
  private usuarioSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private rutinaService: RutinaService,
    private ejercicioService: EjercicioService, // Añadimos el servicio de ejercicios
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    // Suscribirse a cambios del usuario logueado
    this.usuarioSubscription = this.authService.usuarioLogeado$.subscribe(usuario => {
      this.usuarioLogeado = usuario;
      if (this.usuarioLogeado) {
        // Cargar las rutinas cada vez que cambia el usuario logueado
        this.rutinaService.cargarRutinas();
        // Cargar los ejercicios para tener los nombres disponibles
        this.cargarEjercicios();
      } else {
        // Si no hay usuario logueado, vaciar la lista de rutinas
        this.rutinas = [];
      }
    });

    // Suscribirse a cambios en las rutinas almacenadas
    this.rutinaSubscription = this.rutinaService.rutinas$.subscribe(rutinas => {
      // Filtrar solo las rutinas del usuario logueado
      if (this.usuarioLogeado) {
        this.rutinas = rutinas.filter(rutina => rutina.usuarioId === this.usuarioLogeado?._id);
      } else {
        this.rutinas = [];
      }
    });
  }

  ngOnDestroy() {
    // Desuscribimos para evitar fugas de memoria
    if (this.rutinaSubscription) {
      this.rutinaSubscription.unsubscribe();
    }
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  // Cargar los ejercicios desde el servicio
  async cargarEjercicios() {
    this.ejercicios = await this.ejercicioService.obtenerEjercicios();
  }

  // Obtener el nombre del ejercicio por ID
  obtenerNombreEjercicio(ejercicioId: string): string {
    const ejercicio = this.ejercicios.find(e => e._id === ejercicioId);
    return ejercicio ? ejercicio.nombre : 'Ejercicio desconocido';
  }

  // Alternar si la rutina está expandida o no
  toggleExpandirRutina(rutina: Rutina) {
    this.rutinaExpandida = this.rutinaExpandida === rutina._id ? null : rutina._id;
  }

  // Crear una nueva rutina
  crearNuevaRutina() {
    this.router.navigate(['/tabs/tab5']);
  }

  // Modificar una rutina existente para añadir más EjercicioPlan[]
  async modificarRutina(rutina: Rutina, event: Event) {
    event.stopPropagation(); // Evitar que se active el evento de expandir rutina cuando se hace clic en "Modificar"

    const alert = await this.alertController.create({
      header: 'Agregar Ejercicio',
      inputs: [
        {
          name: 'ejercicioId',
          type: 'text',
          placeholder: 'ID del Ejercicio'
        },
        {
          name: 'series',
          type: 'number',
          placeholder: 'Número de Series'
        },
        {
          name: 'repeticiones',
          type: 'number',
          placeholder: 'Número de Repeticiones'
        },
        {
          name: 'notas',
          type: 'text',
          placeholder: 'Notas (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Añadir',
          handler: (data) => {
            if (data.ejercicioId && data.series && data.repeticiones) {
              const nuevoEjercicio = {
                ejercicioId: data.ejercicioId,
                series: data.series,
                repeticiones: data.repeticiones,
                notas: data.notas
              };
              rutina.dias[0].ejercicios.push(nuevoEjercicio); // Añadir el nuevo ejercicio al primer día
              this.rutinaService.actualizarRutina(rutina).then(() => {
                console.log('Rutina actualizada');
              });
            } else {
              console.error('Faltan datos para añadir el ejercicio.');
            }
          }
        }
      ]
    });

    await alert.present();
  }
}