// Modelo de Rutina
export interface Rutina {
  _id?: string;                // Identificador único de la rutina
  _rev?: string;
  entidad: 'rutina';           // Tipo de entidad para distinguir en la base de datos
  usuarioId: string;           // ID del usuario al que pertenece la rutina
  nombre: string;              // Nombre de la rutina (p. ej., "Rutina de Fuerza 5 Días")
  dias: DiaRutina[];           // Lista de días en la rutina
  timestamp: string;           // Fecha de creación de la rutina (requerido)
}

// Modelo de Día de Rutina
export interface DiaRutina {
  diaNombre: string;                // Nombre del día (ej. "Día 1: Espalda")
  descripcion?: string;             // Descripción opcional para el día, p. ej., objetivos o comentarios generales
  ejercicios: EjercicioPlan[];      // Lista de ejercicios a realizar ese día
  fechaEntrenamiento?: string;      // Fecha en la que se realizó el día de entrenamiento (opcional)
}

// Modelo de EjercicioPlan
export interface EjercicioPlan {
  ejercicioId: string;        // ID del ejercicio en la rutina
  nombreEjercicio?: string;   // Nombre del ejercicio (para facilitar acceso directo)
  tipoPeso?: string;
  series: Serie[];            // Lista de series para el ejercicio
  notas?: string;             // Notas adicionales sobre el ejercicio (opcional, p. ej., "con ayuda", "doler muñeca")
}

// Modelo de Serie
export interface Serie {
  numeroSerie: number;        // Número de la serie (para identificar si es la primera, segunda, etc.)
  repeticiones: number;       // Número de repeticiones
  peso?: number;              // Peso utilizado (opcional, ya que puede ser peso corporal)
  tipoPeso?: 'barra' | 'mancuernas' | 'máquina' | 'peso corporal'; // Tipo de peso (opcional)
  alFallo?: boolean;          // Indica si la serie se llevó al fallo (opcional)
  conAyuda?: boolean;         // Indica si se recibió ayuda durante la serie (opcional)
  dolor?: boolean;            // Indica si hubo dolor durante la serie (opcional)
  notas?: string;             // Notas adicionales, como "con ayuda", "hasta el fallo" (opcional)
}
