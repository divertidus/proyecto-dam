//tab2.page.ts
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { GestionEjerciciosComponent } from "../componentes/gestion-ejercicios/gestion-ejercicios.component";

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, GestionEjerciciosComponent]
})
export class Tab2Page {

  constructor() {}

}
