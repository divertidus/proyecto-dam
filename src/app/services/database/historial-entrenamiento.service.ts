// servicio/historial.service.ts
import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de base de datos
import { BehaviorSubject } from 'rxjs'; // Para manejar la lista de historiales de manera reactiva
import { DiaEntrenamiento, EjercicioRealizado, HistorialEntrenamiento, SerieReal } from 'src/app/models/historial-entrenamiento';

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

  // Método para agregar un nuevo historial de entrenamiento
  // Agregar o actualizar un historial de entrenamiento
  // Método para agregar o actualizar el historial de entrenamiento
  async agregarHistorial(historial: HistorialEntrenamiento): Promise<void> {
    try {
      // Buscar si ya existe el historial de este usuario
      const historialesExistentes = await this.obtenerHistorialesPorUsuario(historial.usuarioId);
      let historialExistente = historialesExistentes[0];

      if (historialExistente) {
        // Agregar el nuevo entrenamiento al historial existente
        historialExistente.entrenamientos.push(...historial.entrenamientos);
        await this.baseDatos.put({
          ...historialExistente,
          _rev: historialExistente._rev,
        });
      } else {
        // Crear uno nuevo si no existe
        historial._id = `historial_${historial.usuarioId}_${Date.now()}`;
        await this.baseDatos.put(historial);
      }

      // Emitir inmediatamente el historial actualizado
      // Emitir el historial actualizado después de confirmarse la operación en la base de datos
      const historialesActualizados = await this.obtenerHistorialesPorUsuario(historial.usuarioId);
      await this.emitirHistorialActualizado(historialesActualizados);

    } catch (error) {
      console.error('Error al agregar o actualizar el historial:', error);
      throw error;
    }
  }

  private async emitirHistorialActualizado(historiales: HistorialEntrenamiento[]): Promise<void> {
    this.historialSubject.next([...historiales]);
    console.log('Historiales cargados y emitidos en BehaviorSubject:', historiales);
  }

  // Método para obtener todos los historiales de un usuario
  // Obtener todos los historiales de un usuario
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

  // Método para actualizar un historial

  // Actualizar un historial específico
  async actualizarHistorial(historial: HistorialEntrenamiento): Promise<void> {
    try {
      await this.baseDatos.put(historial);
      await this.cargarHistoriales(historial.usuarioId); // Recargar historial actualizado
    } catch (error) {
      console.error('Error al actualizar historial:', error);
      throw error;
    }
  }

  // Método para eliminar un historial de la base de datos
  // Eliminar un historial completo
  async eliminarHistorial(historial: HistorialEntrenamiento): Promise<void> {
    try {
      await this.baseDatos.remove(historial);
      await this.cargarHistoriales(historial.usuarioId); // Recargar historial actualizado
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

  async obtenerUltimoEntrenamientoPorUsuario(usuarioId: string): Promise<DiaEntrenamiento | null> {
    try {
      const historiales = await this.obtenerHistorialesPorUsuario(usuarioId);
      if (historiales.length === 0) return null;

      historiales.sort(
        (a, b) =>
          new Date(b.entrenamientos[b.entrenamientos.length - 1].fechaEntrenamiento).getTime() -
          new Date(a.entrenamientos[a.entrenamientos.length - 1].fechaEntrenamiento).getTime()
      );

      return historiales[0].entrenamientos[historiales[0].entrenamientos.length - 1] || null;
    } catch (error) {
      console.error('Error al obtener el último entrenamiento:', error);
      return null;
    }
  }

  // Obtener el último peso registrado de un ejercicio para un usuario
  async obtenerUltimoPesoEjercicio(usuarioId: string, ejercicioId: string): Promise<number | null> {
    try {
      const historiales = await this.obtenerHistorialesPorUsuario(usuarioId);

      historiales.sort((a, b) =>
        new Date(b.entrenamientos[0].fechaEntrenamiento).getTime() -
        new Date(a.entrenamientos[0].fechaEntrenamiento).getTime()
      );

      for (const historial of historiales) {
        for (const diaEntrenamiento of historial.entrenamientos) {
          for (const ejercicioRealizado of diaEntrenamiento.ejerciciosRealizados) {
            if (ejercicioRealizado.ejercicioPlanId === ejercicioId) {
              const serieConPeso = ejercicioRealizado.series.find(serie => serie.peso !== undefined && serie.peso !== null);
              if (serieConPeso) return serieConPeso.peso;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error al obtener el último peso del ejercicio:', error);
      return null;
    }
  }

  // Función para obtener el peso anterior de un ejercicio específico para un usuario y rutina dados
  async obtenerPesoAnterior(ejercicio: EjercicioRealizado, usuarioId: string, rutinaId: string): Promise<number[] | null> {
    if (ejercicio.anteriorVezEjercicioID) {
      try {
        // Busca el ejercicio realizado previamente en base al ID referenciado y el usuario/rutina correspondientes
        const entrenamientoAnterior = await this.baseDatos.find({
          selector: {
            _id: ejercicio.anteriorVezEjercicioID,
            usuarioId: usuarioId,
            rutinaId: rutinaId,
            entidad: 'historialEntrenamiento'
          }
        });

        if (entrenamientoAnterior.docs.length > 0 && entrenamientoAnterior.docs[0].series) {
          return entrenamientoAnterior.docs[0].series.map((serie: any) => serie.peso); // Array de pesos anteriores
        }
      } catch (error) {
        console.error('Error al obtener el peso anterior:', error);
      }
    }
    return null; // Si no hay peso anterior registrado o no se encuentra el documento
  }

  // Método para actualizar pesos posteriores después de modificar una serie anterior
  async actualizarPesosPosteriores(ejercicioId: string, usuarioId: string, nuevoPeso: number) {
    try {
      // Encuentra todas las sesiones posteriores que dependen del `anteriorVezEjercicioID` actualizado
      const entrenamientosPosteriores = await this.baseDatos.find({
        selector: {
          entidad: 'historialEntrenamiento',
          usuarioId: usuarioId,
          'entrenamientos.ejercicios.ejercicioId': ejercicioId
        }
      });

      for (const entrenamiento of entrenamientosPosteriores.docs) {
        for (const diaEntrenamiento of entrenamiento.entrenamientos) {
          for (const ejercicio of diaEntrenamiento.ejercicios) {
            if (ejercicio.ejercicioId === ejercicioId && ejercicio.anteriorVezEjercicioID) {
              // Actualizar el `pesoAnterior` de cada serie en la sesión posterior
              ejercicio.series.forEach((serie: SerieReal) => {
                serie.pesoAnterior = nuevoPeso;
              });

              // Guardar los cambios en la base de datos
              await this.baseDatos.put(entrenamiento);
              console.log(`Actualizado el peso anterior en entrenamiento posterior: ${entrenamiento._id}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al actualizar pesos en entrenamientos posteriores:', error);
    }
  }


  // Eliminar un día específico de un historial y recargar el historial
  async eliminarDiaEntrenamiento(historialId: string, diaId: string): Promise<void> {
    try {
      const historial = await this.baseDatos.get(historialId);
      if (!historial) return;

      historial.entrenamientos = historial.entrenamientos.filter((dia: DiaEntrenamiento) => dia._id !== diaId);
      await this.baseDatos.put({ ...historial, _rev: historial._rev });

      // Emitir el historial actualizado
      const historialesActualizados = await this.obtenerHistorialesPorUsuario(historial.usuarioId);
      await this.emitirHistorialActualizado(historialesActualizados);
    } catch (error) {
      console.error(`Error al eliminar el día con ID ${diaId}:`, error);
      throw error;
    }
  }

  async obtenerUltimoEjercicioRealizado(usuarioId: string, ejercicioId: string): Promise<EjercicioRealizado | null> {
    try {
      const historiales = await this.obtenerHistorialesPorUsuario(usuarioId);

      if (historiales.length === 0) return null;

      // Aplanar todos los entrenamientos y ordenar por fecha
      const todosLosEntrenamientos = historiales
        .flatMap(historial => historial.entrenamientos)
        .sort((a, b) =>
          new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime()
        );

      // Buscar el ejercicio más reciente con el ejercicioId dado
      for (const diaEntrenamiento of todosLosEntrenamientos) {
        const ejercicioRealizado = diaEntrenamiento.ejerciciosRealizados.find(
          ejercicio => ejercicio.ejercicioPlanId === ejercicioId
        );

        if (ejercicioRealizado) {
          console.log('Detalles del ejercicio encontrado:', {
            ejercicioPlanId: ejercicioRealizado.ejercicioPlanId,
            id: ejercicioRealizado._id,
            nombre: ejercicioRealizado.nombreEjercicioRealizado,
            series: ejercicioRealizado.series
          });
          return ejercicioRealizado; // Retorna el primer ejercicio encontrado en orden cronológico inverso
        }
      }

      return null; // No se encontró el ejercicio en el historial
    } catch (error) {
      console.error('Error al obtener el último ejercicio realizado:', error);
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
}





