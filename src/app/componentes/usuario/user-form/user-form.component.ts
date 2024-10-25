import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuario } from 'src/app/models/usuario.model';
import { IonCard, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonButton, IonCardContent } from "@ionic/angular/standalone";
import { IonInput, ToastController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/database/usuario.service';
@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [IonCardContent, IonButton, IonLabel, IonItem, IonCardTitle, IonCardHeader, IonCard, FormsModule, IonInput]
})
export class UserFormComponent {
  nombre: string = '';
  email: string = '';

  // por esto se puede usar luego el emit y emite al padre, hacia tab1
  @Output() eventoUsuarioAñadido = new EventEmitter<void>();

  constructor(private usuarioService: UsuarioService, private toastController: ToastController) { }

  //TODO AGREGAR VALIDACION FORMULARIO
  async guardarUsuario(): Promise<void> {
    if (this.validarFormulario()) { // Usamos el método de validación
      try {
        const nuevoUsuario: Usuario = {
          entidad: 'usuario',
          nombre: this.nombre,
          email: this.email,
          imagenPerfil: '',
          timestamp: ''
        };

        await this.usuarioService.agregarUsuario(nuevoUsuario);

        this.nombre = '';
        this.email = '';

        this.eventoUsuarioAñadido.emit();
        await this.presentToast('Usuario guardado exitosamente', 'success');
      } catch (err) {
        console.error('Error guardando usuario:', err);
        await this.presentToast('Error guardando usuario', 'danger');
      }
    } else {
      await this.presentToast('Por favor, completa todos los campos correctamente', 'warning');
    }
  }

  // Método de validación para verificar si los campos son correctos
  private validarFormulario(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.nombre.trim() !== '' && emailRegex.test(this.email);
  }

  // Método para mostrar un toast con un mensaje específico y color
  async presentToast(mensaje: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}