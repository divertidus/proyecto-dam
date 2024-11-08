// Modelo de Rutina
export interface Rutina {
  _id?: string;
  _rev?: string             // Identificador único de la rutina
  entidad: 'rutina';           // Tipo de entidad para distinguir en la base de datos
  usuarioId: string;           // ID del usuario al que pertenece la rutina
  nombre: string;              // Nombre de la rutina (p. ej., "Rutina de Fuerza 5 Días")
  dias: DiaRutina[];           // Lista de días en la rutina (sin fechas ni pesos específicos)
  timestamp: string; 
  descripcion?: string;          // Fecha de creación de la rutina
}

// Modelo de Día de Rutina (Plantilla)
export interface DiaRutina {
  _id?: string;
  diaNombre: string;                // Nombre del día (ej. "Día 1: Espalda y Bíceps")
  descripcion: string;             // Descripción opcional para el día, p. ej., objetivos o comentarios generales
  ejercicios: EjercicioPlan[];      // Lista de ejercicios a realizar ese día (sin pesos específicos)
}

// Modelo de EjercicioPlan (Plantilla)
export interface EjercicioPlan {
  _id?: string; 
  ejercicioId: string;              // ID del ejercicio en la rutina
  nombreEjercicio: string;         // Nombre del ejercicio (para facilitar acceso directo)
  tipoPeso?: 'Barra' | 'Mancuernas' | 'Máquina' | 'Peso Corporal';
  series: number;
  repeticiones: number;
  notas?: string               // Lista de series para el ejercicio (sin peso específico)
}
