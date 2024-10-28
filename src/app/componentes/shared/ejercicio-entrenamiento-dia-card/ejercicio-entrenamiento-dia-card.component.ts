import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonItem, IonCheckbox, IonLabel } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { ModalController, PopoverController } from '@ionic/angular';
import { EjercicioSesion, SerieSesion } from 'src/app/models/historial-entrenamiento';
@Component({
  selector: 'app-ejercicio-entrenamiento-dia-card',
  templateUrl: './ejercicio-entrenamiento-dia-card.component.html',
  styleUrls: ['./ejercicio-entrenamiento-dia-card.component.scss'],
  standalone: true,
  imports: [IonLabel, IonCheckbox, IonItem, CommonModule, NgFor, NgIf, FormsModule],
  providers: [ModalController,PopoverController]
})
export class EjercicioEntrenamientoDiaCardComponent {

  @Input() ejercicioSesion: EjercicioSesion; // Ejercicio actual que se está mostrando

  // Método para verificar si una serie está completada
  isSerieCompletada(serieSesion: SerieSesion): boolean {
    return serieSesion.repeticiones > 0 && serieSesion.peso !== undefined; // La serie está completada si tiene repeticiones y peso
  }
}
