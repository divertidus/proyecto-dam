import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { HistorialService } from 'src/app/services/historial-entreno.service';
import { DiaEntrenamiento } from 'src/app/models/historial-entreno';
import { Usuario } from 'src/app/models/usuario.model';
import { DiaEntrenamientoCardComponent } from 'src/app/componentes/shared/dia-entrenamiento-card/dia-entrenamiento-card.component';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-historial-entrenamiento',
  templateUrl: './historial-entrenamiento.component.html',
  styleUrls: ['./historial-entrenamiento.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, IonicModule, CommonModule, DiaEntrenamientoCardComponent],
})
export class HistorialEntrenamientoComponent implements OnInit {
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
    for (let i = actualIndex - 1; i >= 0; i--) {
      const entrenamiento = this.entrenamientos[i];

      if (entrenamiento.diaRutinaId === diaRutinaId) {
        const ejercicioAnterior = entrenamiento.ejercicios.find(e => e.ejercicioId === ejercicioId);

        if (ejercicioAnterior && ejercicioAnterior.series.length > 0) {
          return ejercicioAnterior; // Devolver el ejercicio anterior si tiene al menos una serie
        }
      }
    }

    return null;
  }

  // Método para comparar los datos de dos entrenamientos
  compararDatos(actual: DiaEntrenamiento, anterior: DiaEntrenamiento) {
    const comparacion = {
      ejercicios: []
    };

    for (let i = 0; i < actual.ejercicios.length; i++) {
      const ejercicioActual = actual.ejercicios[i];

      const ejercicioAnterior = this.buscarEjercicioAnterior(
        ejercicioActual.ejercicioId,
        this.entrenamientos.indexOf(actual),
        actual.diaRutinaId
      );

      const comparacionEjercicio = {
        ejercicioId: ejercicioActual.ejercicioId,
        seriesActual: ejercicioActual.series,
        seriesAnterior: ejercicioAnterior ? ejercicioAnterior.series : [],
        notasActual: ejercicioActual.notas,
        notasAnterior: ejercicioAnterior ? ejercicioAnterior.notas : null
      };

      comparacion.ejercicios.push(comparacionEjercicio);
    }

    return comparacion;
  }
}