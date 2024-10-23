import { Usuario } from "../models/usuario.model";


export interface AuthProvider {
    login(credentials?: any): Promise<Usuario>; // Ahora las credenciales son opcionales
    logout(): Promise<void>;
    getUsuarioLogeado(): Usuario | null;
}