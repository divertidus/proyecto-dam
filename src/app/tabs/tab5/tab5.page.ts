/* tab5.page.ts  */
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToolbarLoggedComponent } from 'src/app/componentes/shared/toolbar-logged/toolbar-logged.component';
import { HistorialEntrenamientoComponent } from 'src/app/componentes/shared/historial-entrenamiento/historial-entrenamiento.component';
import { IonContent } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { PopoverController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonContent, NgIf, NgFor, CommonModule,
    HistorialEntrenamientoComponent,
    ToolbarLoggedComponent, FormsModule],
  providers: [ModalController, PopoverController]
})
export class Tab5Page implements OnInit {


  constructor(
  ) { }

  async ngOnInit() {
  }
}