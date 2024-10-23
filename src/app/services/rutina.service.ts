import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de la base de datos
import { BehaviorSubject } from 'rxjs';
import { Rutina, EjercicioPlan } from '../models/rutina.model';

@Injectable({
  providedIn: 'root'
})
export class RutinaService {
  private db: any;
  private rutinasSubject = new BehaviorSubject<Rutina[]>([]);
  rutinas$ = this.rutinasSubject.asObservable(); // Observable para suscribirse a los cambios de las rutinas

  constructor(private databaseService: DatabaseService) {
    this.db = this.databaseService.obtenerBaseDatos();
    this.cargarRutinas(); // Inicializamos las rutinas cargándolas desde la base de datos
  }

  // Método para agregar una nueva rutina
  async agregarRutina(nuevaRutina: Rutina) {
    try {
      const response = await this.db.post({
        ...nuevaRutina,
        _id: nuevaRutina._id || undefined, // Asegurarse de que el ID es opcional
        timestamp: new Date().toISOString(), // Añadir timestamp para saber cuándo se creó
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
      const result = await this.db.find({
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
      const result = await this.db.find({ selector: { entidad: 'rutina' } });
      const rutinas = result.docs;
      console.log('RUTINA.SERVICE -> Cargadas rutinas en Bhaviour')
      this.rutinasSubject.next(rutinas); // Emitimos las rutinas para que todos los suscriptores las reciban
    } catch (err) {
      console.error('RUTINA.SERVICE -> Error al cargar rutinas:', err);
      throw err;
    }
  }

  // Método para obtener una rutina específica por su ID
  async obtenerRutinaPorId(rutinaId: string) {
    try {
      const result = await this.db.get(rutinaId);
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

  // Método para actualizar una rutina existente
  async actualizarRutina(rutina: Rutina) {
    try {
      if (!rutina._id || !rutina._rev) {
        throw new Error('RUTINA.SERVICE -> Rutina inválida: falta _id o _rev');
      }

      const response = await this.db.put({
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
      const rutina = await this.obtenerRutinaPorId(rutinaId); // Obtener la rutina para asegurarnos de que existe y tiene la versión correcta
      const response = await this.db.remove(rutina);
      console.log('RUTINA.SERVICE -> Rutina eliminada con éxito', response);
      this.cargarRutinas(); // Recargar las rutinas después de eliminar una
      return response;
    } catch (err) {
      console.error('RUTINA.SERVICE -> Error al eliminar rutina:', err);
      throw err;
    }
  }

  // Método para agregar un ejercicio a un día específico de una rutina
  async agregarEjercicioARutina(rutinaId: string, diaIndex: number, nuevoEjercicio: EjercicioPlan) {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId);
      if (rutina.dias && rutina.dias[diaIndex]) {
        rutina.dias[diaIndex].ejercicios.push(nuevoEjercicio);
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

  // Método para actualizar la fecha de entrenamiento de un día específico
  async actualizarFechaEntrenamiento(rutinaId: string, diaIndex: number, nuevaFecha: string) {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId);
      if (rutina.dias && rutina.dias[diaIndex]) {
        rutina.dias[diaIndex].fechaEntrenamiento = nuevaFecha;
        console.log('RUTINA.SERVICE -> Actualizada fecha')
        return this.actualizarRutina(rutina); // Actualizamos la rutina con la nueva fecha
      } else {
        throw new Error('RUTINA.SERVICE -> Día no encontrado en la rutina');
      }
    } catch (err) {
      console.error('RUTINA.SERVICE -> Error al actualizar fecha de entrenamiento:', err);
      throw err;
    }
  }
}
