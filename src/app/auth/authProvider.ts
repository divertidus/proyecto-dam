import { UserDocument } from "../interfaces/interfaces";

export interface AuthProvider {
    login(credentials?: any): Promise<UserDocument>; // Ahora las credenciales son opcionales
    logout(): Promise<void>;
    getUsuarioLogeado(): UserDocument | null;
}