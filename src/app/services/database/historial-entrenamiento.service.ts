// servicio/historial.service.ts
import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de base de datos
import { BehaviorSubject } from 'rxjs'; // Para manejar la lista de historiales de manera reactiva
import { EjercicioRealizado, HistorialEntrenamiento, SerieReal } from 'src/app/models/historial-entrenamiento';

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
  async agregarHistorial(historial: HistorialEntrenamiento) {
    try {
      // Mostrar el objeto completo en consola antes de guardarlo
      console.log('Historial que se guarda:', historial);
      const respuesta = await this.baseDatos.post(historial);
      console.log('Historial añadido con éxito', respuesta);
  
      const historiales = await this.obtenerHistorialesPorUsuario(historial.usuarioId);
      this.historialSubject.next(historiales);
  
      return respuesta;
    } catch (error) {
      console.error('Error al agregar historial:', error);
      throw error;
    }
  }

  // Método para obtener todos los historiales de un usuario
  async obtenerHistorialesPorUsuario(usuarioId: string) {
    try {
      const resultado = await this.baseDatos.find({
        selector: {
          entidad: 'historialEntrenamiento',
          usuarioId: usuarioId
        }
      });
      const historiales = resultado.docs;
      return historiales;
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
  async actualizarHistorial(historial: HistorialEntrenamiento) {
    try {
      const respuesta = await this.baseDatos.put(historial);
      console.log('Historial actualizado con éxito', respuesta);
      return respuesta;
    } catch (error) {
      console.error('Error al actualizar historial:', error);
      throw error;
    }
  }

  // Método para eliminar un historial de la base de datos
  async eliminarHistorial(historial: HistorialEntrenamiento) {
    try {
      const respuesta = await this.baseDatos.remove(historial);
      console.log('Historial eliminado con éxito', respuesta);
      return respuesta;
    } catch (error) {
      console.error('Error al eliminar historial:', error);
      throw error;
    }
  }

  // Método para cargar los historiales de un usuario y almacenarlos en el BehaviorSubject
  async cargarHistoriales(usuarioId: string) {
    try {
      const historiales = await this.obtenerHistorialesPorUsuario(usuarioId);
      this.historialSubject.next(historiales); // Actualizamos el BehaviorSubject con los historiales obtenidos
      console.log('Historiales cargados en BehaviorSubject');
    } catch (error) {
      console.error('Error al cargar historiales:', error);
      throw error;
    }
  }

  async obtenerUltimoEntrenamientoPorUsuario(usuarioId: string): Promise<HistorialEntrenamiento | null> {
    try {
      // Obtenemos el historial del usuario
      const historiales = await this.obtenerHistorialesPorUsuario(usuarioId);
      if (historiales.length === 0) {
        console.log('No hay entrenamientos registrados');
        return null;
      }

      // Ordenamos los historiales por fecha descendente
      historiales.sort(
        (a, b) =>
          new Date(b.entrenamientos[0].fechaEntrenamiento).getTime() -
          new Date(a.entrenamientos[0].fechaEntrenamiento).getTime()
      );

      // Devolvemos el último entrenamiento
      return historiales[0].entrenamientos[0];
    } catch (error) {
      console.error('Error al obtener el último entrenamiento:', error);
      return null;
    }
  }

  // Método para buscar el último peso de un ejercicio específico
  async obtenerUltimoPesoEjercicio(usuarioId: string, ejercicioId: string): Promise<number | null> {
    try {
      // Obtenemos el historial del usuario
      const historiales = await this.obtenerHistorialesPorUsuario(usuarioId);

      // Ordenamos los historiales cronológicamente de más reciente a más antiguo
      historiales.sort((a, b) =>
        new Date(b.entrenamientos[0].fechaEntrenamiento).getTime() -
        new Date(a.entrenamientos[0].fechaEntrenamiento).getTime()
      );

      // Recorremos los entrenamientos de más reciente a más antiguo
      for (const historial of historiales) {
        for (const diaEntrenamiento of historial.entrenamientos) {
          for (const ejercicioRealizado of diaEntrenamiento.ejercicios) {
            // Aquí se compara el ejercicio actual del entrenamiento con el ejercicioId que estamos buscando
       //     console.log(`Buscando coincidencia de ejercicioId: ${ejercicioRealizado.ejercicioId} === ${ejercicioId}`);

            // Si el ID del ejercicio coincide con el que estamos buscando
            if (ejercicioRealizado.ejercicioId === ejercicioId) {
              // Buscar la serie con peso registrado
              const serieConPeso = ejercicioRealizado.series.find(serie => serie.peso !== undefined && serie.peso !== null);

              if (serieConPeso) {
                console.log(`Peso encontrado para el ejercicio ${ejercicioId}: ${serieConPeso.peso}`);
                return serieConPeso.peso; // Devolver el último peso encontrado
              }
            }
          }
        }
      }

      // Si no se encontró ningún peso anterior, devolvemos null
      console.log(`No se encontró peso para el ejercicio ${ejercicioId}`);
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


}

/* Ejemplo de Uso: Al Modificar un Peso en una Serie
 
Si deseas actualizar el peso anterior en sesiones posteriores cuando cambias el peso de una serie en una sesión específica, puedes llamar al método actualizarPesosPosteriores desde el lugar donde se hace la modificación.

typescript
Copiar código
// Ejemplo de actualización en un componente
async modificarPesoSerie(ejercicio: EjercicioRealizado, nuevoPeso: number, usuarioId: string) {
// Modificar el peso actual de la serie
ejercicio.series[0].peso = nuevoPeso;

// Guardar el ejercicio con el peso actualizado
await this.historialService.guardarEjercicio(ejercicio);

// Llamar a actualizarPesosPosteriores para que el `pesoAnterior` en sesiones futuras refleje el nuevo peso
await this.historialService.actualizarPesosPosteriores(ejercicio.ejercicioId, usuarioId, nuevoPeso);
}
*/





