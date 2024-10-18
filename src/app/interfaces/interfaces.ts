// Definir la interfaz UserDocument para describir la estructura de los documentos de usuario
export interface UserDocument {
    _id?: string;           // Identificador único del documento (opcional)
    _rev?: string;          // Versión del documento (opcional)
    nombre: string;           // Nombre del usuario (requerido)
    email: string;          // Correo electrónico del usuario (requerido)
    timestamp: string;      // Marca de tiempo de cuándo se creó el documento (requerido)
}

