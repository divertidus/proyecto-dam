import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { HistorialService } from 'src/app/services/historial-entreno.service';
import { IonicModule } from '@ionic/angular';
import { DiaEntrenamiento } from 'src/app/models/historial-entreno';
import { Usuario } from 'src/app/models/usuario.model';
import { DiaEntrenamientoCardComponent } from 'src/app/componentes/shared/dia-entrenamiento-card/dia-entrenamiento-card.component';
import { ToolbarLoggedComponent } from "../../componentes/shared/toolbar-logged/toolbar-logged.component";
import { UltimoEntrenoComponent } from 'src/app/componentes/shared/ultimo-entreno/ultimo-entreno.component';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [NgIf, NgFor, IonicModule, CommonModule,UltimoEntrenoComponent, DiaEntrenamientoCardComponent, ToolbarLoggedComponent],
})
export class Tab3Page implements OnInit {
  ultimoEntrenamiento: DiaEntrenamiento | null = null; // Almacena el último entrenamiento
  usuarioLogeado: Usuario | null = null; // Almacena el usuario logeado
  comparacion: any = null; // Almacena la comparación del último entrenamiento con el anterior
  expandido: boolean = false; // Inicialmente expandido

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

  toggleEntrenamiento() {
    this.expandido = !this.expandido; // Alterna entre expandido y contraído
    console.log('Estado expandido:', this.expandido); // Verificar si cambia
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
      historiales.sort((a, b) => new Date(b.entrenamientos[0].fechaEntrenamiento).getTime() - new Date(a.entrenamientos[0].fechaEntrenamiento).getTime());

      // Cargamos el último entrenamiento
      this.ultimoEntrenamiento = historiales[0].entrenamientos[0];

      // Buscar el entrenamiento anterior con el mismo día de rutina
      const entrenamientoAnterior = this.buscarEntrenamientoAnterior(this.ultimoEntrenamiento, historiales);

      // Si existe un entrenamiento anterior, hacemos la comparación
      if (entrenamientoAnterior) {
        this.comparacion = this.compararDatos(this.ultimoEntrenamiento, entrenamientoAnterior);
      } else {
        this.comparacion = null; // No hay entrenamiento anterior
      }

    } catch (error) {
      console.error('Error al cargar el último entrenamiento:', error);
    }
  }

  // Método para buscar el entrenamiento anterior con el mismo día de rutina
  buscarEntrenamientoAnterior(actual: DiaEntrenamiento, historiales: any[]): DiaEntrenamiento | null {
    for (let i = 1; i < historiales.length; i++) {
      const entrenamientoAnterior = historiales[i].entrenamientos.find(e => e.diaRutinaId === actual.diaRutinaId);
      if (entrenamientoAnterior) {
        return entrenamientoAnterior;
      }
    }
    return null;
  }

  // Método para comparar los datos de dos entrenamientos
  compararDatos(actual: DiaEntrenamiento, anterior: DiaEntrenamiento) {
    const comparacion = {
      ejercicios: []
    };

    // Iterar sobre los ejercicios del entrenamiento actual
    for (let i = 0; i < actual.ejercicios.length; i++) {
      const ejercicioActual = actual.ejercicios[i];
      const ejercicioAnterior = anterior.ejercicios.find(e => e.ejercicioId === ejercicioActual.ejercicioId);

      const comparacionEjercicio = {
        ejercicioId: ejercicioActual.ejercicioId,
        seriesActual: ejercicioActual.series,
        seriesAnterior: ejercicioAnterior ? ejercicioAnterior.series : [],
        notasActual: ejercicioActual.notas, // Incluimos las notas del ejercicio actual
        notasAnterior: ejercicioAnterior ? ejercicioAnterior.notas : null // Notas del ejercicio anterior
      };

      comparacion.ejercicios.push(comparacionEjercicio);
    }

    return comparacion;
  }
}
