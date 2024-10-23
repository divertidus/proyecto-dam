// tab5.page.ts
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { DiaEntrenamiento, Usuario } from 'src/app/interfaces/posiblesNuevasEntidades';
import { HistorialService } from 'src/app/services/historial-entreno.service';
import { IonicModule } from '@ionic/angular';
import { ToolbarLoggedComponent } from 'src/app/componentes/toolbar-logged/toolbar-logged.component';


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

  // Método para cargar todos los entrenamientos del usuario logeado
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
}