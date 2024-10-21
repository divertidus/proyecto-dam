// gestion-ejercicios.component.ts
import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { EjercicioFormComponent } from '../ejercicio-form/ejercicio-form.component';

@Component({
  selector: 'app-gestion-ejercicios',
  templateUrl: './gestion-ejercicios.component.html',
  styleUrls: ['./gestion-ejercicios.component.scss'],
  standalone: true,
  imports: [IonicModule, NgFor, NgIf, FormsModule, EjercicioFormComponent],
  providers: []
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

  /*
  //TODO AGREGAR VALIDACION FORMULARIO
  async agregarEjercicio() {
    const ejercicioCreado = await this.ejercicioService.agregarEjercicio(this.nuevoEjercicio);
    this.ejercicios.push(ejercicioCreado);
    this.nuevoEjercicio = { id: '', nombre: '', tipo: 'barra', cantidadSeries: 0, repeticiones: 0 }; // Reiniciar formulario
    this.cargarEjercicios();
  }
    */

  // Aquí puedes agregar métodos para actualizar y eliminar ejercicios también
}