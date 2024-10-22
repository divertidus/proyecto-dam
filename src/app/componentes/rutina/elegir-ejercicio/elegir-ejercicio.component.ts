import { Component, Input, OnInit } from '@angular/core';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { ModalController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-elegir-ejercicio',
  templateUrl: './elegir-ejercicio.component.html',
  styleUrls: ['./elegir-ejercicio.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
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
      equipamiento: this.ejercicioSeleccionado.tipoPeso,
      series: this.series,
      repeticiones: this.repeticiones,
      notas: this.notas
    };
    this.modalController.dismiss(ejercicioConDetalles);
  }
}
