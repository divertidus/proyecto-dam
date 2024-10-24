// auth.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthProvider } from './authProvider';
import { ProveedorSeleccionUsuario } from './elegir-user.provider';
import { EmailPasswordAuthProvider } from './email-password.provider';
import { GoogleAuthProvider } from './google-auth.provider';
import { Usuario } from '../models/usuario.model';
import { UsuarioService } from '../services/database/usuario.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // 1. Variable que representa el estado del usuario logueado, utilizando un BehaviorSubject.
  // BehaviorSubject permite tener un valor por defecto y notificar cambios a cualquier componente que se suscriba a él.
  private estadoUsuarioLogeado = new BehaviorSubject<Usuario | null>(null); // Estado del usuario logueado
  // 2. Observable que expone el estado del usuario logueado. Cualquier componente puede suscribirse a este observable para recibir notificaciones de cambios.
  usuarioLogeado$ = this.estadoUsuarioLogeado.asObservable(); // Observable para suscribirse a cambios

  private authProvider: AuthProvider; // Proveedor de autenticación

  constructor(private usuarioService: UsuarioService) {
    this.authProvider = new ProveedorSeleccionUsuario(); // Inicializa con el proveedor por defecto
    // this.authProvider = new EmailPasswordAuthProvider(); // para iniciar sesion con email y contraseña si lo pongo
    // this.authProvider = new GoogleAuthProvider(); // par ainiciar sesion con google si lo pongo
  }

  // Cambia el proveedor de autenticación
  setAuthProvider(proveedorAutenticacion: AuthProvider): void {
    this.authProvider = proveedorAutenticacion; // Actualiza el proveedor de autenticación
  }


  // Método para seleccionar un usuario de la base de datos
  // 3. Método para seleccionar un usuario. 
  // Este método actualiza el valor de 'estadoUsuarioLogeado', lo cual notifica a todos los componentes suscritos.
  elegirUsuario(usuario: Usuario): void {
    const proveedorSeleccionUsuario = this.authProvider as ProveedorSeleccionUsuario; // Asegúrate de que el proveedor es del tipo correcto
    proveedorSeleccionUsuario.elegirUsuario(usuario); // Selecciona el usuario
    this.estadoUsuarioLogeado.next(usuario); // Actualiza el estado del usuario logueado
  }

  // Método para iniciar sesión
  // 4. Método para iniciar sesión. Una vez se inicia sesión, se actualiza 'estadoUsuarioLogeado', notificando a los suscriptores.
  async login(credentials: any): Promise<void> {
    const usuario = await this.authProvider.login(credentials); // Llama al método login del proveedor
    this.estadoUsuarioLogeado.next(usuario); // Actualiza el estado del usuario logueado
    console.log(`AUTH.SERVICE -> Usuario logueado: ${usuario.nombre}`); // Muestra en consola el usuario logueado
  }

  // Método para iniciar sesión directamente con el usuario seleccionado
  async loginConUsuarioSeleccionado(): Promise<void> {
    try {
      const usuario = await this.authProvider.login(); // Llama al método login del proveedor
      this.estadoUsuarioLogeado.next(usuario); // Actualiza el estado del usuario logueado
      console.log(`AUTH.SERVICE -> Usuario logueado: ${usuario.nombre}`); // Muestra en consola el usuario logueado
    } catch (error) {
      console.error(error.message); // Manejo de errores
    }
  }

  // Método para cerrar sesión
  async logout(): Promise<void> {
    await this.authProvider.logout(); // Llama al método logout del proveedor
    this.estadoUsuarioLogeado.next(null); // Limpia el estado del usuario logueado
    console.log('AUTH.SERVICE -> Usuario deslogueado'); // Muestra en consola que el usuario ha cerrado sesión
  }

  // Obtiene el usuario logueado
  // 5. Método para obtener el usuario logueado actual.
  getUsuarioLogeado(): Usuario | null {
    return this.estadoUsuarioLogeado.value; // Retorna el usuario logueado actual
  }

  // Método para iniciar sesión automáticamente con el primer usuario
  async autoLoginPrimerUsuario() {
    try {
      // Obtén todos los usuarios de la base de datos
      console.log('AUTH.SERVICE -> Intentando autologin')
      const usuarios: Usuario[] = await this.usuarioService.obtenerUsuarios();

      if (usuarios.length > 0) {
        // Si hay al menos un usuario, selecciona el primero y haz login
        console.log('AUTH.SERVICE -> Sesion automatica en proceso')
        const primerUsuario = usuarios[0];
        this.loginAuto(primerUsuario);

      } else {
        console.log('AUTH.SERVICE -> No hay usuarios creados para sesion automatica')
      }
    } catch (error) {
      console.error('AUTH.SERVICE -> Error al hacer login automático:', error);
    }
  }

  // Método simulado para hacer login con un usuario específico
  loginAuto(usuario: Usuario) {
    console.log('AUTH.SERVICE -> Usuario logeado automáticamente:', usuario.nombre);
    this.estadoUsuarioLogeado.next(usuario); // Actualiza el estado del usuario logueado
    console.log(`AUTH.SERVICE -> Usuario logueado automaticamente: ${usuario.nombre}`); // Muestra en consola el usuario logueado
  } catch(error) {
    console.error(error.message); // Manejo de errores
  }
  // Aquí guardarías la información del usuario logueado en algún lugar (local storage o variable de estado)
  // Ejemplo: this.usuarioActual = usuario;





}







/* EXPLICACION DEL NEXT DEL BEHAVIOR

La función next() en un BehaviorSubject es crucial para actualizar el valor 
almacenado y notificar a todos los suscriptores de los cambios.

¿Por qué se usa next()?
Actualización del valor: El BehaviorSubject siempre mantiene un valor actual,
 y para cambiar ese valor (como cuando el usuario se loguea o desloguea), debes usar next().
  Este método toma un nuevo valor y lo asigna como el valor actual del BehaviorSubject.

Notificación a los suscriptores: Cada vez que llamas a next(),
 todos los componentes o servicios que estén "escuchando" o
  suscritos al BehaviorSubject recibirán automáticamente el nuevo valor.
   Esto permite que tu aplicación responda de inmediato a los cambios,
    como mostrar en la interfaz qué usuario está logueado, 
    sin tener que hacer actualizaciones manuales en cada parte del código.

Ejemplo simple:
Supongamos que tienes dos componentes que dependen del estado del usuario:

Componente A muestra el nombre del usuario logueado.
Componente B maneja la interfaz de usuario de login/logout.
Ambos componentes están suscritos al mismo BehaviorSubject. 
Cuando se llama a next() en el servicio de autenticación para actualizar el estado del usuario,
 tanto el componente A como el B reciben la actualización simultáneamente.

typescript
Copiar código
// Al iniciar sesión
authService.loggedInUserSubject.next(newUser); // Actualiza el valor del usuario logueado

// Componente A
authService.loggedInUser$.subscribe(user => {
  console.log("Usuario logueado:", user?.name);
});

// Componente B
authService.loggedInUser$.subscribe(user => {
  if (!user) {
    console.log("No hay usuario logueado.");
  } else {
    console.log("Mostrar botón de logout");
  }
});
Resumen:
next() es necesario porque es la forma de cambiar el valor que contiene el BehaviorSubject,
 y ese cambio se propaga de inmediato a todos los lugares que dependan de ese valor.


*/