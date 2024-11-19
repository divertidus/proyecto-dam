// servicio/historial.service.ts
import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de base de datos
import { BehaviorSubject } from 'rxjs'; // Para manejar la lista de historiales de manera reactiva
import { DiaEntrenamiento, EjercicioRealizado, HistorialEntrenamiento, SerieReal } from 'src/app/models/historial-entrenamiento';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root' // Servicio disponible en toda la aplicación
})
export class HistorialService {
  private baseDatos: any; // Almacenamos la instancia de la base de datos
  private historialSubject = new BehaviorSubject<HistorialEntrenamiento[]>([]); // Sujeto para el historial de entrenamiento
  historial$ = this.historialSubject.asObservable(); // Observable para escuchar cambios en los historiales

  // Añadimos un mapa para almacenar los nombres de los ejercicios
  nombresEjercicios: { [id: string]: string } = {};

  constructor(private servicioBaseDatos: DatabaseService) {
    // Obtenemos la base de datos a través del servicio general de base de datos
    this.baseDatos = this.servicioBaseDatos.obtenerBaseDatos();

  }

  ///////////////////////// HISTORIAL /////////////////////////// 

  // Agregar o actualizar un historial de entrenamiento
  async agregarHistorial(historial: HistorialEntrenamiento): Promise<void> {
    try {
      const historialesExistentes = await this.obtenerHistorialesPorUsuario(historial.usuarioId);
      let historialExistente = historialesExistentes[0];

      if (historialExistente) {
        historialExistente.entrenamientos.push(...historial.entrenamientos);
        await this.baseDatos.put({
          ...historialExistente,
          _rev: historialExistente._rev,
        });
      } else {
        historial._id = `historial_${historial.usuarioId}_${Date.now()}`;
        await this.baseDatos.put(historial);
      }

      await this.emitirHistorialActualizado(historial.usuarioId);
    } catch (error) {
      console.error('Error al agregar o actualizar el historial:', error);
      throw error;
    }
  }

  // Método para obtener todos los historiales de un usuario
  async obtenerHistorialesPorUsuario(usuarioId: string): Promise<HistorialEntrenamiento[]> {
    try {
      const result = await this.baseDatos.find({
        selector: { entidad: 'historialEntrenamiento', usuarioId }
      });
      return result.docs as HistorialEntrenamiento[];
    } catch (error) {
      console.error('Error al obtener historiales:', error);
      throw error;
    }
  }

  // Método para obtener un historial específico por su ID
  async obtenerHistorialPorId(id: string) {
    try {
      const resultado = await this.baseDatos.get(id);
      return resultado;
    } catch (error) {
      console.error('Error al obtener historial por ID:', error);
      throw error;
    }
  }

  // Actualizar un historial específico
  async actualizarHistorial(historial: HistorialEntrenamiento): Promise<void> {
    try {
      await this.baseDatos.put(historial);
      await this.emitirHistorialActualizado(historial.usuarioId);
    } catch (error) {
      console.error('Error al actualizar historial:', error);
      throw error;
    }
  }

  // Eliminar un historial completo
  async eliminarHistorial(historial: HistorialEntrenamiento): Promise<void> {
    try {
      await this.baseDatos.remove(historial);
      await this.emitirHistorialActualizado(historial.usuarioId);
    } catch (error) {
      console.error('Error al eliminar historial:', error);
      throw error;
    }
  }

  // HistorialService
  async cargarHistoriales(usuarioId: string) {
    try {
      const historiales = await this.obtenerHistorialesPorUsuario(usuarioId);
      // Forzamos la emisión de datos más recientes
      this.historialSubject.next([...historiales]); // Forzar emisión de copia para detectar el cambio
      console.log('Historiales cargados y emitidos en BehaviorSubject:', historiales);
    } catch (error) {
      console.error('Error al cargar historiales:', error);
      throw error;
    }
  }

  // Método para emitir los historiales actualizados
  private async emitirHistorialActualizado(usuarioId: string): Promise<void> {
    const historialesActualizados = await this.obtenerHistorialesPorUsuario(usuarioId);
    this.historialSubject.next([...historialesActualizados]);
    console.log('Historiales emitidos en BehaviorSubject:', historialesActualizados);
  }

