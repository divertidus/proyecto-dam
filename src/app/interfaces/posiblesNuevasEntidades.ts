// Modelo de Usuario
export interface Usuario {
    _id?: string;                // Identificador único del usuario
    entidad: 'usuario';          // Tipo de entidad para distinguir en la base de datos
    nombre: string;              // Nombre del usuario
    email?: string;              // Correo electrónico del usuario
    rutinas?: string[];          // IDs de las rutinas asociadas al usuario
    imagenPerfil?: string;       // URL de la imagen de perfil del usuario (opcional)
    timestamp: string;           // Fecha de creación del usuario
  }
  
  // Modelo de Ejercicio
  export interface Ejercicio {
    _id?: string;               // Identificador único del ejercicio
    entidad: 'ejercicio';       // Tipo de entidad para distinguir en la base de datos
    nombre: string;             // Nombre del ejercicio (p. ej., "Press de Banca")
    descripcion?: string;       // Descripción breve del ejercicio, p. ej., cómo realizarlo correctamente
    tipoPeso?: 'barra' | 'mancuernas' | 'máquina' | 'peso corporal'; // Tipo de ejercicio
    musculoPrincipal: string;   // Grupo muscular principal trabajado
    imagen?: string;            // Imagen del ejercicio (opcional, para futuras versiones)
  }
  
  // Modelo de Rutina
  export interface Rutina {
    _id?: string;                // Identificador único de la rutina
    entidad: 'rutina';           // Tipo de entidad para distinguir en la base de datos
    usuarioId: string;           // ID del usuario al que pertenece la rutina
    nombre: string;              // Nombre de la rutina (p. ej., "Rutina de Fuerza 5 Días")
    dias: DiaRutina[];           // Lista de días en la rutina (sin fechas ni pesos específicos)
    timestamp: string;           // Fecha de creación de la rutina
  }
  
  // Modelo de Día de Rutina (Plantilla)
  export interface DiaRutina {
    diaNombre: string;                // Nombre del día (ej. "Día 1: Espalda y Bíceps")
    descripcion?: string;             // Descripción opcional para el día, p. ej., objetivos o comentarios generales
    ejercicios: EjercicioPlan[];      // Lista de ejercicios a realizar ese día (sin pesos específicos)
  }
  
  // Modelo de EjercicioPlan (Plantilla)
  export interface EjercicioPlan {
    ejercicioId: string;              // ID del ejercicio en la rutina
    nombreEjercicio?: string;         // Nombre del ejercicio (para facilitar acceso directo)
    tipoPeso?: 'barra' | 'mancuernas' | 'máquina' | 'peso corporal';
    series: Serie[];                  // Lista de series para el ejercicio (sin peso específico)
  }
  
  // Modelo de Serie (Plantilla)
  export interface Serie {
    numeroSerie: number;              // Número de la serie (para identificar si es la primera, segunda, etc.)
    repeticiones: number;             // Número de repeticiones para la serie
  }
  
  // Modelo de Historial de Entrenamientos
  export interface HistorialEntrenamiento {
    _id?: string;                     // Identificador único del historial de entrenamiento
    entidad: 'historialEntrenamiento';// Tipo de entidad para distinguir en la base de datos
    usuarioId: string;                // ID del usuario al que pertenece el historial
    entrenamientos: DiaEntrenamiento[]; // Lista de días de entrenamiento realizados
  }
  
  // Modelo de Día de Entrenamiento (Registro Real)
  export interface DiaEntrenamiento {
    fechaEntrenamiento: string;       // Fecha en la que se realizó el día de entrenamiento
    diaRutinaId: string;              // Referencia al día de la rutina (e.g., "Día 1: Espalda y Bíceps")
    ejercicios: EjercicioRealizado[]; // Lista de ejercicios realizados con pesos y detalles específicos
  }
  
  // Modelo de EjercicioRealizado (Registro Real)
  export interface EjercicioRealizado {
    ejercicioId: string;              // ID del ejercicio realizado
    series: SerieReal[];              // Lista de series realizadas con pesos específicos
  }
  
  // Modelo de SerieReal (Registro Real)
  export interface SerieReal {
    numeroSerie: number;              // Número de la serie (para identificar si es la primera, segunda, etc.)
    repeticiones: number;             // Número de repeticiones
    peso?: number;                    // Peso utilizado en la serie (opcional, ya que puede ser peso corporal)
    alFallo?: boolean;                // Indica si la serie se llevó al fallo (opcional)
    conAyuda?: boolean;               // Indica si se recibió ayuda durante la serie (opcional)
    dolor?: boolean;                  // Indica si hubo dolor durante la serie (opcional)
    notas?: string;                   // Notas adicionales, como "con ayuda", "hasta el fallo" (opcional)
  }
  