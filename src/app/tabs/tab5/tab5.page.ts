import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToolbarLoggedComponent } from 'src/app/componentes/shared/toolbar-logged/toolbar-logged.component';
import { IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { PopoverController, ModalController } from '@ionic/angular';
import { HistoriaEntrenamientoComponent } from 'src/app/componentes/shared/historial-entrenamiento/historial-entrenamiento.component'; // Cambia a HistoriaEntrenamientoComponent

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    IonContent,
    ToolbarLoggedComponent,
    HistoriaEntrenamientoComponent
  ],
  providers: [ModalController, PopoverController]
})
export class Tab5Page implements OnInit {
  constructor() { }

  async ngOnInit() {
    // Cualquier lógica adicional
  }
}
