// Modelo de Registro de Actividad
export interface registroActividad {
    _id?: string;                   // Identificador único del registro
    entidad: 'registroActividad';   // tipo de entidad
    usuarioId: string;              // ID del usuario al que pertenece el registro
    rutinaId: string;               // ID de la rutina realizada
    fecha: string;                  // Fecha de la sesión de entrenamiento
    detalles: DetalleSerie[];       // Detalles de las series realizadas en la sesión
}

export interface DetalleSerie {
    ejercicioId: string;        // ID del ejercicio realizado
    series: number;             // Número total de series realizadas
    repeticiones: number[];     // Array con las repeticiones por serie
    peso: number[];             // Array con los pesos utilizados en cada serie
    notas?: string;             // Notas adicionales sobre el ejercicio (opcional)
}