import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DiaRutina, EjercicioPlan } from 'src/app/models/rutina.model';
import { IonInput, IonCheckbox, IonGrid, IonRow, IonCol, IonAlert, IonContent } from '@ionic/angular/standalone';
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
import { EntrenamientoEstadoService } from 'src/app/services/sesion/entrenamiento-estado.service';
import { NgClass } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';



@Component({
  selector: 'app-vista-entreno',
  templateUrl: './vista-entreno.component.html',
  styleUrls: ['./vista-entreno.component.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonFooter, IonInput, IonIcon, IonItem, IonList,
    IonCardContent, IonCardTitle, IonCardHeader,
    IonCard, FormsModule, NgClass, NgFor, NgIf, IonCheckbox]
})
export class VistaEntrenoComponent implements OnInit, OnChanges {
  [x: string]: any;

  @Input() rutinaId: string | null = null;
  @Input() diaRutinaId: string | null = null;
  @Input() descripcion: string | null = null;


  ejercicios: any[] = []; // Aquí almacenaremos los ejercicios del día

  usuarioId: string | null = null; // Añadir esta propiedad
  nombreRutinaEntrenamiento: string | null
  // Variables de conteo
  ejerciciosCompletados = 0;
  totalEjercicios = 0;
  entrenamientoEnProgreso: boolean = false;
  entrenamientoDetalles: { rutinaId: string; diaRutinaId: string; descripcion: string } | null = null;

  private inicioEntrenamiento: Date | null = null; // Hora de inicio del entrenamiento

