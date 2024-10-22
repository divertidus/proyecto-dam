import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { RutinaService } from 'src/app/services/rutina.service';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons';
import { EjercicioFormComponent } from 'src/app/componentes/ejercicio/ejercicio-form/ejercicio-form.component';
import { EjercicioListComponent } from "../../componentes/ejercicio/ejercicio-list/ejercicio-list.component";
import { DiaRutina, EjercicioPlan, Rutina } from 'src/app/models/rutina.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service'; // Importamos AuthService
import { ToolbarLoggedComponent } from 'src/app/componentes/toolbar-logged/toolbar-logged.component';
import { RutinaCrearDiaComponent } from 'src/app/componentes/rutina-crear-dia/rutina-crear-dia.component';


@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, EjercicioListComponent, EjercicioFormComponent, RutinaCrearDiaComponent, ToolbarLoggedComponent]
})
export class Tab5Page implements OnInit {

  listaDeEjercicios: Ejercicio[] = []; // Todos los ejercicios disponibles
  rutinaActual: Rutina; // Rutina actual seleccionada
  diaSeleccionado: DiaRutina | null = null; // Día actual que se va a editar
  modoActual: 'crear' | 'editar' = 'crear'; // Modo actual: crear o editar un día


  constructor(
    private ejercicioService: EjercicioService,
    private rutinaService: RutinaService, // Añadimos RutinaService aquí
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService // Añadimos AuthService aquí
  ) {
    addIcons(todosLosIconos);
  }

  ngOnInit() {
    this.cargarEjercicios();
    const rutinaId = this.route.snapshot.paramMap.get('id');
    this.cargarRutina(rutinaId);
  }


  // Cargar los ejercicios disponibles para añadir al día de la rutina
  async cargarEjercicios() {
    try {
      this.listaDeEjercicios = await this.ejercicioService.obtenerEjercicios();
    } catch (error) {
      console.error('Error al cargar los ejercicios:', error);
    }
  }

  // Cargar la rutina actual desde el servicio
  async cargarRutina(rutinaId: string) {
    try {
      this.rutinaActual = await this.rutinaService.obtenerRutinaPorId(rutinaId);
    } catch (error) {
      console.error('Error al cargar la rutina:', error);
    }
  }

  // Manejar la creación de un nuevo día
  crearDia() {
    this.diaSeleccionado = null; // No hay día seleccionado, estamos creando uno nuevo
    this.modoActual = 'crear'; // Cambiar a modo crear
  }

  // Manejar la edición de un día existente
  editarDia(dia: DiaRutina) {
    this.diaSeleccionado = dia; // El día seleccionado se pasa al componente
    this.modoActual = 'editar'; // Cambiar a modo editar
  }

  guardarDia(dia: DiaRutina) {
    // Asegurarse de que la rutina actual está definida antes de acceder a sus propiedades
    if (!this.rutinaActual) {
      console.error('La rutina no está definida.');
      return;
    }

    // Validar si estamos creando un nuevo día o editando uno existente
    if (this.modoActual === 'crear') {
      if (!this.rutinaActual.dias) {
        // Si 'dias' no está inicializado, inicializarlo como un array vacío
        this.rutinaActual.dias = [];
      }
      // Agregar el nuevo día
      this.rutinaActual.dias.push(dia);
    } else {
      // Si estamos en modo edición, encontrar el día que estamos editando
      const index = this.rutinaActual.dias.findIndex(d => d.diaNombre === this.diaSeleccionado?.diaNombre);
      if (index > -1) {
        // Reemplazar el día existente con los nuevos datos
        this.rutinaActual.dias[index] = dia;
      } else {
        console.error('El día que intentas editar no se encuentra en la rutina.');
      }
    }

    // Guardar la rutina actualizada en el servicio
    this.rutinaService.actualizarRutina(this.rutinaActual)
      .then(() => {
        console.log('Rutina actualizada correctamente');
        this.volverAtras(); // Regresar o cerrar el formulario
      })
      .catch(error => {
        console.error('Error al actualizar la rutina:', error);
      });
  }

  // Cancelar la creación o edición del día
  volverAtras() {
    this.diaSeleccionado = null; // Limpiar la selección
    this.router.navigate(['/rutinas']); // Redirigir a la lista de rutinas (ajusta esta ruta según tu aplicación)
  }
}
