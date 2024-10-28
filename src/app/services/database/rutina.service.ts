import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de la base de datos
import { BehaviorSubject } from 'rxjs';
import { EjercicioPlanificado, Rutina, SesionPlanificada } from 'src/app/models/rutina.model';


@Injectable({
  providedIn: 'root'
})
export class RutinaService {
  private baseDatos: any;
  private rutinasSubject = new BehaviorSubject<Rutina[]>([]);
  rutinas$ = this.rutinasSubject.asObservable(); // Observable para suscribirse a los cambios de las rutinas

  constructor(private databaseService: DatabaseService) {
    this.baseDatos = this.databaseService.obtenerBaseDatos();
    console.log("RutinaService - baseDatos inicializado:", this.baseDatos);
    this.cargarRutinas();
  }

  // Método para agregar una nueva rutina
  async agregarRutina(nuevaRutina: Rutina) {
    try {
      // Validar si `sesionesPlanificadas` contiene datos
      if (!nuevaRutina.sesionesPlanificadas || nuevaRutina.sesionesPlanificadas.length === 0) {
        console.error('Error: La rutina no contiene sesiones planificadas');
        return;
      }

      const response = await this.baseDatos.post({
        ...nuevaRutina,
        _id: nuevaRutina._id || undefined,
        timestamp: new Date().toISOString(),
      });

      console.log('RUTINA.SERVICE -> Rutina añadida con éxito', response);
      this.cargarRutinas(); // Cargar de nuevo todas las rutinas después de añadir una nueva
      return response;
    } catch (err) {
      console.error('RUTINA.SERVICE -> Error al agregar rutina:', err);
      throw err;
    }
  }

  // Método para obtener todas las rutinas de un usuario específico
  async obtenerRutinasPorUsuario(usuarioId: string) {
    try {
      const result = await this.baseDatos.find({
        selector: { entidad: 'rutina', usuarioId }
      });
      console.log('RUTINA.SERVICE -> Obtenidas rutinas')
      return result.docs;
    } catch (err) {
      console.error('RUTINA.SERVICE -> Error al obtener rutinas:', err);
      throw err;
    }
  }

  // Método para cargar todas las rutinas en el BehaviorSubject
  async cargarRutinas() {
    try {
        const result = await this.baseDatos.find({ selector: { entidad: 'rutina' } });
        const rutinas = result.docs;
        console.log('RUTINA.SERVICE -> Rutinas cargadas en Behavior:', rutinas); // Log para ver todas las rutinas y sus datos
        this.rutinasSubject.next(rutinas);
    } catch (err) {
        console.error('RUTINA.SERVICE -> Error al cargar rutinas:', err);
        throw err;
    }
}

  // Método para obtener una rutina específica por su ID
  async obtenerRutinaPorId(rutinaId: string) {
    try {
      const result = await this.baseDatos.get(rutinaId);
      if (result.entidad === 'rutina') {
        console.log('RUTINA.SERVICE -> Obtenida rutina por ID')
        return result;
      } else {
        throw new Error('RUTINA.SERVICE -> El documento no es del tipo rutina');
      }
    } catch (err) {
      console.error('RUTINA.SERVICE -> Error al obtener rutina:', err);
      throw err;
    }
  }

  // Método para obtener un día específico de una rutina por su nombre
  async obtenerSesionPlanificadaPorNombre(rutinaId: string, nombreSesion: string): Promise<SesionPlanificada> {
    try {
      const rutina: Rutina = await this.obtenerRutinaPorId(rutinaId); // Obtener la rutina completa
      const sesionPlanificada = rutina.sesionesPlanificadas.find((sesionPlanificada: SesionPlanificada) => sesionPlanificada.nombreSesion === nombreSesion);
      if (sesionPlanificada) {
        return sesionPlanificada; // Retornamos el día de la rutina que coincide con el nombre
      } else {
        throw new Error('Día no encontrado en la rutina');
      }
    } catch (err) {
      console.error('Error al obtener el día de la rutina por nombre:', err);
      throw err;
    }
  }

