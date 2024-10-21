export interface Rutina {
    id: string;     // Identificador único de la rutina
    entidad:'rutina';           // tipo de entidad
    nombre: string;             // Nombre de la rutina
    dias: DiaRutina[];          // Arreglo de días que contiene ejercicios
  }
  
  export interface DiaRutina {
    dia: string;                // Día de la semana (ej. "Lunes", "Martes", etc.)
    ejercicios: string[];       // IDs de los ejercicios en ese día
  }