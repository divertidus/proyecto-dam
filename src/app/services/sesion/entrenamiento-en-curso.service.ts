import { Injectable } from '@angular/core';
import { DatabaseService } from '../database/database.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from 'src/app/models/usuario.model';
import { BehaviorSubject } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid'
import { Router } from '@angular/router';
import { DiaEntrenamiento, HistorialEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { HistorialService } from '../database/historial-entrenamiento.service';


interface EntrenamientoState {
  enProgreso: boolean;
  pausado: boolean;
  rutinaId?: string;
  diaRutinaId?: string;
  descripcion?: string;
  diaRutinaNombre?: string;
  tiempoAcumulado?: number; // Tiempo total acumulado en minutos
  datosEntrenamiento?: any; // Estado actual del entrenamiento
  timestampInicio?: string; // Hora de inicio actual
  timestampUltimaPausa?: string; // Última hora registrada al pausar
}

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoEnCursoService {

  private baseDatos: any;
  private usuarioActual: Usuario | null = null;

  constructor(
    private servicioBaseDatos: DatabaseService,
    private authService: AuthService,
    private historialService: HistorialService
  ) {
    this.baseDatos = this.servicioBaseDatos.obtenerBaseDatos();

    // Suscribirse a los cambios en el usuario logueado
    this.authService.usuarioLogeado$.subscribe((usuario) => {
      this.usuarioActual = usuario;
      console.log('Usuario actualizado en EntrenamientoEnCursoService:', usuario);
    });
  }

  private entrenamientoEnProgreso$ = new BehaviorSubject<boolean>(false);

  getEstadoEntrenamiento() {
    return this.entrenamientoEnProgreso$.asObservable();
  }

  setEstadoEntrenamiento(enProgreso: boolean) {
    this.entrenamientoEnProgreso$.next(enProgreso);
  }

  // Iniciar un entrenamiento
  async iniciarEntrenamiento(
    rutinaId: string,
    diaRutinaId: string,
    descripcion: string,
    diaRutinaNombre: string,
    datosEntrenamiento: any
  ): Promise<void> {
    if (!this.usuarioActual) {
      console.error('No se puede iniciar entrenamiento: usuario no logueado.');
      return;
    }

    const estadoEntrenamiento: EntrenamientoState = {
      enProgreso: true,
      pausado: false,
      rutinaId,
      diaRutinaId,
      descripcion,
      diaRutinaNombre,
      tiempoAcumulado: 0,
      datosEntrenamiento,
      timestampInicio: new Date().toISOString(),
    };

    const documentoEntrenamiento = {
      _id: uuidv4(),
      entidad: 'entrenamiento-en-curso',
      usuarioId: this.usuarioActual._id,
      ...estadoEntrenamiento,
    };

    try {
      await this.baseDatos.put(documentoEntrenamiento);
      this.setEstadoEntrenamiento(true); // Actualizar estado local
      console.log('Entrenamiento iniciado y guardado:', documentoEntrenamiento);
    } catch (error) {
      console.error('Error al iniciar entrenamiento:', error);
    }
  }

  // Verificar entrenamiento en curso
  async verificarEntrenamientoEnCurso(): Promise<EntrenamientoState | null> {
    if (!this.usuarioActual || !this.usuarioActual._id) {
      console.error('No se puede verificar entrenamiento: usuario no logueado.');
      return null;
    }

    try {
      const result = await this.baseDatos.find({
        selector: {
          entidad: 'entrenamiento-en-curso',
          usuarioId: this.usuarioActual._id,
        },
      });

      if (result.docs.length > 0) {
        const doc = result.docs[0]; // Debería haber solo uno por usuario
        console.log('Entrenamiento en curso recuperado:', doc);
        return doc;
      } else {
        console.log('No hay entrenamiento en curso para este usuario.');
        return null;
      }
    } catch (error) {
      console.error('Error al verificar entrenamiento en curso:', error);
      return null;
    }
  }

  // Pausar un entrenamiento
  async pausarEntrenamiento(): Promise<void> {
    try {
      const entrenamientoActual = await this.baseDatos.get('entrenamiento-en-curso');
      const tiempoTranscurrido = this.calcularTiempoTranscurrido(entrenamientoActual.timestampInicio);

      const estadoActualizado = {
        ...entrenamientoActual,
        enProgreso: false,
        pausado: true,
        tiempoAcumulado: (entrenamientoActual.tiempoAcumulado || 0) + tiempoTranscurrido,
        timestampUltimaPausa: new Date().toISOString(),
      };

      await this.baseDatos.put(estadoActualizado);
      console.log('Entrenamiento pausado:', estadoActualizado);
    } catch (error) {
      console.error('Error al pausar entrenamiento:', error);
    }
  }

  // Reanudar un entrenamiento
  async reanudarEntrenamiento(): Promise<void> {
    try {
      const entrenamientoActual = await this.baseDatos.get('entrenamiento-en-curso');

      if (!entrenamientoActual.pausado) {
        console.warn('No hay entrenamiento pausado para reanudar.');
        return;
      }

      const estadoActualizado = {
        ...entrenamientoActual,
        enProgreso: true,
        pausado: false,
        timestampInicio: new Date().toISOString(),
      };

      await this.baseDatos.put(estadoActualizado);
      console.log('Entrenamiento reanudado:', estadoActualizado);
    } catch (error) {
      console.error('Error al reanudar entrenamiento:', error);
    }
  }

  // Calcular tiempo transcurrido
  private calcularTiempoTranscurrido(timestamp: string | undefined): number {
    if (!timestamp) return 0;

    const inicio = new Date(timestamp).getTime();
    const ahora = Date.now();
    const diferenciaMs = ahora - inicio;

    return Math.floor(diferenciaMs / (1000 * 60)); // Convertir a minutos
  }

  // En EntrenamientoEnCursoService
  async obtenerEstadoActual(): Promise<EntrenamientoState | null> {
    try {
      const result = await this.baseDatos.find({
        selector: {
          entidad: 'entrenamiento-en-curso',
          usuarioId: this.usuarioActual?._id,
        },
      });

      if (result.docs.length > 0) {
        const doc = result.docs[0]; // Solo debería haber uno por usuario
        console.log('Estado actual del entrenamiento recuperado:', doc);
        return doc; // Retornar el estado del entrenamiento
      } else {
        console.log('No hay entrenamiento en curso para este usuario.');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el estado actual del entrenamiento:', error);
      return null;
    }
  }

  async verificarYMostrarEntrenamientoPendiente(alertController: AlertController, router: Router): Promise<void> {
    try {
      const entrenamientoEnCurso = await this.verificarEntrenamientoEnCurso();

      if (entrenamientoEnCurso && entrenamientoEnCurso.enProgreso) {
        const alert = await alertController.create({
          header: 'Entrenamiento Pendiente',
          message: `Tienes un entrenamiento en curso: ${entrenamientoEnCurso.diaRutinaNombre}. ¿Deseas continuar?`,
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: async () => {
                const confirmCancel = await alertController.create({
                  header: 'Confirmar Cancelación',
                  message: 'Si cancelas, este entrenamiento no se guardará y no se podrá recuperar. ¿Estás seguro?',
                  buttons: [
                    {
                      text: 'No',
                      role: 'cancel',
                    },
                    {
                      text: 'Sí, cancelar',
                      handler: async () => {
                        await this.finalizarSinGuardarEntrenamiento(); // Usar el método implementado
                        console.log('Entrenamiento en curso eliminado.');
                      },
                    },
                  ],
                });
                await confirmCancel.present();
              },
            },
            {
              text: 'Continuar',
              handler: () => {
                console.log('Usuario decidió continuar el entrenamiento.');
                router.navigate(['/tabs/tab3']); // Redirigir automáticamente al tab3
              },
            },
          ],
        });

        await alert.present();
      }
    } catch (error) {
      console.error('Error al verificar entrenamiento en curso:', error);
    }
  }

  async finalizarYGuardarEntrenamiento(): Promise<void> {
    try {
      // Verificar que hay un usuario logueado
      if (!this.usuarioActual) {
        console.error('No se puede guardar el entrenamiento porque el usuario no está logueado.');
        return;
      }
  
      // Obtener el documento "entrenamiento-en-curso"
      const result = await this.baseDatos.find({
        selector: {
          entidad: 'entrenamiento-en-curso',
          usuarioId: this.usuarioActual._id,
        },
      });
  
      if (result.docs.length === 0) {
        console.error('No hay entrenamiento en curso para este usuario.');
        return;
      }
  
      // Obtener el documento actual
      const entrenamientoActual = result.docs[0];
      console.log('Documento de entrenamiento-en-curso inicial:', entrenamientoActual);
  
      // Verificar y procesar los datos de ejercicios
      const ejerciciosActuales = entrenamientoActual.datosEntrenamiento?.ejercicios || [];
      if (!Array.isArray(ejerciciosActuales)) {
        console.error("El campo 'ejercicios' no es válido o no es un array.");
        return;
      }
  
      // Actualizar los ejercicios con datos actuales simulando la lógica de guardarSesion
      const ejerciciosActualizados = ejerciciosActuales.map(ejercicio => {
        const seriesReal = Array.isArray(ejercicio.seriesReal)
          ? ejercicio.seriesReal.map((serie, index) => ({
              numeroSerie: index + 1,
              repeticiones: serie.repeticiones || 0,
              peso: serie.peso || 0,
              pesoAnterior: serie.pesoAnterior || null,
              alFallo: serie.alFallo || false,
              conAyuda: serie.conAyuda || false,
              dolor: serie.dolor || false,
              notas: serie.notas || '',
            }))
          : []; // Si no hay series, inicializamos como vacío.
  
        return {
          ...ejercicio,
          seriesReal,
          seriesCompletadas: seriesReal.filter(serie => serie.repeticiones > 0).length,
          seriesTotal: ejercicio.seriesTotal || seriesReal.length,
          notas: ejercicio.notas || '',
        };
      });
  
      console.log('Ejercicios procesados y actualizados:', ejerciciosActualizados);
  
      // Actualizar el documento con los datos nuevos
      const registroActualizado = {
        ...entrenamientoActual,
        datosEntrenamiento: {
          ...entrenamientoActual.datosEntrenamiento,
          ejercicios: ejerciciosActualizados,
        },
        timestampUltimaActualizacion: new Date().toISOString(),
      };
  
      console.log('Documento de entrenamiento-en-curso actualizado:', registroActualizado);
  
      // Guardar el documento actualizado en la base de datos
      await this.baseDatos.put({
        _id: entrenamientoActual._id,
        ...registroActualizado,
      });
  
      console.log('Entrenamiento en curso actualizado y guardado correctamente.');
    } catch (error) {
      console.error('Error al finalizar y guardar el entrenamiento:', error);
    }
  }
  





  async finalizarEntrenamiento(opciones: { guardar: boolean }): Promise<void> {
    try {
      const entrenamientoActual = await this.verificarEntrenamientoEnCurso();

      if (!entrenamientoActual) {
        console.log('No hay entrenamiento en curso para finalizar.');
        return;
      }

      if (opciones.guardar) {
        // Lógica para guardar el entrenamiento
        await this.finalizarYGuardarEntrenamiento();
      } else {
        // Eliminar sin guardar
        await this.eliminarRegistroEntrenamientoEnCurso();
        console.log('Entrenamiento en curso eliminado sin guardar.');
      }
    } catch (error) {
      console.error('Error al finalizar entrenamiento:', error);
    }
  }

  async finalizarSinGuardarEntrenamiento(): Promise<void> {
    try {
      const entrenamientoActual = await this.verificarEntrenamientoEnCurso();
      if (entrenamientoActual) {
        await this.baseDatos.remove(entrenamientoActual);
        console.log('Entrenamiento eliminado sin guardar.');
        this.setEstadoEntrenamiento(false); // Actualizar el estado
      } else {
        console.log('No hay entrenamiento en curso para eliminar.');
      }
    } catch (error) {
      console.error('Error al eliminar el entrenamiento en curso sin guardar:', error);
    }
  }

  async eliminarRegistroEntrenamientoEnCurso(): Promise<void> {
    try {
      const entrenamientoActual = await this.verificarEntrenamientoEnCurso();
      if (entrenamientoActual) {
        await this.baseDatos.remove(entrenamientoActual);
        console.log('Registro de entrenamiento en curso eliminado.');
        this.setEstadoEntrenamiento(false); // Actualizar el estado
      } else {
        console.log('No hay registro de entrenamiento en curso para eliminar.');
      }
    } catch (error) {
      console.error('Error al eliminar el registro de entrenamiento en curso:', error);
    }
  }


  /* ESTO ES PARA GUARDAR UN ENTRENAMIENTO EN EL BOTON DE GUARDAR PORQUE SE HA TERMINADO DE ENTRENAR */


}
