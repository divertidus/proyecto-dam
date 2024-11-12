import { Component, Input, OnInit } from '@angular/core';
import { IonButton, IonInput, IonLabel, IonItem, IonSelectOption, IonSelect } from '@ionic/angular/standalone';
import { EjercicioPlan } from 'src/app/models/rutina.model';
import { PopoverController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-editar-dia-rutina-editar-ejercicio-plan-popover',
  templateUrl: './editar-dia-rutina-editar-ejercicio-plan-popover.component.html',
  styleUrls: ['./editar-dia-rutina-editar-ejercicio-plan-popover.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonSelectOption, IonSelect,
    IonInput, IonButton, FormsModule, NgIf],
})
export class EditarDiaRutinaEditarEjercicioPlanPopoverComponent implements OnInit {


  @Input() ejercicioPlan: EjercicioPlan = {
    ejercicioId: '',
    nombreEjercicio: '',
    tipoPeso: 'Barra',  // Valor predeterminado
    series: 1,
    repeticiones: 10,
    notas: ''
  };

  camposInvalidos = {
    series: false,
    repeticiones: false,
    tipoPeso: false,
  };

  formModificado = false;
  private ejercicioPlanOriginal: EjercicioPlan;


  constructor(private popoverController: PopoverController) { }

  ngOnInit(): void {
    console.log('Soy el mensajito del OnInit del popover que no va. Se recibio el ejercicioPlan?', this.ejercicioPlan);

    // Almacena una copia del estado original del ejercicio para comparar
    this.ejercicioPlanOriginal = { ...this.ejercicioPlan };

    /*   // Inicializar tipoPeso si está vacío
      if (!this.ejercicioPlan.tipoPeso) {
        this.ejercicioPlan.tipoPeso = 'Barra'; // O el valor por defecto que prefieras
      } */


  }

  validarCampo(campo: keyof typeof this.camposInvalidos) {
    if (campo === 'series' || campo === 'repeticiones') {
      this.camposInvalidos[campo] = this.ejercicioPlan[campo] <= 0;
    } else {
      this.camposInvalidos[campo] = !this.ejercicioPlan[campo];
    }
    this.detectarCambios();
  }

  detectarCambios() {
    // Marca el formulario como modificado solo si hay diferencias con el estado original
    this.formModificado = JSON.stringify(this.ejercicioPlan) !== JSON.stringify(this.ejercicioPlanOriginal);
  }

  camposCompletos(): boolean {
    return Object.values(this.camposInvalidos).every((campo) => !campo);
  }

  async guardarEjercicioPlan() {
    if (this.camposCompletos() && this.formModificado) {
      await this.popoverController.dismiss(this.ejercicioPlan);
    } else {
      console.log('Faltan campos por completar o valores inválidos.');
    }
  }

  async cerrarPopover() {
    await this.popoverController.dismiss(null);
  }
}