export interface Ejercicio {
    id: string;                 // Identificador único del ejercicio
    nombre: string;             // Nombre del ejercicio
    descripcion?: string;       // Descripción del ejercicio (opcional)
    tipo: 'barra' | 'mancuerna' | 'máquina' | 'peso corporal'; // Tipo de ejercicio
    cantidadSeries: number;     // Número de series realizadas
    repeticiones: number;       // Número de repeticiones por serie
    imagen?: string;            // URL de la imagen que representa el ejercicio (opcional)
}