import { Component, Input } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from 'src/app/models/usuario.model';
import { PopoverController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-popover-usuario-avatar',
  templateUrl: './popover-usuario-avatar.component.html',
  styleUrls: ['./popover-usuario-avatar.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class PopoverUsuarioAvatarComponent {
  @Input() usuario: Usuario | null = null;

  constructor(
    private authService: AuthService,
    private popoverCtrl: PopoverController,
    private router: Router) { }

  // Método para cerrar sesión
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/seleccionar-usuario']);
    this.popoverCtrl.dismiss();
  }
}
