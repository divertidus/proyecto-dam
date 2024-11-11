/* rutina.model.ts */

// Modelo de Rutina
export interface Rutina {
  _id?: string;
  _rev?: string             
  entidad: 'rutina';           
  usuarioId: string;           
  nombre: string;              
  dias: DiaRutina[];           
  timestamp: string; 
  descripcion?: string;          
}

// Modelo de Día de Rutina (Plantilla)
export interface DiaRutina {
  _id?: string;
  diaNombre: string;              
  descripcion: string;             
  ejercicios: EjercicioPlan[];      
}

// Modelo de EjercicioPlan (Plantilla)
export interface EjercicioPlan {
  _id?: string; 
  ejercicioId: string;             
  nombreEjercicio: string;         
  tipoPeso?: 'Barra' | 'Mancuernas' |
   'Máquina' | 'Peso Corporal';
  series: number;
  repeticiones: number;
  notas?: string              
}
