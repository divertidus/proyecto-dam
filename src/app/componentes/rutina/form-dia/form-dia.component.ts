import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { ToolbarModalesCancelarComponent } from "../../shared/toolbar-modales-cancelar/toolbar-modales-cancelar.component";
import { Subscription } from 'rxjs';
import {
  IonFooter, IonItem, IonLabel, IonText, IonSearchbar, IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonToolbar, IonButton, IonInput
} from '@ionic/angular/standalone';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { EjercicioPlanificado, SesionPlanificada } from 'src/app/models/rutina.model';

@Component({
  selector: 'app-form-dia',
  templateUrl: './form-dia.component.html',
  styleUrls: ['./form-dia.component.scss'],
  standalone: true,
  imports: [IonButton, IonInput, IonToolbar, IonCardContent, IonCardTitle, IonCardHeader,
    IonCard, IonCol, IonRow, IonGrid, IonContent, IonSearchbar, IonText,
    IonLabel, IonItem, IonFooter, CommonModule, FormsModule, ToolbarModalesCancelarComponent]

})
export class FormDiaComponent implements OnInit {

  //@Input() ejercicios: Ejercicio[] = []; // Lista de ejercicios disponibles
  @Input() sesionExistente: SesionPlanificada | null = null; // Día ya existente, si estamos editando
  @Input() modo: 'crear' | 'editar' = 'crear'; // Modo de operación (crear o editar)
  @Input() numeroDiasExistentes: number = 0; // Número de días ya existentes en la rutina

  sesionNombre: string = '';
  descripcionSesion: string = '';
  ejerciciosEnRutina: EjercicioPlanificado[] = []; // Ejercicios añadidos al día
  ejerciciosFiltrados: Ejercicio[] = []; // Para no modificar la lista original
  ejerciciosObtenidos: Ejercicio[] = []; // Lista de ejercicios obtenidos del servicio
  private ejerciciosSub: Subscription; // Para manejar la suscripción

  constructor(
    private ejercicioService: EjercicioService,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    // Cargar ejercicios al iniciar el componente
    this.ejerciciosSub = this.ejercicioService.ejercicios$.subscribe(data => {
      this.ejerciciosObtenidos = data;
      this.ejerciciosFiltrados = [...this.ejerciciosObtenidos]; // Inicializa los ejercicios filtrados
    });

    if (this.modo === 'editar') {
      // Cargar datos del día existente si estamos en modo edición
      console.log('Sesion existente: ', this.sesionExistente)
      console.log('Sesion existente nombre: ', this.sesionExistente.nombreSesion)
      this.sesionNombre = this.sesionExistente.nombreSesion ? this.sesionExistente.nombreSesion : '';
      this.ejerciciosEnRutina = [...(this.sesionExistente?.ejerciciosPlanificados || [])];
    } else {
      // Si estamos creando un nuevo día, inicializamos el nombre y vaciamos la lista de ejercicios
      console.log('SIN EDICION')
      this.sesionNombre = `Día ${this.numeroDiasExistentes + 1}`;
      this.ejerciciosEnRutina = [];
    }
  }

  /* // Método para cargar ejercicios desde el servicio
  async cargarEjercicios() {
    this.ejerciciosObtenidos = await this.ejercicioService.obtenerEjercicios(); // Cargar la lista de ejercicios
    this.ejerciciosFiltrados = [...this.ejerciciosObtenidos]; // Copiar para el filtro de búsqueda
  } */

  // Filtrar los ejercicios cuando el usuario realiza una búsqueda
  buscarEjercicios(event: any) {
    const valorBusqueda = event.detail.value ? event.detail.value.toLowerCase() : '';

    if (valorBusqueda === '') {
      this.ejerciciosFiltrados = [...this.ejerciciosObtenidos]; // Restaura la lista original
    } else {
      this.ejerciciosFiltrados = this.ejerciciosObtenidos.filter(ejercicio =>
        ejercicio.nombre.toLowerCase().includes(valorBusqueda) ||
        (ejercicio.descripcion && ejercicio.descripcion.toLowerCase().includes(valorBusqueda)) ||
        (ejercicio.musculoPrincipal && ejercicio.musculoPrincipal.toLowerCase().includes(valorBusqueda))
      );
    }
  }

