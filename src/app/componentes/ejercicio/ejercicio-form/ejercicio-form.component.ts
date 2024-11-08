import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastController, PopoverController, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { IonLabel, IonItem, IonButton, IonAlert, IonCardContent } from "@ionic/angular/standalone";
import { IonInput, IonSelectOption, IonSelect } from '@ionic/angular/standalone';
import { NgFor, NgIf } from '@angular/common';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';

@Component({
  selector: 'app-ejercicio-form',
  templateUrl: './ejercicio-form.component.html',
  styleUrls: ['./ejercicio-form.component.scss'],
  standalone: true,
  imports: [IonCardContent, IonAlert, IonButton, IonItem,
    IonLabel, FormsModule, IonInput, IonSelectOption, IonSelect, NgIf, NgFor],
  providers: [ModalController, PopoverController]
})
export class EjercicioFormComponent {
  // Recibe el nuevo ejercicio
  @Input() nuevoEjercicio: Ejercicio = {
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

  constructor(
    private ejercicioService: EjercicioService,
    private popoverController: PopoverController
  ) { }

  // Método para validar cada campo de forma individual
  validarCampo(campo: keyof typeof this.camposInvalidos) {
    this.camposInvalidos[campo] = !this.nuevoEjercicio[campo];
  }

  private validarEjercicio(): boolean {
    this.camposInvalidos.nombre = !this.nuevoEjercicio.nombre;
    this.camposInvalidos.musculoPrincipal = !this.nuevoEjercicio.musculoPrincipal;
    this.camposInvalidos.tipoPeso = !this.nuevoEjercicio.tipoPeso;
    return Object.values(this.camposInvalidos).every((campo) => !campo);
  }

  async agregarEjercicio() {
    if (this.validarEjercicio()) {
      await this.ejercicioService.agregarEjercicio(this.nuevoEjercicio);
      console.log('En agregarEjercicio de form antes del dismiss enviandolo: ', this.nuevoEjercicio)
      this.popoverController.dismiss(this.nuevoEjercicio); // Cerrar el popover y devolver el ejercicio añadido
    } else {
      console.log('Faltan campos por completar.');
    }
  }

  async cerrarPopover() {
    await this.popoverController.dismiss(null);
  }
}