/* Tab3Page.page.ts */

import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { DiaEntrenamiento, Usuario } from 'src/app/interfaces/posiblesNuevasEntidades';
import { HistorialService } from 'src/app/services/historial-entreno.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [NgIf, NgFor, IonicModule, CommonModule],
})
export class Tab3Page implements OnInit {
  ultimoEntrenamiento: DiaEntrenamiento | null = null; // Almacena el último entrenamiento
  usuarioLogeado: Usuario | null = null; // Almacena el usuario logeado

  constructor(
    private authService: AuthService, // Inyectamos el AuthService para obtener el usuario logeado
    private historialService: HistorialService // Inyectamos el HistorialService para obtener el historial
  ) { }

  async ngOnInit() {
    // Suscribirse al observable del usuario logeado
    this.authService.usuarioLogeado$.subscribe(async (usuario) => {
      if (usuario) {
        this.usuarioLogeado = usuario; // Guardamos el usuario logeado
        await this.cargarUltimoEntrenamiento(); // Cargamos el último entrenamiento
      }
    });
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

      // Encontramos el entrenamiento más reciente (último por fecha)
      historiales.sort((a, b) => new Date(b.entrenamientos[0].fechaEntrenamiento).getTime() - new Date(a.entrenamientos[0].fechaEntrenamiento).getTime());
      this.ultimoEntrenamiento = historiales[0].entrenamientos[0]; // Tomamos el entrenamiento más reciente
    } catch (error) {
      console.error('Error al cargar el último entrenamiento:', error);
    }
  }
}