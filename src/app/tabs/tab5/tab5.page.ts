// tab5.page.ts
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ToolbarLoggedComponent } from 'src/app/componentes/shared/toolbar-logged/toolbar-logged.component';
import { HistorialEntrenamientoComponent } from 'src/app/componentes/shared/historial-entrenamiento/historial-entrenamiento.component';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [NgIf, NgFor, IonicModule, CommonModule,
    HistorialEntrenamientoComponent,
    ToolbarLoggedComponent],
})
export class Tab5Page implements OnInit {


  constructor(
  ) { }

  async ngOnInit() {
  }
}