// auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Verifica si hay un usuario logueado
    const usuarioLogueado = this.authService.getUsuarioLogeado();
    if (!usuarioLogueado) {
      // Si no hay usuario logueado, redirige a la pantalla inicial
      this.router.navigate(['/seleccionar-usuario']);
      return false; // Deniega el acceso a la ruta
    }
    return true; // Permite el acceso si hay un usuario logueado
  }
}