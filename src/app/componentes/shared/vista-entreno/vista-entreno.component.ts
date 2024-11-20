import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { DiaRutina, EjercicioPlan } from 'src/app/models/rutina.model';
import { IonInput, IonCheckbox, IonGrid, IonRow, IonCol, IonAlert, IonContent, IonModal } from '@ionic/angular/standalone';
import {
  IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonList, IonItem, IonIcon, IonFooter, IonButton
} from "@ionic/angular/standalone";
import { DiaEntrenamiento, EjercicioRealizado, HistorialEntrenamiento, SerieReal } from 'src/app/models/historial-entrenamiento';
import { AuthService } from 'src/app/auth/auth.service'; // Importamos AuthService
import { RutinaService } from 'src/app/services/database/rutina.service';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';
import { v4 as uuidv4 } from 'uuid';
import { NgClass } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { EditarDiaRutinaAgregarEjercicioSueltoComponent } from '../../rutina/editar-dia-rutina-agregar-ejercicio-suelto/editar-dia-rutina-agregar-ejercicio-suelto.component';
import { EntrenamientoEnCursoService } from 'src/app/services/sesion/entrenamiento-en-curso.service';
import { EntrenamientoState } from 'src/app/services/sesion/entrenamiento-en-curso.service';


@Component({
  selector: 'app-vista-entreno',
  templateUrl: './vista-entreno.component.html',
  styleUrls: ['./vista-entreno.component.scss'],
  standalone: true,
  imports: [IonModal, IonContent, IonButton, IonFooter, IonInput, IonIcon, IonItem, IonList,
    IonCardContent, IonCardTitle, IonCardHeader,
    IonCard, FormsModule, NgClass, NgFor, NgIf, IonCheckbox]
})
export class VistaEntrenoComponent implements OnInit, OnChanges {
  [x: string]: any;

  @Input() rutinaId: string | null = null;
  @Input() diaRutinaId: string | null = null;
  @Input() diaRutinaNombre: string | null = null;
  @Input() descripcion: string | null = null;


  ejerciciosRealizados: any[] = []; // Aquí almacenaremos los ejercicios del día

  usuarioId: string | null = null; // Añadir esta propiedad
  nombreRutinaEntrenamiento: string | null
  // Variables de conteo
  ejerciciosCompletados = 0;
  totalEjercicios = 0;
  entrenamientoDetalles: { rutinaId: string; diaRutinaId: string; descripcion: string } | null = null;

  private inicioEntrenamiento: Date | null = null; // Hora de inicio del entrenamiento