  constructor(
    private route: ActivatedRoute,
    private rutinaService: RutinaService,
    private ejercicioService: EjercicioService, // Servicio que te permite cargar los datos de la rutina
    private alertController: AlertController, // Para crear alertas
    private historialService: HistorialService,
    private authService: AuthService,
    private router: Router,
    private entrenamientoEstadoService: EntrenamientoEstadoService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rutinaId'] || changes['diaRutinaId'] || changes['descripcion']) {
      console.log('Datos actualizados en ngOnChanges:', {
        rutinaId: this.rutinaId,
        diaRutinaId: this.diaRutinaId,
        descripcion: this.descripcion
      });

      if (this.rutinaId && this.diaRutinaId) {
        this.cargarDiaRutinaPorNombre(this.rutinaId, this.diaRutinaId);
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
  }

  async cargarDiaRutinaPorNombre(rutinaId: string, diaNombre: string) {
    try {
      const { rutina, diaRutina } = await this.cargarRutina(rutinaId, diaNombre);

      if (rutina && diaRutina) {
        console.log('Rutina cargada:', rutina);
        console.log('Día de rutina cargado:', diaRutina);

        this.nombreRutinaEntrenamiento = rutina.nombre;
        this.ejercicios = await Promise.all(diaRutina.ejercicios.map(ej => this.crearEjercicio(ej)));
        this.totalEjercicios = this.ejercicios.length;

        this.ejercicios.forEach(ejercicio => {
          ejercicio.seriesReal.forEach(serie => {
            if (!serie.peso) {
              serie.peso = serie.pesoAnterior || 0;
            }
          });
        });

        this.actualizarEjerciciosCompletados();
      } else {
        console.error(`No se encontró el día de rutina ${diaNombre} en la rutina con ID ${rutinaId}`);
      }
    } catch (error) {
      console.error('Error al cargar el día de la rutina:', error);
    }
  }

  // Método para cargar la rutina y el día de la rutina
  private async cargarRutina(rutinaId: string, diaNombre: string) {
    const rutina = await this.rutinaService.obtenerRutinaPorId(rutinaId);
    const diaRutina = await this.rutinaService.obtenerDiaRutinaPorNombre(rutinaId, diaNombre);
    return { rutina, diaRutina };
  }

  // Método para obtener el último ejercicio realizado por el usuario
  private async obtenerUltimoEjercicioRealizado(usuarioId: string, ejercicioId: string): Promise<EjercicioRealizado | null> {
    return await this.historialService.obtenerUltimoEjercicioRealizado(usuarioId, ejercicioId);
  }

  // Método para crear las series con valores anteriores
  private crearSerieReal(serie: SerieReal, ultimoEjercicio: EjercicioRealizado | null, index: number): SerieReal {
    return {
      _id: uuidv4(),
      numeroSerie: serie.numeroSerie,
      repeticiones: serie.repeticiones,
      repeticionesAnterior: ultimoEjercicio?.series[index]?.repeticiones || null,
      peso: ultimoEjercicio?.series[index]?.peso || 0,
      pesoAnterior: ultimoEjercicio?.series[index]?.peso || null,
      alFallo: false,
      conAyuda: false,
      dolor: false,
      enEdicion: true,
      notas: ''
    };
  }

  // Método para crear cada ejercicio con sus series y valores anteriores
  private async crearEjercicio(ej: EjercicioPlan) {
    const ejercicioDetalles = await this.ejercicioService.obtenerEjercicioPorId(ej.ejercicioId);
    const ultimoEjercicio = this.usuarioId ? await this.obtenerUltimoEjercicioRealizado(this.usuarioId, ej.ejercicioId) : null;

    // Generar series según el número de series y repeticiones del nuevo modelo
    const seriesReal: SerieReal[] = Array.from({ length: ej.series }).map((_, index) => {
      return {
        _id: uuidv4(),
        numeroSerie: index + 1,
        repeticiones: ej.repeticiones,
        repeticionesAnterior: ultimoEjercicio?.series[index]?.repeticiones || null,
        peso: ultimoEjercicio?.series[index]?.peso ?? 0, // Cambiar de `||` a `??` para diferenciar peso 0 y null
        pesoAnterior: ultimoEjercicio?.series[index]?.peso || null,
        alFallo: false,
        conAyuda: false,
        dolor: false,
        enEdicion: true,
        notas: ''
      };
    });

    return {
      ejercicioPlanId: ej.ejercicioId,
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
            this.ejercicios[ejercicioIndex].seriesReal[serieIndex].notas = data.nota;
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
            this.ejercicios[index].notas = data.nota; // Guardamos la nota en el ejercicio correspondiente
            console.log('Nota guardada:', data.nota);
          }
        }
      ]
    });

    await alert.present();
  }

  async guardarEntrenamiento() {
    if (this.ejercicios && this.ejercicios.length > 0) {
      // Clasificamos los ejercicios en completados, incompletos y no iniciados
      const ejerciciosCompletos = this.ejercicios.filter(ej => ej.seriesCompletadas >= ej.seriesTotal);
      const ejerciciosIncompletos = this.ejercicios.filter(ej => ej.seriesCompletadas > 0 && ej.seriesCompletadas < ej.seriesTotal);
      const ejerciciosNoIniciados = this.ejercicios.filter(ej => ej.seriesCompletadas === 0);

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
    const finEntrenamiento = new Date(); // Marca la fecha y hora de finalización del entrenamiento
    const tiempoEmpleadoMinutos = this.inicioEntrenamiento
      ? Math.floor((finEntrenamiento.getTime() - this.inicioEntrenamiento.getTime()) / 60000)
      : 0; // Calcula la duración en minutos

    const nuevoDiaEntrenamiento: DiaEntrenamiento = {
      _id: uuidv4(),
      fechaEntrenamiento: this.inicioEntrenamiento?.toISOString() || new Date().toISOString(),
      nombreRutinaEntrenamiento: this.nombreRutinaEntrenamiento || 'Rutina sin nombre',
      diaRutinaId: this.diaRutinaId!,
      descripcion: this.descripcion || '',
      tiempoEmpleado: tiempoEmpleadoMinutos, // Tiempo empleado en minutos
      ejerciciosRealizados: this.ejercicios.map(ej => {
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
      this.entrenamientoEnProgreso = false;
      this.entrenamientoEstadoService.finalizarEntrenamiento();

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
    const ejercicio = this.ejercicios[ejercicioIndex];
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

  // Método para toggle edición
  toggleEdicion(ejercicioIndex: number, serieIndex: number) {
    const serie = this.ejercicios[ejercicioIndex].seriesReal[serieIndex];
    if (serie.enEdicion) {
      // Guardar cambios
      serie.enEdicion = false;
    } else {
      // Entrar en modo edición
      serie.enEdicion = true;
    }
  }

  // Método para marcar serie completada

  marcarSerieCompletada(ejercicioIndex: number, serieIndex: number) {
    console.log(`Método marcarSerieCompletada llamado para ejercicio ${ejercicioIndex}, serie ${serieIndex}`);

    const ejercicio = this.ejercicios[ejercicioIndex];
    const serie = ejercicio.seriesReal[serieIndex];

    // Validar que los campos necesarios estén completos y mostrar un mensaje de alerta en caso de error
    if (!serie.repeticiones || serie.peso === undefined || serie.peso <= 0) {
      console.warn("La serie necesita repeticiones y peso definidos para completarse.");
      return;
    }

    // Marcar la serie como completada y bloquear su edición
    serie.completado = true;
    serie.enEdicion = false;

    // Si es la siguiente serie en la secuencia, incrementa el contador de series completadas
    if (serieIndex === ejercicio.seriesCompletadas) {
      ejercicio.seriesCompletadas++;
    }

    // Si todas las series están completadas, marca el ejercicio como completado y ciérralo
    if (ejercicio.seriesCompletadas === ejercicio.seriesTotal) {
      ejercicio.completado = true;
      ejercicio.abierto = false;  // Cerrar el ejercicio automáticamente
      console.log(`Ejercicio ${ejercicioIndex} cerrado al completarse. Estado de 'abierto':`, ejercicio.abierto);
    } else {
      console.log(`Ejercicio ${ejercicioIndex} aún abierto. Estado de 'abierto':`, ejercicio.abierto);
    }

    // **Actualizar el peso de la siguiente serie** si es la siguiente en la secuencia
    if (serieIndex + 1 < ejercicio.seriesReal.length) {
      const siguienteSerie = ejercicio.seriesReal[serieIndex + 1];
      if (siguienteSerie.peso === 0 || siguienteSerie.peso === null) {
        siguienteSerie.peso = serie.peso; // Asigna el peso de la serie actual como peso predeterminado para la siguiente serie
        console.log(`Peso de la serie ${serieIndex + 1} actualizado a ${serie.peso} kg`);
      }
    }

    // Forzar la detección de cambios para asegurar que el HTML refleje el estado actualizado
    this.changeDetectorRef.detectChanges();
  }



  editarSerie(ejercicioIndex: number, serieIndex: number) {
    const serie = this.ejercicios[ejercicioIndex].seriesReal[serieIndex];

    if (serie.completado) {
      // Habilitar la edición
      serie.enEdicion = true;
      // Guardar valores anteriores por si necesitamos revertir
      serie.valoresAnteriores = {
        repeticiones: serie.repeticiones,
        peso: serie.peso,
        fallo: serie.fallo,
        dolor: serie.dolor,
        ayuda: serie.ayuda
      };
    }
    serie.completado = false;

    // Asegurar que ejerciciosCompletados se actualice
    this.actualizarEjerciciosCompletados();
  }


  toggleEjercicio(index: number) {
    // Cerrar todos los ejercicios menos el seleccionado
    this.ejercicios.forEach((ejercicio, i) => {
      if (i !== index) {
        ejercicio.abierto = false;
      }
    });

    // Alternar el estado abierto/cerrado del ejercicio seleccionado sin importar su estado de completado
    this.ejercicios[index].abierto = !this.ejercicios[index].abierto;
  }

  private actualizarEjerciciosCompletados() {
    // Contar solo los ejercicios donde seriesCompletadas es igual a seriesTotal
    this.ejerciciosCompletados = this.ejercicios.filter(ej => ej.seriesCompletadas >= ej.seriesTotal).length;
    this.totalEjercicios = this.ejercicios.length;
  }

  anadirSerieExtra(ejercicioIndex: number) {
    const ejercicio = this.ejercicios[ejercicioIndex];
    const ultimaSerie = ejercicio.seriesReal[ejercicio.seriesReal.length - 1];

    const nuevaSerie: SerieReal = {
      _id: uuidv4(),
      numeroSerie: ejercicio.seriesReal.length + 1,
      repeticiones: ultimaSerie.repeticiones || 0,
      peso: ultimaSerie.peso || 0, // Copiar el peso de la última serie sin establecer `pesoAnterior`
      alFallo: false,
      conAyuda: false,
      dolor: false,
      enEdicion: true,  // La nueva serie estará en edición
      notas: 'Serie extra'
    };

    // Añadir la serie extra al array `seriesReal` sin afectar `seriesTotal`
    ejercicio.seriesReal.push(nuevaSerie);

    // Actualizar el estado general de ejercicios completados
    this.actualizarEjerciciosCompletados();
  }

  async confirmarEliminarUltimaSerie(ejercicioIndex: number) {
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
            this.eliminarUltimaSerie(ejercicioIndex);
          },
        },
      ],
    });
    await alert.present();
  }

  eliminarUltimaSerie(ejercicioIndex: number) {
    const ejercicio = this.ejercicios[ejercicioIndex];

    // Solo permite eliminar si hay series extras
    if (ejercicio.seriesReal.length > ejercicio.seriesTotal) {
      ejercicio.seriesReal.pop(); // Elimina la última serie

      // Decrementa el contador de series completadas si la serie eliminada estaba completa
      if (ejercicio.seriesCompletadas > ejercicio.seriesTotal) {
        ejercicio.seriesCompletadas--;
        this.actualizarEjerciciosCompletados();
      }
    }
  }

  mostrarBotonAnadirSerieExtra(ejercicioIndex: number): boolean {
    const ejercicio = this.ejercicios[ejercicioIndex];
    return ejercicio.seriesReal.every(s => !s.enEdicion);
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
          handler: () => {
            this.entrenamientoEnProgreso = false; // Marca el entrenamiento como finalizado
            this.reiniciarEstadoEntrenamiento(); // Restablece el estado a su inicio
            this.entrenamientoEstadoService.finalizarEntrenamiento(); // Finaliza la sesión en el estado de entrenamiento
          },
        },
      ],
    });

    await alert.present();
  }

  // Método para reiniciar el estado del entrenamiento
  reiniciarEstadoEntrenamiento() {
    this.ejercicios.forEach(ejercicio => {
      ejercicio.seriesCompletadas = 0;
      ejercicio.seriesReal.forEach(serie => {
        serie.repeticiones = null;
        serie.peso = null;
        serie.alFallo = false;
        serie.dolor = false;
        serie.conAyuda = false;
        serie.completado = false;
        serie.enEdicion = true;
        serie.notas = '';
      });
      ejercicio.completado = false;
      ejercicio.abierto = false;
      ejercicio.notas = '';
    });

    this.ejerciciosCompletados = 0;
    this.totalEjercicios = this.ejercicios.length;
    console.log('Estado del entrenamiento reiniciado');
  }
}