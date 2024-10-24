/* ultimo-entreno.component.ts */
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { DiaEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { Usuario } from 'src/app/models/usuario.model';
import { DiaEntrenamientoCardComponent } from 'src/app/componentes/shared/dia-entrenamiento-card/dia-entrenamiento-card.component';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { PopoverController, ModalController } from '@ionic/angular';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';

@Component({
  selector: 'app-ultimo-entreno',
  templateUrl: './ultimo-entreno.component.html',
  styleUrls: ['./ultimo-entreno.component.scss'],
  standalone: true,
  imports: [IonCardContent, FormsModule, IonCardTitle, IonCardHeader, IonCard, NgIf, NgFor, CommonModule, DiaEntrenamientoCardComponent],
  providers: [ModalController, PopoverController]
})
export class UltimoEntrenoComponent implements OnInit {
  ultimoEntrenamientoComparado: any = null;

  constructor() { }

  ngOnInit() {
  }
}