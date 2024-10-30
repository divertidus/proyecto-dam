import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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



@Component({
  selector: 'app-vista-entreno',
  templateUrl: './vista-entreno.component.html',
  styleUrls: ['./vista-entreno.component.scss'],
  standalone: true,
  imports: [IonContent, IonAlert, IonCol, IonRow, IonGrid, IonButton, IonFooter, IonInput, IonIcon, IonItem, IonList,
    IonCardContent, IonCardTitle, IonCardHeader,
    IonCard, IonTitle, IonToolbar, IonHeader, FormsModule, NgFor, NgIf, IonCheckbox]
})
export class VistaEntrenoComponent implements OnInit {
  [x: string]: any;

  diaRutinaId: string | null = null; // Usamos diaRutinaId como el nombre del día
  descripcion: string | null = null;
  ejercicios: any[] = []; // Aquí almacenaremos los ejercicios del día
  rutinaId: string | null = null; // ID de la rutina
  usuarioId: string | null = null; // Añadir esta propiedad
  nombreRutinaEntrenamiento: string | null
  // Variables de conteo
  ejerciciosCompletados = 0;
  totalEjercicios = 0;

  constructor(
    private route: ActivatedRoute,
    private rutinaService: RutinaService,
    private ejercicioService: EjercicioService, // Servicio que te permite cargar los datos de la rutina
    private alertController: AlertController, // Para crear alertas
    private historialService: HistorialService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Capturamos los parámetros de la URL
    this.route.paramMap.subscribe(params => {
      this.diaRutinaId = params.get('diaRutinaId');
      this.descripcion = params.get('descripcion');
      this.rutinaId = params.get('rutinaId');
      if (this.diaRutinaId && this.rutinaId) {
        this.cargarDiaRutinaPorNombre(this.rutinaId, this.diaRutinaId);
      }
    });

    // Suscribirse al usuario logeado desde el AuthService
    this.authService.usuarioLogeado$.subscribe((usuario) => {
      if (usuario) {
        this.usuarioId = usuario._id; // Guardamos el ID del usuario
      } else {
        console.error('No hay usuario logueado.');
      }
    });

    this.ejercicios.forEach(ejercicio => {
      ejercicio.seriesReal.forEach(serie => {
        // Si serie.peso está vacío, lo inicializamos con serie.pesoAnterior
        serie.peso = serie.pesoAnterior;  // Usamos el valor de pesoAnterior solo si peso está vacío
      });
    });

  }

