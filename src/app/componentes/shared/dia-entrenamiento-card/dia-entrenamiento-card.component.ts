import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { DiaEntrenamiento, SerieReal } from 'src/app/models/historial-entrenamiento';
import { IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonList, IonItem, IonLabel, IonButton, IonIcon } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { SerieEditorComponent } from '../serie-editor/serie-editor.component';
@Component({
  selector: 'app-dia-entrenamiento-card',
  templateUrl: './dia-entrenamiento-card.component.html',
  styleUrls: ['./dia-entrenamiento-card.component.scss'],
  standalone: true,
  providers: [AlertController],
  imports: [IonIcon, SerieEditorComponent, IonButton, IonLabel, IonItem, IonList, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonCard, NgIf, NgFor, CommonModule, FormsModule]
})
export class DiaEntrenamientoCardComponent {
  @Input() diaEntrenamiento: DiaEntrenamiento; // Entrenamiento actual
  @Input() expandido: boolean = false; // Para saber si debe estar expandido
  @Input() index: number; // Índice del entrenamiento
  @Input() obtenerNombreEjercicio: (ejercicioId: string) => string; // Input de la función para obtener el nombre
  @Input() editable: boolean = false;

  @Output() toggleExpand = new EventEmitter<number>(); // Evento para expandir/colapsar
  @Output() diaEliminado = new EventEmitter<string>(); // Cambiamos el tipo a `string`


  constructor(private alertController: AlertController) {

  }
  // Método para manejar el click y emitir el índice para cambiar el estado de expansión
  onToggleExpand() {
    this.toggleExpand.emit(this.index);
  }

  // Método para formatear los detalles de los checks de una serie y retornarlos como una cadena
  getSerieDetails(serie: SerieReal): string {
    const checks: string[] = [];

    // Revisamos cada check y lo añadimos al array si está marcado

    if (serie.conAyuda) checks.push('Con Ayuda');
    if (serie.alFallo) checks.push('Al Fallo');
    if (serie.dolor) checks.push('Dolor');

    // Devolvemos una cadena con todos los checks separados por guiones
    return checks.length > 0 ? checks.join(' - ') : '';
  }

  // Método para confirmar la eliminación del día
  async confirmarEliminarDia() {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este día del historial?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => this.eliminarDia(),
        },
      ],
    });
    await alert.present();
  }


  // Lógica para eliminar el día y emitir el evento con el ID

  eliminarDia() {
    if (this.diaEntrenamiento && this.diaEntrenamiento._id) {
      console.log(`Eliminando día con ID: ${this.diaEntrenamiento._id}`);
      
      this.diaEliminado.emit(this.diaEntrenamiento._id); // Enviar el ID
    } else {
      console.error("No se pudo encontrar el ID del día a eliminar.");
    }
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