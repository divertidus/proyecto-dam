import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface EntrenamientoState {
  enProgreso: boolean;
  rutinaId?: string;
  diaRutinaId?: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoEstadoService {
  private entrenamientoState = new BehaviorSubject<EntrenamientoState>({ enProgreso: false });
  entrenamientoState$ = this.entrenamientoState.asObservable();

  constructor() {
    // Mostrar el estado inicial en la consola
    console.log('Estado inicial del entrenamiento:', this.entrenamientoState.value);
  }

  comenzarEntrenamiento(rutinaId: string, diaRutinaId: string, descripcion: string) {
    const newState: EntrenamientoState = {
      enProgreso: true,
      rutinaId,
      diaRutinaId,
      descripcion
    };
    console.log('Intentando iniciar entrenamiento con datos:', newState);

    this.entrenamientoState.next(newState);

    // Confirmar el estado después de iniciar el entrenamiento
    console.log('Estado actualizado para iniciar entrenamiento:', this.entrenamientoState.value);
  }

  finalizarEntrenamiento() {
    console.log('Intentando finalizar entrenamiento');

    this.entrenamientoState.next({ enProgreso: false });

    // Confirmar el estado después de finalizar el entrenamiento
    console.log('Estado actualizado para finalizar entrenamiento:', this.entrenamientoState.value);
  }

  obtenerEstadoActual(): EntrenamientoState {
    // Confirmar el estado al acceder a él
    console.log('Estado actual obtenido:', this.entrenamientoState.value);
    return this.entrenamientoState.value;
  }
}
