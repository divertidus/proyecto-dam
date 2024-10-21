import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/seleccionar-usuario/seleccionar-usuario.page').then(m => m.SeleccionarUsuarioPage)
  },
  {
    path: 'crear-usuario',
    loadComponent: () =>
      import('./paginas/crear-usuario/crear-usuario.page').then(m => m.CrearUsuarioPage)
  },
  {
    path: 'seleccionar-usuario',
    loadComponent: () =>
      import('./paginas/seleccionar-usuario/seleccionar-usuario.page').then(m => m.SeleccionarUsuarioPage)
  },
  {
    path: 'tabs', // Asegúrate de que este sea el path correcto para las tabs
   // canActivate: [AuthGuard], // Aplica el guard a las rutas de tabs
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes)
  },
  {
    path: '**',
    redirectTo: 'seleccionar-usuario', // Redirigir a seleccionar usuario si la ruta no coincide
    pathMatch: 'full'
  }
];