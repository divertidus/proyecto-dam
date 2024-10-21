import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'crear-usuario',
    loadComponent: () => import('./paginas/crear-usuario/crear-usuario.page').then(m => m.CrearUsuarioPage)
  },
  {
    path: 'seleccionar-usuario',
    loadComponent: () => import('./paginas/seleccionar-usuario/seleccionar-usuario.page').then(m => m.SeleccionarUsuarioPage)
  }
];
