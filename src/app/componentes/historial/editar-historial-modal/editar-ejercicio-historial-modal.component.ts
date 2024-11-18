import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { DiaEntrenamiento, EjercicioRealizado, SerieReal } from 'src/app/models/historial-entrenamiento';
import { IonHeader, IonContent, IonLabel, IonCheckbox, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonInput, IonTextarea, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFooter, IonSearchbar, IonGrid, IonRow, IonCol, IonAlert, IonModal, IonCardSubtitle } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { AnadirEjercicioExtraComponent } from '../anadir-ejercicio-extra/anadir-ejercicio-extra.component';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { DiaRutina, EjercicioPlan } from 'src/app/models/rutina.model';
import { RutinaService } from 'src/app/services/database/rutina.service';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';
import { AuthService } from '../../../auth/auth.service';
import { EditarDiaRutinaAgregarEjercicioSueltoComponent } from '../../rutina/editar-dia-rutina-agregar-ejercicio-suelto/editar-dia-rutina-agregar-ejercicio-suelto.component';

@Component({
  selector: 'app-editar-ejercicio-historia-modal',
  templateUrl: './editar-ejercicio-historial-modal.component.html',
  styleUrls: ['./editar-ejercicio-historial-modal.component.scss'],
  imports: [IonFooter, IonCardContent, CommonModule, IonCardTitle,IonLabel,IonItem,
    IonCardHeader, IonCard, IonIcon, IonInput, IonButtons,
    IonButton, IonTitle, NgIf, NgFor,IonCheckbox,
    IonToolbar, IonContent, IonHeader, FormsModule],
  providers: [AlertController, ModalController],
  standalone: true
})
export class EditarEjercicioHistorialComponent implements OnInit {
  @Input() diaEntrenamiento: DiaEntrenamiento; // Recibe el ejercicio a editar
  @Input() editable: boolean; // Define si el modal permite edición
  @Input() historialId: string; // Recibe historialId
  @Input() usuarioId: string; // Recibido desde el componente padre

  diaEntrenamientoBackup: DiaEntrenamiento; // Backup para trabajar temporalmente
  diaEntrenamientoOriginal: DiaEntrenamiento;

  ejercicioAbiertoIndex: number | null = null; // Índice del ejercicio actualmente abierto

  nuevaSerieEnEdicion: boolean = false; // Indicador de nueva serie en edición

  ejerciciosDisponibles: Ejercicio[] = [];
  ejerciciosFiltrados: Ejercicio[] = [];

