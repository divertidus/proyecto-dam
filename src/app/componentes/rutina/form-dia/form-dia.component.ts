import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioPlan, DiaRutina } from 'src/app/models/rutina.model';
import { ToolbarModalesCancelarComponent } from "../../shared/toolbar-modales-cancelar/toolbar-modales-cancelar.component";
import { Subscription } from 'rxjs';
import {
  IonFooter, IonItem, IonLabel,
  IonSearchbar, IonContent, IonGrid, IonRow,
  IonCol, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonToolbar, IonButton, IonInput,
  IonList, IonIcon, IonPopover, IonCardSubtitle, IonModal
} from '@ionic/angular/standalone';

import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { FiltroEjercicioComponent, TipoPesoFiltro } from '../../filtros/filtro-ejercicio/filtro-ejercicio.component';


@Component({
  selector: 'app-form-dia',
  templateUrl: './form-dia.component.html',
  styleUrls: ['./form-dia.component.scss'],
  standalone: true,
  imports: [IonIcon, IonList, IonButton, IonInput,
    IonToolbar, IonCardContent, IonCardTitle, IonCardHeader,
    IonCard, IonCol, IonRow, IonGrid, IonContent,
    IonSearchbar, IonLabel, IonItem, IonFooter,
    CommonModule, FormsModule, ToolbarModalesCancelarComponent,
    IonPopover, FiltroEjercicioComponent]

})
export class FormDiaComponent implements OnInit {

  //@Input() ejercicios: Ejercicio[] = []; // Lista de ejercicios disponibles
  @Input() diaExistente: DiaRutina | null = null; // Día ya existente, si estamos editando
  @Input() modo: 'crear' | 'editar' = 'crear'; // Modo de operación (crear o editar)
  @Input() numeroDiasExistentes: number = 0; // Número de días ya existentes en la rutina

  nombreDia: string = '';
  descripcionDia: string = '';
  ejerciciosEnRutina: EjercicioPlan[] = []; // Ejercicios añadidos al día
  ejerciciosFiltrados: Ejercicio[] = []; // Para no modificar la lista original
  ejercicios: Ejercicio[] = []; // Lista de ejercicios obtenidos del servicio
  private ejerciciosSub: Subscription; // Para manejar la suscripción


  // Definir `filtroTipoPeso` con el tipo específico y una inicialización correcta
  filtroTipoPeso: TipoPesoFiltro = {
    Barra: false,
    Mancuernas: false,
    Máquina: false,
    "Peso Corporal": false,
  };
  filtroMusculoPrincipal: { [key: string]: boolean } = {}; // Filtros de grupo muscular

  constructor(
    private ejercicioService: EjercicioService,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    // Cargar ejercicios del servicio
    this.ejerciciosSub = this.ejercicioService.ejercicios$.subscribe(data => {
      this.ejercicios = data;
      this.ejerciciosFiltrados = [...this.ejercicios]; // Inicializa los ejercicios filtrados
    });

    if (this.modo === 'editar') {
      // Si estamos en modo edición, cargamos los datos del día existente
      this.nombreDia = this.diaExistente ? this.diaExistente.diaNombre : '';
      this.ejerciciosEnRutina = [...(this.diaExistente?.ejercicios || [])]; // Copia los ejercicios existentes para edición
    } else {
      // Si estamos creando un nuevo día, aseguramos que no haya ejercicios añadidos y asignamos nombre por defecto
      this.nombreDia = `Día ${this.numeroDiasExistentes + 1}`;
      this.ejerciciosEnRutina = [];
    }

    this.descripcionDia = '';
  }

  // Filtrar los ejercicios cuando el usuario realiza una búsqueda
  // Método para buscar ejercicios por texto
  buscarEjercicios(event: any) {
    const valorBusqueda = event.detail.value ? event.detail.value.toLowerCase() : '';
    this.aplicarFiltros(valorBusqueda); // Aplicar el filtro de texto junto con los demás filtros
  }

  // Método que recibe los filtros desde FiltroEjercicioComponent
  aplicarFiltrosDesdeFiltro(event: { tipoPeso: TipoPesoFiltro; musculoPrincipal: { [key: string]: boolean } }) {
    this.filtroTipoPeso = event.tipoPeso;
    this.filtroMusculoPrincipal = event.musculoPrincipal;
    this.aplicarFiltros(); // Aplicar los filtros tras actualizar los valores
  }

