/* tab3.page.ts */
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { ToolbarLoggedComponent } from "../../componentes/shared/toolbar-logged/toolbar-logged.component";
import { UltimoEntrenoComponent } from 'src/app/componentes/shared/ultimo-entreno/ultimo-entreno.component';
import { DiaRutina, Rutina } from 'src/app/models/rutina.model';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario.model';
import { DiaEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { IonContent, IonButton, IonModal, IonAlert } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';
import { RutinaService } from 'src/app/services/database/rutina.service';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [IonAlert, IonModal, IonButton, IonContent, NgIf, NgFor, CommonModule, UltimoEntrenoComponent, FormsModule, ToolbarLoggedComponent],
  providers: [ModalController, PopoverController]
})
export class Tab3Page implements OnInit {
  usuarioLogeado: Usuario | null = null;
  rutinas: Rutina[] = [];
  ultimoEntrenamiento: DiaEntrenamiento | null = null; // Guardar el último entrenamiento

  constructor(
    private authService: AuthService,
    private rutinaService: RutinaService,
    private historialService: HistorialService,
    private alertController: AlertController,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    // Suscribirse al usuario logueado
    this.authService.usuarioLogeado$.subscribe(async (usuario) => {
      this.ultimoEntrenamiento = null;

      if (usuario) {
        this.usuarioLogeado = usuario;
        // Cargar las rutinas del usuario
        // Suscribirse a los cambios en las rutinas del usuario
        this.rutinaService.rutinas$.subscribe((rutinas) => {
          this.rutinas = rutinas.filter(rutina => rutina.usuarioId === this.usuarioLogeado?._id);
        });

        // Suscribirse a los cambios en el historial
        this.historialService.historial$.subscribe(() => {
          this.cargarUltimoEntrenamiento(); // Recargar último entrenamiento cuando el historial cambie
        });

      } else {
        // Si no hay usuario logueado, reiniciar las variables
        this.usuarioLogeado = null;
        this.rutinas = [];
        this.ultimoEntrenamiento = null;
      }
    });
  }

  async onComenzarButtonClick() {
    console.log('Botón Comenzar presionado');

    // Cargar el último entrenamiento
    await this.cargarUltimoEntrenamiento();
    console.log('Último entrenamiento:', this.ultimoEntrenamiento);

    if (!this.usuarioLogeado || this.rutinas.length === 0) {
      console.error('No hay usuario logueado o no hay rutinas disponibles.');
      return;
    }

    if (this.rutinas.length === 1) {
      // Aquí asumimos que hay solo una rutina
      const rutina: Rutina = this.rutinas[0];
      this.sugerirProximoDia(rutina);
    } else {
      // Si hay más de una rutina, pedimos al usuario que elija cuál quiere utilizar
      await this.mostrarSelectorDeRutina();
    }
  }

  async mostrarSelectorDeRutina() {
    const alert = await this.alertController.create({
      header: 'Selecciona una rutina',
      inputs: this.rutinas.map((rutina, index) => ({
        name: `rutina_${index}`,
        type: 'radio',
        label: rutina.nombre,
        value: rutina,
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: (rutinaSeleccionada: Rutina) => {
            this.sugerirProximoDia(rutinaSeleccionada);
          },
        },
      ],
    });

    await alert.present();
  }

  async cargarUltimoEntrenamiento() {
    try {
      console.log('dentro de cargarUltimoEntrenamiento');
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

  async sugerirProximoDia(rutina: Rutina) {
    // Obtener el próximo día sugerido de entrenamiento
    const siguienteDia = this.obtenerProximoDia(rutina);
    console.log('Día sugerido para el próximo entrenamiento:', siguienteDia);

    // Mostrar un selector para que el usuario elija si desea seguir el día sugerido o seleccionar otro
    const alert = await this.alertController.create({
      header: 'Selecciona el día de entrenamiento',
      inputs: rutina.dias.map((dia, index) => ({
        name: `dia_${index}`,
        type: 'radio',
        label: dia.diaNombre+' - '+dia.descripcion,
        value: dia,
        checked: dia === siguienteDia // Marcar el día sugerido
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: (diaSeleccionado: DiaRutina) => {
            console.log('Día seleccionado:', diaSeleccionado);
            // Aquí puedes redirigir al usuario al día seleccionado
            console.log('Navegando a tab4 con:', { rutinaId: rutina._id, diaRutinaId: diaSeleccionado.diaNombre, descripcion: diaSeleccionado.descripcion });
            this.router.navigate(['/tabs/tab4', { rutinaId: rutina._id, diaRutinaId: diaSeleccionado.diaNombre, descripcion: diaSeleccionado.descripcion }]);

          },
        },
      ],
    });

    await alert.present();
  }

  obtenerProximoDia(rutina: Rutina): DiaRutina {
    if (!this.ultimoEntrenamiento) {
      // Si no hay historiales previos, sugerimos el primer día de la rutina
      console.log('No hay entrenamientos previos. Sugerimos el primer día de la rutina.');
      return rutina.dias[0];
    }

    // Buscar el índice del día correspondiente al último entrenamiento realizado
    const indiceUltimoDia = rutina.dias.findIndex(d => d.diaNombre === this.ultimoEntrenamiento?.diaRutinaId);

    if (indiceUltimoDia === -1) {
      // Si el índice es -1, significa que el día no se encontró, así que sugerimos el primer día
      console.log('El último día realizado no se encontró en la rutina. Sugerimos el primer día de la rutina.');
      return rutina.dias[0];
    }

    if (indiceUltimoDia === rutina.dias.length - 1) {
      // Si el último día fue el último en la lista, sugerimos el primer día para volver a comenzar
      console.log('El último día realizado fue el último de la rutina. Sugerimos el primer día de la rutina.');
      return rutina.dias[0];
    } else {
      // Si no, sugerimos el siguiente día
      console.log(`El último día realizado fue el día ${rutina.dias[indiceUltimoDia].diaNombre}. Sugerimos el siguiente día: ${rutina.dias[indiceUltimoDia + 1].diaNombre}.`);
      return rutina.dias[indiceUltimoDia + 1];
    }
  }
}
