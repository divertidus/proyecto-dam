import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DiaRutina, EjercicioPlan, Rutina } from 'src/app/models/rutina.model';
import { IonInput, IonCheckbox, IonGrid, IonRow, IonCol, IonAlert, IonContent } from '@ionic/angular/standalone';
import {
  IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonList, IonItem, IonIcon, IonFooter, IonButton
} from "@ionic/angular/standalone";
import { DiaEntrenamiento, HistorialEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { AuthService } from 'src/app/auth/auth.service'; // Importamos AuthService
import { RutinaService } from 'src/app/services/database/rutina.service';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';
import { ChangeDetectorRef } from '@angular/core';


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

  // Método para cargar y contar ejercicios
  async cargarDiaRutinaPorNombre(rutinaId: string, diaNombre: string) {
    try {
      const diaRutina: DiaRutina = await this.rutinaService.obtenerDiaRutinaPorNombre(rutinaId, diaNombre);
      if (diaRutina) {
        this.ejercicios = await Promise.all(diaRutina.ejercicios.map(async (ej) => {
          const ejercicioDetalles = await this.ejercicioService.obtenerEjercicioPorId(ej.ejercicioId);
          let ultimoPeso = null;
          if (this.usuarioId) {
            ultimoPeso = await this.historialService.obtenerUltimoPesoEjercicio(this.usuarioId, ej.ejercicioId);
          }

          // Configuración de series y atributos del ejercicio
          const seriesReal = (ej.series || []).map((serie: any) => ({
            numeroSerie: serie.numeroSerie,
            repeticiones: serie.repeticiones,
            peso: ultimoPeso || 0,
            pesoAnterior: ultimoPeso || 0,
            completado: false,  // Inicialización de la propiedad completado
            dolor: false,
            conAyuda: false,
            alFallo: false,
          }));

          return {
            ...ej,
            nombreEjercicio: ejercicioDetalles.nombre,
            seriesReal: seriesReal,
            seriesCompletadas: 0,
            seriesTotal: seriesReal.length,
            abierto: false,
            completado: false,
          };
        }));

        // Actualizar el contador total de ejercicios y completados
        this.totalEjercicios = this.ejercicios.length;
        this.actualizarEjerciciosCompletados();
        console.log("Estructura de ejercicios cargados:", this.ejercicios);
      } else {
        console.error(`Día de rutina con nombre ${diaNombre} no encontrado`);
      }
    } catch (error) {
      console.error('Error al cargar el día de la rutina:', error);
    }
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

// Método que realiza el guardado según el mensaje de estado
guardarSesion(mensajeEstado?: string) {
  const ejerciciosCompletados = this.ejercicios.map(ej => {
    // Determinar el estado del ejercicio actual
    const esEjercicioNoIniciado = ej.seriesCompletadas === 0;
    const esEjercicioIncompleto = ej.seriesCompletadas > 0 && ej.seriesCompletadas < ej.seriesTotal;
    const esEjercicioCompleto = ej.seriesCompletadas === ej.seriesTotal;

    // Filtrar solo las series completadas
    const seriesCompletadas = ej.seriesReal
      .filter(serie => serie.completado)
      .map((serie, index) => ({
        numeroSerie: index + 1,
        repeticiones: serie.repeticiones,
        peso: serie.peso,
        alFallo: serie.alFallo,
        conAyuda: serie.conAyuda,
        dolor: serie.dolor,
        notas: serie.notas || null,
      }));

    return {
      ejercicioId: ej.ejercicioId,
      series: esEjercicioNoIniciado ? [] : seriesCompletadas,
      notas: esEjercicioNoIniciado && mensajeEstado === 'NO SE HIZO'
        ? 'NO SE HIZO'
        : esEjercicioIncompleto
          ? 'INCOMPLETO'
          : esEjercicioCompleto
            ? ej.notas || null
            : null,
    };
  });

  // Crear `DiaEntrenamiento`
  const nuevoDiaEntrenamiento: DiaEntrenamiento = {
    fechaEntrenamiento: new Date().toISOString(),
    diaRutinaId: this.diaRutinaId,
    ejercicios: ejerciciosCompletados,
    notas: '',
  };

  // Crear `HistorialEntrenamiento` que contiene a `nuevoDiaEntrenamiento`
  const nuevoHistorialEntrenamiento: HistorialEntrenamiento = {
    entidad: 'historialEntrenamiento',
    usuarioId: this.usuarioId!,
    entrenamientos: [nuevoDiaEntrenamiento], // Array que contiene el `DiaEntrenamiento`
  };

  // Guardar el nuevo historial de entrenamiento
  this.historialService.agregarHistorial(nuevoHistorialEntrenamiento)
    .then(() => {
      console.log('Nueva sesión de entrenamiento guardada:', nuevoDiaEntrenamiento);
      this.mostrarAlertaExito();
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

  decrementarPeso(i: number, j: number) {
    console.log('Índices recibidos - i:', i, 'j:', j); // Registro de índices para depuración

    if (typeof i === 'number' && typeof j === 'number' && this.ejercicios[i]?.seriesReal?.[j]) {
      if (this.ejercicios[i].seriesReal[j].peso > 0) {
        this.ejercicios[i].seriesReal[j].peso--;
      }
    } else {
      console.warn(`No se pudo acceder a seriesReal para el ejercicio en índice ${i}, serie ${j}`);
    }
  }

  incrementarPeso(i: number, j: number) {
    console.log('Índices recibidos - i:', i, 'j:', j); // Registro de índices para depuración

    if (typeof i === 'number' && typeof j === 'number' && this.ejercicios[i]?.seriesReal?.[j]) {
      this.ejercicios[i].seriesReal[j].peso++;
    } else {
      console.warn(`No se pudo acceder a seriesReal para el ejercicio en índice ${i}, serie ${j}`);
    }
  }

  toggleEjercicio(index: number) {
    this.ejercicios[index].abierto = !this.ejercicios[index].abierto;
  }

  // Actualizar el contador de ejercicios completados
  actualizarEjerciciosCompletados() {
    this.ejerciciosCompletados = this.ejercicios.filter(ej => ej.completado).length;
    this.totalEjercicios = this.ejercicios.length;
  }

  marcarSerieCompletada(ejercicioIndex: number, serieIndex: number) {
    const ejercicio = this.ejercicios[ejercicioIndex];
    const serie = ejercicio.seriesReal[serieIndex];

    // Marcar la serie actual como completada
    serie.completado = true;
    ejercicio.seriesCompletadas++;

    // Si todas las series del ejercicio están completadas, marcamos el ejercicio como completado
    if (ejercicio.seriesCompletadas === ejercicio.seriesTotal) {
      ejercicio.completado = true;
      this.actualizarEjerciciosCompletados();
    }
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