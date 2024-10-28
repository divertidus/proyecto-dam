// Modelo de Rutina
export interface Rutina {
  _id?: string;
  _rev?: string             // Identificador único de la rutina
  entidad: 'rutina';           // Tipo de entidad para distinguir en la base de datos
  usuarioId: string;           // ID del usuario al que pertenece la rutina
  nombre: string;              // Nombre de la rutina (p. ej., "Rutina de Fuerza 5 Días")
  sesionesPlanificadas: SesionPlanificada[];           // Lista de días en la rutina (sin fechas ni pesos específicos)
  timestamp: string;
  descripcion?: string;          // Fecha de creación de la rutina
}

// Modelo de Día de Rutina (Plantilla)
export interface SesionPlanificada {
  _id?: string;
  nombreSesion: string;              // Ej. "Día 1: Espalda y Bíceps"
  descripcion?: string;             // Descripción opcional para el día, p. ej., objetivos o comentarios generales
  ejerciciosPlanificados: EjercicioPlanificado[]; // Ejercicios para este día
}

// Modelo de EjercicioPlan (Plantilla)
export interface EjercicioPlanificado {
  _id?: string;
  idEjercicioOriginal: string;  // Referencia al ID del ejercicio original            // ID del ejercicio en la rutina
  nombreEjercicio?: string;         // Nombre del ejercicio (para facilitar acceso directo)
  tipoPeso?: 'barra' | 'mancuernas' | 'máquina' | 'peso corporal';
  seriesPlanificadas: SeriePlanificada[]; // Lista de series (sin peso específico)
  notas?: string               // Lista de series para el ejercicio (sin peso específico)
}

// Modelo de Serie (Plantilla)
export interface SeriePlanificada {
  _id?: string;
  numeroSerie: number;              // Número de la serie (para identificar si es la primera, segunda, etc.)
  repeticiones: number;             // Número de repeticiones para la serie
}