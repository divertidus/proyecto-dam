import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Usuario } from 'src/app/models/usuario.model';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons';


@Component({
  selector: 'app-toolbar-logged',
  templateUrl: './toolbar-logged.component.html',
  styleUrls: ['./toolbar-logged.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ToolbarLoggedComponent {

  @Input() titulo: string = ''; // Título de la pantalla (pasado como input desde los tabs)

  usuarioLogeado: Usuario | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.usuarioLogeado = this.authService.getUsuarioLogeado();
    addIcons(todosLosIconos);
  }

  mostrarUsuarioLogeado(): string {
    return this.usuarioLogeado ? this.usuarioLogeado.nombre : 'Sin Usuario';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/seleccionar-usuario']);
  }
}