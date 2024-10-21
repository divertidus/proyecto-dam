import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Ejercicio } from '../../models/ejercicio.model';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons'

@Component({
  selector: 'app-ejercicio-list',
  templateUrl: './ejercicio-list.component.html',
  styleUrls: ['./ejercicio-list.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class EjercicioListComponent {
  @Input() ejercicios: Ejercicio[] = [];

  @Output() editarEjercicio = new EventEmitter<Ejercicio>();
  @Output() eliminarEjercicio = new EventEmitter<Ejercicio>();
  @Output() marcarEjercicio = new EventEmitter<Ejercicio>();

  constructor() {
    addIcons(todosLosIconos)
  }
  seleccionarEjercicio(ejercicio: Ejercicio) {
    console.log('Ejercicio seleccionado:', ejercicio);
  }
}