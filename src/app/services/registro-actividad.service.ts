import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de la base de datos
import { BehaviorSubject } from 'rxjs';
import { registroActividad } from '../models/registroActividad.model';

@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la app
})

export class RegistroActividadService {
  private db: any; // Variable para manejar la instancia de la base de datos
  private registrosSubject = new BehaviorSubject<registroActividad[]>([]); // Un BehaviorSubject para manejar la lista de registros en tiempo real
  registros$ = this.registrosSubject.asObservable(); // Observable para que otros componentes puedan suscribirse

  constructor(private databaseService: DatabaseService) {
    // Obtener la instancia de la base de datos desde el servicio general
    this.db = this.databaseService.obtenerBaseDatos();
  }

  // Agregar un nuevo registro de actividad
  async agregarRegistro(nuevoRegistro: registroActividad) {
    try {
      const response = await this.db.post({
        entidad: 'registroActividad', // Especificamos que la entidad es un 'registroActividad'
        usuarioId: nuevoRegistro.usuarioId,
        rutinaId: nuevoRegistro.rutinaId,
        fecha: nuevoRegistro.fecha,
        detalles: nuevoRegistro.detalles.map(detalle => ({
          ejercicioId: detalle.ejercicioId,
          series: detalle.series,
          repeticiones: detalle.repeticiones,
          peso: detalle.peso,
          notas: detalle.notas // Añadimos el campo 'notas' si está presente
        })),
        timestamp: new Date().toISOString() // Agregamos la fecha de creación
      });
      console.log('Registro de actividad añadido con éxito', response);
      return response; // Devolvemos la respuesta del proceso de agregar
    } catch (err) {
      console.error('Error al agregar registro de actividad:', err);
      throw err; // Si hay un error, lo lanzamos para que se maneje externamente
    }
  }

  // Obtener todos los registros de actividad
  async obtenerRegistros() {
    try {
      const result = await this.db.find({
        selector: { entidad: 'registroActividad' } // Filtramos por el campo 'entidad' para obtener solo los registros de actividad
      });
      const registros = result.docs; // Extraemos los registros de los resultados
      return registros; // Devolvemos los registros
    } catch (err) {
      console.error('Error al obtener registros de actividad:', err);
      throw err;
    }
  }

  // Obtener un registro de actividad específico por su ID
  async obtenerRegistroPorId(id: string) {
    try {
      const resultado = await this.db.get(id);
      if (resultado.entidad === 'registroActividad') {
        return resultado; // Devolvemos el registro encontrado si es del tipo 'registroActividad'
      } else {
        throw new Error('El documento no es del tipo registroActividad');
      }
    } catch (error) {
      console.error('Error al obtener registro por ID:', error);
      throw error; // Lanzamos el error para manejarlo fuera
    }
  }

  // Actualizar un registro de actividad
  async actualizarRegistro(registro: registroActividad) {
    try {
      const response = await this.db.put({
        ...registro,
        detalles: registro.detalles.map(detalle => ({
          ejercicioId: detalle.ejercicioId,
          series: detalle.series,
          repeticiones: detalle.repeticiones,
          peso: detalle.peso,
          notas: detalle.notas // Añadimos el campo 'notas' si está presente
        }))
      });
      console.log('Registro de actividad actualizado con éxito', response);
      return response; // Devolvemos la respuesta de la actualización
    } catch (err) {
      console.error('Error al actualizar registro de actividad:', err);
      throw err;
    }
  }

  // Eliminar un registro de actividad
  async eliminarRegistro(registro: registroActividad) {
    try {
      const response = await this.db.remove(registro); // Usamos `remove` para eliminar el documento
      console.log('Registro de actividad eliminado con éxito', response);
      return response; // Devolvemos la respuesta de la eliminación
    } catch (err) {
      console.error('Error al eliminar registro de actividad:', err);
      throw err;
    }
  }

  // Cargar todos los registros de actividad en el BehaviorSubject
  async cargarRegistros() {
    try {
      const registros = await this.obtenerRegistros(); // Obtenemos todos los registros de actividad
      this.registrosSubject.next(registros); // Actualizamos el BehaviorSubject con los registros obtenidos
    } catch (err) {
      console.error('Error al cargar registros de actividad:', err);
      throw err;
    }
  }
}
