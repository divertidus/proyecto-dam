import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DiaEntrenamiento } from 'src/app/models/historial-entreno';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-dia-entrenamiento-card',
  templateUrl: './dia-entrenamiento-card.component.html',
  styleUrls: ['./dia-entrenamiento-card.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, IonicModule, CommonModule]
})
export class DiaEntrenamientoCardComponent {
  @Input() entrenamientoActual: DiaEntrenamiento; // Entrenamiento actual
  @Input() comparacion: any; // Comparación del entrenamiento anterior
  @Input() expandido: boolean = false; // Para saber si debe estar expandido
  @Input() index: number; // Índice del entrenamiento

  @Output() toggleExpand = new EventEmitter<number>(); // Evento para expandir/colapsar
}


/*

Inputs:
entrenamientoActual: Objeto del tipo DiaEntrenamiento que representa el 
entrenamiento que estamos visualizando.
comparacion: Objeto que contiene la información de comparación del entrenamiento anterior. 
Esto podría ser opcional y se podría omitir si no hay comparaciones disponibles.
expandido: Un booleano que indica si el entrenamiento debe estar expandido o colapsado.
index: El índice de la tarjeta en la lista general, 
útil para la interacción (expansión/contracción).
Outputs (opcional por ahora, pero útil si quieres interacción desde fuera):
toggleExpand: Un evento que puedes emitir al hacer click en la tarjeta, 
para que la página/tab que contiene las tarjetas pueda manejar la expansión.*/ 