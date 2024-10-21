import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Usuario } from 'src/app/models/usuario.model';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-toolbar-logged',
  templateUrl: './toolbar-logged.component.html',
  styleUrls: ['./toolbar-logged.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ToolbarLoggedComponent implements OnInit, OnDestroy {

  @Input() titulo: string = ''; // Título de la pantalla (pasado como input desde los tabs)
  usuarioLogeado: Usuario | null = null;
  private usuarioSubscription: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    addIcons(todosLosIconos);
  }

  ngOnInit() {
    this.usuarioSubscription = this.authService.usuarioLogeado$.subscribe(usuario => {
      this.usuarioLogeado = usuario;
    });
  }

  ngOnDestroy() {
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  mostrarUsuarioLogeado(): string {
    return this.usuarioLogeado ? this.usuarioLogeado.nombre : 'Sin Usuario';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/seleccionar-usuario']);
  }
}