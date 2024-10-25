import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { DiaEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { Usuario } from 'src/app/models/usuario.model';
import { DiaEntrenamientoCardComponent } from 'src/app/componentes/shared/dia-entrenamiento-card/dia-entrenamiento-card.component';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { PopoverController, ModalController } from '@ionic/angular';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';

@Component({
  selector: 'app-historial-entrenamiento',
  templateUrl: './historial-entrenamiento.component.html',
  styleUrls: ['./historial-entrenamiento.component.scss'],
  standalone: true,
  imports: [IonCardContent, FormsModule, IonCardTitle, IonCardHeader, IonCard, IonList, NgIf, NgFor, CommonModule, DiaEntrenamientoCardComponent],
  providers: [ModalController, PopoverController]
})
export class HistorialEntrenamientoComponent implements OnInit {
  entrenamientos: DiaEntrenamiento[] = []; // Almacena todos los entrenamientos
  usuarioLogeado: Usuario | null = null; // Almacena el usuario logeado
  entrenamientosExpandido: Set<number> = new Set<number>(); // Set para manejar entrenamientos expandidos
  comparaciones: { [key: number]: any } = {}; // Almacena las comparaciones de los entrenamientos

  // Añadimos un mapa para almacenar los nombres de los ejercicios
  nombresEjercicios: { [id: string]: string } = {}

  constructor(
    private authService: AuthService,
    private historialService: HistorialService,
    private ejercicioService: EjercicioService
  ) { }

  async ngOnInit() {
    this.authService.usuarioLogeado$.subscribe(async (usuario) => {
      if (usuario) {
        this.usuarioLogeado = usuario;
        await this.cargarNombresEjercicios(); // Cargar nombres de ejercicios
        await this.cargarEntrenamientos();
      }
    });

    // Suscribirse al observable de cambios en el historial
    this.historialService.historial$.subscribe(async () => {
      await this.cargarEntrenamientos(); // Recargar los entrenamientos cuando el historial cambie
    });
  }

  // Cargar todos los entrenamientos
  async cargarEntrenamientos() {
    try {
      if (!this.usuarioLogeado) return;

      this.entrenamientos = []; // Limpiar entrenamientos antes de recargar

      const historiales = await this.historialService.obtenerHistorialesPorUsuario(this.usuarioLogeado._id!);
      if (historiales.length === 0) {
        console.log('No hay entrenamientos registrados');
        return;
      }

      this.entrenamientos = historiales.flatMap(h => h.entrenamientos);
      this.entrenamientos.sort(
        (a, b) =>
          new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime()
      );
    } catch (error) {
      console.error('Error al cargar los entrenamientos:', error);
    }
}


  // Cargar los nombres de los ejercicios en el mapa `nombresEjercicios`
  async cargarNombresEjercicios() {
    const ejercicios = await this.ejercicioService.obtenerEjercicios();
    ejercicios.forEach(ejercicio => {
      this.nombresEjercicios[ejercicio._id] = ejercicio.nombre;
    });
  }

  // Método para obtener el nombre del ejercicio usando su ID
  obtenerNombreEjercicio(ejercicioId: string): string {
    return this.nombresEjercicios[ejercicioId] || 'Ejercicio desconocido';
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

}