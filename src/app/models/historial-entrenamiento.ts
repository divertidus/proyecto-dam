//historial-entreno.ts

// Modelo de Historial de Entrenamientos
export interface HistorialEntrenamiento {
  _id?: string;
  entidad: 'historialEntrenamiento';
  usuarioId: string;
  sesionesRealizadas: SesionEntrenamiento[];  // Colección de todas las sesiones realizadas
}

// Modelo de Día de Entrenamiento (Registro Real)
export interface SesionEntrenamiento {
  _id?: string;
  fechaSesion: string;              // Fecha en que se realizó la sesión
  sesionPlanificadaId: string;      // ID de la sesión planificada (de la rutina)
  ejerciciosSesion: EjercicioSesion[]; // Lista de ejercicios realizados
  notas?: string;                   // Notas sobre la sesión completa
}

// Modelo de EjercicioSesion (Ejercicio Realizado dentro de una Sesión)
export interface EjercicioSesion {
  _id?: string;
  idEjercicioPlanificado: string;               // Referencia al ejercicio original
  seriesSesion: SerieSesion[];      // Series realizadas en esta sesión
  notas?: string;                   // Notas específicas del ejercicio
  idEjercicioSesionAnterior?: string; // ID del ejercicio en la sesión anterior
}

// Modelo de SerieSesion (Detalles de una Serie Realizada)
export interface SerieSesion {
  _id?: string;
  numeroSerie: number;
  repeticiones?: number;
  repeticionesAnterior?: number;
  peso?: number;
  pesoAnterior?: number;
  alFallo?: boolean;
  conAyuda?: boolean;
  dolor?: boolean;
  notas?: string;
}