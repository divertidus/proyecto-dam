import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface EntrenamientoState {
  enProgreso: boolean;
  pausado: boolean;
  rutinaId?: string;
  diaRutinaId?: string;
  descripcion?: string;
  diaRutinaNombre?: string;
  tiempoAcumulado?: number; // Tiempo total acumulado en minutos
  datosEntrenamiento?: any; // Estado actual del entrenamiento
  timestampInicio?: string; // Hora de inicio actual
  timestampUltimaPausa?: string; // Última hora registrada al pausar
}

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoEstadoService {
  private entrenamientoState = new BehaviorSubject<EntrenamientoState>({
    enProgreso: false,
    pausado: false
  });
  entrenamientoState$ = this.entrenamientoState.asObservable();

  constructor() {
    // Cargar el estado desde el LocalStorage al iniciar el servicio
    this.cargarEstadoDesdeLocalStorage();
    console.log('Estado inicial del entrenamiento:', this.entrenamientoState.value);
  }

  // Iniciar un entrenamiento
  comenzarEntrenamiento(rutinaId: string, diaRutinaId: string, descripcion: string, diaRutinaNombre: string) {
    const newState: EntrenamientoState = {
      enProgreso: true,
      pausado: false,
      rutinaId,
      diaRutinaId,
      descripcion,
      diaRutinaNombre
    };
    console.log('Intentando iniciar entrenamiento con datos:', newState);
    this.entrenamientoState.next(newState);
    this.guardarEstadoEnLocalStorage();
    console.log('Estado actualizado para iniciar entrenamiento:', this.entrenamientoState.value);
  }

  // Finalizar un entrenamiento
  finalizarEntrenamiento() {
    console.log('Intentando finalizar entrenamiento');
    this.entrenamientoState.next({ enProgreso: false, pausado: false });
    this.guardarEstadoEnLocalStorage();
    console.log('Estado actualizado para finalizar entrenamiento:', this.entrenamientoState.value);
  }

  // Pausar un entrenamiento
  pausarEntrenamiento() {
    const estadoActual = this.entrenamientoState.value;
    if (estadoActual.enProgreso) {
      this.entrenamientoState.next({
        ...estadoActual,
        enProgreso: false,
        pausado: true
      });
      this.guardarEstadoEnLocalStorage();
      console.log('Entrenamiento pausado:', this.entrenamientoState.value);
    }
  }

  // Reanudar un entrenamiento
  reanudarEntrenamiento() {
    const estadoActual = this.entrenamientoState.value;
    if (estadoActual.pausado) {
      this.entrenamientoState.next({
        ...estadoActual,
        enProgreso: true,
        pausado: false
      });
      this.guardarEstadoEnLocalStorage();
      console.log('Entrenamiento reanudado:', this.entrenamientoState.value);
    }
  }

  // Obtener el estado actual
  obtenerEstadoActual(): EntrenamientoState {
    console.log('Estado actual obtenido:', this.entrenamientoState.value);
    return this.entrenamientoState.value;
  }

  // Guardar el estado en LocalStorage
  private guardarEstadoEnLocalStorage(): void {
    const estadoActual = this.entrenamientoState.value;
    localStorage.setItem('estadoEntrenamiento', JSON.stringify(estadoActual));
    console.log('Estado guardado en LocalStorage:', estadoActual);
  }

  // Cargar el estado desde LocalStorage
  private cargarEstadoDesdeLocalStorage(): void {
    const estadoGuardado = localStorage.getItem('estadoEntrenamiento');
    if (estadoGuardado) {
      const estado: EntrenamientoState = JSON.parse(estadoGuardado);
      this.entrenamientoState.next(estado);
      console.log('Estado cargado desde LocalStorage:', estado);
    }
  }
}

