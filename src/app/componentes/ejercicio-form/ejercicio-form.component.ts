import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { Ejercicio } from 'src/app/models/ejercicio.model';


@Component({
  selector: 'app-ejercicio-form',
  templateUrl: './ejercicio-form.component.html',
  styleUrls: ['./ejercicio-form.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class EjercicioFormComponent implements OnInit {
  // Recibe el nuevo ejercicio
  @Input() nuevoEjercicio: Ejercicio = {
    id: '',
    entidad: 'ejercicio',
    nombre: '',
    equipamiento: 'barra',
    cantidadSeries: 0,
    repeticiones: 0
  };

  @Output() ejercicioAgregado = new EventEmitter<Ejercicio>(); // Emitimos el evento para agregar el ejercicio

  constructor(private ejercicioService: EjercicioService) { }

  // Método para emitir el evento cuando se haga clic en "Agregar Ejercicio"
  agregarEjercicio() {
    this.ejercicioAgregado.emit(this.nuevoEjercicio); // Emitimos el nuevo ejercicio
    // Reiniciamos el formulario
    this.nuevoEjercicio = { id: '', entidad: 'ejercicio', nombre: '', equipamiento: 'barra', cantidadSeries: 0, repeticiones: 0 };
  }

  ngOnInit() { }

}
