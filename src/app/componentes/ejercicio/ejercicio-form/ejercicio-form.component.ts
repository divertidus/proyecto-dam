import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastController, PopoverController, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { IonLabel, IonItem, IonButton, IonAlert } from "@ionic/angular/standalone";
import { IonInput, IonSelectOption, IonSelect } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ejercicio-form',
  templateUrl: './ejercicio-form.component.html',
  styleUrls: ['./ejercicio-form.component.scss'],
  standalone: true,
  imports: [IonAlert, IonButton, IonItem, IonLabel, FormsModule, IonInput, IonSelectOption, IonSelect],
  providers: [ModalController, PopoverController]
})
export class EjercicioFormComponent implements OnInit {
  // Recibe el nuevo ejercicio
  @Input() nuevoEjercicio: Ejercicio = {
    musculoPrincipal: '',
    entidad: 'ejercicio',
    nombre: '',
    // tipo: 'barra',
    descripcion: ''
  };

  @Output() ejercicioAgregado = new EventEmitter<Ejercicio>(); // Emitimos el evento para agregar el ejercicio

  constructor(
    private toastController: ToastController) { }

  // Método para emitir el evento cuando se haga clic en "Agregar Ejercicio"
  async agregarEjercicio() {
    if (await this.validarFormulario()) {
      this.ejercicioAgregado.emit(this.nuevoEjercicio);
      // Reiniciar el formulario
      this.nuevoEjercicio = { entidad: 'ejercicio', nombre: '', musculoPrincipal: ''/* , tipo: 'barra' */, descripcion: '' };
    }
  }



  ngOnInit() { }

  private async validarFormulario(): Promise<boolean> {
    if (!this.nuevoEjercicio.nombre.trim()) {
      const toast = await this.toastController.create({
        message: 'El nombre del ejercicio es obligatorio',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return false; // Devuelve false si la validación falla
    }

    // Si todas las validaciones pasan, devuelve true
    return true;
  }
}