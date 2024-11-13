import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de la base de datos
import { BehaviorSubject } from 'rxjs';
import { Rutina, DiaRutina, EjercicioPlan } from 'src/app/models/rutina.model';

@Injectable({
  providedIn: 'root'
})
export class RutinaService {
  private baseDatos: any;
  private rutinasSubject = new BehaviorSubject<Rutina[]>([]);
  rutinas$ = this.rutinasSubject.asObservable(); // Observable para suscribirse a los cambios de las rutinas

  constructor(private databaseService: DatabaseService) {
    this.baseDatos = this.databaseService.obtenerBaseDatos();
    console.log("RUTINA SERVICE -> RutinaService - baseDatos inicializado:", this.baseDatos);
    this.cargarRutinas();
  }

  /*************  METODOS PARA RUTINA  *******************/
  // Método para agregar una nueva rutina
  async agregarRutina(nuevaRutina: Rutina) {
    try {
      const response = await this.baseDatos.post({
        ...nuevaRutina,
        _id: nuevaRutina._id || undefined, // Asegurarse de que el ID es opcional
        timestamp: new Date().toISOString(), // Añadir timestamp para saber cuándo se creó
      });
      //  console.log('RUTINA.SERVICE -> Rutina añadida con éxito', response);
      this.cargarRutinas(); // Cargar de nuevo todas las rutinas después de añadir una nueva
      return response;
    } catch (err) {
      //  console.error('RUTINA.SERVICE -> Error al agregar rutina:', err);
      throw err;
    }
  }

  // Método para obtener todas las rutinas de un usuario específico
  async obtenerRutinasPorUsuario(usuarioId: string): Promise<Rutina[]> {
    console.log("RUTINA SERVICE -> Obteniendo rutinas para usuarioId:", usuarioId); // <-- Añade este console.log aquí
    try {
      const result = await this.baseDatos.find({
        selector: { entidad: 'rutina', usuarioId }
      });
      console.log('RUTINA.SERVICE -> Obtenidas rutinas para usuarioId:', usuarioId)
      console.log('RUTINA.SERVICE -> Las rutinas:', result.docs)
      return result.docs;
    } catch (err) {
      //  console.error('RUTINA.SERVICE -> Error al obtener rutinas:', err);
      throw err;
    }
  }

  // Método para cargar todas las rutinas en el BehaviorSubject
  async cargarRutinas() {
    try {
      const result = await this.baseDatos.find({ selector: { entidad: 'rutina' } });
      const rutinas = result.docs;
      //  console.log('RUTINA.SERVICE -> Cargadas rutinas en Bhaviour')
      this.rutinasSubject.next(rutinas); // Emitimos las rutinas para que todos los suscriptores las reciban
    } catch (err) {
      //  console.error('RUTINA.SERVICE -> Error al cargar rutinas:', err);
      throw err;
    }
  }

  // Método para obtener una rutina específica por su ID
  async obtenerRutinaPorId(rutinaId: string) {
    try {
      const result = await this.baseDatos.get(rutinaId);
      if (result.entidad === 'rutina') {
        //  console.log('RUTINA.SERVICE -> Obtenida rutina por ID')
        return result;
      } else {
        //  throw new Error('RUTINA.SERVICE -> El documento no es del tipo rutina');
      }
    } catch (err) {
      //  console.error('RUTINA.SERVICE -> Error al obtener rutina:', err);
      throw err;
    }
  }

  /* // Método para obtener un día específico de una rutina por su nombre
  async obtenerDiaRutinaPorNombre(rutinaId: string, diaNombre: string): Promise<DiaRutina> {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId); // Obtener la rutina completa
      const diaRutina = rutina.dias.find((dia: DiaRutina) => dia.diaNombre === diaNombre);
      if (diaRutina) {
        return diaRutina; // Retornamos el día de la rutina que coincide con el nombre
      } else {
        throw new Error('Día no encontrado en la rutina');
      }
    } catch (err) {
      console.error('Error al obtener el día de la rutina por nombre:', err);
      throw err;
    }
  } */

