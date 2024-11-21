import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle, IonList
} from '@ionic/angular/standalone';
import { NgCalendarModule } from 'ionic2-calendar'; // Importa el componente del calendario
import { CalendarMode } from 'ionic2-calendar';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service'; // Importa el servicio para obtener el historial
import { Usuario } from 'src/app/models/usuario.model'; // Importa el modelo de Usuario
import { AuthService } from 'src/app/auth/auth.service'; // Importa el servicio de autenticación
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { DiaEntrenamiento, HistorialEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { DiaEntrenamientoCardComponent } from '../../shared/dia-entrenamiento-card/dia-entrenamiento-card.component';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';

@Component({
  selector: 'app-calendario-historial',
  templateUrl: './calendario-historial.component.html',
  styleUrls: ['./calendario-historial.component.scss'],
  standalone: true,
  imports: [IonList,
    NgIf,
    NgFor,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    NgCalendarModule,
    CommonModule, DiaEntrenamientoCardComponent
  ],
})
export class CalendarioHistorialComponent implements OnInit {

  selectedEvent: any = null; // Nueva propiedad para almacenar el evento seleccionado
  eventSource: any[] = []; // Eventos para el calendario
  entrenamientos: DiaEntrenamiento[] = []; // Todos los entrenamientos
  entrenamientosFiltrados: DiaEntrenamiento[] = []; // Entrenamientos filtrados por día
  usuarioLogeado: Usuario | null = null; // Usuario autenticado
  nombresEjercicios: { [id: string]: string } = {}; // Mapa de nombres de ejercicios
  expandido: Set<number> = new Set(); // Control para expandir/contraer tarjetas
  monthTitle: string = 'ASD'; // Declaración de la propiedad
  fechaSeleccionada: string = ''; // Fecha seleccionada para mostrar el mensaje

  calendar = {
    mode: 'month' as CalendarMode,
    currentDate: new Date(), // Fecha actual
  };

  constructor(
    private authService: AuthService,
    private historialService: HistorialService,
    private ejercicioService: EjercicioService
  ) { }

  ngOnInit(): void {
    this.authService.usuarioLogeado$.subscribe(usuario => {
      if (usuario) {
        this.usuarioLogeado = usuario;
        this.suscribirHistorial();
        this.cargarNombresEjercicios();
      }
    });
  }

  // Suscribirse al historial$ para obtener entrenamientos
  // Sincronizar dinámicamente el calendario con el historial actualizado
  suscribirHistorial(): void {
    this.historialService.historial$.subscribe(historiales => {
      // Aplanar entrenamientos y sincronizar calendario
      this.entrenamientos = historiales
        .flatMap(historial => historial.entrenamientos)
        .sort((a, b) => new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime());

      // Mapear entrenamientos a eventos del calendario
      this.eventSource = this.entrenamientos.map(entrenamiento => ({
        id: entrenamiento._id,
        title: entrenamiento.nombreRutinaEntrenamiento,
        startTime: new Date(entrenamiento.fechaEntrenamiento),
        endTime: new Date(new Date(entrenamiento.fechaEntrenamiento).getTime() + 60 * 60 * 1000),
        allDay: false,
        entrenamiento,
      }));

      console.log('Eventos del calendario:', this.eventSource);
    });
  }

  // Cargar nombres de ejercicios
  async cargarNombresEjercicios(): Promise<void> {
    const ejercicios = await this.ejercicioService.obtenerEjercicios();
    ejercicios.forEach(ejercicio => {
      this.nombresEjercicios[ejercicio._id] = ejercicio.nombre;
    });
  }

  // Obtener el nombre de un ejercicio dado su ID
  obtenerNombreEjercicio(ejercicioId: string): string {
    return this.nombresEjercicios[ejercicioId] || 'Ejercicio desconocido';
  }

  // Actualizar los entrenamientos desde el historial
  actualizarEntrenamientos(historiales: HistorialEntrenamiento[]): void {
    this.entrenamientos = historiales
      .flatMap(historial => historial.entrenamientos)
      .sort(
        (a, b) =>
          new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime()
      );
    console.log('Entrenamientos cargados:', this.entrenamientos);

    // Mapear los entrenamientos para el calendario
    this.eventSource = this.entrenamientos.map(entrenamiento => ({
      id: entrenamiento._id,
      title: entrenamiento.nombreRutinaEntrenamiento,
      startTime: new Date(entrenamiento.fechaEntrenamiento),
      endTime: new Date(
        new Date(entrenamiento.fechaEntrenamiento).getTime() + 60 * 60 * 1000
      ),
      allDay: false,
      entrenamiento,
    }));
    console.log('Eventos del calendario:', this.eventSource);
  }





  //Detectar eventos seleccionados
  onEventSelected(event: any): void {
  /*   console.log('Evento seleccionado:', event); // Verifica lo que devuelve el calendario
    if (event?.entrenamiento) {
      this.selectedEvent = event.entrenamiento; // Accedemos al objeto completo del entrenamiento
      console.log('Entrenamiento seleccionado:', this.selectedEvent);
    } else {
      console.log('No hay entrenamiento seleccionado');
    } */
  }


  // Manejar la selección de un día en el calendario
  onTimeSelected(event: any): void {
    const fechaSeleccionada = new Date(event.selectedTime).toISOString().split('T')[0]; // Solo fecha
    this.fechaSeleccionada = fechaSeleccionada;

    // Filtrar entrenamientos que coincidan con la fecha seleccionada
    this.entrenamientosFiltrados = this.entrenamientos.filter(entrenamiento => {
      const fechaEntrenamiento = new Date(entrenamiento.fechaEntrenamiento).toISOString().split('T')[0];
      return fechaEntrenamiento === fechaSeleccionada;
    });

    console.log('Fecha seleccionada:', this.fechaSeleccionada);
    console.log('Entrenamientos filtrados:', this.entrenamientosFiltrados);
  }




  onTitleChanged(event: any): void {
    this.monthTitle = event.title; // Actualiza dinámicamente el mes
    console.log('Mes actual:', this.monthTitle);
  }

  onRangeChanged(event: any): void {
    console.log('Rango cambiado:', event);
  }

  // Permitir seleccionar días pasados, actuales y futuros
  markDisabled = (date: Date): boolean => {
    const currentDate = new Date();
    const fechaActual = currentDate.toISOString().split('T')[0];
    const fechaCalendario = date.toISOString().split('T')[0];

    // Permitir seleccionar días pasados con entrenamientos
    const tieneEntrenamiento = this.entrenamientos.some(entrenamiento => {
      const fechaEntrenamiento = new Date(entrenamiento.fechaEntrenamiento).toISOString().split('T')[0];
      return fechaEntrenamiento === fechaCalendario;
    });

    // Permitir días futuros y días con entrenamiento
    return fechaCalendario < fechaActual && !tieneEntrenamiento;
  };

  // Expandir o contraer una tarjeta de entrenamiento
  toggleEntrenamiento(index: number): void {
    console.log(`Toggling entrenamiento para el índice: ${index}`);
    if (this.expandido.has(index)) {
      this.expandido.delete(index); // Contraer
    } else {
      this.expandido.add(index); // Expandir
    }
  }

  // Verificar si una tarjeta está expandida
  isExpandido(index: number): boolean {
    return this.expandido.has(index);
  }

  handleEliminarDia(diaEntrenamientoId: string): void {
    console.log(`Eliminar día con ID: ${diaEntrenamientoId}`);
    // Implementa la lógica para eliminar un día
  }
}
