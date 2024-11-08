import { Component, Input, OnInit } from '@angular/core';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import {
  IonHeader, IonToolbar, IonInput, IonButton, IonIcon,
  IonTitle, IonGrid, IonCol, IonCardHeader, IonCardSubtitle, IonContent, IonRow, IonCard, IonCardTitle, IonButtons, IonLabel, IonItem, IonCardContent
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-elegir-ejercicio',
  templateUrl: './elegir-ejercicio.component.html',
  styleUrls: ['./elegir-ejercicio.component.scss'],
  standalone: true,
  imports: [IonCardContent, IonItem, IonLabel, IonInput, IonButtons, IonCardTitle, IonCard, IonRow, IonContent, IonCardSubtitle, IonCardHeader, IonCol, IonGrid, IonTitle, IonIcon, IonButton, IonToolbar, IonHeader, FormsModule]
})
export class ElegirEjercicioComponent implements OnInit {

  @Input() ejercicioSeleccionado!: Ejercicio; // Ejercicio seleccionado
  series!: number;
  repeticiones!: number;
  notas: string = '';

  constructor(private modalController: ModalController) { }
  ngOnInit(): void {

  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  confirmarDetalles() {
    const ejercicioConDetalles = {
      ejercicioId: this.ejercicioSeleccionado._id,
      nombre: this.ejercicioSeleccionado.nombre,
      tipoPeso: this.ejercicioSeleccionado.tipoPeso,
      series: this.series,
      repeticiones: this.repeticiones,
      notas: this.notas
    };
    this.modalController.dismiss(ejercicioConDetalles);
  }
}
