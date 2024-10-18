// models/usuarios.model.ts

export interface Usuario {
    id: string;                  // Identificador único del usuario
    nombre: string;             // Nombre del usuario
    email: string;              // Correo electrónico del usuario
    rutinas: string[];          // IDs de las rutinas asociadas al usuario
    imagenPerfil?: string;      // URL de la imagen de perfil del usuario (opcional)
}