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
import { ModalController } from '@ionic/angular';
import { DiaRutina, Rutina } from 'src/app/models/rutina.model';
import { RutinaService } from 'src/app/services/rutina.service';
import { Subscription } from 'rxjs';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { FormDiaComponent } from 'src/app/componentes/rutina/form-dia/form-dia.component';
import { ToolbarLoggedComponent } from 'src/app/componentes/toolbar-logged/toolbar-logged.component';





@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgFor, NgIf, UserFormComponent, FormDiaComponent,
    UserListComponent, ToolbarLoggedComponent]
})
export class Tab1Page implements OnInit, OnDestroy {

  abrirModalAgregarDia(_t19: Rutina, $event: MouseEvent) {
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
    private alertController: AlertController,
    private modalController: ModalController
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


  async abrirFormularioDia(rutina?: Rutina, event?: Event) {
    console.log('Intentando abrir el formulario de día para añadir'); // Depuración

    if (event) {
      event.stopPropagation(); // Evitar la propagación del clic si es necesario
    }

    try {
      const modal = await this.modalController.create({
        component: FormDiaComponent,
        componentProps: {
          ejercicios: this.ejercicios, // Pasar la lista de ejercicios
          diaExistente: null, // No pasamos día existente porque es para añadir un nuevo día
          modo: 'crear', // Siempre será modo "crear" cuando estamos añadiendo un nuevo día
          numeroDiasExistentes: rutina ? rutina.dias.length : 0 // Número de días existentes en la rutina
        }
      });

      console.log('Modal creado con éxito'); // Depuración
      await modal.present();
      console.log('Modal presentado con éxito'); // Depuración

      const { data } = await modal.onDidDismiss();
      console.log('Datos recibidos al cerrar el modal:', data); // Depuración

      if (data) {
        this.guardarNuevoDiaEnRutina(rutina, data);
      }

    } catch (error) {
      console.error('Error al intentar abrir el modal:', error);
    }
  }

  guardarNuevoDiaEnRutina(rutina: Rutina | undefined, dia: DiaRutina) {
    if (rutina) {
      // Si la rutina existe, añadir el día a la rutina existente
      rutina.dias.push(dia);
      this.rutinaService.actualizarRutina(rutina).then(() => {
        console.log('Nuevo día añadido y rutina actualizada');
        this.rutinaService.cargarRutinas(); // Refrescar la lista de rutinas después de añadir el nuevo día
      });
    } else {
      // Si no hay rutina, crear una nueva con el día
      const nuevaRutina: Rutina = {
        nombre: 'Mi Primera Rutina',
        dias: [dia], // Añadir el día creado a la nueva rutina
        usuarioId: this.usuarioLogeado?._id || '',
        entidad: 'rutina',
        timestamp: new Date().toISOString()
      };
      this.rutinaService.agregarRutina(nuevaRutina).then(response => {
        nuevaRutina._id = response.id; // Guardar el ID generado
        console.log('Nueva rutina creada con éxito');
        this.rutinaService.cargarRutinas(); // Refrescar las rutinas
      });
    }
  }

  guardarNuevoDia(dia: DiaRutina) {
    if (this.rutinas.length === 0) {
      // Si no hay rutinas, crear una nueva con el primer día
      const nuevaRutina: Rutina = {
        nombre: 'Mi Primera Rutina',
        dias: [dia], // Añadir el día creado a la nueva rutina
        usuarioId: this.usuarioLogeado?._id || '',
        entidad: 'rutina',
        timestamp: new Date().toISOString()
      };
      this.rutinaService.agregarRutina(nuevaRutina).then(response => {
        nuevaRutina._id = response.id; // Guardar el ID generado
        this.rutinas.push(nuevaRutina); // Añadir la rutina a la lista local
        this.rutinaService.cargarRutinas(); // Refrescar las rutinas
      });
    } else {
      // Añadir el día a una rutina existente (en este caso la primera)
      this.rutinas[0].dias.push(dia);
      this.rutinaService.actualizarRutina(this.rutinas[0]).then(() => {
        console.log('Rutina actualizada');
        this.rutinaService.cargarRutinas(); // Refrescar las rutinas
      });
    }
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

  modificarRutina(_t19: Rutina, $event: MouseEvent) {
    throw new Error('Method not implemented.');
  }


}