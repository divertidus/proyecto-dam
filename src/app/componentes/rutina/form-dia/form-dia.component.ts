import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
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
import { v4 as uuidv4 } from 'uuid'; // Si deseas usar una biblioteca como uuid
import { EjercicioListComponent } from '../../ejercicio/ejercicio-list/ejercicio-list.component';
import { EjercicioFormComponent } from '../../ejercicio/ejercicio-form/ejercicio-form.component';

@Component({
  selector: 'app-form-dia',
  templateUrl: './form-dia.component.html',
  styleUrls: ['./form-dia.component.scss'],
  standalone: true,
  imports: [IonIcon, IonList, IonButton,
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
  tituloBarraSuperior: string = ''; // Propiedad no de solo lectura


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
    private modalController: ModalController,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {

    // Número del día actual
    const diaNumero = this.numeroDiasExistentes + 1;
    this.nombreDia = `Día ${diaNumero}`;

    // Establece el título en función del modo
    this.tituloBarraSuperior = this.modo === 'crear' ? `Crear Día ${diaNumero}` : `Editar Día ${diaNumero}`;

    // Cargar ejercicios del servicio
    this.ejerciciosSub = this.ejercicioService.ejercicios$.subscribe((data) => {
      this.ejercicios = data;
      this.ejerciciosFiltrados = [...this.ejercicios];
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

  ngOnDestroy() {
    if (this.ejerciciosSub) {
      this.ejerciciosSub.unsubscribe();
    }
  }

  // Solicitar descripción mostrando el número del día en el mensaje
  async solicitarDescripcion(): Promise<void> {
    const diaNumero = this.numeroDiasExistentes + 1;
    const mensajePrincipal = `Ingresa una breve descripción para el día ${diaNumero} de la rutina.    `;
    const mensajeEjemplo = ` (Por ejemplo: Pierna, Pecho y Tríceps, Libre, etc.)`;
    const alert = await this.alertController.create({
      header: `Descripción del Día ${diaNumero}`,
      message: `${mensajePrincipal}${mensajeEjemplo}`, // Combinamos usando `<br>` aquí
      inputs: [
        {
          name: 'descripcion',
          type: 'text',
          placeholder: `Descripción del día ${diaNumero}`,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            return false;
          }
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.descripcion && data.descripcion.trim() !== '') {
              this.guardar(data.descripcion.trim());
              return true;
            } else {
              this.alertController
                .create({
                  header: 'Error',
                  message: 'Por favor, ingresa una descripción válida.',
                  buttons: ['Aceptar'],
                })
                .then((alert) => alert.present());
              return false;
            }
          }
        },
      ],
    });

    await alert.present();
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
      backdropDismiss: false,
      inputs: [
        {
          name: 'series',
          type: 'number',
          placeholder: 'Número de Series',
          min: 1,
        },
        {
          name: 'repeticiones',
          type: 'number',
          placeholder: 'Repeticiones por Serie',
          min: 1,
        },
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas adicionales (opcional)',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Agregar',
          handler: (data) => {
            if (!data.series || !data.repeticiones || data.series <= 0 || data.repeticiones <= 0) {
              console.error('Datos incompletos o incorrectos al agregar ejercicio');
              this.alertController
                .create({
                  header: 'Error',
                  message: 'Por favor, asegúrate de ingresar un número válido de series y repeticiones.',
                  buttons: ['Aceptar'],
                })
                .then((alert) => alert.present());
              return false;
            }

            // Agregar el ejercicio al día como EjercicioPlan
            this.agregarEjercicio(ejercicio, parseInt(data.series), parseInt(data.repeticiones), data.notas);
            return true;
          },
        },
      ],
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
      _id: uuidv4(),
      ejercicioId: ejercicio._id!,
      nombreEjercicio: ejercicio.nombre,
      series: series, // Crea las series con el número de repeticiones
      repeticiones: repeticiones,
      tipoPeso: ejercicio.tipoPeso,
      notas: notas || '',

    };

    this.ejerciciosEnRutina.push(ejercicioPlan); // Añadir el ejercicio a la rutina
  }

  guardar(descripcion?: string) {
    if (descripcion) {
      this.descripcionDia = descripcion;
    }
    // Procede con el guardado del día usando this.descripcionDia
    if (!this.descripcionDia || this.descripcionDia.trim() === '') {
      this.alertController.create({
        header: 'Error',
        message: 'Por favor, ingresa una descripción para el día.',
        buttons: ['Aceptar']
      }).then(alert => alert.present());
      return;
    }
    if (this.ejerciciosEnRutina.length === 0) {
      this.alertController.create({
        header: 'Error',
        message: 'Por favor, selecciona al menos un ejercicio para el día.',
        buttons: ['Aceptar']
      }).then(alert => alert.present());
      return;
    }
    const nuevoDia: DiaRutina = {
      _id: uuidv4(),
      diaNombre: this.nombreDia,
      ejercicios: this.ejerciciosEnRutina,
      descripcion: this.descripcionDia
    };
    this.modalController.dismiss(nuevoDia);
  }

  // Cancelar la operación de creación o edición
  async cancelarOperacion() {
    if (this.ejerciciosEnRutina.length > 0) {
      const alert = await this.alertController.create({
        header: 'Cancelar creación de día',
        message: '¿Seguro que desea cancelar la creación de un día? Se perderán los ejercicios seleccionados.',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Sí',
            handler: () => {
              this.modalController.dismiss();
            },
          },
        ],
      });

      await alert.present();
    } else {
      // Si no hay ejercicios seleccionados, simplemente cerrar el modal
      this.modalController.dismiss();
    }
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

  async crearNuevoEjercicio() {
    const popover = await this.popoverController.create({
      component: EjercicioFormComponent,
      cssClass: 'popover-ejercicio-compacto',
      backdropDismiss: true,
      mode: 'md', // Puedes ajustar a 'ios' si estás en iOS
      showBackdrop: true,
    });
  
    popover.onDidDismiss().then(async (result) => {
      if (result.data) {
        console.log('Ejercicio creado desde EditarDiaRutinaAgregarEjercicioSuelto:', result.data);
  
        // Actualizar lista de ejercicios
        await this.actualizarListaEjercicios();
  
        // Emitir el nuevo ejercicio al componente padre
        this.seleccionarEjercicio(result.data);
      } else {
        console.log('No se creó ningún ejercicio.');
      }
    });
  
    await popover.present();
  }
  
  private async actualizarListaEjercicios() {
    // Refrescar la lista de ejercicios desde el servicio
    const ejercicios = await this.ejercicioService.obtenerEjercicios();
    this.ejercicios = ejercicios;
  
    // Ordenar y actualizar lista filtrada
    this.ejercicios.sort((a, b) => a.nombre.localeCompare(b.nombre));
    this.ejerciciosFiltrados = [...this.ejercicios];
  }
}