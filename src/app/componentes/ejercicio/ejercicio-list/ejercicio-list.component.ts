/* gestion-list.component.ts */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Ejercicio } from '../../../models/ejercicio.model';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons'
import { IonGrid, IonRow, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonCardContent, IonCard, IonCol } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
@Component({
  selector: 'app-ejercicio-list',
  templateUrl: './ejercicio-list.component.html',
  styleUrls: ['./ejercicio-list.component.scss'],
  standalone: true,
  imports: [IonCol, IonCard, FormsModule, IonCardContent, IonIcon, IonButton, IonCardSubtitle, IonCardTitle, IonCardHeader, IonRow, IonGrid, CommonModule]
})
export class EjercicioListComponent implements OnInit {

  ejercicios$: Observable<Ejercicio[]>; // Observable para manejar la lista reactiva de ejercicios


  @Input() ejercicios: Ejercicio[] = [];

  @Output() editarEjercicio = new EventEmitter<Ejercicio>();
  @Output() eliminarEjercicio = new EventEmitter<Ejercicio>();
  @Output() marcarEjercicio = new EventEmitter<Ejercicio>();

  constructor(private ejercicioService: EjercicioService) {
    addIcons(todosLosIconos)
  }

  ngOnInit() {
    // Se suscribe al Observable ejercicios$ para recibir actualizaciones en tiempo real
    this.ejercicios$ = this.ejercicioService.ejercicios$;
  }


  seleccionarEjercicio(ejercicio: Ejercicio) {
    console.log('Ejercicio seleccionado:', ejercicio);
  }
}
