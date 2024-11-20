import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonItem, IonInput, IonContent, IonLabel, IonButton, IonSelect, IonSelectOption, IonHeader, IonTitle, IonToolbar, IonButtons, IonIcon, IonText } from '@ionic/angular/standalone';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { PopoverController } from '@ionic/angular';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-ejercicio-ver-editar-popover',
  templateUrl: './ejercicio-ver-editar-popover.component.html',
  styleUrls: ['./ejercicio-ver-editar-popover.component.scss'],
  standalone: true,
  imports: [IonText, IonIcon, IonButtons, IonToolbar, IonTitle, IonHeader, IonButton, IonLabel, IonContent,
    IonItem, FormsModule,NgIf],
  providers: []
})
export class EjercicioVerEditarPopoverComponent {

  @Input() ejercicio!: Ejercicio; // Recibir el ejercicio

  constructor(private popoverController: PopoverController, private ejercicioService: EjercicioService) { }

  async guardarCambios() {
    // Solo se permite guardar cambios si es un ejercicio personalizado
    if (this.ejercicio.ejercicioPersonalizado) {
      await this.ejercicioService.agregarEjercicio(this.ejercicio); // Llamar al servicio para guardar el ejercicio
    }
    await this.popoverController.dismiss(this.ejercicio); // Cerrar el popover y devolver el ejercicio editado
  }

  async eliminarEjercicio() {
    if (this.ejercicio.ejercicioPersonalizado) {
      await this.ejercicioService.eliminarEjercicio(this.ejercicio); // Implementar método para eliminar el ejercicio
    }
    await this.popoverController.dismiss(null); // Cerrar el popover
  }

  cerrarPopover() {
    this.popoverController.dismiss(null);
  }
}