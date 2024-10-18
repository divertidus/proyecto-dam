import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Ejercicio } from '../models/ejercicio.model';

@Injectable({
  providedIn: 'root',
})
export class EjercicioService {
  private db: PouchDB.Database<Ejercicio>;

  constructor() {
    this.db = new PouchDB<Ejercicio>('ejercicios'); // Nombre de la base de datos
  }

  // Crear un nuevo ejercicio
  async crearEjercicio(ejercicio: Ejercicio): Promise<Ejercicio> {
    try {
      const response = await this.db.post(ejercicio);
      return { ...ejercicio, id: response.id }; // Devolver el ejercicio con el ID generado
    } catch (err) {
      console.error('Error al crear ejercicio:', err);
      throw err;
    }
  }

  // Obtener todos los ejercicios
  async obtenerEjercicios(): Promise<Ejercicio[]> {
    try {
      const result = await this.db.allDocs({ include_docs: true });
      return result.rows.map(row => row.doc as Ejercicio);
    } catch (err) {
      console.error('Error al obtener ejercicios:', err);
      throw err;
    }
  }

  // Obtener un ejercicio por ID
  async obtenerEjercicioPorId(id: string): Promise<Ejercicio | null> {
    try {
      const ejercicio = await this.db.get(id);
      return ejercicio;
    } catch (err) {
      console.error('Error al obtener ejercicio:', err);
      return null; // Si no se encuentra, devolvemos null
    }
  }

  // Actualizar un ejercicio
  async actualizarEjercicio(ejercicio: Ejercicio): Promise<Ejercicio> {
    try {
      const existingEjercicio = await this.db.get(ejercicio.id);
      const updatedEjercicio = { ...existingEjercicio, ...ejercicio };
      await this.db.put(updatedEjercicio);
      return updatedEjercicio;
    } catch (err) {
      console.error('Error al actualizar ejercicio:', err);
      throw err;
    }
  }

  // Eliminar un ejercicio
  async eliminarEjercicio(id: string): Promise<void> {
    try {
      const ejercicio = await this.db.get(id);
      await this.db.remove(ejercicio);
    } catch (err) {
      console.error('Error al eliminar ejercicio:', err);
      throw err;
    }
  }
}