import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { EjercicioService } from './services/ejercicio.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private ejercicioService: EjercicioService,
    private authService: AuthService) { }

  ngOnInit() {
    this.ejercicioService.inicializarEjercicios(); // Inicializar los ejercicios al cargar la aplicación
    this.authService.autoLoginPrimerUsuario();
  }
}
