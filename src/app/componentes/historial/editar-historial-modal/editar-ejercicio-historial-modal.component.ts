import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { DiaEntrenamiento, EjercicioRealizado, SerieReal } from 'src/app/models/historial-entrenamiento';
import { IonHeader, IonContent, IonLabel, IonCheckbox, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonInput, IonTextarea, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFooter, IonSearchbar, IonGrid, IonRow, IonCol, IonAlert } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { AnadirEjercicioExtraComponent } from '../anadir-ejercicio-extra/anadir-ejercicio-extra.component';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { DiaRutina } from 'src/app/models/rutina.model';
import { RutinaService } from 'src/app/services/database/rutina.service';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-editar-ejercicio-historia-modal',
  templateUrl: './editar-ejercicio-historial-modal.component.html',
  styleUrls: ['./editar-ejercicio-historial-modal.component.scss'],
  imports: [IonAlert, IonCol, IonRow, IonGrid, IonSearchbar, IonFooter, IonCardContent, CommonModule, IonCardTitle,
    IonCardHeader, IonCard, IonIcon, IonTextarea, IonInput, IonItem,
    IonList, IonButton, IonButtons, IonTitle, NgIf, NgFor,
    IonToolbar, IonCheckbox, IonLabel, IonContent, IonHeader, FormsModule],
  providers: [AlertController, ModalController],
  standalone: true
})
export class EditarEjercicioHistorialComponent implements OnInit {
  @Input() diaEntrenamiento: DiaEntrenamiento; // Recibe el ejercicio a editar
  @Input() editable: boolean; // Define si el modal permite edición
  @Input() historialId: string; // Recibe historialId
  @Input() usuarioId: string; // Recibido desde el componente padre

  diaEntrenamientoBackup: DiaEntrenamiento; // Backup para trabajar temporalmente
  ejercicioAbiertoIndex: number | null = null; // Índice del ejercicio actualmente abierto
  nuevaSerieEnEdicion: boolean = false; // Indicador de nueva serie en edición
  ejerciciosDisponibles: Ejercicio[] = [];
  ejerciciosFiltrados: Ejercicio[] = [];


  constructor(private modalController: ModalController,
    private alertController: AlertController,
    private ejercicioService: EjercicioService,
    private historialService: HistorialService,


  ) { }

  ngOnInit() {
    // Creamos un backup profundo para trabajar en él

    this.diaEntrenamientoBackup = JSON.parse(JSON.stringify(this.diaEntrenamiento));
    console.log('Día entrenamiento recibido en el modal:', this.diaEntrenamiento);
    console.log('Historial ID recibido en el modal:', this.historialId); // Verificar que historialId se recibe correctamente
    this.cargarEjerciciosDisponibles();
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  // Guardar cambios: aplicamos los cambios del backup al objeto principal
  guardarCambios() {
    // Actualizamos `seriesCompletadas` en cada ejercicio antes de guardar
    this.diaEntrenamientoBackup.ejerciciosRealizados.forEach((ejercicio) => {
      ejercicio.seriesCompletadas = ejercicio.series.filter(
        (serie) => serie.repeticiones > 0 && serie.peso > 0
      ).length;
    });

    // Actualiza `diaEntrenamiento` con el backup modificado
    this.diaEntrenamiento = JSON.parse(JSON.stringify(this.diaEntrenamientoBackup));

    // Guarda el `diaEntrenamiento` en la base de datos
    this.historialService.actualizarDiaEntrenamiento(this.diaEntrenamiento)
      .then(() => {
        this.modalController.dismiss({
          diaEntrenamiento: this.diaEntrenamiento,
          historialId: this.historialId,
          actualizado: true,
        });
      });
  }

  // Métodos para incrementar y decrementar peso en una serie específica
  incrementarPeso(serie: SerieReal) {
    if (serie.peso === undefined) serie.peso = 0;
    serie.peso += 1.25;
  }

  decrementarPeso(serie: SerieReal) {
    if (serie.peso === undefined) serie.peso = 0;
    if (serie.peso > 0) serie.peso -= 1.25;
  }

  async abrirNotasEjercicio(index: number) {
    const alert = await this.alertController.create({
      header: 'Editar Nota del Ejercicio',
      inputs: [
        {
          name: 'nota',
          type: 'text',
          placeholder: 'Escribe tu nota aquí',
          value: this.diaEntrenamiento.ejerciciosRealizados[index].notas || '',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.diaEntrenamiento.ejerciciosRealizados[index].notas = data.nota;
          },
        },
      ],
    });

    await alert.present();
  }

  async abrirNotasSerie(ejercicioIndex: number, serieIndex: number) {
    const serie = this.diaEntrenamiento.ejerciciosRealizados[ejercicioIndex].series[serieIndex];
    const alert = await this.alertController.create({
      header: 'Editar Nota de la Serie',
      inputs: [
        {
          name: 'nota',
          type: 'text',
          placeholder: 'Escribe tu nota aquí',
          value: serie.notas || '',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            serie.notas = data.nota;
          },
        },
      ],
    });