  /////////////////////////  OTROS HISTORIAL   //////////////////////////////////

  async obtenerUltimoEjercicioRealizado(usuarioId: string, ejercicioPlanId: string, rutinaId: string, diaRutinaId: string): Promise<EjercicioRealizado | null> {
    try {

      //console.log('Soy el obtenerUltimoEjercicioRealizado y recibo el id de supoouestamente ejercicioPlanId:  ', ejercicioPlanId)
      const historiales = await this.obtenerHistorialesPorUsuario(usuarioId);

      if (historiales.length === 0) return null;

      // Aplanar todos los entrenamientos y ordenar por fecha
      const todosLosEntrenamientos = historiales
        .flatMap(historial => historial.entrenamientos)
        .sort((a, b) =>
          new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime()
        );

      // Buscar el ejercicioRealizado más reciente con el ejercicioPlanId, rutinaId, y diaRutinaId dados
      for (const diaEntrenamiento of todosLosEntrenamientos) {
        // Comprobar que el diaEntrenamiento pertenece a la misma rutina y día
        if (diaEntrenamiento.rutinaId === rutinaId && diaEntrenamiento.diaRutinaId === diaRutinaId) {
          const ejercicioRealizadoEncontrado = diaEntrenamiento.ejerciciosRealizados.find(
            (ejercicioRealizado) => ejercicioRealizado.ejercicioPlanId === ejercicioPlanId
          );

          if (ejercicioRealizadoEncontrado) {
            /*   console.log('Detalles del ejercicioRealizado encontrado:',
                {
                  ejercicioPlanId: ejercicioRealizadoEncontrado.ejercicioPlanId,
                  id: ejercicioRealizadoEncontrado._id,
                  nombre: ejercicioRealizadoEncontrado.nombreEjercicioRealizado,
                  series: ejercicioRealizadoEncontrado.series
                }); */
            return ejercicioRealizadoEncontrado; // Retorna el primer ejercicioRealizado encontrado en orden cronológico inverso
          }
        }
      }

      return null; // No se encontró el ejercicio en el historial
    } catch (error) {
      console.error('Error al obtener el último ejercicioRealizado:', error);
      return null;
    }
  }



  ///////////////////////// SERIES /////////////////////////// 

