import { Component, Input} from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { IonLabel, IonItem, IonButton } from "@ionic/angular/standalone";
import { IonInput, IonSelectOption, IonSelect } from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';

@Component({
  selector: 'app-ejercicio-form',
  templateUrl: './ejercicio-form.component.html',
  styleUrls: ['./ejercicio-form.component.scss'],
  standalone: true,
  imports: [  IonButton, IonItem,
    IonLabel, FormsModule, IonInput, IonSelectOption, IonSelect, NgIf],
  providers: [ModalController, PopoverController]
})
export class EjercicioFormComponent {

  @Input() modoEdicion: boolean = false;

  // Recibe el nuevo ejercicio
  @Input() ejercicio: Ejercicio = {
    musculoPrincipal: '',
    entidad: 'ejercicio',
    nombre: '',
    tipoPeso: 'Barra',
    descripcion: '',
    ejercicioPersonalizado: true
  };

  camposInvalidos = {
    nombre: false,
    musculoPrincipal: false,
    tipoPeso: false,
  };

  formModificado = false; // Nueva propiedad para detectar cambios

  constructor(
    private ejercicioService: EjercicioService,
    private popoverController: PopoverController
  ) { }

  // Método para validar cada campo de forma individual
  validarCampo(campo: keyof typeof this.camposInvalidos) {
    this.camposInvalidos[campo] = !this.ejercicio[campo];
    this.detectarCambios();
  }


  detectarCambios() {
    // Detectar si hubo algún cambio en el formulario
    this.formModificado = true;
  }

  private validarEjercicio(): boolean {
    this.camposInvalidos.nombre = !this.ejercicio.nombre;
    this.camposInvalidos.musculoPrincipal = !this.ejercicio.musculoPrincipal;
    this.camposInvalidos.tipoPeso = !this.ejercicio.tipoPeso;
    return Object.values(this.camposInvalidos).every((campo) => !campo);
  }

  async guardarEjercicio() {
    if (this.validarEjercicio() && this.formModificado) {
      if (this.modoEdicion) {
        await this.ejercicioService.actualizarEjercicio(this.ejercicio);
      } else {
        await this.ejercicioService.agregarEjercicio(this.ejercicio);
      }
      this.popoverController.dismiss(this.ejercicio);
    } else {
      console.log('Faltan campos por completar.');
    }
  }

  async cerrarPopover() {
    await this.popoverController.dismiss(null);
  }
}