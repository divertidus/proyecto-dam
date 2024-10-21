// auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

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

/*
Paso 1: Crear un Guard de Rutas
Genera un nuevo guardia usando Angular CLI:
bash
Copiar código
ng generate guard auth
Esto creará dos archivos: auth.guard.ts y auth.guard.spec.ts.
Configura el Guard para verificar si el usuario está logueado:
typescript
Copiar código
// auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service'; // Asegúrate de importar tu servicio de autenticación

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

Paso 2: Configura el Guard en las Rutas
Ahora, debes aplicar el guardia a las rutas que desees proteger. Por ejemplo, si quieres proteger las rutas de las tabs para que solo los usuarios logueados puedan acceder a ellas:
typescript
Copiar código
// tabs.routes.ts

import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from 'src/app/auth/auth.guard'; // Asegúrate de importar el guard

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [AuthGuard], // Aplica el guard a las rutas de tabs
    children: [
      {
        path: 'tab1',
        loadComponent: () => 
          import('./tab1/tab1.page').then(m => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () => 
          import('./tab2/tab2.page').then(m => m.Tab2Page),
      },
      {
        path: 'tab3',
        loadComponent: () => 
          import('./tab3/tab3.page').then(m => m.Tab3Page),
      },
      {
        path: 'tab4',
        loadComponent: () => 
          import('./tab4/tab4.page').then(m => m.Tab4Page),
      },
      {
        path: 'tab5',
        loadComponent: () => 
          import('./tab5/tab5.page').then(m => m.Tab5Page),
      },
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full',
      },
    ],
  },
];

Paso 3: Prueba la Funcionalidad
Prueba la Aplicación: Intenta refrescar la página o navegar a las tabs sin estar logueado. Deberías ser redirigido a SeleccionarUsuarioPage.
Asegúrate de que el Guard Funcione: Si intentas acceder a las tabs sin haber iniciado sesión, el guard debería interceptar la solicitud y redirigirte a la pantalla inicial.
Resumen
Guard de Rutas: Usamos un guardia para verificar si hay un usuario logueado y redirigir a la pantalla inicial si no es así.
Protección de Rutas: Aplica el guard a las rutas que desees proteger para asegurarte de que solo los usuarios logueados puedan acceder a ellas.
Pruebas: Asegúrate de que la redirección funcione correctamente en diferentes escenarios.
Si tienes más preguntas o necesitas ayuda adicional, ¡hazmelo saber!
4o mini
Tú dijiste:
Al hacer ng generate guard auth debo elegir entre Which type of guard would you like to create? (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed) ◯ CanActivate ◯ CanActivateChild ❯◯ CanDeactivate ◯ CanMatch
ChatGPT Plus
ChatGPT
Al crear un guard en Angular, puedes elegir entre varios tipos de guardias, cada uno diseñado para un propósito específico. En tu caso, dado que deseas controlar el acceso a las rutas basadas en si un usuario está logueado, deberías seleccionar CanActivate.
Explicación de las Opciones
CanActivate: Este guard se utiliza para proteger rutas y determinar si se puede activar una ruta específica. Es el que necesitas para verificar si un usuario está logueado antes de permitir el acceso a las rutas de tu aplicación.
CanActivateChild: Este guard se utiliza para proteger las rutas secundarias (hijas) de una ruta principal. Solo es necesario si tienes rutas anidadas y quieres aplicar una lógica de protección específica a esas rutas.
CanDeactivate: Este guard se usa para prevenir la navegación fuera de una ruta o componente. Es útil si quieres preguntar al usuario si está seguro de salir de una página (por ejemplo, un formulario con cambios no guardados).
CanMatch: Este guard se utiliza para decidir si una ruta coincide con la solicitud del usuario. Es más avanzado y no se necesita para la mayoría de los casos comunes.
Qué Hacer
Al hacer ng generate guard auth, selecciona la opción CanActivate. Esto te permitirá implementar la lógica necesaria para verificar si el usuario está logueado antes de permitir el acceso a ciertas rutas en tu aplicación.
Cómo Proceder
Usa las teclas de flecha para navegar y selecciona CanActivate presionando la barra espaciadora.
Presiona Enter para confirmar la selección.
Esto generará un guard que puedes implementar con la lógica de autenticación que discutimos anteriormente. Si necesitas ayuda adicional con la implementación o tienes más preguntas, ¡hazmelo saber!


*/