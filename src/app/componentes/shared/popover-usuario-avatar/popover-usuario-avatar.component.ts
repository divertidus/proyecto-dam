import { Component, Input } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from 'src/app/models/usuario.model';
import { PopoverController, ModalController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { IonList, IonItem, IonAvatar, IonLabel, IonIcon, ToastController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { EntrenamientoEnCursoService } from 'src/app/services/sesion/entrenamiento-en-curso.service';

@Component({
  selector: 'app-popover-usuario-avatar',
  templateUrl: './popover-usuario-avatar.component.html',
  styleUrls: ['./popover-usuario-avatar.component.scss'],
  standalone: true,
  imports: [IonIcon, FormsModule, IonLabel, IonAvatar, IonItem, IonList,],
  providers: [ModalController, PopoverController]
})
export class PopoverUsuarioAvatarComponent {
  @Input() usuario: Usuario | null = null;

  constructor(
    private authService: AuthService,
    private popoverCtrl: PopoverController,
    private entrenamientoEnCursoService: EntrenamientoEnCursoService, // Servicio correcto
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) { }

  async logout(): Promise<void> {
    try {
      // Obtener el estado actual del entrenamiento
      const estadoEntrenamiento = this.entrenamientoEnCursoService.obtenerEstadoActual();
  
      // Debugging detallado del estado
      console.log('Estado actual del entrenamiento:', JSON.stringify(estadoEntrenamiento, null, 2));
  
      if (estadoEntrenamiento.enProgreso) {
        console.log('Entrenamiento en curso detectado. Mostrando alerta.');
  
        // Mostrar alerta para decidir acción
        const alert = await this.alertController.create({
          header: 'Entrenamiento en curso',
          message:
            'Hay un entrenamiento en curso. Si cierras sesión, el entrenamiento se finalizará. ¿Deseas guardarlo antes de salir?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Finalizar sin guardar',
              handler: async () => {
                this.entrenamientoEnCursoService.finalizarSinGuardarEntrenamiento();
                console.log('Entrenamiento cancelado sin guardar.');
                this.procederLogout();
              },
            },
            {
              text: 'Guardar y salir',
              handler: async () => {
                console.log('Guardando entrenamiento en curso:', JSON.stringify(estadoEntrenamiento, null, 2));
                this.procederLogout();
              },
            },
          ],
        });
  
        await alert.present();
      } else {
        console.log('No hay entrenamiento en curso. Procediendo con el logout.');
        this.procederLogout();
      }
    } catch (error) {
      console.error('Error al verificar el estado del entrenamiento:', error);
      this.procederLogout(); // Proceder con el logout aunque falle la verificación
    }
  }
  

  // Método auxiliar para realizar el cierre de sesión
  private procederLogout(): void {
    this.authService.logout();
    this.router.navigate(['/seleccionar-usuario']);
    this.popoverCtrl.dismiss();
  }

  // Mostrar un mensaje en forma de Toast
  private async mostrarToastMensaje(mensaje: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}