  // Método para obtener un día específico de una rutina por su ID
  async obtenerDiaRutinaPorId(rutinaId: string, diaRutinaId: string): Promise<DiaRutina> {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId); // Obtener la rutina completa
      const diaRutina = rutina.dias.find((dia: DiaRutina) => dia._id === diaRutinaId); // Busca por _id
      if (diaRutina) {
        return diaRutina; // Retorna el día de la rutina que coincide con el ID
      } else {
        throw new Error('RUTINA SERVICE -> Día no encontrado en la rutina');
      }
    } catch (err) {
      console.error(' RUTINA SERVICE -> Error al obtener el día de la rutina por ID:', err);
      throw err;
    }
  }

  // Método para obtener un día específico de una rutina por el índice del día
  async obtenerDiaRutina(rutinaId: string, diaIndex: number): Promise<DiaRutina> {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId); // Obtener la rutina completa
      if (rutina.dias && rutina.dias[diaIndex]) {
        return rutina.dias[diaIndex]; // Retornamos el día de la rutina correspondiente al índice
      } else {
        throw new Error('RUTINA SERVICE -> Día no encontrado en la rutina');
      }
    } catch (err) {
      console.error('RUTINA SERVICE -> Error al obtener el día de la rutina:', err);
      throw err;
    }
  }

  // Método para actualizar una rutina existente
  async actualizarRutina(rutina: Rutina) {
    try {
      if (!rutina._id || !rutina._rev) {
        //  throw new Error('RUTINA.SERVICE -> Rutina inválida: falta _id o _rev');
      }

      const response = await this.baseDatos.put({
        ...rutina,
        timestamp: rutina.timestamp || new Date().toISOString() // Mantener el timestamp o agregar uno si no está presente
      });
      //  console.log('RUTINA.SERVICE -> Rutina actualizada con éxito', response);
      this.cargarRutinas(); // Recargar las rutinas para reflejar los cambios
      return response;
    } catch (err) {
      //  console.error('RUTINA.SERVICE -> Error al actualizar rutina:', err);
      throw err;
    }
  }

  // Método para eliminar una rutina específica
  async eliminarRutina(rutinaId: string) {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId); // Obtener la rutina para asegurarnos de que existe y tiene la versión correcta
      const response = await this.baseDatos.remove(rutina);
      //  console.log('RUTINA.SERVICE -> Rutina eliminada con éxito', response);
      this.cargarRutinas(); // Recargar las rutinas después de eliminar una
      return response;
    } catch (err) {
      //  console.error('RUTINA.SERVICE -> Error al eliminar rutina:', err);
      throw err;
    }
  }

  // Método para agregar un ejercicio a un día específico de una rutina
  async agregarEjercicioARutina(rutinaId: string, diaIndex: number, nuevoEjercicio: EjercicioPlan) {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId);
      if (rutina.dias && rutina.dias[diaIndex]) {
        rutina.dias[diaIndex].ejercicios.push(nuevoEjercicio);
        //  console.log('RUTINA.SERVICE -> Ejercicio agregado a dia de rutina')
        return this.actualizarRutina(rutina); // Actualizamos la rutina con el nuevo ejercicio
      } else {
        //  throw new Error('RUTINA.SERVICE -> Día no encontrado en la rutina');
      }
    } catch (err) {
      //  console.error('RUTINA.SERVICE -> Error al agregar ejercicio a la rutina:', err);
      throw err;
    }
  }

  // Método para actualizar la fecha de entrenamiento de un día específico
  async actualizarFechaEntrenamiento(rutinaId: string, diaIndex: number, nuevaFecha: string) {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId);
      if (rutina.dias && rutina.dias[diaIndex]) {
        rutina.dias[diaIndex].fechaEntrenamiento = nuevaFecha;
        //  console.log('RUTINA.SERVICE -> Actualizada fecha')
        return this.actualizarRutina(rutina); // Actualizamos la rutina con la nueva fecha
      } else {
        //  throw new Error('RUTINA.SERVICE -> Día no encontrado en la rutina');
      }
    } catch (err) {
      //  console.error('RUTINA.SERVICE -> Error al actualizar fecha de entrenamiento:', err);
      throw err;
    }
  }


  /*************  METODOS PARA DIA RUTINA  *******************/

  // Método para agregar un nuevo día a una rutina específica
  async agregarDiaARutina(rutinaId: string, nuevoDia: DiaRutina) {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId);
      rutina.dias.push(nuevoDia);
      return this.actualizarRutina(rutina); // Guardar la rutina actualizada
    } catch (err) {
      console.error('Error al agregar un nuevo día a la rutina:', err);
      throw err;
    }
  }

  // Método para obtener un día específico por su _id dentro de una rutina
  async obtenerDiaPorId(rutinaId: string, diaId: string): Promise<DiaRutina | undefined> {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId);
      return rutina.dias.find(dia => dia._id === diaId);
    } catch (err) {
      console.error('Error al obtener el día por ID:', err);
      throw err;
    }
  }

  // Método para actualizar un día específico dentro de una rutina
  async actualizarDiaEnRutina(rutinaId: string, diaActualizado: DiaRutina) {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId);
      const index = rutina.dias.findIndex(dia => dia._id === diaActualizado._id);
      if (index !== -1) {
        rutina.dias[index] = diaActualizado;
        return this.actualizarRutina(rutina); // Guardar la rutina completa
      } else {
        throw new Error('Día no encontrado en la rutina');
      }
    } catch (err) {
      console.error('Error al actualizar el día en la rutina:', err);
      throw err;
    }
  }

  // Método para eliminar un día específico de una rutina
  async eliminarDiaDeRutina(rutinaId: string, diaId: string) {
    try {
      const rutina = await this.obtenerRutinaPorId(rutinaId);
      rutina.dias = rutina.dias.filter(dia => dia._id !== diaId); // Eliminar el día específico
      return this.actualizarRutina(rutina); // Guardar la rutina completa sin el día eliminado
    } catch (err) {
      console.error('Error al eliminar el día de la rutina:', err);
      throw err;
    }
  }


}
