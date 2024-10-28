import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { IonInput, IonCheckbox, IonGrid, IonRow, IonCol, IonAlert, IonContent } from '@ionic/angular/standalone';
import {
  IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonList, IonItem, IonIcon, IonFooter, IonButton
} from "@ionic/angular/standalone";
import { AuthService } from 'src/app/auth/auth.service'; // Importamos AuthService
import { RutinaService } from 'src/app/services/database/rutina.service';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';
import { ChangeDetectorRef } from '@angular/core';
import { SesionPlanificada } from 'src/app/models/rutina.model';
import { HistorialEntrenamiento, SesionEntrenamiento } from 'src/app/models/historial-entrenamiento';


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
  ejercicios: any[] = []; // Aquí almacenaremos los ejercicios del día
  rutinaId: string | null = null; // ID de la rutina
  usuarioId: string | null = null; // Añadir esta propiedad

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
      this.rutinaId = params.get('rutinaId');
      if (this.diaRutinaId && this.rutinaId) {
        this.cargarSesionPlanificadaPorNombre(this.rutinaId, this.diaRutinaId);
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

  async cargarSesionPlanificadaPorNombre(rutinaId: string, nombreSesion: string) {
    try {
      const sesionPlanificada: SesionPlanificada = await this.rutinaService.obtenerSesionPlanificadaPorNombre(rutinaId, nombreSesion);
      if (sesionPlanificada) {
        this.ejercicios = await Promise.all(sesionPlanificada.ejerciciosPlanificados.map(async (ej) => {
          const ejercicioDetalles = await this.ejercicioService.obtenerEjercicioPorId(ej.idEjercicioOriginal);
          let ultimoPeso = null;
          if (this.usuarioId) {
            ultimoPeso = await this.historialService.obtenerUltimoPesoEjercicio(this.usuarioId, ej.idEjercicioOriginal);
          }

          const seriesSesion = (ej.seriesPlanificadas || []).map((serie: any) => ({
            numeroSerie: serie.numeroSerie,
            repeticiones: serie.repeticiones,
            peso: ultimoPeso || 0,
            pesoAnterior: ultimoPeso || 0,
            completado: false,
            dolor: false,
            conAyuda: false,
            alFallo: false,
            enEdicion: true,
            notas: ''
          }));

          return {
            ...ej,
            nombreEjercicio: ejercicioDetalles.nombre,
            seriesReal: seriesSesion,
            seriesCompletadas: 0,
            seriesTotal: seriesSesion.length,
            abierto: false,
            completado: false,
          };
        }));

        this.totalEjercicios = this.ejercicios.length;
        this.actualizarEjerciciosCompletados();
      } else {
        console.error(`Día de rutina con nombre ${nombreSesion} no encontrado`);
      }
    } catch (error) {
      console.error('Error al cargar el día de la rutina:', error);
    }
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
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.ejercicios[ejercicioIndex].seriesReal[serieIndex].notas = data.nota;
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
                this.guardarSesion('NO SE HIZO'); // Guardamos incluyendo notas de "NO SE HIZO" para ejercicios no iniciados
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

  guardarSesion(mensajeEstado?: string) {
    const ejerciciosCompletados = this.ejercicios.map(ej => {
      return {
        idEjercicioPlanificado: ej.ejercicioId, // Cambiado de ejercicioId a idEjercicioPlanificado
        seriesSesion: ej.seriesReal.map((serie, index) => ({
          numeroSerie: index + 1,
          repeticiones: serie.completado ? serie.repeticiones : null,
          peso: serie.completado ? serie.peso : null,
          alFallo: serie.alFallo,
          conAyuda: serie.conAyuda,
          dolor: serie.dolor,
          notas: serie.notas || null,
        })),
        notas: ej.notas || null,
      };
    });

    const nuevaSesionEntrenamiento: SesionEntrenamiento = {
      fechaSesion: new Date().toISOString(),
      sesionPlanificadaId: this.diaRutinaId,
      ejerciciosSesion: ejerciciosCompletados,
      notas: '',
    };

    const nuevoHistorialEntrenamiento: HistorialEntrenamiento = {
      entidad: 'historialEntrenamiento',
      usuarioId: this.usuarioId!,
      sesionesRealizadas: [nuevaSesionEntrenamiento],
    };

    this.historialService.agregarHistorial(nuevoHistorialEntrenamiento)
      .then(() => {
        this.mostrarAlertaExito();
        this.router.navigate(['/tabs/tab3']);
      })
      .catch(error => {
        console.error('Error al guardar el entrenamiento:', error);
        this.mostrarAlertaError();
      });
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
    const serie = this.ejercicios[ejercicioIndex].seriesReal[serieIndex];
    if (serie.enEdicion) {
      // Guardar cambios y bloquear edición
      serie.enEdicion = false;
      this.marcarSerieCompletada(ejercicioIndex, serieIndex);
    } else {
      // Permitir edición
      serie.enEdicion = true;
    }
  }

  decrementarPeso(ejercicio: any, serieIndex: number) {
    const serie = ejercicio.seriesReal[serieIndex];
    serie.peso = Math.max(0, (serie.peso || 0) - 1.25);
  }

  incrementarPeso(ejercicio: any, serieIndex: number) {
    const serie = ejercicio.seriesReal[serieIndex];
    serie.peso = (serie.peso || 0) + 1.25;
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

    if (!serie.repeticiones || !serie.peso) {
      return;
    }

    serie.completado = true;
    serie.enEdicion = false;

    if (serieIndex === ejercicio.seriesCompletadas) {
      ejercicio.seriesCompletadas++;
    }

    if (ejercicio.seriesCompletadas === ejercicio.seriesTotal) {
      ejercicio.completado = true;
      this.actualizarEjerciciosCompletados();
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


/*  el siguinete guardar siempre tiene el array de series con la cantidad de series que toque incluso is está incompleta o sin hacer, aunque con valores null.

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
                this.guardarSesion('NO SE HIZO'); // Guardamos incluyendo notas de "NO SE HIZO" para ejercicios no iniciados
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

// Método que realiza el guardado según el mensaje de estado
guardarSesion(mensajeEstado?: string) {
  const ejerciciosCompletados = this.ejercicios.map(ej => {
    // Determinar el estado del ejercicio actual
    const esEjercicioNoIniciado = ej.seriesCompletadas === 0;
    const esEjercicioIncompleto = ej.seriesCompletadas > 0 && ej.seriesCompletadas < ej.seriesTotal;
    const esEjercicioCompleto = ej.seriesCompletadas === ej.seriesTotal;

    return {
      ejercicioId: ej.nombreEjercicio,
      series: ej.seriesReal.map((serie, index) => ({
        numeroSerie: index + 1,
        repeticiones: serie.completado ? serie.repeticiones : null,
        peso: serie.completado ? serie.peso : null,
        alFallo: serie.alFallo,
        conAyuda: serie.conAyuda,
        dolor: serie.dolor,
        notas: serie.notas || null,
      })),
      notas: esEjercicioNoIniciado && mensajeEstado === 'NO SE HIZO'
        ? 'NO SE HIZO'
        : esEjercicioIncompleto
          ? 'INCOMPLETO'
          : esEjercicioCompleto
            ? ej.notas || null
            : null,
    };
  });

  // Aquí guardamos el entrenamiento con los valores en estado adecuado
  const nuevoDiaEntrenamiento: DiaEntrenamiento = {
    fechaEntrenamiento: new Date().toISOString(),
    diaRutinaId: this.diaRutinaId,
    ejercicios: ejerciciosCompletados,
    notas: '',
  };

  const nuevoHistorialEntrenamiento: HistorialEntrenamiento = {
    entidad: 'historialEntrenamiento',
    usuarioId: this.usuarioId,
    entrenamientos: [nuevoDiaEntrenamiento],
  };

  this.historialService.agregarHistorial(nuevoHistorialEntrenamiento)
    .then(() => {
      console.log('Nueva sesión de entrenamiento guardada:', nuevoDiaEntrenamiento);
      this.mostrarAlertaExito();
      this.router.navigate(['/tabs/tab3']);
    })
    .catch((error) => {
      console.error('Error al guardar la sesión de entrenamiento:', error);
      this.mostrarAlertaError();
    });
}
*/