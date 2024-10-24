import { Component, OnInit } from '@angular/core';
import { DiaEntrenamientoCardComponent } from 'src/app/componentes/shared/dia-entrenamiento-card/dia-entrenamiento-card.component';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { PopoverController, ModalController } from '@ionic/angular';
import { DiaEntrenamiento, HistorialEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';

@Component({
  selector: 'app-historial-entrenamiento',
  templateUrl: './historial-entrenamiento.component.html',
  styleUrls: ['./historial-entrenamiento.component.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonCardContent, FormsModule, IonCardTitle, IonCardHeader, IonCard, IonList, NgIf, NgFor, CommonModule, DiaEntrenamientoCardComponent],
  providers: [ModalController, PopoverController]
})
export class HistoriaEntrenamientoComponent implements OnInit {
  historialEntrenamientos: HistorialEntrenamiento[] = []; // Para almacenar el historial de entrenamientos
  entrenamientoActual: DiaEntrenamiento | null = null; // Para almacenar el entrenamiento seleccionado

  constructor(private historialService: HistorialService) { }

  ngOnInit() {
    this.cargarHistorialEntrenamientos();
  }

  async cargarHistorialEntrenamientos() {
    const usuarioId = 'ID_DEL_USUARIO_LOGEADO'; // Cambia esto por el ID del usuario logueado
    try {
      const historiales = await this.historialService.obtenerHistorialesPorUsuario(usuarioId);
      this.historialEntrenamientos = historiales;
      // Lógica para seleccionar el entrenamiento actual, si es necesario
      this.entrenamientoActual = this.historialEntrenamientos[0]?.entrenamientos[0] || null; // Ejemplo: seleccionando el primer entrenamiento
    } catch (error) {
      console.error('Error al cargar el historial de entrenamientos:', error);
    }
  }
}