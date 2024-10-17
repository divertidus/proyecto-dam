// auth.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserDocument } from '../interfaces/interfaces';
import { AuthProvider } from './authProvider';
import { ElegirUserAuthProvider } from './elegir-user.provider';
import { EmailPasswordAuthProvider } from './email-password.provider';
import { GoogleAuthProvider } from './google-auth.provider';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInUserSubject = new BehaviorSubject<UserDocument | null>(null); // Estado del usuario logueado
  loggedInUser$ = this.loggedInUserSubject.asObservable(); // Observable para suscribirse a cambios

  private authProvider: AuthProvider; // Proveedor de autenticación

  constructor() {
    this.authProvider = new ElegirUserAuthProvider(); // Inicializa con el proveedor por defecto
    // this.authProvider = new EmailPasswordAuthProvider(); // para iniciar sesion con email y contraseña si lo pongo
    // this.authProvider = new GoogleAuthProvider(); // par ainiciar sesion con google si lo pongo
  }

  // Cambia el proveedor de autenticación
  setAuthProvider(provider: AuthProvider): void {
    this.authProvider = provider; // Actualiza el proveedor de autenticación
  }


  // Método para seleccionar un usuario de la base de datos
  selectUser(user: UserDocument): void {
    const userSelectionProvider = this.authProvider as ElegirUserAuthProvider; // Asegúrate de que el proveedor es del tipo correcto
    userSelectionProvider.selectUser(user); // Selecciona el usuario
    this.loggedInUserSubject.next(user); // Actualiza el estado del usuario logueado
  }

  // Método para iniciar sesión
  async login(credentials: any): Promise<void> {
    const user = await this.authProvider.login(credentials); // Llama al método login del proveedor
    this.loggedInUserSubject.next(user); // Actualiza el estado del usuario logueado
    console.log(`Usuario logueado: ${user.name}`); // Muestra en consola el usuario logueado
  }

  // Método para iniciar sesión directamente con el usuario seleccionado
  async loginWithSelectedUser(): Promise<void> {
    try {
      const user = await this.authProvider.login(); // Llama al método login del proveedor
      this.loggedInUserSubject.next(user); // Actualiza el estado del usuario logueado
      console.log(`Usuario logueado: ${user.name}`); // Muestra en consola el usuario logueado
    } catch (error) {
      console.error(error.message); // Manejo de errores
    }
  }

  // Método para cerrar sesión
  async logout(): Promise<void> {
    await this.authProvider.logout(); // Llama al método logout del proveedor
    this.loggedInUserSubject.next(null); // Limpia el estado del usuario logueado
    console.log('Usuario deslogueado'); // Muestra en consola que el usuario ha cerrado sesión
  }

  // Obtiene el usuario logueado
  getLoggedInUser(): UserDocument | null {
    return this.loggedInUserSubject.value; // Retorna el usuario logueado actual
  }
}