  async cargarDiaRutinaPorNombre(rutinaId: string, diaNombre: string) {
    try {
      const { rutina, diaRutina } = await this.cargarRutina(rutinaId, diaNombre);

      if (diaRutina) {
        this.nombreRutinaEntrenamiento = rutina.nombre;
        this.ejercicios = await Promise.all(diaRutina.ejercicios.map(ej => this.crearEjercicio(ej)));
        this.totalEjercicios = this.ejercicios.length;
        this.actualizarEjerciciosCompletados();
      } else {
        console.error(`Día de rutina con nombre ${diaNombre} no encontrado`);
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
 
    // Verificar el contenido de ultimoEjercicio y su _id
    console.log("Detalles del último ejercicio encontrado:", ultimoEjercicio);
 
    const seriesReal: SerieReal[] = (ej.series || []).map((serie, index) => this.crearSerieReal(serie, ultimoEjercicio, index));
 
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
      const ejerciciosCompletos = this.ejercicios.filter(ej => ej.seriesCompletadas === ej.seriesTotal);
      const ejerciciosIncompletos = this.ejercicios.filter(ej => ej.seriesCompletadas > 0 && ej.seriesCompletadas < ej.seriesTotal);
      const ejerciciosNoIniciados = this.ejercicios.filter(ej => ej.seriesCompletadas === 0);

      // Si todos los ejercicios están completos, guardamos directamente
      if (ejerciciosIncompletos.length === 0 && ejerciciosNoIniciados.length === 0) {
        this.guardarSesion(); // Método que realiza el guardado
        return;
      }

      // Caso 1: Ejercicios no iniciados
      if (ejerciciosNoIniciados.length > 0 && ejerciciosCompletos.length > 0) {
        const alert = await this.alertController.create({
          header: 'Ejercicios no realizados',
          message: 'Algunos ejercicios no se han iniciado. ¿Desea guardar todos los ejercicios? Aquellos no iniciados tendrán la nota "NO SE HIZO".',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Guardar',
              handler: () => {
                this.guardarSesion('No se hizo'); // Guardamos incluyendo notas de "NO SE HIZO" para ejercicios no iniciados
              }
            }
          ]
        });
        await alert.present();
        return;
      }

      // Caso 2: Ejercicios incompletos
      if (ejerciciosIncompletos.length > 0) {
        const alert = await this.alertController.create({
          header: 'Ejercicios incompletos',
          message: 'Hay ejercicios con series incompletas. ¿Desea guardar solo las series completadas y marcar los ejercicios incompletos?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Guardar',
              handler: () => {
                this.guardarSesion('Incompleto'); // Guardamos incluyendo "Incompleto" para ejercicios parcialmente realizados
              }
            }
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
    const nuevoDiaEntrenamiento: DiaEntrenamiento = {
      _id: uuidv4(),
      fechaEntrenamiento: new Date().toISOString(),
      nombreRutinaEntrenamiento: this.nombreRutinaEntrenamiento,
      diaRutinaId: this.diaRutinaId!,
      descripcion: this.descripcion,
      ejerciciosRealizados: this.ejercicios.map(ej => {
        // Estado de notas basado en si el ejercicio fue iniciado o completado
        let notasEjercicio = '';
        if (ej.seriesCompletadas === 0) {
          notasEjercicio = mensajeEstado === 'No se hizo' ? 'No se hizo' : ''; // Solo si está completamente sin iniciar
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
          notas: notasEjercicio, // Guardamos el estado del ejercicio en 'notas' si aplica
          anteriorVezEjercicioID: ej._id || null,
        };
      }),
      notas: '',
    };

    try {
      // Guardar o actualizar en la base de datos como hasta ahora
      const historialesExistentes = await this.historialService.obtenerHistorialesPorUsuario(this.usuarioId!);
      let historialExistente: HistorialEntrenamiento | null = null;
      if (historialesExistentes.length > 0) {
        historialExistente = historialesExistentes[0];
      }

      if (historialExistente) {
        historialExistente.entrenamientos.push(nuevoDiaEntrenamiento);
        await this.historialService.actualizarHistorial(historialExistente);
      } else {
        const nuevoHistorial: HistorialEntrenamiento = {
          entidad: 'historialEntrenamiento',
          usuarioId: this.usuarioId!,
          entrenamientos: [nuevoDiaEntrenamiento],
        };
        await this.historialService.agregarHistorial(nuevoHistorial);
      }

      console.log('Nueva sesión de entrenamiento guardada:', nuevoDiaEntrenamiento);
      this.mostrarAlertaExito();
      this.router.navigate(['/tabs/tab3']);
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

    if (serie.enEdicion) {
      // Al hacer clic en "OK", verificar que el peso no sea 0
      if (serie.peso === 0) {
        console.warn("El peso no puede ser 0. Establezca un valor de peso.");
        return;
      }

      // Confirmar los cambios y bloquear la edición
      serie.enEdicion = false;
      serie.completado = true;

      // Establecer el peso predeterminado para las siguientes series solo si es la primera vez y no existe peso anterior
      if (!serie.pesoAnterior) {
        ejercicio.seriesReal.forEach((s, i) => {
          if (i > serieIndex && s.peso === 0) {
            s.peso = serie.peso; // Actualizamos el peso como predeterminado
          }
        });
      }

      // Incrementar el contador de series completadas
      if (serieIndex === ejercicio.seriesCompletadas) {
        ejercicio.seriesCompletadas++;
      }

      // Marcar el ejercicio como completado si todas las series lo están
      if (ejercicio.seriesCompletadas === ejercicio.seriesTotal) {
        ejercicio.completado = true;
        this.actualizarEjerciciosCompletados();
      }
    } else {
      // Permitir la edición si se hace clic en "EDIT"
      serie.enEdicion = true;
    }
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
    const ejercicio = this.ejercicios[ejercicioIndex];
    const serie = ejercicio.seriesReal[serieIndex];

    // Validar que los campos necesarios estén completos
    if (!serie.repeticiones || !serie.peso) {
      // Mostrar mensaje de error o alerta
      return;
    }

    // Marcar la serie como completada
    serie.completado = true;
    serie.enEdicion = false;

    // Incrementar el contador de series completadas si es la siguiente en la secuencia
    if (serieIndex === ejercicio.seriesCompletadas) {
      ejercicio.seriesCompletadas++;
    }

    // Marcar el ejercicio como completado si todas las series lo están
    if (ejercicio.seriesCompletadas === ejercicio.seriesTotal) {
      ejercicio.completado = true;
      this.actualizarEjerciciosCompletados(); // Llamar para actualizar el estado global
    }
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
  }


  toggleEjercicio(index: number) {
    this.ejercicios[index].abierto = !this.ejercicios[index].abierto;
  }

  // Función para actualizar el conteo de ejercicios completados
  actualizarEjerciciosCompletados() {
    this.ejerciciosCompletados = this.ejercicios.filter(ej => ej.completado).length;
    this.totalEjercicios = this.ejercicios.length;
  }

}
