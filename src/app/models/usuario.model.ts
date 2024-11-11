// models/usuarios.model.ts
export interface Usuario {
    _id?: string;
    entidad: 'usuario';
    nombre: string;
    email?: string;
    rutinas?: string[];
    imagenPerfil?: string;
    timestamp: string;
}