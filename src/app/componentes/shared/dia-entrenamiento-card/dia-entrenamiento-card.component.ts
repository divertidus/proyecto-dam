/* dia-entrenamiento-card.component.ts */
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DiaEntrenamiento, SerieReal } from 'src/app/models/historial-entrenamiento';
import {
  IonCard, IonCardContent, IonCardSubtitle,
  IonCardTitle, IonCardHeader, IonList,
  IonItem, IonLabel, IonButton, IonIcon, IonHeader
} from "@ionic/angular/standalone";
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
  imports: [IonButton, IonLabel, IonItem, IonList, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonCard, NgIf, NgFor, CommonModule, FormsModule]
})
export class DiaEntrenamientoCardComponent {
  @Input() diaEntrenamiento: DiaEntrenamiento; // Entrenamiento actual
  @Input() expandido: boolean = false; // Para saber si debe estar expandido
  @Input() index: number; // Índice del entrenamiento
  @Input() obtenerNombreEjercicio: (ejercicioId: string) => string; // Input de la función para obtener el nombre
  @Input() editable: boolean = false;
  @Input() usuarioId: string;
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
      componentProps: {
        diaEntrenamiento: this.diaEntrenamiento,
        editable: this.editable,
        usuarioId: this.usuarioId
      }
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