  constructor(
    private rutinaService: RutinaService,
    private ejercicioService: EjercicioService, // Servicio que te permite cargar los datos de la rutina
    private alertController: AlertController, // Para crear alertas
    private historialService: HistorialService,
    private authService: AuthService,
    private entrenamientoEnCursoService: EntrenamientoEnCursoService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalController: ModalController
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rutinaId'] || changes['diaRutinaId'] || changes['descripcion']) {
      console.log('Datos actualizados en ngOnChanges:', {
        rutinaId: this.rutinaId,
        diaRutinaId: this.diaRutinaId,
        descripcion: this.descripcion
      });

      if (this.rutinaId && this.diaRutinaId) {
        this.cargarDiaRutinaPorId(this.rutinaId, this.diaRutinaId);
      }
    }
  }

  ngOnInit() {
    // Solo suscripción al usuario

    this.inicioEntrenamiento = new Date(); // Almacena la fecha y hora de inicio del entrenamiento
    this.authService.usuarioLogeado$.subscribe((usuario) => {
      if (usuario) {
        this.usuarioId = usuario._id;
      } else {
        console.error('No hay usuario logueado.');
      }
    });

    console.log('Rutina ID en app-vista-entreno:', this.rutinaId);
    console.log('Día Rutina ID en app-vista-entreno:', this.diaRutinaId);
    console.log('Descripción en app-vista-entreno:', this.descripcion);
  }

  async cargarDiaRutinaPorId(rutinaId: string, diaRutinaId: string) {
    console.log('cargarDiaRutinaPorId -> RutinaiD: ', rutinaId);
    console.log('cargarDiaRutinaPorId -> diaRutinaId: ', diaRutinaId);

    try {
      // Intentamos cargar la rutina con el ID proporcionado
      const resultadoCarga = await this.cargarRutina(rutinaId, diaRutinaId);
      console.log('cargarDiaRutinaPorId -> Resultado de cargarRutina:', resultadoCarga);

      // Verificamos que se hayan cargado la rutina y el día
      const { rutina, diaRutina } = resultadoCarga;
      console.log('cargarDiaRutinaPorId -> Rutina obtenida:', rutina);
      console.log('cargarDiaRutinaPorId -> Día de rutina obtenido:', diaRutina);

      if (rutina && diaRutina) {
        console.log('Rutina cargada:', rutina);
        console.log('Día de rutina cargado:', diaRutina);

        // Configuramos el nombre de la rutina para el entrenamiento
        this.nombreRutinaEntrenamiento = rutina.nombre;

        // Creamos los EjerciciosRealizados asociados al día de rutina
        this.ejerciciosRealizados = await Promise.all(
          diaRutina.ejercicios.map(ejercicioPlan => this.crearEjercicioRealizado(ejercicioPlan, rutinaId))
        );
        this.totalEjercicios = this.ejerciciosRealizados.length;

        // Ajustamos el peso en las series si falta
        this.ejerciciosRealizados.forEach(ejercicioRealizado => {
          ejercicioRealizado.seriesReal.forEach(serieReal => {
            if (!serieReal.peso) {
              serieReal.peso = serieReal.pesoAnterior || 0;
            }
          });
        });

        // Actualizamos el estado de ejercicios completados
        this.actualizarEjerciciosCompletados();

        console.log('cargarDiaRutinaPorId -> Ejercicios cargados correctamente:', this.ejerciciosRealizados);
      } else {
        console.error(`No se encontró el día de rutina con ID ${diaRutinaId} en la rutina con ID ${rutinaId}`);
        console.log('cargarDiaRutinaPorId -> Valores faltantes:', {
          rutinaExistente: !!rutina,
          diaRutinaExistente: !!diaRutina,
        });
      }
    } catch (error) {
      console.error('Error al cargar el día de la rutina:', error);
    }
  }

  private async cargarRutina(rutinaId: string, diaRutinaId: string) {
    const rutina = await this.rutinaService.obtenerRutinaPorId(rutinaId);
    const diaRutina = rutina?.dias.find(dia => dia._id === diaRutinaId); // Busca el día específico por ID
    return { rutina, diaRutina };
  }

  private async crearEjercicioRealizado(ejercicioPlan: EjercicioPlan, rutinaId: string) {
    const ejercicioDetalles = await this.ejercicioService.obtenerEjercicioPorId(ejercicioPlan.ejercicioId);

    // Aquí pasamos ejercicioPlan._id en lugar de ejercicioPlan.ejercicioId
    const ultimoEjercicio = this.usuarioId ? await this.historialService.obtenerUltimoEjercicioRealizado(
      this.usuarioId,
      ejercicioPlan._id,  // Cambiado a ejercicioPlan._id
      rutinaId,
      this.diaRutinaId
    ) : null;

    const seriesReal: SerieReal[] = Array.from({ length: ejercicioPlan.series }).map((_, index) => {
      return {
        _id: uuidv4(),
        numeroSerie: index + 1,
        repeticiones: ejercicioPlan.repeticiones,
        repeticionesAnterior: ultimoEjercicio?.series[index]?.repeticiones || null,
        peso: ultimoEjercicio?.series[index]?.peso ?? 0, // Diferencia entre peso 0 y null
        pesoAnterior: ultimoEjercicio?.series[index]?.peso || null,
        alFallo: false,
        conAyuda: false,
        dolor: false,
        enEdicion: true,
        notas: ''
      };
    });

    return {
      ejercicioPlanId: ejercicioPlan._id,  // Asegúrate de que esto sea ejercicioPlan._id
      nombreEjercicio: ejercicioDetalles.nombre,
      seriesReal,
      seriesCompletadas: 0,
      seriesTotal: seriesReal.length,
      abierto: false,
      completado: false,
      notas: '',
      anteriorVezEjercicioID: ultimoEjercicio?._id || null
    };
  }

  // Método para abrir el alert para agregar notas a una serie específica
  async abrirNotasSerie(ejercicioIndex: number, serieIndex: number) {
    const alert = await this.alertController.create({
      header: 'Añadir Nota',
      inputs: [
        {
          name: 'nota',
          type: 'text',
          placeholder: 'Escribe tu nota aquí',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Nota cancelada');
          },
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.ejerciciosRealizados[ejercicioIndex].seriesReal[serieIndex].notas = data.nota;
            console.log('Nota guardada para la serie:', data.nota);
          },
        },
      ],
    });

    await alert.present();
  }

  // Método para abrir el alert para agregar notas
  async abrirNotas(index: number) {
    const alert = await this.alertController.create({
      header: 'Añadir Nota',
      inputs: [
        {
          name: 'nota',
          type: 'text',
          placeholder: 'Escribe tu nota aquí'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Nota cancelada');
          }
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.ejerciciosRealizados[index].notas = data.nota; // Guardamos la nota en el ejercicio correspondiente
            console.log('Nota guardada:', data.nota);
          }
        }
      ]
    });

    await alert.present();
  }

  async guardarEntrenamiento() {
    if (this.ejerciciosRealizados && this.ejerciciosRealizados.length > 0) {
      // Clasificamos los ejercicios en completados, incompletos y no iniciados
      const ejerciciosCompletos = this.ejerciciosRealizados.filter(ej => ej.seriesCompletadas >= ej.seriesTotal);
      const ejerciciosIncompletos = this.ejerciciosRealizados.filter(ej => ej.seriesCompletadas > 0 && ej.seriesCompletadas < ej.seriesTotal);
      const ejerciciosNoIniciados = this.ejerciciosRealizados.filter(ej => ej.seriesCompletadas === 0);

      if (ejerciciosIncompletos.length === 0 && ejerciciosNoIniciados.length === 0) {
        this.guardarSesion();
        return;
      }

      if (ejerciciosNoIniciados.length > 0 && ejerciciosCompletos.length > 0) {
        const alert = await this.alertController.create({
          header: 'Ejercicios no realizados',
          message: 'Algunos ejercicios no se han iniciado. ¿Desea guardar todos los ejercicios? Aquellos no iniciados tendrán la nota "NO SE HIZO".',
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Guardar', handler: () => this.guardarSesion('No se hizo') }
          ]
        });
        await alert.present();
        return;
      }

      if (ejerciciosIncompletos.length > 0) {
        const alert = await this.alertController.create({
          header: 'Ejercicios incompletos',
          message: 'Hay ejercicios con series incompletas. ¿Desea guardar solo las series completadas y marcar los ejercicios incompletos?',
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Guardar', handler: () => this.guardarSesion('Incompleto') }
          ]
        });
        await alert.present();
        return;
      }
    } else {
      console.warn('No hay ejercicios para guardar en esta sesión');
    }
  }

  async guardarSesion(mensajeEstado?: string) {
    console.log('Ejercicios realizados a guardar:', this.ejerciciosRealizados);

    const finEntrenamiento = new Date(); // Marca la fecha y hora de finalización del entrenamiento
    const tiempoEmpleadoMinutos = this.inicioEntrenamiento
      ? Math.floor((finEntrenamiento.getTime() - this.inicioEntrenamiento.getTime()) / 60000)
      : 0; // Calcula la duración en minutos

    const nuevoDiaEntrenamiento: DiaEntrenamiento = {
      _id: uuidv4(),
      rutinaId: this.rutinaId,
      fechaEntrenamiento: this.inicioEntrenamiento?.toISOString() || new Date().toISOString(),
      nombreRutinaEntrenamiento: this.nombreRutinaEntrenamiento || 'Rutina sin nombre',
      diaRutinaId: this.diaRutinaId!,
      diaEntrenamientoNombre: this.diaRutinaNombre,
      descripcion: this.descripcion || '',
      tiempoEmpleado: tiempoEmpleadoMinutos, // Tiempo empleado en minutos
      ejerciciosRealizados: this.ejerciciosRealizados.map(ej => {
        let notasEjercicio = '';
        if (ej.seriesCompletadas === 0) {
          notasEjercicio = mensajeEstado === 'No se hizo' ? 'No se hizo' : '';
        } else if (ej.seriesCompletadas < ej.seriesTotal) {
          notasEjercicio = 'Incompleto';
        }

        return {
          _id: uuidv4(),
          ejercicioPlanId: ej.ejercicioPlanId,
          nombreEjercicioRealizado: ej.nombreEjercicio,
          series: ej.seriesReal
            .filter(serie => serie.completado)
            .map((serie, index) => ({
              numeroSerie: index + 1,
              repeticiones: serie.repeticiones,
              repeticionesAnterior: serie.repeticionesAnterior || null,
              peso: serie.peso,
              pesoAnterior: serie.pesoAnterior || null,
              alFallo: serie.alFallo,
              conAyuda: serie.conAyuda,
              dolor: serie.dolor,
              notas: serie.notas || null,
            })),
          seriesCompletadas: ej.seriesCompletadas || 0,
          seriesTotal: ej.seriesTotal || ej.seriesReal.length,
          notas: [notasEjercicio, ej.notas].filter(nota => nota).join(' - '),
          anteriorVezEjercicioID: ej._id || null,
        };
      }),
      notas: '',
    };


    try {
      if (!this.usuarioId) {
        console.error('El usuario no está identificado.');
        return;
      }

      const historialesExistentes = await this.historialService.obtenerHistorialesPorUsuario(this.usuarioId);
      let historialExistente: HistorialEntrenamiento | null = null;

      if (historialesExistentes.length > 0) {
        historialExistente = historialesExistentes[0];
        console.log('Historial existente encontrado:', historialExistente);
      } else {
        console.log('No se encontró un historial existente para el usuario.');
      }

      console.log('Ejercicios realizados a guardar antes de :   if (historialExistente)', this.ejerciciosRealizados);

      if (historialExistente) {
        historialExistente.entrenamientos.push(nuevoDiaEntrenamiento);
        await this.historialService.actualizarHistorial(historialExistente);
      } else {
        const nuevoHistorial: HistorialEntrenamiento = {
          entidad: 'historialEntrenamiento',
          usuarioId: this.usuarioId,
          entrenamientos: [nuevoDiaEntrenamiento],
        };
        await this.historialService.agregarHistorial(nuevoHistorial);
      }

      console.log('Nueva sesión de entrenamiento guardada:', nuevoDiaEntrenamiento);
      this.mostrarAlertaExito();

      // Finaliza el entrenamiento y regresa a la vista principal
      this.entrenamientoEnCursoService.setEstadoEntrenamiento({
        enProgreso: false,
        pausado: false,
      });
      this.entrenamientoEnCursoService.finalizarSinGuardarEntrenamiento()

    } catch (error) {
      console.error('Error al guardar el entrenamiento:', error);
      this.mostrarAlertaError();
    }
  }


  async mostrarAlertaExito() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El entrenamiento ha sido guardado correctamente.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async mostrarAlertaError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Hubo un problema al guardar el entrenamiento. Por favor, inténtalo de nuevo.',
      buttons: ['OK']
    });
    await alert.present();
  }

  toggleEditarSerie(ejercicioIndex: number, serieIndex: number) {
    const ejercicio = this.ejerciciosRealizados[ejercicioIndex];
    const serie = ejercicio.seriesReal[serieIndex];

    console.log(`Ejecutando toggleEditarSerie para ejercicio ${ejercicioIndex}, serie ${serieIndex}`);

    if (serie.enEdicion) {
      if (serie.peso === 0) {
        console.warn("El peso no puede ser 0. Establezca un valor de peso.");
        return;
      }

      serie.enEdicion = false;

      // Incrementar seriesCompletadas solo si es la primera vez que se completa esta serie
      if (!serie.completado) {
        ejercicio.seriesCompletadas++;
        serie.completado = true; // Marcar la serie como completada

        // **Actualizar el peso en la siguiente serie**
        if (serieIndex + 1 < ejercicio.seriesReal.length) {
          const siguienteSerie = ejercicio.seriesReal[serieIndex + 1];
          if (!siguienteSerie.peso || siguienteSerie.peso === 0) {
            siguienteSerie.peso = serie.peso; // Asigna el peso de la serie actual
            console.log(`Peso de la siguiente serie (${serieIndex + 1}) establecido a ${serie.peso} kg`);
          }
        }
      }

      // Verificar si todas las series están completadas para cerrar el ejercicio
      if (ejercicio.seriesCompletadas === ejercicio.seriesTotal) {
        ejercicio.abierto = false; // Cerrar el ejercicio
        console.log(`Ejercicio ${ejercicioIndex} completado y cerrado. Estado de 'abierto':`, ejercicio.abierto);
      } else {
        console.log(`Ejercicio ${ejercicioIndex} aún no completo. Estado de 'abierto':`, ejercicio.abierto);
      }

    } else {
      serie.enEdicion = true;
    }

    // Asegurar que se actualice el estado de ejercicios completados
    this.actualizarEjerciciosCompletados();
  }

  private actualizarEjerciciosCompletados() {
    this.ejerciciosCompletados = this.ejerciciosRealizados.filter(ejercicioRealizado => ejercicioRealizado.seriesCompletadas >= ejercicioRealizado.seriesTotal).length;
    this.totalEjercicios = this.ejerciciosRealizados.length;
  }



  marcarSerieCompletada(ejercicioRealizadoIndex: number, serieRealIndex: number): void {
    console.log(`Método marcarSerieCompletada llamado para ejercicio ${ejercicioRealizadoIndex}, serie ${serieRealIndex}`);
  
    const ejercicioRealizado = this.ejerciciosRealizados[ejercicioRealizadoIndex];
    const serieReal = ejercicioRealizado.seriesReal[serieRealIndex];
  
    // Validar que los campos necesarios estén completos y mostrar un mensaje de alerta en caso de error
    if (!serieReal.repeticiones || serieReal.peso === undefined || serieReal.peso <= 0) {
      console.warn(`La serie ${serieRealIndex} necesita repeticiones y peso definidos para completarse.`);
      return;
    }
  
    // Marcar la serie como completada y bloquear su edición
    serieReal.completado = true;
    serieReal.enEdicion = false;
    console.log(`Serie ${serieRealIndex} marcada como completada para ejercicio ${ejercicioRealizadoIndex}.`);
  
    // Si es la siguiente serie en la secuencia, incrementa el contador de series completadas
    if (serieRealIndex === ejercicioRealizado.seriesCompletadas) {
      ejercicioRealizado.seriesCompletadas++;
      console.log(`Contador de series completadas actualizado a ${ejercicioRealizado.seriesCompletadas}.`);
    }
  
    // Si todas las series están completadas, marca el ejercicio como completado y ciérralo
    if (ejercicioRealizado.seriesCompletadas === ejercicioRealizado.seriesTotal) {
      ejercicioRealizado.completado = true;
      ejercicioRealizado.abierto = false; // Cerrar el ejercicio automáticamente
      console.log(`Ejercicio ${ejercicioRealizadoIndex} cerrado al completarse. Estado de 'abierto': ${ejercicioRealizado.abierto}`);
    } else {
      console.log(`Ejercicio ${ejercicioRealizadoIndex} aún abierto. Estado de 'abierto': ${ejercicioRealizado.abierto}`);
    }
  
    // Actualizar el peso de la siguiente serie si es la siguiente en la secuencia
    if (serieRealIndex + 1 < ejercicioRealizado.seriesReal.length) {
      const siguienteSerieReal = ejercicioRealizado.seriesReal[serieRealIndex + 1];
      if (siguienteSerieReal.peso === 0 || siguienteSerieReal.peso === null) {
        siguienteSerieReal.peso = serieReal.peso; // Asigna el peso de la serie actual como peso predeterminado para la siguiente serie
        console.log(`Peso de la serie ${serieRealIndex + 1} actualizado a ${serieReal.peso} kg.`);
      }
    }
  
    // Validar el estado completo del ejercicio y sus series
    console.log('Ejercicio después de marcar serie:', JSON.stringify(ejercicioRealizado, null, 2));
  
    // Actualizar el estado del entrenamiento
    this.actualizarEstadoEntrenamiento();
  
    // Imprimir depuración detallada del estado actualizado
    console.log('Estado del entrenamiento actualizado tras completar la serie:', JSON.stringify(this.entrenamientoEnCursoService.obtenerEstadoActual(), null, 2));
  
    // Forzar la detección de cambios para asegurar que el HTML refleje el estado actualizado
    this.changeDetectorRef.detectChanges();
  }

  editarSerie(ejercicioRealizadoIndex: number, serieRealIndex: number) {
    const serieReal = this.ejerciciosRealizados[ejercicioRealizadoIndex].seriesReal[serieRealIndex];

    if (serieReal.completado) {
      // Habilitar la edición
      serieReal.enEdicion = true;
      // Guardar valores anteriores por si necesitamos revertir
      serieReal.valoresAnteriores = {
        repeticiones: serieReal.repeticiones,
        peso: serieReal.peso,
        fallo: serieReal.fallo,
        dolor: serieReal.dolor,
        ayuda: serieReal.ayuda
      };
    }
    serieReal.completado = false;

    // Asegurar que ejerciciosCompletados se actualice
    this.actualizarEjerciciosCompletados();
  }

  toggleEjercicio(index: number) {
    // Cerrar todos los ejercicios menos el seleccionado
    this.ejerciciosRealizados.forEach((ejercicioRealizado, i) => {
      if (i !== index) {
        ejercicioRealizado.abierto = false;
      }
    });

    // Alternar el estado abierto/cerrado del ejercicio seleccionado sin importar su estado de completado
    this.ejerciciosRealizados[index].abierto = !this.ejerciciosRealizados[index].abierto;
  }


  anadirSerieExtra(ejercicioRealizadoIndex: number) {
    const ejercicioRealizado = this.ejerciciosRealizados[ejercicioRealizadoIndex];
    const ultimaSerieReal = ejercicioRealizado.seriesReal[ejercicioRealizado.seriesReal.length - 1];

    const nuevaSerieReal: SerieReal = {
      _id: uuidv4(),
      numeroSerie: ejercicioRealizado.seriesReal.length + 1,
      repeticiones: ultimaSerieReal.repeticiones || 0,
      peso: ultimaSerieReal.peso || 0, // Copiar el peso de la última serie sin establecer `pesoAnterior`
      alFallo: false,
      conAyuda: false,
      dolor: false,
      enEdicion: true,  // La nueva serie estará en edición
      notas: 'Serie extra'
    };

    // Añadir la serie extra al array `seriesReal` sin afectar `seriesTotal`
    ejercicioRealizado.seriesReal.push(nuevaSerieReal);

    // Actualizar el estado general de ejercicios completados
    this.actualizarEjerciciosCompletados();
  }

  async confirmarEliminarUltimaSerie(ejercicioRealizadoIndex: number) {
    const alert = await this.alertController.create({
      header: 'Eliminar Serie',
      message: '¿Estás seguro de que quieres eliminar la última serie?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarUltimaSerie(ejercicioRealizadoIndex);
          },
        },
      ],
    });
    await alert.present();
  }

  eliminarUltimaSerie(ejercicioRealizadoIndex: number) {
    const ejercicioRealizado = this.ejerciciosRealizados[ejercicioRealizadoIndex];

    // Solo permite eliminar si hay series extras
    if (ejercicioRealizado.seriesReal.length > ejercicioRealizado.seriesTotal) {
      ejercicioRealizado.seriesReal.pop(); // Elimina la última serie

      // Decrementa el contador de series completadas si la serie eliminada estaba completa
      if (ejercicioRealizado.seriesCompletadas > ejercicioRealizado.seriesTotal) {
        ejercicioRealizado.seriesCompletadas--;
        this.actualizarEjerciciosCompletados();
      }
    }
  }

  mostrarBotonAnadirSerieExtra(ejercicioRealizadoIndex: number): boolean {
    const ejercicioRealizado = this.ejerciciosRealizados[ejercicioRealizadoIndex];
    return ejercicioRealizado.seriesReal.every(serieReal => !serieReal.enEdicion);
  }

  async cancelarEntrenamiento() {
    const alert = await this.alertController.create({
      header: 'Cancelar Entrenamiento',
      message: 'Si cancelas, los ejercicios realizados en esta sesión no se guardarán. ¿Estás seguro de que deseas cancelar?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancelación de entrenamiento abortada');
          },
        },
        {
          text: 'Sí, cancelar',
          role: 'destructive',
          handler: () => this.ejecutarCancelacion(), // Llamar a una función que maneje la lógica
        },
      ],
    });

    await alert.present();
  }

  private async ejecutarCancelacion() {
    try {
      // Finalizar el entrenamiento sin guardar
      await this.entrenamientoEnCursoService.finalizarSinGuardarEntrenamiento();

      // Actualizar el estado a uno vacío en lugar de un booleano
      this.entrenamientoEnCursoService.setEstadoEntrenamiento({
        enProgreso: false,
        pausado: false,
      });

      this.entrenamientoDetalles = null; // Limpiar los detalles en la vista
      this.changeDetectorRef.detectChanges(); // Forzar actualización de la interfaz
      console.log('Entrenamiento cancelado y eliminado correctamente');
    } catch (error) {
      console.error('Error al cancelar el entrenamiento:', error);
    }
  }


  async agregarEjercicioRealizadoDesdePlan(ejercicioPlan: EjercicioPlan) {
    console.log('Datos del EjercicioPlan:', ejercicioPlan);

    const ejercicioRealizado = await this.crearEjercicioRealizado(ejercicioPlan, this.rutinaId!);
    console.log('EjercicioRealizado creado con lógica reutilizada:', ejercicioRealizado);

    // Agregar el nuevo ejercicio al array de ejercicios realizados
    this.ejerciciosRealizados.push(ejercicioRealizado);

    console.log('Estado actualizado de ejerciciosRealizados:', this.ejerciciosRealizados);
    this.actualizarEjerciciosCompletados();

    // Forzar la detección de cambios
    this.changeDetectorRef.detectChanges();
  }

  // Método para abrir el modal de añadir ejercicio extra
  async agregarEjercicioExtra() {
    const modal = await this.modalController.create({
      component: EditarDiaRutinaAgregarEjercicioSueltoComponent,
    });

    modal.onDidDismiss().then((result) => {
      console.log('Resultado del modal:', result);
      if (result.data) {
        const ejercicioPlan = result.data as EjercicioPlan;
        console.log('EjercicioPlan recibido:', ejercicioPlan);
        this.agregarEjercicioRealizadoDesdePlan(ejercicioPlan);
      } else {
        console.log('No se seleccionó ningún ejercicio.');
      }
    });

    await modal.present();
  }

  decrementarPeso(ejercicio: any, serieIndex: number) {
    const serie = ejercicio.seriesReal[serieIndex];
    if (!serie.peso) serie.peso = 0;
    serie.peso = Math.max(0, serie.peso - 1.25);
  }

  incrementarPeso(ejercicio: any, serieIndex: number) {
    const serie = ejercicio.seriesReal[serieIndex];
    if (!serie.peso) serie.peso = 0;
    serie.peso += 1.25;
  }

  actualizarEstadoEntrenamiento(): void {
    const estadoActualizado: EntrenamientoState = {
      ...this['obtenerEstadoActual'](), // Recupera el estado actual
      datosEntrenamiento: this.ejerciciosRealizados.map((ejercicio) => ({
        _id: ejercicio._id,
        ejercicioId: ejercicio.ejercicioId,
        nombreEjercicio: ejercicio.nombreEjercicio,
        tipoPeso: ejercicio.tipoPeso,
        series: ejercicio.seriesReal.map((serie) => ({
          numeroSerie: serie.numeroSerie,
          repeticiones: serie.repeticiones,
          peso: serie.peso,
          notas: serie.notas,
          alFallo: serie.alFallo,
          conAyuda: serie.conAyuda,
          dolor: serie.dolor,
          completado: serie.completado,
        })), // Incluye toda la información de las series
      })),
      timestampUltimaPausa: new Date().toISOString(), // Actualización del tiempo
    };
  
    this['setEstadoEntrenamiento'](estadoActualizado);
  
    console.log(
      'Estado del entrenamiento actualizado:',
      JSON.stringify(estadoActualizado, null, 2)
    );
  }

  calcularTiempoAcumulado(): number {
    if (!this.inicioEntrenamiento) {
      console.warn('El entrenamiento no ha iniciado.');
      return 0; // Si no hay inicio, el tiempo acumulado es 0
    }

    const ahora = new Date();
    const inicio = new Date(this.inicioEntrenamiento);
    const ultimaPausa = this.entrenamientoEnCursoService.obtenerEstadoActual().timestampUltimaPausa
      ? new Date(this.entrenamientoEnCursoService.obtenerEstadoActual().timestampUltimaPausa)
      : null;

    // Si está pausado, calcula el tiempo hasta la última pausa
    if (this.entrenamientoEnCursoService.obtenerEstadoActual().pausado && ultimaPausa) {
      return Math.floor((ultimaPausa.getTime() - inicio.getTime()) / 60000); // Diferencia en minutos
    }

    // Si no está pausado, calcula el tiempo hasta ahora
    return Math.floor((ahora.getTime() - inicio.getTime()) / 60000); // Diferencia en minutos
  }







  /*  QUIZA ELIMINABLES */

  // Método para reiniciar el estado del entrenamiento
  /*   reiniciarEstadoEntrenamiento() {
      this.ejerciciosRealizados.forEach(ejercicioRealizado => {
        ejercicioRealizado.seriesCompletadas = 0;
        ejercicioRealizado.seriesReal.forEach(serieReal => {
          serieReal.repeticiones = null;
          serieReal.peso = null;
          serieReal.alFallo = false;
          serieReal.dolor = false;
          serieReal.conAyuda = false;
          serieReal.completado = false;
          serieReal.enEdicion = true;
          serieReal.notas = '';
        });
        ejercicioRealizado.completado = false;
        ejercicioRealizado.abierto = false;
        ejercicioRealizado.notas = '';
      });
  
      this.ejerciciosCompletados = 0;
      this.totalEjercicios = this.ejerciciosRealizados.length;
      console.log('Estado del entrenamiento reiniciado');
    } */


  // Método para toggle edición
  /*  toggleEdicion(ejercicioIndex: number, serieIndex: number) {
     const serie = this.ejerciciosRealizados[ejercicioIndex].seriesReal[serieIndex];
     if (serie.enEdicion) {
       // Guardar cambios
       serie.enEdicion = false;
     } else {
       // Entrar en modo edición
       serie.enEdicion = true;
     }
   } */

}
