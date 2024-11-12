/* filtro-ejercicio.component.ts */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonList, IonItem, IonCheckbox, IonLabel, IonButton, PopoverController } from "@ionic/angular/standalone";

@Component({
  selector: 'app-filtro-ejercicio',
  templateUrl: './filtro-ejercicio.component.html',
  styleUrls: ['./filtro-ejercicio.component.scss'],
  standalone: true,
  imports: [IonList, IonItem, IonCheckbox, IonLabel, FormsModule]
})
export class FiltroEjercicioComponent {

  constructor(private popoverController: PopoverController) { }


  @Output() aplicarFiltros = new EventEmitter<{ tipoPeso: TipoPesoFiltro; musculoPrincipal: MusculoPrincipalFiltro }>();
  @Input() filtroTipoPeso: TipoPesoFiltro = {
    Barra: false,
    Mancuernas: false,
    Máquina: false,
    "Peso Corporal": false,
  };

  // `filtroMusculo` es dinámico y puede tener cualquier clave
  @Input() filtroMusculoPrincipal: MusculoPrincipalFiltro = {
    Pecho: false,
    Espalda: false,
    Hombro: false,
    Pierna: false,
    Bíceps: false,
    Tríceps: false,
  };


  emitirFiltros() {
    // Emitir los filtros seleccionados cada vez que se actualiza un checkbox
    this.aplicarFiltros.emit({ tipoPeso: this.filtroTipoPeso, musculoPrincipal: this.filtroMusculoPrincipal });
  }


  async onAplicarFiltros() {
    this.aplicarFiltros.emit({ tipoPeso: this.filtroTipoPeso, musculoPrincipal: this.filtroMusculoPrincipal });
    await this.popoverController.dismiss();
  }
}



// Define un tipo específico para Tipo de Peso y Grupo Muscular
export type TipoPesoFiltro = {
  Barra: boolean;
  Mancuernas: boolean;
  Máquina: boolean;
  "Peso Corporal": boolean;
};

export type MusculoPrincipalFiltro = {
  [key: string]: boolean; // Permite cualquier cadena como clave, p. ej., "pecho", "cuádriceps", etc.
};
