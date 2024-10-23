import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { IonicModule, PopoverController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Usuario } from 'src/app/models/usuario.model';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { PopoverUsuarioAvatarComponent } from '../popover-usuario-avatar/popover-usuario-avatar.component';

@Component({
  selector: 'app-toolbar-logged',
  templateUrl: './toolbar-logged.component.html',
  styleUrls: ['./toolbar-logged.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ToolbarLoggedComponent implements OnInit, OnDestroy {
  @Input() titulo: string = ''; // Título de la pantalla
  usuarioLogeado: Usuario | null = null;
  private usuarioSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private popoverController: PopoverController // Inyectamos el PopoverController
  ) {
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

  // Método para mostrar el popover con los datos del usuario
  async presentPopover(event: Event) {
    const popover = await this.popoverController.create({
      component: PopoverUsuarioAvatarComponent,
      event: event,
      translucent: true,
      componentProps: { usuario: this.usuarioLogeado } // Pasamos el usuario al popover
    });
    return await popover.present();
  }
}