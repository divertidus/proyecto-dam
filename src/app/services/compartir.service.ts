import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { EjercicioService } from './database/ejercicio.service';
import { Rutina } from '../models/rutina.model';

@Injectable({
  providedIn: 'root'
})
export class CompartirService {
  constructor(private ejercicioService: EjercicioService) { }

  async compartirRutina(rutina: Rutina): Promise<void> {
    try {
      if (!rutina) {
        console.error('No se seleccionó ninguna rutina para compartir.');
        return;
      }

      // Procesar la rutina para incluir los detalles completos de los ejercicios
      const rutinaProcesada = {
        ...rutina,
        usuarioId: undefined,
        _rev: undefined,
        dias: await Promise.all(rutina.dias.map(async (dia) => {
          return {
            ...dia,
            ejercicios: await Promise.all(dia.ejercicios.map(async (ejercicioPlan) => {
              const ejercicioCompleto = await this.ejercicioService.obtenerEjercicioPorId(ejercicioPlan.ejercicioId);
              return {
                ...ejercicioPlan,
                ejercicioCompleto,
              };
            })),
          };
        })),
      };

      // Convertir la rutina a JSON
      const rutinaJSON = JSON.stringify(rutinaProcesada, null, 2);
      const nombreArchivo = `Rutina_${rutina.nombre.replace(/\s+/g, '_')}_${rutina._id.substring(0, 6)}.json`;

      // Guardar el archivo en el dispositivo
      const result = await Filesystem.writeFile({
        path: nombreArchivo,
        data: rutinaJSON,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      console.log('Archivo guardado:', result);

      // Compartir el archivo
      await Share.share({
        title: 'Compartir Rutina',
        text: `Aquí tienes una rutina de ejercicios: ${rutina.nombre}`,
        url: result.uri, // URI del archivo guardado
        dialogTitle: 'Compartir Rutina',
      });

      console.log('Rutina compartida correctamente.');
    } catch (error) {
      console.error('Error al compartir la rutina:', error);
    }
  }
}
