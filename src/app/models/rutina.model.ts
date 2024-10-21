// Modelo de Rutina
export interface Rutina {
  _id?: string;                // Identificador único de la rutina
  entidad: 'rutina';           // tipo de entidad
  usuarioId: string;           // ID del usuario al que pertenece la rutina
  nombre: string;              // Nombre de la rutina
  dias: DiaRutina[];           // Arreglo de días que contiene ejercicios
}

export interface DiaRutina {
  diaNombre: string;                // Día de la semana (ej. "Lunes", "Martes", etc.)
  ejercicios: EjercicioPlan[];      // Arreglo de ejercicios y sus detalles para el día
  descripcion: string;              // Descripción opcional para el día (detalles adicionales)
}

export interface EjercicioPlan {
  ejercicioId: string;        // ID del ejercicio en la rutina
  series: number;             // Número de series planificadas para el ejercicio
  repeticiones: number;       // Número de repeticiones planificadas para el ejercicio
  notas?: string;             // Notas adicionales sobre el ejercicio (opcional)
}
