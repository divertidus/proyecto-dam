//historial-entreno.ts

// Modelo de Historial de Entrenamientos
export interface HistorialEntrenamiento {
  _id?: string;
  entidad: 'historialEntrenamiento';
  usuarioId: string;
  entrenamientos: DiaEntrenamiento[];
}

// Modelo de Día de Entrenamiento (Registro Real)
export interface DiaEntrenamiento {
  fechaEntrenamiento: string;
  diaRutinaId: string;
  ejercicios: EjercicioRealizado[];
  notas?: string;
}

// Modelo de EjercicioRealizado (Registro Real)
export interface EjercicioRealizado {
  ejercicioId: string;
  series: SerieReal[];
  notas?: string;
}

// Modelo de SerieReal (Registro Real)
export interface SerieReal {
  numeroSerie: number;
  repeticiones: number;
  peso?: number;
  alFallo?: boolean;
  conAyuda?: boolean;
  dolor?: boolean;
  notas?: string;
}