    await alert.present();
  }

  // Método para alternar el ejercicio abierto
  toggleEjercicio(index: number) {
    this.ejercicioAbiertoIndex = this.ejercicioAbiertoIndex === index ? null : index;
  }

  // Método para confirmar la adición de una serie
  async confirmarAnadirSerie(ejercicioIndex: number) {
    const ejercicio = this.diaEntrenamientoBackup.ejerciciosRealizados[ejercicioIndex];

    // Verifica si el ejercicio fue guardado sin series
    if (ejercicio.series.length === 0) {
      const alert = await this.alertController.create({
        header: 'Ejercicio sin series',
        message: 'Este ejercicio se guardó sin series. ¿Deseas añadir la primera serie?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Añadir Serie',
            handler: () => {
              this.anadirSerie(ejercicioIndex, false); // Añadir una serie normal
            }
          }
        ]
      });
      await alert.present();
    } else {
      // Confirmar si desea añadir una serie extra a un ejercicio con series existentes
      const alert = await this.alertController.create({
        header: 'Añadir Serie Extra',
        message: '¿Deseas añadir una serie extra a este ejercicio?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Añadir',
            handler: () => {
              this.anadirSerie(ejercicioIndex, true); // Añadir una serie extra
            }
          }
        ]
      });
      await alert.present();
    }
  }

  // Método para obtener el último ejercicio realizado por el usuario y capturar el `pesoAnterior` correcto
  private async obtenerUltimoEjercicioRealizado(usuarioId: string, ejercicioId: string): Promise<EjercicioRealizado | null> {
    return await this.historialService.obtenerUltimoEjercicioRealizado(usuarioId, ejercicioId);
  }

  // Método adaptado para crear las series y capturar `pesoAnterior` de la última sesión previa
  private crearSerieReal(serie: SerieReal, ultimoEjercicio: EjercicioRealizado | null, index: number, esExtra: boolean): SerieReal {
    return {
      _id: uuidv4(),
      numeroSerie: serie.numeroSerie,
      repeticiones: serie.repeticiones,
      repeticionesAnterior: ultimoEjercicio?.series[index]?.repeticiones || null,
      peso: serie.peso || 0,  // Mantiene el peso actual
      pesoAnterior: esExtra ? null : ultimoEjercicio?.series[index]?.peso || null, // Asigna pesoAnterior si es una nueva sesión
      alFallo: serie.alFallo || false,
      conAyuda: serie.conAyuda || false,
      dolor: serie.dolor || false,
      enEdicion: true,
      notas: serie.notas || ''
    };
  }



  // Método para mostrar el botón de añadir serie
  mostrarBotonAnadirSerie(ejercicio: EjercicioRealizado): boolean {
    // Muestra el botón si no hay series o si todas las series están confirmadas
    return ejercicio.series.length === 0 || ejercicio.series.every(serie => !serie.enEdicion);
  }

  // Eliminar serie, trabajando sobre el backup
  async confirmarEliminarSerie(ejercicioIndex: number, serieIndex: number) {
    const alert = await this.alertController.create({
      header: 'Eliminar Serie',
      message: '¿Estás seguro de que quieres eliminar esta serie?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarSerie(ejercicioIndex, serieIndex);
          }
        }
      ]
    });
    await alert.present();
  }

  eliminarSerie(ejercicioIndex: number, serieIndex: number) {
    const ejercicio = this.diaEntrenamientoBackup.ejerciciosRealizados[ejercicioIndex];
    const serieAEliminar = ejercicio.series[serieIndex];

    // Verificar si la serie a eliminar cuenta como completada (repeticiones > 0 y peso > 0)
    const esSerieCompletada = serieAEliminar.repeticiones > 0 && serieAEliminar.peso > 0;

    // Eliminar la serie del array
    ejercicio.series.splice(serieIndex, 1);

    // Si la serie eliminada estaba completa, restamos uno a `seriesCompletadas`
    if (esSerieCompletada) {
        ejercicio.seriesCompletadas = Math.max(0, ejercicio.seriesCompletadas - 1);
    }

    // Actualizar `seriesCompletadas` para reflejar el cambio en la interfaz
    this.actualizarSeriesCompletadas(ejercicioIndex);
}

  toggleEditarSerie(ejercicioIndex: number, serieIndex: number) {
    const ejercicio = this.diaEntrenamientoBackup.ejerciciosRealizados[ejercicioIndex];
    const serie = ejercicio.series[serieIndex];

    // Cambiar el estado de edición de la serie
    serie.enEdicion = !serie.enEdicion;

    if (!serie.enEdicion) {
      // Solo actualizar `seriesCompletadas` si repeticiones y peso son mayores a 0
      if (serie.repeticiones > 0 && serie.peso > 0) {
        this.actualizarSeriesCompletadas(ejercicioIndex);
      }
    }
  }

  async anadirSerie(ejercicioIndex: number, esExtra: boolean) {
    const ejercicioRealizado = this.diaEntrenamientoBackup.ejerciciosRealizados[ejercicioIndex];

    // Obtener las repeticiones de la última serie (si existe)
    const repeticionesAnteriores = ejercicioRealizado.series.length > 0
      ? ejercicioRealizado.series[ejercicioRealizado.series.length - 1].repeticiones
      : 0;

    // Crear la nueva serie, usando el valor de repeticiones anteriores por defecto
    const nuevaSerie: SerieReal = {
      _id: uuidv4(),
      numeroSerie: ejercicioRealizado.series.length + 1,
      repeticiones: repeticionesAnteriores,  // Asigna repeticiones por defecto
      peso: 0,  // Peso inicial
      alFallo: false,
      conAyuda: false,
      dolor: false,
      enEdicion: true,
      notas: esExtra ? 'Serie extra' : ''
    };

    // Añade la serie extra y actualiza `seriesCompletadas`
    ejercicioRealizado.series.push(nuevaSerie);
    this.actualizarSeriesCompletadas(ejercicioIndex);
  }

  // Método para calcular seriesCompletadas basado en series completas con depuración
  actualizarSeriesCompletadas(ejercicioIndex: number) {
    const ejercicio = this.diaEntrenamientoBackup.ejerciciosRealizados[ejercicioIndex];

    ejercicio.seriesCompletadas = ejercicio.series.filter(
      serie => serie.repeticiones > 0 && serie.peso > 0
    ).length;

    // Registrar en consola el valor actualizado para verificar el cambio
    console.log(`Series completadas actualizadas para "${ejercicio.nombreEjercicioRealizado}":`, ejercicio.seriesCompletadas);
  }


  // Cancelar sin guardar cambios: simplemente cerramos el modal
  confirmarCancelarEdicion() {
    this.alertController.create({
      header: 'Cancelar Edición',
      message: '¿Estás seguro de que quieres salir sin guardar los cambios?',
      buttons: [
        { text: 'Continuar Editando', role: 'cancel' },
        {
          text: 'Salir sin Guardar',
          handler: () => {
            this.modalController.dismiss(null, 'cancel'); // No aplicamos cambios
          }
        }
      ]
    }).then(alert => alert.present());
  }

  // Método para abrir el modal de añadir un nuevo ejercicio
  async abrirModalAnadirEjercicio() {
    const modal = await this.modalController.create({
      component: AnadirEjercicioExtraComponent,
      componentProps: {
        ejerciciosDisponibles: this.ejerciciosDisponibles, // Pasa la lista de ejercicios disponibles
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data.role !== 'cancel' && data.data) {
        this.agregarEjercicioNuevo(data.data); // Añade el ejercicio seleccionado a la lista actual
      }
    });

    await modal.present();
  }

  agregarEjercicioNuevo(ejercicio) {
    const nuevoEjercicio = {
      ...ejercicio,
      series: [],
      notas: 'Ejercicio añadido',
    };
    this.diaEntrenamientoBackup.ejerciciosRealizados.push(nuevoEjercicio); // Añade el ejercicio a la lista actual
  }

  // Cargar ejercicios ya existentes
  cargarEjerciciosDisponibles() {
    this.ejercicioService.ejercicios$.subscribe(data => {
      this.ejerciciosDisponibles = data;
      this.ejerciciosFiltrados = [...this.ejerciciosDisponibles];
    });
  }

  // Filtrar ejercicios por búsqueda
  buscarEjercicios(event: any) {
    const valorBusqueda = event.detail.value ? event.detail.value.toLowerCase() : '';
    this.ejerciciosFiltrados = valorBusqueda
      ? this.ejerciciosDisponibles.filter(ejercicio => ejercicio.nombre.toLowerCase().includes(valorBusqueda))
      : [...this.ejerciciosDisponibles];
  }


  // Crear un EjercicioRealizado basado en un Ejercicio existente
  agregarEjercicioRealizado(ejercicio: Ejercicio) {
    const nuevoEjercicioRealizado: EjercicioRealizado = {
      ejercicioPlanId: ejercicio._id,
      nombreEjercicioRealizado: ejercicio.nombre,
      series: [ // Creamos una serie inicial para evitar errores en propiedades no definidas
        {
          numeroSerie: 1,
          repeticiones: 0,      // Repeticiones inicializadas a 0
          peso: 0,              // Peso inicial a 0
          enEdicion: true,      // Activa la edición para esta serie
          alFallo: false,
          conAyuda: false,
          dolor: false,
          notas: ''
        }
      ],
      seriesCompletadas: 0,      // Inicializamos en 0 ya que el ejercicio recién se ha añadido
      seriesTotal: 1,            // Definimos 1 ya que solo hemos añadido una serie inicial
      notas: '',
      anteriorVezEjercicioID: ''
    };

    this.diaEntrenamientoBackup.ejerciciosRealizados.push(nuevoEjercicioRealizado);
  }
}
