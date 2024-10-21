import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { RutinaService } from 'src/app/services/rutina.service';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons';
import { EjercicioFormComponent } from 'src/app/componentes/ejercicio/ejercicio-form/ejercicio-form.component';
import { EjercicioListComponent } from "../../componentes/ejercicio/ejercicio-list/ejercicio-list.component";
import { EjercicioPlan, Rutina } from 'src/app/models/rutina.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service'; // Importamos AuthService
import { ToolbarLoggedComponent } from 'src/app/componentes/toolbar-logged/toolbar-logged.component';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, EjercicioListComponent, EjercicioFormComponent,ToolbarLoggedComponent]
})
export class Tab5Page implements OnInit {

  ejercicios: Ejercicio[] = []; // Almacena todos los ejercicios
  ejerciciosFiltrados: Ejercicio[] = []; // Ejercicios filtrados por la barra de búsqueda
  ejerciciosEnRutina: EjercicioPlan[] = []; // Lista tipada para almacenar los ejercicios añadidos a la rutina

  constructor(
    private ejercicioService: EjercicioService,
    private rutinaService: RutinaService, // Añadimos RutinaService aquí
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService // Añadimos AuthService aquí
  ) {
    addIcons(todosLosIconos);
  }

  ngOnInit() {
    this.cargarEjercicios();
  }

  // Cargar los ejercicios desde el servicio
  async cargarEjercicios() {
    this.ejercicios = await this.ejercicioService.obtenerEjercicios();
    console.log(this.ejercicios); // Verifica que los ejercicios se carguen correctamente
    this.ejerciciosFiltrados = this.ejercicios; // Inicialmente mostrar todos
  }

  // Actualizar la lista filtrada cuando el usuario escribe en la barra de búsqueda
  buscarEjercicios(event: any) {
    const valorBusqueda = event.target.value.toLowerCase();
    this.ejerciciosFiltrados = this.ejercicios.filter(ejercicio =>
      ejercicio.nombre.toLowerCase().includes(valorBusqueda) ||
      (ejercicio.descripcion && ejercicio.descripcion.toLowerCase().includes(valorBusqueda)) ||
      (ejercicio.musculo && ejercicio.musculo.toLowerCase().includes(valorBusqueda))
    );
  }

  // Seleccionar un ejercicio y abrir un alert para especificar series y repeticiones
  async seleccionarEjercicio(ejercicio: Ejercicio) {
    const alert = await this.alertController.create({
      header: `Detalles de: ${ejercicio.nombre}`,
      inputs: [
        {
          name: 'series',
          type: 'number',
          placeholder: 'Número de Series (Ej. 3)',
          min: 1
        },
        {
          name: 'repeticiones',
          type: 'number',
          placeholder: 'Repeticiones por Serie (Ej. 10)',
          min: 1
        },
        {
          name: 'notas',
          type: 'text',
          placeholder: 'Notas adicionales (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Operación cancelada');
          }
        },
        {
          text: 'Añadir Ejercicio',
          handler: (data) => {
            if (data.series && data.repeticiones) {
              this.onEjercicioAgregado(ejercicio, data.series, data.repeticiones, data.notas);
            } else {
              console.log('Series y repeticiones son requeridas para añadir el ejercicio');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Agregar el ejercicio con los detalles ingresados
  onEjercicioAgregado(ejercicio: Ejercicio, series: number, repeticiones: number, notas?: string) {
    const ejercicioConDetalles: EjercicioPlan = {
      ejercicioId: ejercicio._id!,
      series: series,
      repeticiones: repeticiones,
      notas: notas || ''
    };

    this.ejerciciosEnRutina.push(ejercicioConDetalles);

    console.log('Ejercicio añadido a la rutina:', ejercicioConDetalles);
    console.log('Ejercicios en esta rutina: ', this.ejerciciosEnRutina.length);
  }

  // Mostrar el formulario emergente para agregar un nuevo ejercicio
  async mostrarFormularioAgregar() {
    const modal = await this.modalController.create({
      component: EjercicioFormComponent
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.cargarEjercicios(); // Actualizar la lista de ejercicios
      }
    });

    await modal.present();
  }

  // Guardar la rutina con los ejercicios seleccionados
  async guardarRutina() {
    if (this.ejerciciosEnRutina.length === 0) {
      console.log('No hay ejercicios para guardar.');
      return;
    }

    const usuarioActual = this.authService.getUsuarioLogeado();
    if (!usuarioActual) {
      console.error('No se puede guardar la rutina porque no hay un usuario logueado.');
      return;
    }

    const nuevaRutina: Rutina = {
      _id: undefined,
      entidad: 'rutina',
      usuarioId: usuarioActual._id, // Asociar la rutina con el usuario logueado
      nombre: 'Rutina Personalizada',
      dias: [
        {
          diaNombre: 'Día 1',
          ejercicios: this.ejerciciosEnRutina,
          descripcion: 'Rutina creada automáticamente'
        }
      ]
    };

    try {
      await this.rutinaService.agregarRutina(nuevaRutina); // Usar RutinaService para agregar la rutina
      this.ejerciciosEnRutina = []; // Reiniciar la lista de ejercicios
      await this.mostrarMensajeRutinaGuardada(); // Mostrar feedback al usuario
      this.router.navigate(['/tabs/tab1']); // Redirigir a Tab 1 usando la ruta completa
    } catch (error) {
      console.error('Error al guardar la rutina:', error);
    }
  }

  // Mostrar mensaje de confirmación de que la rutina ha sido guardada
  async mostrarMensajeRutinaGuardada() {
    const alert = await this.alertController.create({
      header: 'Rutina Guardada',
      message: 'Tu rutina ha sido guardada con éxito.',
      buttons: ['OK']
    });
    await alert.present();
  }
}