  // Crear una nueva serie en un ejercicio de un día específico
  async crearSerie(historial: HistorialEntrenamiento, diaEntrenamiento: DiaEntrenamiento, ejercicio: EjercicioRealizado, nuevaSerie: SerieReal): Promise<void> {
    try {
      // Verificar y asignar un ID único a la nueva serie si no existe
      nuevaSerie._id = nuevaSerie._id || `serie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      ejercicio.series.push(nuevaSerie); // Agregar la serie al ejercicio

      await this.baseDatos.put({ ...historial, _rev: historial._rev });
      console.log('Serie creada exitosamente');
    } catch (error) {
      console.error('Error al crear serie:', error);
      throw error;
    }
  }

  // Obtener una serie específica
  async obtenerSerie(historial: HistorialEntrenamiento, diaEntrenamiento: DiaEntrenamiento, ejercicio: EjercicioRealizado, serieId: string): Promise<SerieReal | null> {
    try {
      // Buscar la serie específica dentro del ejercicio dado
      return ejercicio.series.find((serie: SerieReal) => serie._id === serieId) || null;
    } catch (error) {
      console.error('Error al obtener serie:', error);
      throw error;
    }
  }

  // Actualizar una serie existente
  async actualizarSerie(historial: HistorialEntrenamiento, diaEntrenamiento: DiaEntrenamiento, ejercicio: EjercicioRealizado, serieActualizada: SerieReal): Promise<void> {
    try {
      // Buscar el índice de la serie a actualizar en el ejercicio
      const indexSerie = ejercicio.series.findIndex((serie: SerieReal) => serie._id === serieActualizada._id);
      if (indexSerie === -1) throw new Error('Serie no encontrada');

      ejercicio.series[indexSerie] = { ...serieActualizada }; // Actualizar la serie en el arreglo

      await this.baseDatos.put({ ...historial, _rev: historial._rev });
      console.log('Serie actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar serie:', error);
      throw error;
    }
  }

  // Eliminar una serie específica
  async eliminarSerie(historial: HistorialEntrenamiento, diaEntrenamiento: DiaEntrenamiento, ejercicio: EjercicioRealizado, serieId: string): Promise<void> {
    try {
      // Filtrar las series para eliminar la serie con el ID especificado
      ejercicio.series = ejercicio.series.filter((serie: SerieReal) => serie._id !== serieId);

      await this.baseDatos.put({ ...historial, _rev: historial._rev });
      console.log('Serie eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar serie:', error);
      throw error;
    }
  }

  ///////////////////////// DIAS /////////////////////////// 

  // Crear un nuevo día de entrenamiento en el historial
  async crearDiaEntrenamiento(historial: HistorialEntrenamiento, nuevoDia: DiaEntrenamiento): Promise<void> {
    try {
      nuevoDia._id = nuevoDia._id || uuidv4();
      historial.entrenamientos.push(nuevoDia);

      await this.baseDatos.put({ ...historial, _rev: historial._rev });
      await this.emitirHistorialActualizado(historial.usuarioId);
    } catch (error) {
      console.error('Error al crear el día de entrenamiento:', error);
      throw error;
    }
  }

  // Obtener un día específico de entrenamiento por su ID
  async obtenerDiaEntrenamiento(historial: HistorialEntrenamiento, diaId: string): Promise<DiaEntrenamiento | null> {
    try {
      // Buscar el día de entrenamiento dentro del historial por su ID
      return historial.entrenamientos.find((dia: DiaEntrenamiento) => dia._id === diaId) || null;
    } catch (error) {
      console.error('Error al obtener el día de entrenamiento:', error);
      throw error;
    }
  }

  // Actualizar un día específico de entrenamiento
  async actualizarDiaEntrenamiento(diaActualizado: DiaEntrenamiento): Promise<void> {
    try {
      const result = await this.baseDatos.find({
        selector: {
          entidad: 'historialEntrenamiento',
          entrenamientos: { $elemMatch: { _id: diaActualizado._id } }
        }
      });

      if (result.docs.length === 0) {
        console.error('No se encontró ningún historial que contenga el día a actualizar.');
        return;
      }

      const historial = result.docs[0];
      const indexDia = historial.entrenamientos.findIndex(dia => dia._id === diaActualizado._id);
      if (indexDia === -1) {
        console.error('El día de entrenamiento no se encontró en el historial.');
        return;
      }

      historial.entrenamientos[indexDia] = { ...diaActualizado };
      await this.baseDatos.put({ ...historial, _rev: historial._rev });
      await this.emitirHistorialActualizado(historial.usuarioId);
    } catch (error) {
      console.error('Error al actualizar el día de entrenamiento:', error);
      throw error;
    }
  }

  // Método para obtener el historialId de un día de entrenamiento específico
  async obtenerHistorialIdPorDia(diaId: string): Promise<string | null> {
    try {
      const historiales = await this.historial$.toPromise(); // Espera a que los historiales se carguen
      const historial = historiales.find(h =>
        h.entrenamientos.some(dia => dia._id === diaId)
      );

      return historial ? historial._id : null;
    } catch (error) {
      console.error('Error al obtener historialId por diaId:', error);
      return null;
    }
  }

  // Eliminar un día específico de entrenamiento
  async eliminarDiaEntrenamiento(historialId: string, diaId: string): Promise<void> {
    try {
      const historial = await this.baseDatos.get(historialId);
      if (!historial) {
        console.error('No se encontró el historial con el ID especificado.');
        return;
      }

      historial.entrenamientos = historial.entrenamientos.filter((dia: DiaEntrenamiento) => dia._id !== diaId);
      await this.baseDatos.put({ ...historial, _rev: historial._rev });
      await this.emitirHistorialActualizado(historial.usuarioId);
    } catch (error) {
      console.error(`Error al eliminar el día con ID ${diaId}:`, error);
      throw error;
    }
  }



}





