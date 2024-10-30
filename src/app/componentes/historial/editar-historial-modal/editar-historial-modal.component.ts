import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DiaEntrenamiento, EjercicioRealizado, SerieReal } from 'src/app/models/historial-entrenamiento';
import { IonHeader, IonContent, IonLabel, IonCheckbox, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonInput, IonTextarea } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-historial-modal',
  templateUrl: './editar-historial-modal.component.html',
  styleUrls: ['./editar-historial-modal.component.scss'],
  imports: [IonTextarea, IonInput, IonItem,
    IonList, IonButton, IonButtons, IonTitle,
    IonToolbar, IonCheckbox, IonLabel, IonContent, IonHeader, FormsModule],
  providers: [],
  standalone: true
})
export class EditarHistorialComponent {
  @Input() ejercicio: EjercicioRealizado; // Recibe el ejercicio a editar
  @Input() editable: boolean; // Define si el modal permite edición

  constructor(private modalController: ModalController) { }

  cerrarModal() {
    this.modalController.dismiss();
  }

  guardarCambios() {
    this.modalController.dismiss({ ejercicio: this.ejercicio, actualizado: true });
  }
}