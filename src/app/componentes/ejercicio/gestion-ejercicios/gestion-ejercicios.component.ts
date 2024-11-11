/* gestion-ejercicios.component.ts */
import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioFormComponent } from '../ejercicio-form/ejercicio-form.component';
import { EjercicioListComponent } from "../ejercicio-list/ejercicio-list.component";
import { IonContent } from "@ionic/angular/standalone";
import { PopoverController, ModalController } from '@ionic/angular';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';

@Component({
  selector: 'app-gestion-ejercicios',
  templateUrl: './gestion-ejercicios.component.html',
  styleUrls: ['./gestion-ejercicios.component.scss'],
  standalone: true,
  imports: [FormsModule, EjercicioListComponent],
  providers: [ModalController, PopoverController]
})
export class GestionEjerciciosComponent implements OnInit {

  ejercicios: Ejercicio[] = [];
  // nuevoEjercicio: Ejercicio = { id: '', nombre: '', tipo: 'barra', cantidadSeries: 0, repeticiones: 0 };

  constructor(private ejercicioService: EjercicioService) { }

  ngOnInit() {
    this.cargarEjercicios();
  }

  async cargarEjercicios() {
    this.ejercicios = await this.ejercicioService.obtenerEjercicios();
  }

  // Método que recibe el evento del componente EjercicioFormComponent
  async onEjercicioAgregado(ejercicio: Ejercicio) {
    await this.ejercicioService.agregarEjercicio(ejercicio); // Agregamos el ejercicio a la base de datos
    this.cargarEjercicios(); // Recargamos la lista de ejercicios
  }

}