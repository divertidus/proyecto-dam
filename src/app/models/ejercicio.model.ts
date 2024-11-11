/* ejercicio.model.ts */
export interface Ejercicio {
    _id?: string;               
    entidad: 'ejercicio';       
    nombre: string;             
    descripcion?: string;       
    tipoPeso: 'Barra' | 'Mancuernas' |
     'Máquina' | 'Peso Corporal'; 
    musculoPrincipal: string;  
    imagen?: string;            
    ejercicioPersonalizado:boolean
}