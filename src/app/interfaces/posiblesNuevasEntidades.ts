// Modelo de Usuario
export interface Usuario {
    _id?: string;           // Identificador único del usuario
    nombre: string;         // Nombre del usuario
    email?: string;         // Email del usuario (opcional, para futuras ampliaciones)
}

// Modelo de Rutina
export interface Rutina {
    _id?: string;                // Identificador único de la rutina
    usuarioId: string;           // ID del usuario al que pertenece la rutina
    nombre: string;              // Nombre de la rutina (p. ej., "Rutina de Fuerza 5 Días")
    dias: DiaRutina[];           // Lista de días en la rutina
}

// Modelo de Día de Rutina
export interface DiaRutina {
    diaNombre: string;                // Nombre del día (ej. "Día 1: Espalda")
    descripcion?: string;             // Descripción opcional para el día, p. ej., objetivos o comentarios generales
    ejercicios: EjercicioPlan[];      // Lista de ejercicios a realizar ese día
}

// Modelo de EjercicioPlan
export interface EjercicioPlan {
    ejercicioId: string;        // ID del ejercicio en la rutina
    nombreEjercicio?: string;   // Nombre del ejercicio (para facilitar acceso directo)
    series: Serie[];            // Lista de series para el ejercicio
    notas?: string;             // Notas adicionales sobre el ejercicio (opcional, p. ej., "con ayuda", "doler muñeca")
}

// Modelo de Serie
export interface Serie {
    repeticiones: number;       // Número de repeticiones
    peso?: number;              // Peso utilizado (opcional, ya que puede ser peso corporal)
    tipoPeso?: 'barra' | 'mancuernas' | 'máquina' | 'peso corporal'; // Tipo de peso (opcional)
    alFallo?: boolean;          // Indica si la serie se llevó al fallo (opcional)
    conAyuda?: boolean;         // Indica si se recibió ayuda durante la serie (opcional)
    dolor?: boolean;            // Indica si hubo dolor durante la serie (opcional)
    notas?: string;             // Notas adicionales, como "con ayuda", "hasta el fallo" (opcional)
}

// Modelo de Ejercicio
export interface Ejercicio {
    _id?: string;               // Identificador único del ejercicio
    nombre: string;             // Nombre del ejercicio (p. ej., "Press de Banca")
    descripcion?: string;       // Descripción breve del ejercicio, p. ej., cómo realizarlo correctamente
    tipo?: 'barra' | 'mancuernas' | 'máquina' | 'peso corporal'; // Tipo de ejercicio
    musculoPrincipal: string;   // Grupo muscular principal trabajado
    imagen?: string;            // Imagen del ejercicio (opcional, para futuras versiones)
}

// Justificación de los cambios:
// 1. Se simplificaron los modelos para enfocarse en los aspectos más esenciales y facilitar la flexibilidad en las rutinas y ejercicios.
// 2. El modelo `Serie` se creó para capturar información detallada sobre cada serie de un ejercicio, permitiendo registrar variabilidad en peso y repeticiones.
// 3. `EjercicioPlan` incluye una lista de `Series` para detallar cada ejecución del ejercicio durante una sesión, mejorando la precisión del registro.
// 4. Se añadió `nombreEjercicio` en `EjercicioPlan` como campo opcional para facilitar el acceso directo, aunque la referencia principal sigue siendo `ejercicioId`.
// 5. `Serie` se actualizó para incluir `alFallo`, `conAyuda`, y `dolor` como campos opcionales, permitiendo registrar más detalles sobre la ejecución de cada serie y mejorando la capacidad de seguimiento del rendimiento y las dificultades.
// 6. `Rutina` y `DiaRutina` fueron diseñados para ofrecer flexibilidad en la planificación y registro de rutinas, alineándose con los ejemplos dados previamente.