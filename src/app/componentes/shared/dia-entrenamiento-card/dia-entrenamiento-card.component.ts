/* dia-entrenamiento-card.component.ts */
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { DiaEntrenamiento, HistorialEntrenamiento, SerieReal } from 'src/app/models/historial-entrenamiento';
import { IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonList, IonItem, IonLabel, IonButton, IonIcon, IonHeader } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { EditarEjercicioHistorialComponent } from '../../historial/editar-historial-modal/editar-ejercicio-historial-modal.component';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';

@Component({
  selector: 'app-dia-entrenamiento-card',
  templateUrl: './dia-entrenamiento-card.component.html',
  styleUrls: ['./dia-entrenamiento-card.component.scss'],
  standalone: true,
  providers: [AlertController, ModalController],
  imports: [IonHeader, IonIcon, IonButton, IonLabel, IonItem, EditarEjercicioHistorialComponent, IonList, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonCard, NgIf, NgFor, CommonModule, FormsModule]
})
export class DiaEntrenamientoCardComponent {
  @Input() diaEntrenamiento: DiaEntrenamiento; // Entrenamiento actual
  @Input() expandido: boolean = false; // Para saber si debe estar expandido
  @Input() index: number; // Índice del entrenamiento
  @Input() obtenerNombreEjercicio: (ejercicioId: string) => string; // Input de la función para obtener el nombre
  @Input() editable: boolean = false;

  @Output() toggleExpand = new EventEmitter<number>(); // Evento para expandir/colapsar
  @Output() diaEliminado = new EventEmitter<string>(); // Cambiamos el tipo a `string`


  constructor(private alertController: AlertController,
    private modalController: ModalController,
    private historialService: HistorialService
  ) {

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


  // Llamada al servicio de actualización sin historialId
  async abrirModalEditarDiaCompleto() {
    const modal = await this.modalController.create({
      component: EditarEjercicioHistorialComponent,
      componentProps: { diaEntrenamiento: this.diaEntrenamiento, editable: this.editable }
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data && result.data.actualizado) {
        console.log('Día de entrenamiento actualizado:', result.data.diaEntrenamiento);
        this.diaEntrenamiento = result.data.diaEntrenamiento;

        // Llamar al método simplificado sin historialId
        await this.historialService.actualizarDiaEntrenamiento(this.diaEntrenamiento);
      }
    });

    await modal.present();
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

/*
  // Editar una sola serie (con alert)
  async editarSerie(ejercicioIndex: number, serieIndex: number) {
    const ejercicio = this.diaEntrenamiento.ejerciciosRealizados[ejercicioIndex];
    const serie = ejercicio.series[serieIndex];

    const alert = await this.alertController.create({
      header: `Editar S${serie.numeroSerie} - ${ejercicio.nombreEjercicioRealizado}`,
      inputs: [
        { name: 'repeticiones', type: 'number', placeholder: 'Repeticiones', value: serie.repeticiones?.toString() || '', label: 'Reps' },
        { name: 'peso', type: 'number', placeholder: 'Peso (kg)', value: serie.peso?.toString() || '', label: 'Peso' },
        { name: 'notas', type: 'textarea', placeholder: 'Notas', value: serie.notas || '', label: 'Notas' },
        { name: 'conAyuda', type: 'checkbox', label: 'Con Ayuda', checked: serie.conAyuda || false },
        { name: 'alFallo', type: 'checkbox', label: 'Al Fallo', checked: serie.alFallo || false },
        { name: 'dolor', type: 'checkbox', label: 'Dolor', checked: serie.dolor || false }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            serie.repeticiones = parseInt(data.repeticiones, 10);
            serie.peso = parseFloat(data.peso);
            serie.notas = data.notas;
            serie.conAyuda = data.conAyuda || false;
            serie.alFallo = data.alFallo || false;
            serie.dolor = data.dolor || false;
          },
        },
      ],
    });

    await alert.present();
  }
*/