  guardarDeshabilitado: boolean = true; // Estado inicial




  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private ejercicioService: EjercicioService,
    private historialService: HistorialService,
    private changeDetectorRef: ChangeDetectorRef // Inyección de ChangeDetectorRef

  ) { }

  ngOnInit() {
    // Realizamos copias profundas para preservar el estado original y editable
    this.diaEntrenamientoBackup = JSON.parse(JSON.stringify(this.diaEntrenamiento));
    this.diaEntrenamientoOriginal = JSON.parse(JSON.stringify(this.diaEntrenamiento));
    this.cargarEjerciciosDisponibles();

  }

  // Detectar cambios entre el estado actual y el original
  verificarCambios(): void {
    this.guardarDeshabilitado = JSON.stringify(this.diaEntrenamientoBackup) === JSON.stringify(this.diaEntrenamientoOriginal);
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  // Método para guardar cambios con confirmación
  async guardarCambios(): Promise<void> {
    // Verificar si hay series en edición
    const tieneSeriesEnEdicion = this.diaEntrenamientoBackup.ejerciciosRealizados.some(ejercicio =>
      ejercicio.series.some(serie => serie.enEdicion)
    );

    if (tieneSeriesEnEdicion) {
      const alert = await this.alertController.create({
        header: 'Aviso',
        message: 'Hay series en edición que no han sido confirmadas. Confirma antes de guardar.',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Guardado',
      message: '¿Estás seguro de que deseas guardar los cambios?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async () => {
            try {
              // Filtrar series incompletas antes de guardar
              this.diaEntrenamientoBackup.ejerciciosRealizados.forEach(ejercicio => {
                ejercicio.series = ejercicio.series.filter(
                  serie => serie.peso > 0 && serie.repeticiones > 0
                );
                ejercicio.seriesCompletadas = ejercicio.series.length;
              });

              // Actualizar el día principal
              this.diaEntrenamiento = JSON.parse(JSON.stringify(this.diaEntrenamientoBackup));

              await this.historialService.actualizarDiaEntrenamiento(this.diaEntrenamiento);

              // Cerrar el modal y pasar los datos al componente padre
              this.modalController.dismiss({
                diaEntrenamiento: this.diaEntrenamiento,
                historialId: this.historialId,
                actualizado: true,
              });
            } catch (error) {
              console.error('Error al guardar cambios:', error);
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'Ocurrió un problema al guardar los cambios. Por favor, inténtalo de nuevo.',
                buttons: ['Aceptar'],
              });
              await errorAlert.present();
            }
          },
        },
      ],
    });

    await alert.present();
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
          value: this.diaEntrenamientoBackup.ejerciciosRealizados[index].notas || '',
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
            // Guardamos la nota directamente en el backup para que se actualice en tiempo real
            this.diaEntrenamientoBackup.ejerciciosRealizados[index].notas = data.nota;
            console.log(`Nota guardada para el ejercicio "${this.diaEntrenamientoBackup.ejerciciosRealizados[index].nombreEjercicioRealizado}": ${data.nota}`);
          },
        },
      ],
    });

    await alert.present();
    this.verificarCambios()
  }

  async abrirNotasSerie(ejercicioIndex: number, serieIndex: number) {
    const serie = this.diaEntrenamientoBackup.ejerciciosRealizados[ejercicioIndex].series[serieIndex];
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
            // Actualiza la nota directamente en el backup
            serie.notas = data.nota;
            console.log(`Nota guardada para la serie ${serie.numeroSerie}: ${data.nota}`);
            this.changeDetectorRef.detectChanges(); // Forzar actualización de la vista
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


  // Método para confirmar la adición de una serie extra cuando se hace clic en el botón "Añadir Serie Extra"
  async confirmarAnadirSerie(ejercicioIndex: number) {
    const ejercicio = this.diaEntrenamientoBackup.ejerciciosRealizados[ejercicioIndex];

    // Verifica si se han completado todas las series planificadas antes de añadir una extra
    if (ejercicio.series.length >= ejercicio.seriesTotal) {
      const ultimaSerie = ejercicio.series[ejercicio.series.length - 1];
      const pesoSeriePrevia = ultimaSerie.peso;
      const repeticionesSeriePrevia = ultimaSerie.repeticiones;

      const nuevaSerieExtra: SerieReal = {
        _id: uuidv4(),
        numeroSerie: ejercicio.series.length + 1,
        repeticiones: repeticionesSeriePrevia,
        peso: pesoSeriePrevia,
        enEdicion: true,
        alFallo: false,
        conAyuda: false,
        dolor: false,
        notas: 'Serie extra'
      };

      // Añade la serie extra y verifica cambios solo si es confirmado
      ejercicio.series.push(nuevaSerieExtra);
      this.verificarCambios();
    }
  }

  // Método para verificar si se debe mostrar el botón de "Añadir Serie Extra"
  mostrarBotonAnadirSerie(ejercicio: EjercicioRealizado): boolean {
    // Verifica si todas las series planificadas están completas y confirmadas (no en edición)
    const seriesPlanificadasCompletas = ejercicio.series.length >= ejercicio.seriesTotal &&
      ejercicio.series.slice(0, ejercicio.seriesTotal).every(
        serie => serie.peso > 0 && serie.repeticiones > 0 && !serie.enEdicion
      );

    // Verifica si la última serie es una serie extra y si está en edición
    const ultimaSerieEnEdicion = ejercicio.series.length > ejercicio.seriesTotal &&
      ejercicio.series[ejercicio.series.length - 1].enEdicion;

    // Muestra el botón solo si las series planificadas están completas y no hay una serie extra en edición
    return seriesPlanificadasCompletas && !ultimaSerieEnEdicion;
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
            this.verificarCambios(); // Mover aquí para confirmar los cambios tras la acción
          }
        }
      ]
    });
    await alert.present();
  }

  eliminarSerie(ejercicioIndex: number, serieIndex: number) {
    const ejercicio = this.diaEntrenamientoBackup.ejerciciosRealizados[ejercicioIndex];
    const serieAEliminar = ejercicio.series[serieIndex];

    // Verificar si la serie a eliminar cuenta como completada
    const esSerieCompletada = serieAEliminar.repeticiones > 0 && serieAEliminar.peso > 0;

    // Eliminar la serie del array
    ejercicio.series.splice(serieIndex, 1);

    // Si la serie eliminada estaba completa, restamos uno a `seriesCompletadas`
    if (esSerieCompletada) {
      ejercicio.seriesCompletadas = Math.max(0, ejercicio.seriesCompletadas - 1);
    }

    // Actualizar series completadas y verificar cambios
    this.actualizarSeriesCompletadas(ejercicioIndex);
    this.verificarCambios();
  }

  // Método para alternar el estado editable de un ejercicio específico
  toggleEditarSerie(ejercicioIndex: number, serieIndex: number) {
    const ejercicio = this.diaEntrenamientoBackup.ejerciciosRealizados[ejercicioIndex];
    const serie = ejercicio.series[serieIndex];

    if (serie.enEdicion) {
      // Confirmar (OK): Guardamos los cambios y salimos del modo edición
      serie.enEdicion = false;
      this.actualizarSeriesCompletadas(ejercicioIndex);
      this.verificarCambios(); // Esto revalida los cambios en el backup
    } else {
      // Iniciar edición (EDIT): Permite modificar la serie
      serie.enEdicion = true;
    }

    // Asegurarse de que los cambios sean visibles inmediatamente
    this.changeDetectorRef.detectChanges(); // Asegúrate de inyectar ChangeDetectorRef en el constructor
  }

  // Añadir una nueva serie con control de edición activo
  async anadirSerie(ejercicioIndex: number, esExtra: boolean) {
    const ejercicioRealizado = this.diaEntrenamientoBackup.ejerciciosRealizados[ejercicioIndex];

    const nuevaSerie: SerieReal = {
      _id: uuidv4(),
      numeroSerie: ejercicioRealizado.series.length + 1,
      repeticiones: 0,
      peso: 0,
      alFallo: false,
      conAyuda: false,
      dolor: false,
      enEdicion: true, // Establecemos enEdicion en true para habilitar inmediatamente la edición
      notas: esExtra ? 'Serie extra' : ''
    };

    ejercicioRealizado.series.push(nuevaSerie);
    this.actualizarSeriesCompletadas(ejercicioIndex);
    console.log(`Serie extra añadida al ejercicio ${ejercicioRealizado.nombreEjercicioRealizado}`, nuevaSerie);
    this.verificarCambios(); // Actualiza el estado del botón

  }

  // Método para calcular seriesCompletadas basado en series completas con depuración
  // Actualizar series y verificar cambios después de cualquier modificación
  actualizarSeriesCompletadas(ejercicioIndex: number): void {
    const ejercicio = this.diaEntrenamientoBackup.ejerciciosRealizados[ejercicioIndex];
    ejercicio.seriesCompletadas = ejercicio.series.filter(
      serie => serie.peso > 0 && serie.repeticiones > 0 && !serie.enEdicion
    ).length;
    // Revalidar estado del botón de guardar
  }

  // Cancelar sin guardar cambios: simplemente cerramos el modal
  // Método para cancelar con confirmación solo si hay cambios
  async confirmarCancelarEdicion(): Promise<void> {
    if (this.guardarDeshabilitado) {
      // Si no hay cambios, cerramos directamente
      this.modalController.dismiss(null, 'cancel');
    } else {
      const alert = await this.alertController.create({
        header: 'Cancelar Edición',
        message: '¿Estás seguro de que deseas salir sin guardar los cambios?',
        buttons: [
          { text: 'Continuar Editando', role: 'cancel' },
          {
            text: 'Salir sin Guardar',
            handler: () => {
              this.modalController.dismiss(null, 'cancel');
            }
          }
        ]
      });
      await alert.present();
    }
  }

  // Método para abrir el modal de añadir un nuevo ejercicio
  async abrirModalAnadirEjercicio() {
    const modal = await this.modalController.create({
      component: AnadirEjercicioExtraComponent,
      componentProps: {
        ejerciciosDisponibles: this.ejerciciosDisponibles,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data.role !== 'cancel' && data.data) {
        this.agregarEjercicioNuevo(data.data);
        this.verificarCambios(); // Verifica cambios solo si se añadió un ejercicio
      }
    });

    await modal.present();
  }


  // Otros métodos deben llamar a verificarCambios() después de realizar modificaciones
  agregarEjercicioNuevo(ejercicio: EjercicioRealizado): void {
    // Ejemplo: al añadir un nuevo ejercicio
    const nuevoEjercicio = {
      ...ejercicio,
      series: [],
      notas: 'Ejercicio añadido',
    };
    this.diaEntrenamientoBackup.ejerciciosRealizados.push(nuevoEjercicio);
    this.verificarCambios();
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
      _id: uuidv4(),                    // Identificador único para esta instancia del EjercicioRealizado
      ejercicioPlanId: uuidv4(),        // Nuevo ID específico para esta instancia del ejercicio en el plan
      nombreEjercicioRealizado: ejercicio.nombre,  // Nombre del ejercicio para visualización
      series: [
        {
          _id: uuidv4(),               // ID único para la serie
          numeroSerie: 1,              // Primera serie
          repeticiones: 0,             // Inicia en 0, para ser editado
          peso: 0,                     // Inicia en 0, para ser editado
          enEdicion: true,             // Modo edición activado desde el inicio
          alFallo: false,
          conAyuda: false,
          dolor: false,
          notas: ''
        }
      ],
      seriesCompletadas: 0,           // No hay series completadas inicialmente
      seriesTotal: 1,                 // Total inicial de series es 1
      notas: '',                      // Notas vacías por defecto
      anteriorVezEjercicioID: ''      // Puede iniciarse vacío
    };

    this.diaEntrenamientoBackup.ejerciciosRealizados.push(nuevoEjercicioRealizado);
    console.log('Ejercicio Realizado añadido:', nuevoEjercicioRealizado);
    this.verificarCambios(); // Actualiza el estado del botón

  }

  agregarEjercicioRealizadoDesdePlan(ejercicioPlan: EjercicioPlan) {
    const primeraSerie: SerieReal = {
      _id: uuidv4(),
      numeroSerie: 1,
      repeticiones: ejercicioPlan.repeticiones,
      peso: 0,           // Peso inicial
      enEdicion: true,    // Activa edición en la primera serie
      alFallo: false,
      conAyuda: false,
      dolor: false,
      notas: ''           // Notas iniciales vacías
    };

    const ejercicioRealizado: EjercicioRealizado = {
      _id: uuidv4(),
      ejercicioPlanId: ejercicioPlan._id,
      nombreEjercicioRealizado: ejercicioPlan.nombreEjercicio,
      series: [primeraSerie],               // Solo la primera serie al inicio
      seriesCompletadas: 0,                 // Comienza sin ninguna serie confirmada
      seriesTotal: ejercicioPlan.series,    // Total de series planificadas
      notas: ejercicioPlan.notas
    };

    this.diaEntrenamientoBackup.ejerciciosRealizados.push(ejercicioRealizado);
    console.log('EjercicioRealizado inicializado con la primera serie en edición:', ejercicioRealizado);
    this.verificarCambios(); // Actualiza el estado del botón

  }

  async agregarEjercicioExtra() {
    const modal = await this.modalController.create({
      component: EditarDiaRutinaAgregarEjercicioSueltoComponent,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        const ejercicioPlan = result.data as EjercicioPlan;
        this.agregarEjercicioRealizadoDesdePlan(ejercicioPlan);
        this.verificarCambios(); // Verifica cambios solo si se añadió un ejercicio
      }
    });

    await modal.present();
  }

  async notificarSeriesNoGuardadas() {
    const alert = await this.alertController.create({
      header: 'Aviso',
      message: 'Las series no confirmadas o en 0 de peso o repeticiones no serán guardadas.',
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  // Método para confirmar la eliminación de un ejercicio completo
  async confirmarEliminarEjercicio(ejercicioIndex: number) {
    const alert = await this.alertController.create({
      header: 'Eliminar Ejercicio',
      message: '¿Estás seguro de que quieres eliminar este ejercicio?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarEjercicio(ejercicioIndex);
            this.verificarCambios(); // Mover aquí para confirmar los cambios tras la acción
          },
        },
      ],
    });
    await alert.present();
  }

  // Método para eliminar el ejercicio del array diaEntrenamientoBackup.ejerciciosRealizados
  eliminarEjercicio(ejercicioIndex: number): void {
    this.diaEntrenamientoBackup.ejerciciosRealizados.splice(ejercicioIndex, 1);
    this.verificarCambios();

  }




}
