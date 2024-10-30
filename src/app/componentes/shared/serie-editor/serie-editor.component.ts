import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SerieReal } from 'src/app/models/historial-entrenamiento';
import { IonInput, IonButton } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-serie-editor',
  templateUrl: './serie-editor.component.html',
  styleUrls: ['./serie-editor.component.scss'],
  imports: [IonInput, IonButton, CommonModule, FormsModule],
  standalone: true,

})
export class SerieEditorComponent {
  @Input() serieReal: SerieReal;
  @Output() saveChanges = new EventEmitter<void>();
  @Output() updateNextSession = new EventEmitter<void>();


  // Campo de estado local para controlar si estamos en modo edición
  enEdicion: boolean = false;

  toggleEditMode() {
    if (this.enEdicion) {
      if (this.serieReal.peso === 0) {
        console.warn("El peso no puede ser 0. Establezca un valor de peso.");
        return;
      }
      this.saveChanges.emit(); // Emitir evento para guardar cambios en la serie
      this.updateNextSession.emit(); // Llamar a la lógica de actualización de sesión posterior
    }
    this.enEdicion = !this.enEdicion; // Alternar el estado local de edición
  }

  // Métodos para incrementar y decrementar el peso
  incrementarPeso() {
    if (!this.serieReal.peso) {
      this.serieReal.peso = 0; // Valor inicial si es undefined o null
    }
    this.serieReal.peso += 2.50;
  }

  decrementarPeso() {
    if (!this.serieReal.peso) {
      this.serieReal.peso = 0; // Valor inicial si es undefined o null
    }
    this.serieReal.peso = Math.max(this.serieReal.peso - 1.25, 0);
  }
}
