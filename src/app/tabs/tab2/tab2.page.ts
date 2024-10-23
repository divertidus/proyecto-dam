//tab2.page.ts
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { GestionEjerciciosComponent } from "../../componentes/ejercicio/gestion-ejercicios/gestion-ejercicios.component";
import { ToolbarLoggedComponent } from 'src/app/componentes/shared/toolbar-logged/toolbar-logged.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, GestionEjerciciosComponent,ToolbarLoggedComponent]
})
export class Tab2Page {

  constructor() { }

}
