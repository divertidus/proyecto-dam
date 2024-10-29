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
  _id?: string;
  fechaEntrenamiento: string;
  diaRutinaId: string;
  descripcion: string;
  ejerciciosRealizados: EjercicioRealizado[];
  notas?: string;
}

// Modelo de EjercicioRealizado (Registro Real)
export interface EjercicioRealizado {
  _id?: string;
  ejercicioPlanId: string;
  nombreEjercicioRealizado: string;
  series: SerieReal[];
  notas?: string;
  anteriorVezEjercicioID?: string
}

// Modelo de SerieReal (Registro Real)
export interface SerieReal {
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