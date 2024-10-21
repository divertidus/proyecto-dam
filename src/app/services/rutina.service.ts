import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de la base de datos
import { BehaviorSubject } from 'rxjs';
import { Rutina } from '../models/rutina.model';

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
      const response = await this.db.post(nuevaRutina);
      console.log('Rutina añadida con éxito', response);
      this.cargarRutinas(); // Cargar de nuevo todas las rutinas después de añadir una nueva
      return response;
    } catch (err) {
      console.error('Error al agregar rutina:', err);
      throw err;
    }
  }

  // Obtener todas las rutinas por usuario logueado
  async obtenerRutinasPorUsuario(usuarioId: string) {
    try {
      const result = await this.db.find({
        selector: { entidad: 'rutina', usuarioId }
      });
      return result.docs;
    } catch (err) {
      console.error('Error al obtener rutinas:', err);
      throw err;
    }
  }

  // Cargar todas las rutinas y actualizar el BehaviorSubject
  async cargarRutinas() {
    try {
      const result = await this.db.find({ selector: { entidad: 'rutina' } });
      const rutinas = result.docs;
      this.rutinasSubject.next(rutinas); // Emitimos las rutinas para que todos los suscriptores las reciban
    } catch (err) {
      console.error('Error al cargar rutinas:', err);
      throw err;
    }
  }
}