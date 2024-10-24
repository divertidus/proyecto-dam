// services/entrenamiento.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DiaEntrenamiento } from 'src/app/models/historial-entrenamiento';

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoService {
  // BehaviorSubject para almacenar el entrenamiento en curso.
  private entrenamientoEnProgreso = new BehaviorSubject<DiaEntrenamiento | null>(null);
  // Observable para que otras partes de la app puedan observar cambios en el entrenamiento en curso.
  entrenamientoEnProgreso$ = this.entrenamientoEnProgreso.asObservable();

  // Método para iniciar un entrenamiento y guardarlo en el localStorage
  comenzarEntrenamiento(diaEntrenamiento: DiaEntrenamiento) {
    this.entrenamientoEnProgreso.next(diaEntrenamiento);
    localStorage.setItem('entrenamientoActual', JSON.stringify(diaEntrenamiento));
  }

  // Método para guardar el entrenamiento (es decir, finalizarlo)
  guardarEntrenamiento() {
    this.entrenamientoEnProgreso.next(null);
    localStorage.removeItem('entrenamientoActual');
  }

  // Método para cargar un entrenamiento guardado del localStorage
  cargarEntrenamientoGuardado() {
    const data = localStorage.getItem('entrenamientoActual');
    if (data) {
      this.entrenamientoEnProgreso.next(JSON.parse(data));
    }
  }
}