  // Método para obtener un día específico de una rutina por el índice del día
  async obtenerSesionDiaRutina(rutinaId: string, sesionDiaIndex: number): Promise<SesionPlanificada> {
    try {
      const rutina: Rutina = await this.obtenerRutinaPorId(rutinaId); // Obtener la rutina completa
      if (rutina.sesionesPlanificadas && rutina.sesionesPlanificadas[sesionDiaIndex]) {
        return rutina.sesionesPlanificadas[sesionDiaIndex]; // Retornamos el día de la rutina correspondiente al índice
      } else {
        throw new Error('Día/sesion no encontrado en la rutina');
      }
    } catch (err) {
      console.error('Error al obtener el día/sesion de la rutina:', err);
      throw err;
    }
  }

  // Método para actualizar una rutina existente
  async actualizarRutina(rutina: Rutina) {
    try {
      if (!rutina._id || !rutina._rev) {
        throw new Error('RUTINA.SERVICE -> Rutina inválida: falta _id o _rev');
      }

      const response = await this.baseDatos.put({
        ...rutina,
        timestamp: rutina.timestamp || new Date().toISOString() // Mantener el timestamp o agregar uno si no está presente
      });
      console.log('RUTINA.SERVICE -> Rutina actualizada con éxito', response);
      this.cargarRutinas(); // Recargar las rutinas para reflejar los cambios
      return response;
    } catch (err) {
      console.error('RUTINA.SERVICE -> Error al actualizar rutina:', err);
      throw err;
    }
  }

  // Método para eliminar una rutina específica
  async eliminarRutina(rutinaId: string) {
    try {
      const rutina: Rutina = await this.obtenerRutinaPorId(rutinaId); // Obtener la rutina para asegurarnos de que existe y tiene la versión correcta
      const response = await this.baseDatos.remove(rutina);
      console.log('RUTINA.SERVICE -> Rutina eliminada con éxito', response);
      this.cargarRutinas(); // Recargar las rutinas después de eliminar una
      return response;
    } catch (err) {
      console.error('RUTINA.SERVICE -> Error al eliminar rutina:', err);
      throw err;
    }
  }

  // Método para agregar un ejercicio a un día específico de una rutina
  async agregarEjercicioARutina(rutinaId: string, sesionDiaIndex: number, nuevoEjercicioPlanificado: EjercicioPlanificado) {
    try {
      const rutina: Rutina = await this.obtenerRutinaPorId(rutinaId);
      if (rutina.sesionesPlanificadas && rutina.sesionesPlanificadas[sesionDiaIndex]) {
        rutina.sesionesPlanificadas[sesionDiaIndex].ejerciciosPlanificados.push(nuevoEjercicioPlanificado);
        console.log('RUTINA.SERVICE -> Ejercicio agregado a dia de rutina')
        return this.actualizarRutina(rutina); // Actualizamos la rutina con el nuevo ejercicio
      } else {
        throw new Error('RUTINA.SERVICE -> Día no encontrado en la rutina');
      }
    } catch (err) {
      console.error('RUTINA.SERVICE -> Error al agregar ejercicio a la rutina:', err);
      throw err;
    }
  }

  /* // Método para actualizar la fecha de entrenamiento de un día específico
  async actualizarFechaEntrenamiento(rutinaId: string, sesionDiaIndex: number, nuevaFecha: string) {
    try {
      const rutina:Rutina = await this.obtenerRutinaPorId(rutinaId);
      if (rutina.sesionesPlanificadas && rutina.sesionesPlanificadas[sesionDiaIndex]) {
        rutina.sesionesPlanificadas[sesionDiaIndex].fechaEntrenamiento = nuevaFecha;
        console.log('RUTINA.SERVICE -> Actualizada fecha')
        return this.actualizarRutina(rutina); // Actualizamos la rutina con la nueva fecha
      } else {
        throw new Error('RUTINA.SERVICE -> Día no encontrado en la rutina');
      }
    } catch (err) {
      console.error('RUTINA.SERVICE -> Error al actualizar fecha de entrenamiento:', err);
      throw err;
    }
  } */
}
