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

@Component({
  selector: 'app-ultimo-entreno',
  templateUrl: './ultimo-entreno.component.html',
  styleUrls: ['./ultimo-entreno.component.scss'],
  standalone: true,
  imports: [IonCardContent, FormsModule, IonCardTitle, IonCardHeader, IonCard, NgIf, NgFor, CommonModule, DiaEntrenamientoCardComponent],
  providers: [ModalController, PopoverController]
})
export class UltimoEntrenoComponent implements OnInit {
  ultimoEntrenamiento: DiaEntrenamiento | null = null; // Almacena el último entrenamiento
  usuarioLogeado: Usuario | null = null; // Almacena el usuario logeado  
  expandido: boolean = false; // Inicialmente expandido

  constructor(
    private authService: AuthService, // Inyectamos el AuthService para obtener el usuario logeado
    private historialService: HistorialService // Inyectamos el HistorialService para obtener el historial
  ) { }

  async ngOnInit() {
    // Suscribirse al observable del usuario logeado
    this.authService.usuarioLogeado$.subscribe(async (usuario) => {
      // Reiniciar los datos cuando el usuario cambia
      this.ultimoEntrenamiento = null;     
      this.expandido = false;

      if (usuario) {
        this.usuarioLogeado = usuario; // Guardamos el usuario logeado
        await this.cargarUltimoEntrenamiento(); // Cargamos el último entrenamiento
      } else {
        this.usuarioLogeado = null;
      }
    });


    // Suscribirse a los cambios del historial y recargar el último entrenamiento
    this.historialService.historial$.subscribe(async () => {
      await this.cargarUltimoEntrenamiento();
    });
  }

  toggleEntrenamiento() {
    this.expandido = !this.expandido; // Alterna entre expandido y contraído
  }

  // Método para cargar el último entrenamiento del usuario logeado
  async cargarUltimoEntrenamiento() {
    try {
      if (!this.usuarioLogeado) return;

      // Obtenemos el historial del usuario
      const historiales = await this.historialService.obtenerHistorialesPorUsuario(this.usuarioLogeado._id!);
      if (historiales.length === 0) {
        console.log('No hay entrenamientos registrados');
        return;
      }

      // Ordenamos los historiales por fecha
      historiales.sort(
        (a, b) =>
          new Date(b.entrenamientos[0].fechaEntrenamiento).getTime() -
          new Date(a.entrenamientos[0].fechaEntrenamiento).getTime()
      );

      // Cargamos el último entrenamiento
      this.ultimoEntrenamiento = historiales[0].entrenamientos[0];

    } catch (error) {
      console.error('Error al cargar el último entrenamiento:', error);
    }
  }
}
