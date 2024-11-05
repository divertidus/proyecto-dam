import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import {
  IonHeader, IonList, IonToolbar,
  IonTitle, IonButton, IonButtons, IonContent,
  IonItem, IonIcon, IonLabel, IonSearchbar, IonFooter,
  IonCardContent, IonCardTitle, IonCard, IonCardHeader, IonInput, IonTextarea, IonCheckbox
} from '@ionic/angular/standalone';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-anadir-ejercicio-extra',
  templateUrl: './anadir-ejercicio-extra.component.html',
  styleUrls: ['./anadir-ejercicio-extra.component.scss'],
  imports: [IonFooter, IonCardContent, IonCardTitle,
    IonCardHeader, IonCard, IonIcon, CommonModule, IonTextarea, IonInput, IonItem,
    IonList, IonButton, IonButtons, IonTitle, NgIf, NgFor, IonSearchbar,
    IonToolbar, IonCheckbox, IonLabel, IonContent, IonHeader, FormsModule],
  standalone: true,
  providers: [ModalController, AlertController],

})
export class AnadirEjercicioExtraComponent implements OnInit {

  @Input() ejerciciosDisponibles: any[] = []; // Lista completa de ejercicios disponibles
  ejerciciosFiltrados: any[] = []; // Lista filtrada para mostrar
  ejercicioSeleccionado: any;

  constructor(private modalController: ModalController, private alertController: AlertController) { }

  ngOnInit() {
    this.ejerciciosFiltrados = [...this.ejerciciosDisponibles]; // Inicialmente muestra todos los ejercicios
  }

  buscarEjercicios(event: any) {
    const query = event.target.value.toLowerCase();
    this.ejerciciosFiltrados = this.ejerciciosDisponibles.filter((ejercicio) =>
      ejercicio.nombre.toLowerCase().includes(query)
    );
  }

  confirmarAnadirEjercicio(ejercicio: any) {
    this.modalController.dismiss(ejercicio);
  }

  cancelarAnadirEjercicio() {
    this.modalController.dismiss(null, 'cancel');
  }
}

