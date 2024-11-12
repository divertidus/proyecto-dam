import { Component, OnInit, Input } from '@angular/core';
import { DiaRutina, EjercicioPlan } from 'src/app/models/rutina.model';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { ModalController, AlertController, PopoverController } from '@ionic/angular';
import {
  IonHeader, IonTitle, IonToolbar,
  IonButton, IonContent,
  IonList, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonIcon, IonFooter, IonLabel, IonItem, IonButtons
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { EditarDiaRutinaAgregarEjercicioSueltoComponent } from '../editar-dia-rutina-agregar-ejercicio-suelto/editar-dia-rutina-agregar-ejercicio-suelto.component';
import { EditarDiaRutinaEditarEjercicioPlanPopoverComponent } from '../editar-dia-rutina-editar-ejercicio-plan-popover/editar-dia-rutina-editar-ejercicio-plan-popover.component';
import { RutinaService } from 'src/app/services/database/rutina.service';

@Component({
  selector: 'app-editar-dia-rutina',
  templateUrl: './editar-dia-rutina.component.html',
  styleUrls: ['./editar-dia-rutina.component.scss'],
  standalone: true,
  imports: [IonButtons, IonFooter,
    IonHeader, IonToolbar, IonTitle, IonButton, IonContent,
    IonList, FormsModule, NgIf, NgFor, IonCard, IonCardHeader,
    IonCardContent, IonIcon, IonLabel
  ],
  providers: []
})
export class EditarDiaRutinaComponent implements OnInit {

  @Input() diaRutina: DiaRutina;
  @Input() rutinaId: string; // Recibe el ID de la rutina para actualizar el día
  ejercicioEnEdicion: EjercicioPlan | null = null; // Para manejar la edición de ejercicios
  estadoExpandido: { [key: string]: boolean } = {}; // Objeto para almacenar el estado de expansión
  cambiosRealizados: boolean = false; // Almacena si hay cambios
  ejercicioOriginal: EjercicioPlan | null = null; // Almacena el ejercicio antes de editar



  constructor(
    private rutinaService: RutinaService,
    private modalController: ModalController,
    private alertController: AlertController,
    private popoverController: PopoverController
  ) { }

  async ngOnInit() {
    console.log('Datos de diaRutina recibidos:', this.diaRutina);
    // Inicializar el estado de expansión de cada ejercicio como false
    this.diaRutina.ejercicios.forEach(ejercicio => {
      this.estadoExpandido[ejercicio.ejercicioId] = false;
    });
  }

  toggleExpandirEjercicio(ejercicioId: string) {
    // Si la tarjeta seleccionada ya está desplegada, simplemente la plegamos
    if (this.estadoExpandido[ejercicioId]) {
      this.estadoExpandido[ejercicioId] = false; // Plegar la tarjeta seleccionada
    } else {
      // Plegar todas las tarjetas
      Object.keys(this.estadoExpandido).forEach(id => {
        this.estadoExpandido[id] = false;
      });
      // Desplegar solo la tarjeta seleccionada
      this.estadoExpandido[ejercicioId] = true;
    }
    // No marcamos cambios como realizados si solo se está desplegando o plegando tarjetas
  }

  // Actualizar cambiosRealizados cuando se edita un ejercicio
async iniciarEdicionEjercicio(ejercicioPlan: EjercicioPlan) {
  this.ejercicioOriginal = { ...ejercicioPlan }; // Copia original para comparar después
  const popover = await this.popoverController.create({
    component: EditarDiaRutinaEditarEjercicioPlanPopoverComponent,
    componentProps: { ejercicioPlan: { ...ejercicioPlan } },
    cssClass: 'popover-ejercicio-compacto',
    translucent: true,
  });
  await popover.present();

  const { data: ejercicioActualizado } = await popover.onDidDismiss();
  if (ejercicioActualizado) {
    const index = this.diaRutina.ejercicios.findIndex(e => e.ejercicioId === ejercicioPlan.ejercicioId);
    if (index !== -1) {
      this.diaRutina.ejercicios[index] = ejercicioActualizado;
      this.cambiosRealizados = true; // Marcar cambios al editar
    }
  }
}

  // Confirmar cambios en la edición de un ejercicio
  confirmarEdicionEjercicio() {
    if (this.ejercicioEnEdicion) {
      const index = this.diaRutina.ejercicios.findIndex(e => e.ejercicioId === this.ejercicioEnEdicion?.ejercicioId);
      if (index !== -1) {
        this.diaRutina.ejercicios[index] = { ...this.ejercicioEnEdicion };
      }
      this.ejercicioEnEdicion = null;
    }
  }

  // Método para verificar si se hicieron cambios reales
  verificarCambios(): boolean {
    return JSON.stringify(this.ejercicioOriginal) !== JSON.stringify(this.ejercicioEnEdicion);
  }

 // Actualizar cambiosRealizados cuando se elimina un ejercicio
eliminarEjercicio(ejercicio: EjercicioPlan) {
  this.diaRutina.ejercicios = this.diaRutina.ejercicios.filter(e => e !== ejercicio);
  this.cambiosRealizados = true; // Marcar cambios al eliminar
}

  // Actualizar cambiosRealizados cuando se agrega un ejercicio suelto
async agregarEjercicioSuelto() {
  const modal = await this.modalController.create({
    component: EditarDiaRutinaAgregarEjercicioSueltoComponent,
    cssClass: 'popover-ejercicio-compacto',
  });
  modal.onDidDismiss().then((result) => {
    const ejercicioSeleccionado = result.data as EjercicioPlan;
    if (ejercicioSeleccionado) {
      this.diaRutina.ejercicios.push(ejercicioSeleccionado);
      this.cambiosRealizados = true; // Marcar cambios al agregar
    }
  });
  await modal.present();
}

  // Guardar cambios en el día de la rutina y devolver el día actualizado
  async guardarCambios() {
    if (this.cambiosRealizados) { // Verifica que hay cambios
      try {
        await this.rutinaService.actualizarDiaEnRutina(this.rutinaId, this.diaRutina);
        this.modalController.dismiss(this.diaRutina);
        this.cambiosRealizados = false; // Restablecer tras guardar
        console.log('Día de rutina actualizado exitosamente.');
      } catch (error) {
        console.error('Error al actualizar el día de rutina:', error);
      }
    }
  }

  async confirmarGuardarCambios() {
    const alert = await this.alertController.create({
      header: 'Guardar Cambios',
      message: '¿Estás seguro de que deseas guardar los cambios realizados?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: () => {
            this.guardarCambios(); // Llama al método de guardado real
          },
        },
      ],
    });
    await alert.present();
  }

  async cancelar() {
    console.log("Modal cancelado sin guardar cambios.");
    await this.modalController.dismiss();
  }

  async confirmarCancelarEdicion() {
    if (!this.cambiosRealizados) {
      await this.modalController.dismiss();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Cancelar edición',
      message: '¿Estás seguro de que deseas cancelar sin guardar los cambios?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Sí, cancelar',
          handler: async () => {
            await this.modalController.dismiss();
          }
        }
      ]
    });

    await alert.present();
  }

  async editarDescripcion() {
    const alert = await this.alertController.create({
      header: 'Editar Descripción del Día',
      inputs: [
        {
          name: 'descripcion',
          type: 'textarea',
          placeholder: 'Ingresa una nueva descripción',
          value: this.diaRutina.descripcion,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.descripcion && data.descripcion.trim() !== '') {
              this.diaRutina.descripcion = data.descripcion.trim();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  
}