import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de la base de datos
import { BehaviorSubject } from 'rxjs';
import { Rutina } from '../models/rutina.model'; // Importamos el modelo de Rutina

@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la app
})

export class RutinaService {
  private db: any; // Variable para manejar la instancia de la base de datos
  private rutinasSubject = new BehaviorSubject<Rutina[]>([]); // Un BehaviorSubject para manejar la lista de rutinas en tiempo real
  rutinas$ = this.rutinasSubject.asObservable(); // Observable para que otros componentes puedan suscribirse

  constructor(private databaseService: DatabaseService) {
    // Obtener la instancia de la base de datos desde el servicio general
    this.db = this.databaseService.obtenerBaseDatos();
  }

  // Agregar una nueva rutina
  async agregarRutina(nuevaRutina: Rutina) {
    try {
      const response = await this.db.post({
        entidad: 'rutina', // Aseguramos que el campo 'entidad' esté presente
        nombre: nuevaRutina.nombre,
        dias: nuevaRutina.dias.map(dia => ({
          ...dia,
          ejercicios: dia.ejercicios.map(ejercicio => ({
            ejercicioId: ejercicio.ejercicioId,
            series: ejercicio.series,
            repeticiones: ejercicio.repeticiones,
            notas: ejercicio.notas // Añadimos el campo 'notas' si está presente
          }))
        })),
        timestamp: new Date().toISOString() // Agregamos la fecha de creación
      });
      console.log('Rutina añadida con éxito', response);
      return response; // Devolvemos la respuesta del proceso de agregar
    } catch (err) {
      console.error('Error al agregar rutina:', err);
      throw err; // Si hay un error, lo lanzamos para que se maneje externamente
    }
  }

  // Obtener todas las rutinas
  async obtenerRutinas() {
    try {
      const result = await this.db.find({
        selector: { entidad: 'rutina' } // Filtramos por el campo 'entidad' para obtener solo rutinas
      });
      const rutinas = result.docs; // Extraemos las rutinas de los resultados
      return rutinas; // Devolvemos las rutinas
    } catch (err) {
      console.error('Error al obtener rutinas:', err);
      throw err;
    }
  }

  // Obtener una rutina específica por su ID
  async obtenerRutinaPorId(id: string) {
    try {
      const resultado = await this.db.get(id);
      if (resultado.entidad === 'rutina') {
        return resultado; // Devolvemos la rutina encontrada si es del tipo 'rutina'
      } else {
        throw new Error('El documento no es del tipo rutina');
      }
    } catch (error) {
      console.error('Error al obtener rutina por ID:', error);
      throw error; // Lanzamos el error para manejarlo fuera
    }
  }

  // Actualizar una rutina
  async actualizarRutina(rutina: Rutina) {
    try {
      const response = await this.db.put({
        ...rutina,
        dias: rutina.dias.map(dia => ({
          ...dia,
          ejercicios: dia.ejercicios.map(ejercicio => ({
            ejercicioId: ejercicio.ejercicioId,
            series: ejercicio.series,
            repeticiones: ejercicio.repeticiones,
            notas: ejercicio.notas // Añadimos el campo 'notas' si está presente
          }))
        }))
      });
      console.log('Rutina actualizada con éxito', response);
      return response; // Devolvemos la respuesta de la actualización
    } catch (err) {
      console.error('Error al actualizar rutina:', err);
      throw err;
    }
  }

  // Eliminar una rutina
  async eliminarRutina(rutina: Rutina) {
    try {
      const response = await this.db.remove(rutina); // Usamos `remove` para eliminar el documento
      console.log('Rutina eliminada con éxito', response);
      return response; // Devolvemos la respuesta de la eliminación
    } catch (err) {
      console.error('Error al eliminar rutina:', err);
      throw err;
    }
  }

  // Cargar todas las rutinas en el BehaviorSubject
  async cargarRutinas() {
    try {
      const rutinas = await this.obtenerRutinas(); // Obtenemos todas las rutinas
      this.rutinasSubject.next(rutinas); // Actualizamos el BehaviorSubject con las rutinas obtenidas
    } catch (err) {
      console.error('Error al cargar rutinas:', err);
      throw err;
    }
  }
}
