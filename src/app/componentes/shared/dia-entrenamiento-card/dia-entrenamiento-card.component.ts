import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SerieSesion, SesionEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonList, IonItem, IonLabel } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dia-entrenamiento-card',
  templateUrl: './dia-entrenamiento-card.component.html',
  styleUrls: ['./dia-entrenamiento-card.component.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonList, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonCard, NgIf, NgFor, CommonModule, FormsModule]
})
export class DiaEntrenamientoCardComponent {
  @Input() entrenamientoActual: SesionEntrenamiento; // Entrenamiento actual
  @Input() expandido: boolean = false; // Para saber si debe estar expandido
  @Input() index: number; // Índice del entrenamiento
  @Input() obtenerNombreEjercicio: (ejercicioId: string) => string; // Input de la función para obtener el nombre

  @Output() toggleExpand = new EventEmitter<number>(); // Evento para expandir/colapsar

  // Método para manejar el click y emitir el índice para cambiar el estado de expansión
  onToggleExpand() {
    this.toggleExpand.emit(this.index);
  }

  // Método para formatear los detalles de los checks de una serie y retornarlos como una cadena
  getSerieDetails(serie: SerieSesion): string {
    const checks: string[] = [];

    // Revisamos cada check y lo añadimos al array si está marcado

    if (serie.conAyuda) checks.push('Con Ayuda');
    if (serie.alFallo) checks.push('Al Fallo');
    if (serie.dolor) checks.push('Dolor');

    // Devolvemos una cadena con todos los checks separados por guiones
    return checks.length > 0 ? checks.join(' - ') : '';
  }
}





/*

Inputs:
entrenamientoActual: Objeto del tipo DiaEntrenamiento que representa el 
entrenamiento que estamos visualizando.

expandido: Un booleano que indica si el entrenamiento debe estar expandido o colapsado.
index: El índice de la tarjeta en la lista general, 
útil para la interacción (expansión/contracción).
Outputs (opcional por ahora, pero útil si quieres interacción desde fuera):
toggleExpand: Un evento que puedes emitir al hacer click en la tarjeta, 
para que la página/tab que contiene las tarjetas pueda manejar la expansión.*/ 