// 1. Componente Tab1 (src/app/tab1/tab1.page.ts)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserFormComponent } from "../../componentes/usuario/user-form/user-form.component";
import { UserListComponent } from "../../componentes/usuario/user-list/user-list.component";
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { Rutina } from 'src/app/models/rutina.model';
import { RutinaService } from 'src/app/services/rutina.service';
import { Subscription } from 'rxjs';
import { ToolbarLoggedComponent } from 'src/app/componentes/toolbar-logged/toolbar-logged.component';



@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, UserFormComponent, UserListComponent, ToolbarLoggedComponent]
})
export class Tab1Page implements OnInit {

  usuarioLogeado: Usuario | null = null;
  rutinas: Rutina[] = [];
  private rutinaSubscription: Subscription;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private rutinaService: RutinaService,
    private router: Router
  ) {
    this.usuarioLogeado = this.authService.getUsuarioLogeado();
  }

  ngOnInit() {
    this.usuarioLogeado = this.authService.getUsuarioLogeado();
    if (this.usuarioLogeado) {
      // Nos suscribimos al observable de rutinas para actualizar la lista automáticamente cuando haya cambios
      this.rutinaSubscription = this.rutinaService.rutinas$.subscribe(rutinas => {
        // Filtramos las rutinas para obtener solo las del usuario logueado
        this.rutinas = rutinas.filter(rutina => rutina.usuarioId === this.usuarioLogeado?._id);
      });
    }
  }

  ngOnDestroy() {
    // Desuscribimos para evitar fugas de memoria
    if (this.rutinaSubscription) {
      this.rutinaSubscription.unsubscribe();
    }
  }

  mostrarUsuarioLogeado(): string {
    return this.usuarioLogeado ? `Usuario: ${this.usuarioLogeado.nombre}` : 'Nadie está logueado';
  }

  logout(): void {
    this.authService.logout();
    this.usuarioLogeado = null;
    this.router.navigate(['/seleccionar-usuario']);
  }

  // Crear una nueva rutina
  crearNuevaRutina() {
    console.log('Crear nueva rutina');
    // Redirige al usuario a la página para crear una nueva rutina
    this.router.navigate(['/tabs/tab5']);
  }

  // Modificar una rutina existente
  modificarRutina(rutina: Rutina) {
    console.log('Modificar rutina:', rutina);
    // Aquí puedes añadir la lógica para modificar la rutina
  }
}