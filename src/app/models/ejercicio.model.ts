export interface Ejercicio {
    _id?: string;               // Identificador único del ejercicio
    entidad: 'ejercicio';       // Tipo de entidad para distinguir en la base de datos
    nombre: string;             // Nombre del ejercicio (p. ej., "Press de Banca")
    descripcion?: string;       // Descripción breve del ejercicio, p. ej., cómo realizarlo correctamente
    tipoPeso: 'Barra' | 'Mancuernas' | 'Máquina' | 'Peso Corporal'; // Tipo de ejercicio
    musculoPrincipal: string;   // Grupo muscular principal trabajado
    imagen?: string;            // Imagen del ejercicio (opcional, para futuras versiones)
    ejercicioPersonalizado:boolean
}