  aplicarFiltros(valorBusqueda: string = '') {
    // Filtrado similar al componente que funciona correctamente
    this.ejerciciosFiltrados = this.ejercicios.filter(ejercicio => {
      // Filtrar por búsqueda de texto (nombre, descripción o grupo muscular)
      const coincideBusqueda = ejercicio.nombre.toLowerCase().includes(valorBusqueda) ||
        (ejercicio.descripcion && ejercicio.descripcion.toLowerCase().includes(valorBusqueda)) ||
        (ejercicio.musculoPrincipal && ejercicio.musculoPrincipal.toLowerCase().includes(valorBusqueda));

      // Verificar si hay algún filtro activo en `filtroTipoPeso`
      const tipoPesoActivo = Object.values(this.filtroTipoPeso).some(valor => valor);
      const tipoPesoSeleccionado = tipoPesoActivo ?
        this.filtroTipoPeso[ejercicio.tipoPeso as keyof TipoPesoFiltro] : true;

      // Verificar si hay algún filtro activo en `filtroMusculoPrincipal`
      const musculoActivo = Object.values(this.filtroMusculoPrincipal).some(valor => valor);
      const musculoSeleccionado = musculoActivo ?
        this.filtroMusculoPrincipal[ejercicio.musculoPrincipal] : true;

      // Combinar todos los criterios para determinar si el ejercicio pasa el filtro
      return coincideBusqueda && tipoPesoSeleccionado && musculoSeleccionado;
    });

    console.log('Ejercicios después de aplicar filtros:', this.ejerciciosFiltrados);
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


  mostrarEjerciciosSeleccionados: boolean = false;

  toggleExpandirEjercicios() {
    if (this.ejerciciosEnRutina.length > 0) {
      this.mostrarEjerciciosSeleccionados = !this.mostrarEjerciciosSeleccionados;
    }
  }


  // Agregar un ejercicio con los detalles ingresados
  agregarEjercicio(ejercicio: Ejercicio, series: number, repeticiones: number, notas: string) {
    const ejercicioPlan: EjercicioPlan = {
      ejercicioId: ejercicio._id!,
      nombreEjercicio: ejercicio.nombre,
      series: series, // Crea las series con el número de repeticiones
      repeticiones: repeticiones,
      notas: notas || '',

    };

    this.ejerciciosEnRutina.push(ejercicioPlan); // Añadir el ejercicio a la rutina
  }

  guardar() {
    // Verificar si se ingresó una descripción
    if (!this.descripcionDia || this.descripcionDia.trim() === '') {
      // Mostrar una alerta si la descripción está vacía
      this.alertController.create({
        header: 'Error',
        message: 'Por favor, ingrese una descripción para el día.',
        buttons: ['Aceptar']
      }).then(alert => alert.present());

      return; // Detener el guardado hasta que se ingrese la descripción
    }

    // Verificar si se seleccionó al menos un ejercicio
    if (this.ejerciciosEnRutina.length === 0) {
      // Mostrar una alerta si no hay ejercicios seleccionados
      this.alertController.create({
        header: 'Error',
        message: 'Por favor, seleccione al menos un ejercicio para el día.',
        buttons: ['Aceptar']
      }).then(alert => alert.present());

      return; // Detener el guardado hasta que se seleccione un ejercicio
    }

    /*   // Si el nombre del día no se especifica, asignamos un nombre automático basado en el número de días existentes en la rutina
      if (!this.nombreDia || this.nombreDia.trim() === '') {
        const diaIndex = this.diaExistente ? this.diaExistente.ejercicios.length : 0; // Obtiene el número de días ya existentes
        this.nombreDia = `Día ${diaIndex + 1}`; // Asigna el nombre como "Día X", donde X es el siguiente número disponible
      } */

    const nuevoDia: DiaRutina = {
      diaNombre: this.nombreDia,
      ejercicios: this.ejerciciosEnRutina,
      descripcion: this.descripcionDia // Guarda la descripción proporcionada por el usuario
    };

    this.modalController.dismiss(nuevoDia); // Enviar los datos de vuelta al componente padre
  }

  // Cancelar la operación de creación o edición
  cancelarOperacion() {
    this.modalController.dismiss(); // Simplemente cierra el modal sin enviar datos
  }

  // Método para eliminar un ejercicio de la lista
  eliminarEjercicio(index: number) {
    this.ejerciciosEnRutina.splice(index, 1); // Elimina el ejercicio por índice
  }

  // Método para editar un ejercicio de la lista
  async editarEjercicio(index: number) {
    const ejercicio = this.ejerciciosEnRutina[index];

    const alert = await this.alertController.create({
      header: `Editar: ${ejercicio.nombreEjercicio}`,
      inputs: [
        {
          name: 'series',
          type: 'number',
          value: ejercicio.series,
          placeholder: 'Número de Series',
          min: 1
        },
        {
          name: 'repeticiones',
          type: 'number',
          value: ejercicio.repeticiones,
          placeholder: 'Repeticiones por Serie',
          min: 1
        },
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas adicionales (opcional)',
          value: ejercicio.notas || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            // Validamos y actualizamos el ejercicio
            if (!data.series || !data.repeticiones || data.series <= 0 || data.repeticiones <= 0) {
              this.alertController.create({
                header: 'Error',
                message: 'Por favor, asegúrate de ingresar un número válido de series y repeticiones.',
                buttons: ['Aceptar']
              }).then(alert => alert.present());

              return false;
            }

            this.ejerciciosEnRutina[index].series = data.series;
            this.ejerciciosEnRutina[index].repeticiones = data.repeticiones;
            this.ejerciciosEnRutina[index].notas = data.notas;

            return true;
          }
        }
      ]
    });

    await alert.present();
  }
}