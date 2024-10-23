// tab5.page.ts
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { HistorialService } from 'src/app/services/historial-entreno.service';
import { IonicModule } from '@ionic/angular';
import { ToolbarLoggedComponent } from 'src/app/componentes/toolbar-logged/toolbar-logged.component';
import { DiaEntrenamiento } from 'src/app/models/historial-entreno';
import { Usuario } from 'src/app/models/usuario.model';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [NgIf, NgFor, IonicModule, CommonModule, ToolbarLoggedComponent],
})
export class Tab5Page implements OnInit {
  entrenamientos: DiaEntrenamiento[] = []; // Almacena todos los entrenamientos
  usuarioLogeado: Usuario | null = null; // Almacena el usuario logeado
  entrenamientosExpandido: Set<number> = new Set<number>(); // Set para manejar entrenamientos expandidos
  comparaciones: { [key: number]: any } = {}; // Almacena las comparaciones de los entrenamientos

  constructor(
    private authService: AuthService,
    private historialService: HistorialService
  ) { }

  async ngOnInit() {
    this.authService.usuarioLogeado$.subscribe(async (usuario) => {
      if (usuario) {
        this.usuarioLogeado = usuario;
        await this.cargarEntrenamientos();
        this.compararEntrenamientos(); // Realiza la comparación de entrenamientos
      }
    });
  }

  // Cargar todos los entrenamientos
  async cargarEntrenamientos() {
    try {
      if (!this.usuarioLogeado) return;

      // Obtenemos el historial del usuario
      const historiales = await this.historialService.obtenerHistorialesPorUsuario(this.usuarioLogeado._id!);
      if (historiales.length === 0) {
        console.log('No hay entrenamientos registrados');
        return;
      }

      // Aplanamos los entrenamientos
      this.entrenamientos = historiales.flatMap(h => h.entrenamientos);
    } catch (error) {
      console.error('Error al cargar los entrenamientos:', error);
    }
  }

  // Método para expandir o contraer el entrenamiento
  toggleEntrenamiento(index: number) {
    if (this.entrenamientosExpandido.has(index)) {
      this.entrenamientosExpandido.delete(index); // Contraer
    } else {
      this.entrenamientosExpandido.add(index); // Expandir
    }
  }

  // Método para verificar si el entrenamiento está expandido
  isExpandido(index: number): boolean {
    return this.entrenamientosExpandido.has(index);
  }

  // Método para comparar entrenamientos del mismo día de rutina
  compararEntrenamientos() {
    // Iterar sobre cada entrenamiento
    for (let i = 0; i < this.entrenamientos.length; i++) {
      const entrenamientoActual = this.entrenamientos[i];

      // Buscar el entrenamiento anterior más cercano con el mismo día de rutina
      const entrenamientoAnterior = this.buscarEntrenamientoAnterior(entrenamientoActual, i);

      if (entrenamientoAnterior) {
        this.comparaciones[i] = this.compararDatos(entrenamientoActual, entrenamientoAnterior); // Guardar la comparación
      }
    }
  }

  // Método para buscar el entrenamiento anterior más cercano con el mismo día de rutina
  buscarEntrenamientoAnterior(actual: DiaEntrenamiento, actualIndex: number): DiaEntrenamiento | null {
    for (let i = actualIndex - 1; i >= 0; i--) {
      const entrenamiento = this.entrenamientos[i];
      if (entrenamiento.diaRutinaId === actual.diaRutinaId) {
        return entrenamiento;
      }
    }
    return null; // Si no se encuentra un entrenamiento anterior
  }

  // Método para buscar el ejercicio anterior más cercano en cualquier entrenamiento
  buscarEjercicioAnterior(ejercicioId: string, actualIndex: number, diaRutinaId: string) {
    // Buscar entrenamiento con el mismo día de rutina y que contenga el ejercicio correspondiente
    for (let i = actualIndex - 1; i >= 0; i--) {
      const entrenamiento = this.entrenamientos[i];

      // Si es el mismo día de rutina
      if (entrenamiento.diaRutinaId === diaRutinaId) {
        const ejercicioAnterior = entrenamiento.ejercicios.find(e => e.ejercicioId === ejercicioId);

        // Comprobar si el ejercicio tiene al menos una serie hecha
        if (ejercicioAnterior && ejercicioAnterior.series.length > 0) {
          return ejercicioAnterior; // Devolver el ejercicio anterior si tiene al menos una serie
        }
      }
    }

    return null; // Si no se encuentra un ejercicio anterior con series
  }

  // Método para comparar los datos de dos entrenamientos
  compararDatos(actual: DiaEntrenamiento, anterior: DiaEntrenamiento) {
    const comparacion = {
      ejercicios: []
    };

    // Iterar sobre los ejercicios del entrenamiento actual
    for (let i = 0; i < actual.ejercicios.length; i++) {
      const ejercicioActual = actual.ejercicios[i];

      // Llamar a buscarEjercicioAnterior con el ejercicioId
      const ejercicioAnterior = this.buscarEjercicioAnterior(
        ejercicioActual.ejercicioId,
        this.entrenamientos.indexOf(actual),
        actual.diaRutinaId
      );

      const comparacionEjercicio = {
        ejercicioId: ejercicioActual.ejercicioId,
        seriesActual: ejercicioActual.series,
        seriesAnterior: ejercicioAnterior ? ejercicioAnterior.series : [], // Usar las series del ejercicio anterior si lo hay
        notasActual: ejercicioActual.notas, // Incluimos las notas del ejercicio actual
        notasAnterior: ejercicioAnterior ? ejercicioAnterior.notas : null // Notas del ejercicio anterior
      };

      comparacion.ejercicios.push(comparacionEjercicio);
    }

    return comparacion;
  }
}