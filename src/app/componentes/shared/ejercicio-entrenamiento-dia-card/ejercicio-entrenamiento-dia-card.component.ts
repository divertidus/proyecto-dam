import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SerieReal, EjercicioRealizado } from 'src/app/models/historial-entreno';

@Component({
  selector: 'app-ejercicio-entrenamiento-dia-card',
  templateUrl: './ejercicio-entrenamiento-dia-card.component.html',
  styleUrls: ['./ejercicio-entrenamiento-dia-card.component.scss'],
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, IonicModule]
})
export class EjercicioEntrenamientoDiaCardComponent {

  @Input() ejercicio: EjercicioRealizado; // Ejercicio actual que se está mostrando

  // Método para verificar si una serie está completada
  isSerieCompletada(serie: SerieReal): boolean {
    return serie.repeticiones > 0 && serie.peso !== undefined; // La serie está completada si tiene repeticiones y peso
  }
}
