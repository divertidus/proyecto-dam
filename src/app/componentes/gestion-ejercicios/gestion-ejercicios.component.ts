import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioService } from 'src/app/services/ejercicio.service';

@Component({
  selector: 'app-gestion-ejercicios',
  templateUrl: './gestion-ejercicios.component.html',
  styleUrls: ['./gestion-ejercicios.component.scss'],
  standalone: true,
  imports: [IonicModule, NgFor, NgIf, FormsModule],
  providers: []
})
export class GestionEjerciciosComponent implements OnInit {

  ejercicios: Ejercicio[] = [];
  nuevoEjercicio: Ejercicio = { id: '', nombre: '', tipo: 'barra', cantidadSeries: 0, repeticiones: 0 };

  constructor(private ejercicioService: EjercicioService) { }

  ngOnInit() {
    this.cargarEjercicios();
  }

  

  async cargarEjercicios() {
    this.ejercicios = await this.ejercicioService.obtenerEjercicios();
  }

  async agregarEjercicio() {
    const ejercicioCreado = await this.ejercicioService.crearEjercicio(this.nuevoEjercicio);
    this.ejercicios.push(ejercicioCreado);
    this.nuevoEjercicio = { id: '', nombre: '', tipo: 'barra', cantidadSeries: 0, repeticiones: 0 }; // Reiniciar formulario
  }

  // Aquí puedes agregar métodos para actualizar y eliminar ejercicios también
}