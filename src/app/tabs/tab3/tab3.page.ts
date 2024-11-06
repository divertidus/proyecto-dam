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
import { EntrenamientoEstadoService } from 'src/app/services/sesion/entrenamiento-estado.service';
import { VistaEntrenoComponent } from "../../componentes/shared/vista-entreno/vista-entreno.component";

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [IonAlert, IonModal, IonButton, IonContent, NgIf, NgFor, CommonModule, UltimoEntrenoComponent, FormsModule, ToolbarLoggedComponent, VistaEntrenoComponent],
  providers: [ModalController, PopoverController]
})
export class Tab3Page implements OnInit {
  usuarioLogeado: Usuario | null = null;
  rutinas: Rutina[] = [];
  ultimoEntrenamiento: DiaEntrenamiento | null = null; // Guardar el último entrenamiento

  entrenamientoEnProgreso = false;
  entrenamientoDetalles: { rutinaId: string; diaRutinaId: string; descripcion: string } | null = null;

  constructor(
    private authService: AuthService,
    private rutinaService: RutinaService,
    private historialService: HistorialService,
    private alertController: AlertController,
    private entrenamientoEstadoService: EntrenamientoEstadoService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.authService.usuarioLogeado$.subscribe(async (usuario) => {
      this.ultimoEntrenamiento = null;

      if (usuario) {
        this.usuarioLogeado = usuario;
        this.rutinaService.rutinas$.subscribe((rutinas) => {
          this.rutinas = rutinas.filter(rutina => rutina.usuarioId === this.usuarioLogeado?._id);
        });
        this.historialService.historial$.subscribe(() => {
          this.cargarUltimoEntrenamiento();
        });

        // Revisar si hay un entrenamiento en progreso en el estado global
        const estadoEntrenamiento = this.entrenamientoEstadoService.obtenerEstadoActual();
        this.entrenamientoEnProgreso = estadoEntrenamiento.enProgreso;
        if (this.entrenamientoEnProgreso) {
          this.entrenamientoDetalles = {
            rutinaId: estadoEntrenamiento.rutinaId!,
            diaRutinaId: estadoEntrenamiento.diaRutinaId!,
            descripcion: estadoEntrenamiento.descripcion
          };
        }

        // Suscribirse a los cambios en el estado de entrenamiento
        this.entrenamientoEstadoService.entrenamientoState$.subscribe((estado) => {
          this.entrenamientoEnProgreso = estado.enProgreso;
          if (estado.enProgreso) {
            this.entrenamientoDetalles = {
              rutinaId: estado.rutinaId!,
              diaRutinaId: estado.diaRutinaId!,
              descripcion: estado.descripcion
            };
            console.log("Datos recibidos en Tab3Page para VistaEntrenoComponent:", this.entrenamientoDetalles);
          } else {
            this.entrenamientoDetalles = null;
          }
        });

      } else {
        this.usuarioLogeado = null;
        this.rutinas = [];
        this.ultimoEntrenamiento = null;
        this.entrenamientoEnProgreso = false;
        this.entrenamientoDetalles = null;
      }
    });
  }

  async onComenzarButtonClick() {
    await this.cargarUltimoEntrenamiento();

    if (!this.usuarioLogeado || this.rutinas.length === 0) {
      console.error('No hay usuario logueado o no hay rutinas disponibles.');
      return;
    }

    if (this.rutinas.length === 1) {
      const rutina: Rutina = this.rutinas[0];
      this.sugerirProximoDia(rutina);
    } else {
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

  async sugerirProximoDia(rutina: Rutina) {
    const siguienteDia = this.obtenerProximoDia(rutina);

    const alert = await this.alertController.create({
      header: 'Selecciona el día de entrenamiento',
      inputs: rutina.dias.map((dia, index) => ({
        name: `dia_${index}`,
        type: 'radio',
        label: `${dia.diaNombre} - ${dia.descripcion}`,
        value: dia,
        checked: dia === siguienteDia
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: (diaSeleccionado: DiaRutina) => {
            if (rutina && diaSeleccionado) {
              console.log('Datos para iniciar entrenamiento:', {
                rutinaId: rutina._id,
                diaRutinaId: diaSeleccionado.diaNombre,
                descripcion: diaSeleccionado.descripcion
              });

              // Enviar los datos al estado global
              this.entrenamientoEstadoService.comenzarEntrenamiento(
                rutina._id,
                diaSeleccionado.diaNombre,
                diaSeleccionado.descripcion
              );

              // Confirmación en consola de que la información se envió
              console.log("Estado actualizado para el entrenamiento en progreso:", this.entrenamientoEstadoService.obtenerEstadoActual());
            }
          },
        },
      ],
    });

    await alert.present();
  }

  obtenerProximoDia(rutina: Rutina): DiaRutina {
    if (!this.ultimoEntrenamiento) {
      return rutina.dias[0];
    }

    const indiceUltimoDia = rutina.dias.findIndex(d => d.diaNombre === this.ultimoEntrenamiento?.diaRutinaId);
    return indiceUltimoDia === -1 || indiceUltimoDia === rutina.dias.length - 1
      ? rutina.dias[0]
      : rutina.dias[indiceUltimoDia + 1];
  }

  async cargarUltimoEntrenamiento() {
    try {
      if (!this.usuarioLogeado) return;

      const historiales = await this.historialService.obtenerHistorialesPorUsuario(this.usuarioLogeado._id!);
      if (historiales.length === 0) {
        this.ultimoEntrenamiento = null;
        return;
      }

      const entrenamientosOrdenados = historiales.flatMap(h => h.entrenamientos).sort(
        (a, b) => new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime()
      );
      this.ultimoEntrenamiento = entrenamientosOrdenados[0];
    } catch (error) {
      console.error('Error al cargar el último entrenamiento:', error);
    }
  }
}

