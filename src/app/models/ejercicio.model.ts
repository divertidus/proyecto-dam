export interface Ejercicio {
    _id?: string;     // Identificador único del ejercicio  generado por pouchDB
    entidad: 'ejercicio';  // Tipo de entidad
    musculo: string;
    nombre: string;        // Nombre del ejercicio
    descripcion?: string;  // Descripción del ejercicio (opcional)
    equipamiento: 'barra' | 'mancuerna' | 'máquina' | 'peso corporal';  // Tipo de equipamiento utilizado
    imagen?: string;  // URL de la imagen que representa el ejercicio (opcional)
}