import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { EjercicioService } from './services/ejercicio.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private ejercicioService: EjercicioService) { }

  ngOnInit() {
    this.ejercicioService.inicializarEjercicios(); // Inicializar los ejercicios al cargar la aplicación
  }
}