  async seleccionarEjercicio(ejercicio: Ejercicio) {
    const alert = await this.alertController.create({
      header: `Detalles de: ${ejercicio.nombre}`,
      inputs: [
        {
          name: 'series',
          type: 'number',
          placeholder: 'Número de Series',
          min: 1
        },
        {
          name: 'repeticiones',
          type: 'number',
          placeholder: 'Repeticiones por Serie',
          min: 1
        },
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas adicionales (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Operación cancelada'); // Podrías retornar 'false' o simplemente dejar el log.
            return false; // Devolvemos 'false' para indicar que no se hizo nada.
          }
        },
        {
          text: 'Agregar',
          handler: (data) => {
            // Validamos y agregamos el ejercicio
            if (!data.series || !data.repeticiones || data.series <= 0 || data.repeticiones <= 0) {
              console.error('Datos incompletos o incorrectos al agregar ejercicio');
              // Mostrar mensaje de error al usuario
              this.alertController.create({
                header: 'Error',
                message: 'Por favor, asegúrate de ingresar un número válido de series y repeticiones.',
                buttons: ['Aceptar']
              }).then(alert => alert.present());

              return false; // Devolvemos 'false' si los datos no son válidos.
            }

            this.agregarEjercicio(
              ejercicio,
              parseInt(data.series),
              parseInt(data.repeticiones),
              data.notas
            );

            return true; // Retornamos 'true' para indicar que se agregó el ejercicio correctamente.
          }
        }
      ]
    });

    await alert.present();
  }


  agregarEjercicio(ejercicio: Ejercicio, series: number, repeticiones: number, notas: string) {
    const ejercicioPlanificado: EjercicioPlanificado = {
      idEjercicioOriginal: ejercicio._id!,
      seriesPlanificadas: Array(series).fill({ repeticiones }),
      notas: notas || ''
    };

    this.ejerciciosEnRutina.push(ejercicioPlanificado);
    console.log("Ejercicio añadido a ejerciciosEnRutina:", this.ejerciciosEnRutina);
  }

  guardar() {
    // Validar descripción
    if (!this.descripcionSesion || this.descripcionSesion.trim() === '') {
      this.alertController.create({
        header: 'Error',
        message: 'Por favor, ingrese una descripción para el día.',
        buttons: ['Aceptar']
      }).then(alert => alert.present());
      return;
    }
  
    // Validar ejercicios en rutina
    if (this.ejerciciosEnRutina.length === 0) {
      this.alertController.create({
        header: 'Error',
        message: 'Por favor, seleccione al menos un ejercicio para el día.',
        buttons: ['Aceptar']
      }).then(alert => alert.present());
      return;
    }
  
    // Construir nueva sesión
    const nuevaSesion: SesionPlanificada = {
      nombreSesion: this.sesionNombre,
      descripcion: this.descripcionSesion,
      ejerciciosPlanificados: this.ejerciciosEnRutina
    };
  
    // Validación final antes de cerrar
    if (!nuevaSesion || !nuevaSesion.ejerciciosPlanificados || nuevaSesion.ejerciciosPlanificados.length === 0) {
      console.error('La sesión añadida no contiene ejercicios o está incompleta.');
      return;
    }
  
    console.log("Contenido de nuevaSesion antes de cerrar el modal:", JSON.stringify(nuevaSesion, null, 2));
  
    // Cerrar el modal y pasar nuevaSesion completa
    this.modalController.dismiss(nuevaSesion);
  }



  // Cancelar la operación de creación o edición
  cancelarOperacion() {
    this.modalController.dismiss(); // Simplemente cierra el modal sin enviar datos
  }
}