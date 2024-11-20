import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { ToolbarLoggedComponent } from "../../componentes/shared/toolbar-logged/toolbar-logged.component";
import { UltimoEntrenoComponent } from 'src/app/componentes/shared/ultimo-entreno/ultimo-entreno.component';
import { DiaRutina, Rutina } from 'src/app/models/rutina.model';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario.model';
import { DiaEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { IonContent, IonButton, IonModal, IonAlert, IonIcon } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';
import { RutinaService } from 'src/app/services/database/rutina.service';
import { VistaEntrenoComponent } from "../../componentes/shared/vista-entreno/vista-entreno.component";
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons'
import { EntrenamientoEnCursoService } from 'src/app/services/sesion/entrenamiento-en-curso.service';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [IonIcon, IonAlert, IonButton, IonContent, NgIf, CommonModule, UltimoEntrenoComponent, FormsModule, ToolbarLoggedComponent, VistaEntrenoComponent],
  providers: [ModalController, PopoverController]
})
export class Tab3Page implements OnInit {
  usuarioLogeado: Usuario | null = null;
  rutinas: Rutina[] = [];
  ultimoEntrenamiento: DiaEntrenamiento | null = null; // Guardar el último entrenamiento

  entrenamientoEnProgreso = false;
  entrenamientoDetalles: { rutinaId: string; diaRutinaId: string; descripcion: string; diaRutinaNombre: string } | null = null;

  constructor(
    private authService: AuthService,
    private rutinaService: RutinaService,
    private historialService: HistorialService,
    private alertController: AlertController,
    private entrenamientoEnCursoService: EntrenamientoEnCursoService,
    private router: Router,
    private cdr: ChangeDetectorRef, // Importante para forzar cambios
  ) { addIcons(todosLosIconos) }

  async ngOnInit(): Promise<void> {
    // Suscribirse al usuario logeado
    this.authService.usuarioLogeado$.subscribe(async (usuario) => {
      // Resetear variables locales
      this.ultimoEntrenamiento = null;
  
      if (usuario) {
        this.usuarioLogeado = usuario;
  
        // Suscribirse a las rutinas del usuario
        this.rutinaService.rutinas$.subscribe((rutinas) => {
          this.rutinas = rutinas.filter((rutina) => rutina.usuarioId === this.usuarioLogeado?._id);
        });
  
        // Suscribirse al historial de entrenamientos
        this.historialService.historial$.subscribe(() => {
          this.cargarUltimoEntrenamiento();
        });
  
        // Suscribirse al estado del entrenamiento en curso
        this.entrenamientoEnCursoService.getEstadoEntrenamiento().subscribe((estadoEntrenamiento) => {
          if (estadoEntrenamiento.enProgreso) {
            this.entrenamientoEnProgreso = true;
            this.entrenamientoDetalles = {
              rutinaId: estadoEntrenamiento.rutinaId || '',
              diaRutinaId: estadoEntrenamiento.diaRutinaId || '',
              descripcion: estadoEntrenamiento.descripcion || 'Sin descripción',
              diaRutinaNombre: estadoEntrenamiento.diaRutinaNombre || 'Día sin nombre',
            };
          } else {
            this.entrenamientoEnProgreso = false;
            this.entrenamientoDetalles = null;
          }
        });
  
        // Cargar el estado del entrenamiento al iniciar
        try {
          const estadoActual = this.entrenamientoEnCursoService.obtenerEstadoActual();
          if (estadoActual.enProgreso) {
            this.entrenamientoEnProgreso = true;
            this.entrenamientoDetalles = {
              rutinaId: estadoActual.rutinaId || '',
              diaRutinaId: estadoActual.diaRutinaId || '',
              descripcion: estadoActual.descripcion || 'Sin descripción',
              diaRutinaNombre: estadoActual.diaRutinaNombre || 'Día sin nombre',
            };
          }
        } catch (error) {
          console.error('Error al cargar el estado del entrenamiento en curso:', error);
        }
      } else {
        // Resetear datos si no hay usuario logeado
        this.usuarioLogeado = null;
        this.rutinas = [];
        this.ultimoEntrenamiento = null;
        this.entrenamientoEnProgreso = false;
        this.entrenamientoDetalles = null;
      }
    });
  }

