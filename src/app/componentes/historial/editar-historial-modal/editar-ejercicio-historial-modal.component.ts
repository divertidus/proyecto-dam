/* editar-ejercicio-historial-modal.component.ts */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DiaEntrenamiento, EjercicioRealizado, SerieReal } from 'src/app/models/historial-entrenamiento';
import { IonHeader, IonContent, IonLabel, IonCheckbox, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonInput, IonTextarea, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-editar-ejercicio-historia-modal',
  templateUrl: './editar-ejercicio-historial-modal.component.html',
  styleUrls: ['./editar-ejercicio-historial-modal.component.scss'],
  imports: [IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonIcon, IonTextarea, IonInput, IonItem,
    IonList, IonButton, IonButtons, IonTitle, NgIf, NgFor,
    IonToolbar, IonCheckbox, IonLabel, IonContent, IonHeader, FormsModule],
  providers: [],
  standalone: true
})
export class EditarEjercicioHistorialComponent implements OnInit {
  @Input() diaEntrenamiento: DiaEntrenamiento; // Recibe el ejercicio a editar
  @Input() editable: boolean; // Define si el modal permite edición
  @Input() historialId: string; // Recibe historialId

  ejercicioAbiertoIndex: number | null = null; // Índice del ejercicio actualmente abierto

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    console.log('Día entrenamiento recibido en el modal:', this.diaEntrenamiento);
    console.log('Historial ID recibido en el modal:', this.historialId); // Verificar que historialId se recibe correctamente
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  guardarCambios() {
    // Incluye historialId en los datos devueltos
    this.modalController.dismiss({
      diaEntrenamiento: this.diaEntrenamiento,
      historialId: this.historialId, // Asegura historialId en el objeto resultante
      actualizado: true
    });
  }


  // Métodos para incrementar y decrementar peso en una serie específica
  incrementarPeso(serie: SerieReal) {
    if (serie.peso === undefined) serie.peso = 0;
    serie.peso += 1.25;
  }

  decrementarPeso(serie: SerieReal) {
    if (serie.peso === undefined) serie.peso = 0;
    if (serie.peso > 0) serie.peso -= 1.25;
  }

  toggleEditarSerie(ejercicioIndex: number, serieIndex: number) {
    const serie = this.diaEntrenamiento.ejerciciosRealizados[ejercicioIndex].series[serieIndex];
    serie.enEdicion = !serie.enEdicion;
  }

  abrirNotasSerie(ejercicioIndex: number, serieIndex: number) {
    const serie = this.diaEntrenamiento.ejerciciosRealizados[ejercicioIndex].series[serieIndex];
    // Puedes implementar un modal para agregar notas aquí si lo deseas
  }

  // Método para alternar el ejercicio abierto
  toggleEjercicio(index: number) {
    this.ejercicioAbiertoIndex = this.ejercicioAbiertoIndex === index ? null : index;
  }

}