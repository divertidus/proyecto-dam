import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { DiaEntrenamiento, HistorialEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { Usuario } from 'src/app/models/usuario.model';
import { DiaEntrenamientoCardComponent } from 'src/app/componentes/shared/dia-entrenamiento-card/dia-entrenamiento-card.component';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonContent } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { PopoverController, ModalController } from '@ionic/angular';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { firstValueFrom, switchMap } from 'rxjs';
import { ToolbarModalesCancelarComponent } from '../../shared/toolbar-modales-cancelar/toolbar-modales-cancelar.component';

@Component({
  selector: 'app-historial-entrenamiento',
  templateUrl: './historial-entrenamiento.component.html',
  styleUrls: ['./historial-entrenamiento.component.scss'],
  standalone: true,
  imports: [IonContent, IonCardContent, FormsModule, IonCardTitle,
    IonCardHeader, IonCard, IonList, NgIf, NgFor,
    CommonModule, DiaEntrenamientoCardComponent, ToolbarModalesCancelarComponent],
  providers: [ModalController, PopoverController]
})
export class HistorialEntrenamientoComponent implements OnInit {
  entrenamientos: DiaEntrenamiento[] = []; // Almacena todos los entrenamientos
  usuarioLogeado: Usuario | null = null; // Almacena el usuario logeado
  entrenamientosExpandido: Set<number> = new Set<number>(); // Set para manejar entrenamientos expandidos
  //comparaciones: { [key: number]: any } = {}; // Almacena las comparaciones de los entrenamientos

  // Añadimos un mapa para almacenar los nombres de los ejercicios
  nombresEjercicios: { [id: string]: string } = {}

  tituloBarraSuperior: string = 'Historial Completo'; // Propiedad no de solo lectura

  constructor(
    private authService: AuthService,
    private historialService: HistorialService,
    private ejercicioService: EjercicioService
  ) { }

  async ngOnInit() {
    this.authService.usuarioLogeado$.subscribe(usuario => {
      if (usuario) {
        this.usuarioLogeado = usuario;
        this.suscribirHistorial(); // Nos suscribimos a los cambios en historial$
        this.cargarNombresEjercicios();
      }
    });
  }

  // Nos suscribimos a `historial$` del servicio para cargar y actualizar los entrenamientos
  suscribirHistorial() {
    this.historialService.historial$.subscribe(historiales => {
      console.log('Historial actualizado en historial$:', historiales);
      this.actualizarEntrenamientos(historiales);
    });
  }

  // Cargar y ordenar entrenamientos desde el historial actualizado
  actualizarEntrenamientos(historiales: HistorialEntrenamiento[]) {
    this.entrenamientos = historiales
      .map(historial => historial.entrenamientos)
      .flat()
      .sort(
        (a, b) =>
          new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime()
      );
    console.log("Estructura de entrenamientos cargados:", this.entrenamientos);
  }

  // Cargar todos los entrenamientos
  async cargarEntrenamientos() {
    try {
      if (!this.usuarioLogeado) return;

      // Obtener los historiales del usuario
      const historiales = await this.historialService.obtenerHistorialesPorUsuario(this.usuarioLogeado._id!);
      if (historiales.length === 0) {
        console.log('No hay entrenamientos registrados');
        return;
      }

      // Aplanar los entrenamientos de todos los historiales y asignarlos a `this.entrenamientos`
      this.entrenamientos = historiales.reduce((acc, historial) => {
        return acc.concat(historial.entrenamientos);
      }, [] as DiaEntrenamiento[]);

      // Verificar que todos los entrenamientos tengan un _id
      this.entrenamientos.forEach(entrenamiento => {
        if (!entrenamiento._id) {
          console.warn("El día de entrenamiento no tiene un ID:", entrenamiento);
        }
      });

      // Ordenar los entrenamientos por fecha
      this.entrenamientos.sort(
        (a, b) =>
          new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime()
      );

      console.log("Estructura de entrenamientos cargados:", this.entrenamientos);
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

  // Método para manejar la eliminación de un día

  async handleEliminarDia(diaEntrenamientoId: string) {
    console.log('Entrando en el handle de eliminarDia');
    if (!diaEntrenamientoId) {
      console.error("ID de día de entrenamiento no definido.");
      return;
    }
    console.log('En handleEliminarDia antes del const historialId = await this.obtenerHistorialIdPorDia(diaEntrenamientoId);');

    // Intentar cargar historiales si están vacíos
    let historialId = await this.obtenerHistorialIdPorDia(diaEntrenamientoId);

    if (!historialId) {
      console.warn('El arreglo de historiales está vacío o el historial específico no fue encontrado, recargando historiales...');
      await this.cargarEntrenamientos(); // Asegura que los datos estén cargados
      historialId = await this.obtenerHistorialIdPorDia(diaEntrenamientoId);
    }

    if (!historialId) {
      console.error("No se encontró un historial para el día de entrenamiento especificado.");
      return;
    }

    console.log('En handleEliminarDia antes del try');
    try {
      console.log('En handleEliminarDia dentro del try');
      await this.historialService.eliminarDiaEntrenamiento(historialId, diaEntrenamientoId);
      console.log(`Día con id ${diaEntrenamientoId} eliminado de la base de datos y del historial.`);

      // Recargar los entrenamientos desde la base de datos para mantener la sincronización
      await this.cargarEntrenamientos();
    } catch (error) {
      console.error('Error al eliminar el día de entrenamiento de la base de datos:', error);
    }
  }

  // Método auxiliar para obtener el ID del historial asociado a un día
  // Método auxiliar para obtener el ID del historial asociado a un día
  async obtenerHistorialIdPorDia(diaId: string): Promise<string | null> {
    console.log('Iniciando obtenerHistorialIdPorDia con diaId:', diaId);

    try {
      const historiales = await firstValueFrom(this.historialService.historial$); // Obtiene los historiales
      console.log('Historiales obtenidos:', historiales);

      const historial = historiales.find(h => {
        const encontrado = h.entrenamientos.some(dia => dia._id === diaId);
        console.log(`Verificando historial con ID ${h._id}, resultado de búsqueda para diaId ${diaId}:`, encontrado);
        return encontrado;
      });

      if (historial) {
        console.log('Historial encontrado con ID:', historial._id);
        return historial._id!;
      } else {
        console.warn('No se encontró un historial que contenga el día con ID:', diaId);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el historial:', error);
      return null;
    }
  }
}