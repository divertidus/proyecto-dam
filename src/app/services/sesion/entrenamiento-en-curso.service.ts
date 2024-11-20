import { Injectable } from '@angular/core';
import { DatabaseService } from '../database/database.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from 'src/app/models/usuario.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid'
import { Router } from '@angular/router';
import { DiaEntrenamiento, HistorialEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { HistorialService } from '../database/historial-entrenamiento.service';


export interface EntrenamientoState {
  enProgreso: boolean;
  pausado: boolean;
  rutinaId?: string;
  diaRutinaId?: string;
  descripcion?: string;
  diaRutinaNombre?: string;
  tiempoAcumulado?: number;
  datosEntrenamiento?: Array<{
    _id: string;
    ejercicioId: string;
    nombreEjercicio: string;
    tipoPeso: string;
    series: Array<{
      numeroSerie: number;
      repeticiones: number;
      peso: number;
      alFallo: boolean;
      conAyuda: boolean;
      dolor: boolean;
      notas: string;
    }>;
    seriesCompletadas: number;
    notas: string;
  }>;
  timestampInicio?: string;
  timestampUltimaPausa?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoEnCursoService {

  private baseDatos: any;
  private usuarioActual: Usuario | null = null;

  // BehaviorSubject para almacenar el estado del entrenamiento
  private estadoEntrenamiento$ = new BehaviorSubject<EntrenamientoState>({
    enProgreso: false,
    pausado: false,
  });

  constructor(
    private servicioBaseDatos: DatabaseService,
    private authService: AuthService,
  ) {
    this.baseDatos = this.servicioBaseDatos.obtenerBaseDatos();

    // Suscribirse a los cambios en el usuario logueado
    this.authService.usuarioLogeado$.subscribe((usuario) => {
      this.usuarioActual = usuario;
      console.log('Usuario actualizado en EntrenamientoEnCursoService:', usuario);
    });
  }

  private entrenamientoEnProgreso$ = new BehaviorSubject<boolean>(false);

  // Método para obtener el estado actual como observable
  getEstadoEntrenamiento(): Observable<EntrenamientoState> {
    return this.estadoEntrenamiento$.asObservable();
  }

  // Obtener el estado actual del entrenamiento
  obtenerEstadoActual(): EntrenamientoState {
    const estado = this.estadoEntrenamiento$.getValue(); // Suponiendo que estás usando un BehaviorSubject
    console.log('Estado recuperado desde el servicio:', JSON.stringify(estado, null, 2));
    return estado;
  }

  // Método para actualizar el estado del entrenamiento
  setEstadoEntrenamiento(estado: EntrenamientoState): void {
    this.estadoEntrenamiento$.next(estado);
    console.log('Estado del entrenamiento actualizado:', estado);
  }

  getRutinaId(): string | undefined {
    return this.obtenerEstadoActual().rutinaId;
  }

  getDiaRutinaId(): string | undefined {
    return this.obtenerEstadoActual().diaRutinaId;
  }

  getDescripcion(): string | undefined {
    return this.obtenerEstadoActual().descripcion;
  }

  getDiaRutinaNombre(): string | undefined {
    return this.obtenerEstadoActual().diaRutinaNombre;
  }

  getEjerciciosRealizados(): any[] | undefined {
    return this.obtenerEstadoActual().datosEntrenamiento;
  }

  getTiempoAcumulado(): number | undefined {
    return this.obtenerEstadoActual().tiempoAcumulado;
  }




  iniciarEntrenamiento(
    rutinaId: string,
    diaRutinaId: string,
    descripcion: string,
    diaNombre: string,
    detalles: { ejercicios: any[] }
  ): void {
    console.log('Entrenamiento iniciado con:', {
      rutinaId,
      diaRutinaId,
      descripcion,
      diaNombre,
      detalles,
    });

    // Configura el estado inicial del entrenamiento
    const estadoInicial: EntrenamientoState = {
      enProgreso: true,
      pausado: false,
      rutinaId,
      diaRutinaId,
      descripcion,
      diaRutinaNombre: diaNombre,
      datosEntrenamiento: detalles.ejercicios,
      tiempoAcumulado: 0,
      timestampInicio: new Date().toISOString(),
      timestampUltimaPausa: null,
    };

    // Actualiza el estado en el servicio
    this.setEstadoEntrenamiento(estadoInicial);

    console.log('Entrenamiento iniciado. Estado inicial:', estadoInicial);
  }

  // Finalizar entrenamiento sin guardar
  finalizarSinGuardarEntrenamiento(): void {
    const estadoActual = this.obtenerEstadoActual();
    console.log('Entrenamiento finalizado sin guardar. Estado:', estadoActual);

    // Reinicia el estado
    this.setEstadoEntrenamiento({
      enProgreso: false,
      pausado: false,
    });
  }

  async guardarEstadoEnBaseDatos(): Promise<void> {
    try {
      if (!this.usuarioActual) {
        console.warn('No hay un usuario logueado para asociar el estado del entrenamiento.');
        return;
      }
  
      const estadoActual = this.obtenerEstadoActual();
  
      // Verificar que el estado actual tenga todos los datos necesarios
      if (!estadoActual || !estadoActual.rutinaId || !estadoActual.diaRutinaId) {
        console.warn('El estado actual del entrenamiento no es válido:', estadoActual);
        return;
      }
  
      const idDocumento = `entrenamiento-${this.usuarioActual._id}`;
  
      try {
        // Intentar obtener el documento existente
        const documentoExistente = await this.baseDatos.get(idDocumento);
  
        // Actualizar el documento existente
        await this.baseDatos.put({
          ...documentoExistente,
          estado: estadoActual,
          _rev: documentoExistente._rev,
        });
  
        console.log('Estado del entrenamiento actualizado en la base de datos:', estadoActual);
      } catch (error) {
        if (error.status === 404) {
          // Crear un nuevo documento si no existe
          const nuevoDocumento = {
            _id: idDocumento,
            tipo: 'estadoEntrenamiento',
            usuarioId: this.usuarioActual._id,
            estado: estadoActual,
          };
  
          await this.baseDatos.put(nuevoDocumento);
          console.log('Nuevo estado del entrenamiento guardado en la base de datos:', nuevoDocumento);
        } else {
          // Manejar otros errores
          console.error('Error al guardar el estado del entrenamiento en la base de datos:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error al guardar el estado del entrenamiento en la base de datos:', error);
      throw error;
    }
  }

  // Cargar estado desde la base de datos
  async cargarEstadoDesdeBaseDatos(): Promise<void> {
    if (this.usuarioActual) {
      try {
        const doc = await this.baseDatos.obtenerDocumento(
          `entrenamiento-${this.usuarioActual._id}`
        );
        const estadoGuardado: EntrenamientoState = doc.estado;
        this.setEstadoEntrenamiento(estadoGuardado);
        console.log('Estado del entrenamiento restaurado desde la base de datos:', estadoGuardado);
      } catch (error) {
        if (error.status !== 404) {
          console.error('Error al cargar el estado del entrenamiento desde la base de datos:', error);
        }
      }
    } else {
      console.warn('No hay un usuario logueado para cargar el estado del entrenamiento.');
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
  /*  async obtenerEstadoActual(): Promise<EntrenamientoState | null> {
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
   } */

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

  /* async finalizarEntrenamiento(opciones: { guardar: boolean }): Promise<void> {
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
  } */

  /*   async finalizarSinGuardarEntrenamiento(): Promise<void> {
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
    } */

  /* async eliminarRegistroEntrenamientoEnCurso(): Promise<void> {
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
  } */


}
