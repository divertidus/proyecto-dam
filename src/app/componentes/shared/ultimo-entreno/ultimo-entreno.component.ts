/* ultimo-entreno.component.html */
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { DiaEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { Usuario } from 'src/app/models/usuario.model';
import { DiaEntrenamientoCardComponent } from 'src/app/componentes/shared/dia-entrenamiento-card/dia-entrenamiento-card.component';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { PopoverController, ModalController } from '@ionic/angular';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';

@Component({
  selector: 'app-ultimo-entreno',
  templateUrl: './ultimo-entreno.component.html',
  styleUrls: ['./ultimo-entreno.component.scss'],
  standalone: true,
  imports: [IonCardContent, FormsModule, IonCardTitle, IonCardHeader, IonCard, NgIf, CommonModule, DiaEntrenamientoCardComponent],
  providers: [ModalController, PopoverController]
})
export class UltimoEntrenoComponent implements OnInit {
  ultimoEntrenamiento: DiaEntrenamiento | null = null; // Almacena el último entrenamiento
  usuarioLogeado: Usuario | null = null; // Almacena el usuario logeado  
  expandido: boolean = false; // Inicialmente expandido
  nombresEjercicios: { [id: string]: string } = {};

  constructor(
    private authService: AuthService, // Inyectamos el AuthService para obtener el usuario logeado
    private historialService: HistorialService, // Inyectamos el HistorialService para obtener el historial
    private ejercicioService: EjercicioService
  ) { }

  async ngOnInit() {
    // Suscribirse al usuario logeado y al historial de entrenamientos
    this.authService.usuarioLogeado$.subscribe(async (usuario) => {
      this.usuarioLogeado = usuario || null;
      if (usuario) {
        await this.cargarNombresEjercicios(); // Cargar nombres de ejercicios una vez

        // Suscripción al historial de entrenamientos
        this.historialService.historial$.subscribe((historiales) => {
          this.actualizarUltimoEntrenamiento(historiales);
        });
      }
    });
  }

  async cargarNombresEjercicios() {
    const ejercicios = await this.ejercicioService.obtenerEjercicios();
    ejercicios.forEach((ejercicio) => {
      this.nombresEjercicios[ejercicio._id] = ejercicio.nombre;
    });
  }

  obtenerNombreEjercicio(ejercicioId: string): string {
    return this.nombresEjercicios[ejercicioId] || 'Ejercicio desconocido';
  }

  toggleEntrenamiento() {
    this.expandido = !this.expandido;
  }

  actualizarUltimoEntrenamiento(historiales: any[]) {
    if (historiales.length === 0) {
      this.ultimoEntrenamiento = null;
      console.log('No hay entrenamientos registrados');
      return;
    }

    const todosLosEntrenamientos = historiales.map((historial) => historial.entrenamientos).flat();
    todosLosEntrenamientos.sort((a, b) =>
      new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime()
    );

    this.ultimoEntrenamiento = todosLosEntrenamientos[0];
    console.log('Último entrenamiento actualizado:', this.ultimoEntrenamiento);
  }
}