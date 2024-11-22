import { Component, OnInit, ViewChild } from '@angular/core';
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
import { CalendarComponent } from 'ionic2-calendar';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service'; // Importa el servicio para obtener el historial
import { Usuario } from 'src/app/models/usuario.model'; // Importa el modelo de Usuario
import { AuthService } from 'src/app/auth/auth.service'; // Importa el servicio de autenticación
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { DiaEntrenamiento, HistorialEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { DiaEntrenamientoCardComponent } from '../../shared/dia-entrenamiento-card/dia-entrenamiento-card.component';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);


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
    IonToolbar,
    IonTitle,
    NgCalendarModule,
    CommonModule, DiaEntrenamientoCardComponent
  ],
})
export class CalendarioHistorialComponent implements OnInit {
  @ViewChild(CalendarComponent) calendarComponent: CalendarComponent;


  selectedEvent: any = null; // Nueva propiedad para almacenar el evento seleccionado
  eventSource: any[] = []; // Eventos para el calendario
  entrenamientos: DiaEntrenamiento[] = []; // Todos los entrenamientos
  entrenamientosFiltrados: DiaEntrenamiento[] = []; // Entrenamientos filtrados por día
  usuarioLogeado: Usuario | null = null; // Usuario autenticado
  nombresEjercicios: { [id: string]: string } = {}; // Mapa de nombres de ejercicios
  expandido: Set<number> = new Set(); // Control para expandir/contraer tarjetas
  monthTitle: string = ''; // Declaración de la propiedad
  fechaSeleccionada: string = ''; // Fecha seleccionada para mostrar el mensaje
  private autoMarkToday = true; // Controla si se marca automáticamente el día actual


  calendar = {
    mode: 'month' as CalendarMode,
    currentDate: new Date(), // Fecha actual
    formatMonthTitle: 'MMMM yyyy', // Formato del título del mes
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
  
        // Seleccionar el día actual al cargar
        const fechaActual = new Date().toISOString().split('T')[0];
        this.fechaSeleccionada = fechaActual;
  
        // Filtrar entrenamientos por la fecha actual
        this.entrenamientosFiltrados = this.entrenamientos.filter(entrenamiento => {
          const fechaEntrenamiento = new Date(entrenamiento.fechaEntrenamiento).toISOString().split('T')[0];
          return fechaEntrenamiento === fechaActual;
        });
  
        // Forzar recarga inicial del rango visible y sincronizar la vista
        setTimeout(() => {
          this.actualizarVistaCalendario();
        }, 200);
      }
    });
  }
  

  // Suscribirse al historial$ para obtener entrenamientos
  suscribirHistorial(): void {
    this.historialService.historial$.subscribe(historiales => {
      this.entrenamientos = historiales
        .flatMap(historial => historial.entrenamientos)
        .sort((a, b) => new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime());
  
      // Crear eventSource con los datos completamente cargados
      this.eventSource = this.entrenamientos.map(entrenamiento => ({
        id: entrenamiento._id,
        title: entrenamiento.nombreRutinaEntrenamiento,
        startTime: new Date(entrenamiento.fechaEntrenamiento),
        endTime: new Date(new Date(entrenamiento.fechaEntrenamiento).getTime() + 60 * 60 * 1000),
        allDay: false,
        entrenamiento,
      }));
  
      console.log('Eventos del calendario actualizados:', this.eventSource);
  
      // Forzar actualización visual del calendario
      setTimeout(() => {
        this.actualizarVistaCalendario();
      }, 200);
    });
  }

  async actualizarVistaCalendario(): Promise<void> {
    if (this.calendarComponent) {
      this.calendarComponent.loadEvents();
      console.log('Vista del calendario actualizada con eventos.');
    }
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
      .sort((a, b) => new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime());

    console.log('Entrenamientos cargados:', this.entrenamientos);

    // Normaliza las fechas antes de mapear
    this.eventSource = this.entrenamientos.map(entrenamiento => {
      const fechaNormalizada = new Date(entrenamiento.fechaEntrenamiento).toISOString().split('T')[0];
      return {
        id: entrenamiento._id,
        title: entrenamiento.nombreRutinaEntrenamiento,
        startTime: new Date(fechaNormalizada), // Fecha normalizada
        endTime: new Date(new Date(fechaNormalizada).getTime() + 60 * 60 * 1000),
        allDay: false,
        entrenamiento,
      };
    });

    console.log('Eventos del calendario:', this.eventSource);
  }


  //Detectar eventos seleccionados
  onEventSelected(event: any): void {

  }


  // Manejar la selección de un día en el calendario
  onTimeSelected(event: any): void {
    const fechaSeleccionada = new Date(event.selectedTime).toISOString(); // Conserva la hora completa
    this.fechaSeleccionada = fechaSeleccionada;
  
    // Filtrar entrenamientos por la fecha seleccionada
    this.entrenamientosFiltrados = this.entrenamientos.filter(entrenamiento => {
      const fechaEntrenamiento = new Date(entrenamiento.fechaEntrenamiento).toISOString();
      return fechaEntrenamiento.split('T')[0] === fechaSeleccionada.split('T')[0]; // Comparación basada en la fecha, ignorando la hora
    });
  
    console.log('Fecha seleccionada:', this.fechaSeleccionada);
    console.log('Entrenamientos filtrados:', this.entrenamientosFiltrados);
  }




  onTitleChanged(title: string): void {
    console.log('Título actualizado:', title);
    this.monthTitle = title; // Actualiza la propiedad con el nuevo título
  }

  onRangeChanged(event: { startTime: Date; endTime: Date }): void {
    const start = event.startTime.toISOString().split('T')[0];
    const end = event.endTime.toISOString().split('T')[0];
  
    // Filtrar entrenamientos en el rango visible
    const entrenamientosEnRango = this.entrenamientos.filter(entrenamiento => {
      const fechaEntrenamiento = new Date(entrenamiento.fechaEntrenamiento).toISOString().split('T')[0];
      return fechaEntrenamiento >= start && fechaEntrenamiento <= end;
    });
  
    // Actualizar eventos del calendario
    this.eventSource = entrenamientosEnRango.map(entrenamiento => ({
      id: entrenamiento._id,
      title: entrenamiento.nombreRutinaEntrenamiento,
      startTime: new Date(entrenamiento.fechaEntrenamiento),
      endTime: new Date(new Date(entrenamiento.fechaEntrenamiento).getTime() + 60 * 60 * 1000),
      allDay: false,
      entrenamiento,
    }));
  
    console.log('Eventos en el rango:', this.eventSource);
  
    // Forzar actualización del calendario sin cambiar la fecha seleccionada
    setTimeout(() => {
      this.actualizarVistaCalendario();
    }, 200);
  }

  // Permitir seleccionar días pasados, actuales y futuros
  markDisabled = (date: Date): boolean => {
    const fechaCalendario = date.toISOString().split('T')[0];
    const hoy = new Date().toISOString().split('T')[0];
  
    // Permite seleccionar días con entrenamientos
    const tieneEntrenamiento = this.entrenamientos.some(entrenamiento => {
      const fechaEntrenamiento = new Date(entrenamiento.fechaEntrenamiento).toISOString().split('T')[0];
      return fechaEntrenamiento === fechaCalendario;
    });
  
    return fechaCalendario > hoy && !tieneEntrenamiento; // Deshabilitar solo días futuros sin entrenamientos
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