  async onComenzarButtonClick() {
    console.log("onComenzarButtonClick -> Comenzando entrenamiento");

    // Si no hay usuario logueado o rutinas disponibles, mostrar mensaje
    if (!this.usuarioLogeado || this.rutinas.length === 0) {
      console.error("No hay usuario logueado o rutinas disponibles.");
      const alert = await this.alertController.create({
        header: 'Sin Rutinas',
        message: 'No tienes rutinas creadas. Por favor, crea una rutina antes de comenzar un entrenamiento.',
        buttons: [{
          text: 'Aceptar',
          handler: () => this.router.navigate(['/tabs/tab1'])
        }]
      });
      await alert.present();
      return;
    }

    // Si solo hay una rutina, sugerir directamente el próximo día
    if (this.rutinas.length === 1) {
      await this.sugerirProximoDia(this.rutinas[0]);
    } else {
      // Mostrar selector de rutina si hay más de una
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
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Aceptar', handler: (rutinaSeleccionada: Rutina) => this.sugerirProximoDia(rutinaSeleccionada) },
      ],
    });

    await alert.present();
  }

  async sugerirProximoDia(rutina: Rutina): Promise<void> {
    const siguienteDia = this.obtenerProximoDia(rutina);

    const alert = await this.alertController.create({
      header: 'Selecciona el día de entrenamiento',
      inputs: rutina.dias.map((dia, index) => ({
        name: `dia_${index}`,
        type: 'radio',
        label: `${dia.diaNombre} - ${dia.descripcion || 'Sin descripción'}`,
        value: dia,
        checked: dia === siguienteDia,
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aceptar',
          handler: async (diaSeleccionado: DiaRutina) => {
            if (rutina && diaSeleccionado) {
              console.log('Datos para iniciar entrenamiento:', {
                rutinaId: rutina._id,
                diaRutinaId: diaSeleccionado._id,
                descripcion: diaSeleccionado.descripcion || 'Sin descripción',
              });

              await this.entrenamientoEnCursoService.iniciarEntrenamiento(
                rutina._id,
                diaSeleccionado._id!,
                diaSeleccionado.descripcion || 'Sin descripción',
                diaSeleccionado.diaNombre,
                { ejercicios: diaSeleccionado.ejercicios || [] } // Verifica si este parámetro es necesario
              );

              // Actualizar detalles del entrenamiento actual
              const entrenamientoEnCurso = await this.entrenamientoEnCursoService.verificarEntrenamientoEnCurso();
              if (entrenamientoEnCurso) {
                this.entrenamientoDetalles = {
                  rutinaId: entrenamientoEnCurso.rutinaId || '',
                  diaRutinaId: entrenamientoEnCurso.diaRutinaId || '',
                  descripcion: entrenamientoEnCurso.descripcion || 'Sin descripción',
                  diaRutinaNombre: entrenamientoEnCurso.diaRutinaNombre || 'Día sin nombre',
                };
                this.entrenamientoEnProgreso = true;

                console.log('Entrenamiento en curso actualizado:', this.entrenamientoDetalles);

                // Forzar detección de cambios
                this.cdr.detectChanges();
              } else {
                console.error('No se pudo verificar el entrenamiento en curso.');
              }
            }
          },
        },
      ],
    });

    await alert.present();
  }

  obtenerProximoDia(rutina: Rutina): DiaRutina {
    if (!this.ultimoEntrenamiento) return rutina.dias[0];

    const indiceUltimoDia = rutina.dias.findIndex(d => d._id === this.ultimoEntrenamiento?.diaRutinaId);

    return indiceUltimoDia === -1 || indiceUltimoDia === rutina.dias.length - 1
      ? rutina.dias[0]
      : rutina.dias[indiceUltimoDia + 1];
  }

  async cargarUltimoEntrenamiento() {
    if (!this.usuarioLogeado) return;

    const historiales = await this.historialService.obtenerHistorialesPorUsuario(this.usuarioLogeado._id!);
    if (historiales.length === 0) {
      this.ultimoEntrenamiento = null;
      return;
    }

    const entrenamientosOrdenados = historiales
      .flatMap((h) => h.entrenamientos)
      .sort((a, b) => new Date(b.fechaEntrenamiento).getTime() - new Date(a.fechaEntrenamiento).getTime());

    this.ultimoEntrenamiento = entrenamientosOrdenados[0];
  }
}