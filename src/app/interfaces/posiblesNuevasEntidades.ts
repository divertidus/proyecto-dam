// Modelo de Usuario
export interface Usuario {
    _id?: string;           // Identificador único del usuario
    entidad: 'usuario';     // Tipo de entidad para distinguir en la base de datos
    nombre: string;         // Nombre del usuario
    email?: string;         // Email del usuario (opcional, para futuras ampliaciones)
    imagenPerfil?: string;  // URL de la imagen de perfil del usuario (opcional)
    rutinas?: string[];     // IDs de las rutinas asociadas al usuario (opcional)
    timestamp: string;  // Fecha de creación del usuario (requerido)
}

export interface Ejercicio {
    _id?: string;               // Identificador único del ejercicio
    entidad: 'ejercicio';       // Tipo de entidad para distinguir en la base de datos
    nombre: string;             // Nombre del ejercicio (p. ej., "Press de Banca")
    descripcion?: string;       // Descripción breve del ejercicio, p. ej., cómo realizarlo correctamente
    tipo?: 'barra' | 'mancuernas' | 'máquina' | 'peso corporal'; // Tipo de ejercicio
    musculoPrincipal: string;   // Grupo muscular principal trabajado
    imagen?: string;            // Imagen del ejercicio (opcional, para futuras versiones)
}

// Modelo de Rutina
export interface Rutina {
    _id?: string;                // Identificador único de la rutina
    entidad: 'rutina';           // Tipo de entidad para distinguir en la base de datos
    usuarioId: string;           // ID del usuario al que pertenece la rutina
    nombre: string;              // Nombre de la rutina (p. ej., "Rutina de Fuerza 5 Días")
    dias: DiaRutina[];           // Lista de días en la rutina
    timestamp: string;           // Fecha de creación de la rutina (requerido)
}

// Modelo de Día de Rutina
export interface DiaRutina {
    diaNombre: string;                // Nombre del día (ej. "Día 1: Espalda")
    descripcion?: string;             // Descripción opcional para el día, p. ej., objetivos o comentarios generales
    ejercicios: EjercicioPlan[];      // Lista de ejercicios a realizar ese día
    fechaEntrenamiento?: string;      // Fecha en la que se realizó el día de entrenamiento (opcional)
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
    numeroSerie: number;        // Número de la serie (para identificar si es la primera, segunda, etc.)
    repeticiones: number;       // Número de repeticiones
    peso?: number;              // Peso utilizado (opcional, ya que puede ser peso corporal)
    tipoPeso?: 'barra' | 'mancuernas' | 'máquina' | 'peso corporal'; // Tipo de peso (opcional)
    alFallo?: boolean;          // Indica si la serie se llevó al fallo (opcional)
    conAyuda?: boolean;         // Indica si se recibió ayuda durante la serie (opcional)
    dolor?: boolean;            // Indica si hubo dolor durante la serie (opcional)
    notas?: string;             // Notas adicionales, como "con ayuda", "hasta el fallo" (opcional)
}

// Relaciones entre entidades:
// 1. Un `Usuario` puede tener varias `Rutinas` asociadas a él,
//  referenciadas por los IDs de las rutinas en el campo `rutinas` del modelo `Usuario`.
// 2. Una `Rutina` pertenece a un `Usuario` a través del campo `usuarioId`.
// 3. Una `Rutina` tiene varios `DiaRutina` que describen cada día de la rutina,
//  con una lista de ejercicios a realizar en cada día.
// 4. Cada `DiaRutina` contiene una lista de `EjercicioPlan` que indica los ejercicios a realizar ese día,
//  con detalles específicos como series y repeticiones.
// 5. Cada `EjercicioPlan` hace referencia a un `Ejercicio` por medio de su `ejercicioId` y
//   detalla las `Series` que se deben realizar.


/*Relaciones:

El Usuario tiene una relación uno a muchos con Rutina (un usuario puede tener múltiples rutinas).
Rutina tiene una relación uno a muchos con DiaRutina (una rutina tiene varios días).
DiaRutina tiene una relación uno a muchos con EjercicioPlan (un día tiene varios ejercicios).
EjercicioPlan tiene una relación uno a muchos con Serie (un ejercicio tiene varias series).
*/ 