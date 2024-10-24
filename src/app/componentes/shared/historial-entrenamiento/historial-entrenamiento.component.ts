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

  constructor(
    private authService: AuthService,
    private historialService: HistorialService
  ) { }

  async ngOnInit() {
    this.authService.usuarioLogeado$.subscribe(async (usuario) => {
      if (usuario) {
        this.usuarioLogeado = usuario;
        await this.cargarEntrenamientos();
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

      // Ordenamos los entrenamientos por fecha (en formato descendente, es decir, más recientes primero)
      this.entrenamientos.sort(
        (a, b) =>
          new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime()
      );
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

}