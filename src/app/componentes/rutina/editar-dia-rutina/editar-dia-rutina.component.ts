import { Component, OnInit, Input } from '@angular/core';
import { DiaRutina, EjercicioPlan } from 'src/app/models/rutina.model';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { ModalController, AlertController, PopoverController } from '@ionic/angular';
import {
  IonHeader, IonTitle, IonToolbar,
  IonButton, IonContent,
  IonList, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonIcon, IonFooter, IonLabel, IonItem
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { EditarDiaRutinaAgregarEjercicioSueltoComponent } from '../editar-dia-rutina-agregar-ejercicio-suelto/editar-dia-rutina-agregar-ejercicio-suelto.component';
import { EditarDiaRutinaEditarEjercicioPlanPopoverComponent } from '../editar-dia-rutina-editar-ejercicio-plan-popover/editar-dia-rutina-editar-ejercicio-plan-popover.component';

@Component({
  selector: 'app-editar-dia-rutina',
  templateUrl: './editar-dia-rutina.component.html',
  styleUrls: ['./editar-dia-rutina.component.scss'],
  standalone: true,
  imports: [IonFooter,
    IonHeader, IonToolbar, IonTitle, IonButton, IonContent,
    IonList,
    FormsModule, NgIf, NgFor, IonCard, IonCardHeader,
    IonCardContent, IonIcon
  ],
  providers: []
})
export class EditarDiaRutinaComponent implements OnInit {

  @Input() diaRutina: DiaRutina;
  ejercicioEnEdicion: EjercicioPlan | null = null; // Para manejar la edición de ejercicios
  estadoExpandido: { [key: string]: boolean } = {}; // Objeto para almacenar el estado de expansión


  constructor(
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

  // Alterna el estado expandido de un ejercicio
  toggleExpandirEjercicio(ejercicioId: string) {
    this.estadoExpandido[ejercicioId] = !this.estadoExpandido[ejercicioId];
  }

  // Método para abrir el popover de edición de EjercicioPlan
  async iniciarEdicionEjercicio(ejercicioPlan: EjercicioPlan) {
    console.log('El ejercicioPlan que se pasa es: ', ejercicioPlan);

    const popover = await this.popoverController.create({
      component: EditarDiaRutinaEditarEjercicioPlanPopoverComponent,
      componentProps: { ejercicioPlan: { ...ejercicioPlan } },
      cssClass: 'popover-ejercicio-compacto', // Asegúrate de aplicar esta clase
      translucent: true,
    });
    await popover.present();

    const { data: ejercicioActualizado } = await popover.onDidDismiss();
    if (ejercicioActualizado) {
      const index = this.diaRutina.ejercicios.findIndex(e => e.ejercicioId === ejercicioPlan.ejercicioId);
      if (index !== -1) {
        this.diaRutina.ejercicios[index] = ejercicioActualizado;
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

  // Eliminar un ejercicio del día
  eliminarEjercicio(ejercicio: EjercicioPlan) {
    this.diaRutina.ejercicios = this.diaRutina.ejercicios.filter(e => e !== ejercicio);
    console.log("Ejercicio eliminado:", ejercicio);
  }

  // Métodos adicionales de control para agregar, guardar y cancelar cambios en el día
  async agregarEjercicioSuelto() {
    const modal = await this.modalController.create({
      component: EditarDiaRutinaAgregarEjercicioSueltoComponent,
      cssClass: 'popover-ejercicio-compacto',
    });

    modal.onDidDismiss().then((result) => {
      const ejercicioSeleccionado = result.data as EjercicioPlan;
      if (ejercicioSeleccionado) {
        this.diaRutina.ejercicios.push(ejercicioSeleccionado);
      }
    });

    await modal.present();
  }

  // Guardar cambios
  guardarCambios() {
    console.log('Ejercicios en diaRutina al guardar:', this.diaRutina.ejercicios);
    this.modalController.dismiss(this.diaRutina);
  }

  // Cancelar cambios
  async cancelar() {
    console.log("Modal cancelado sin guardar cambios.");
    await this.modalController.dismiss();
  }

  // Confirmación antes de guardar
  async confirmarGuardar() {
    const alert = await this.alertController.create({
      header: 'Confirmar Guardado',
      message: '¿Deseas guardar los cambios?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: () => {
            this.guardarCambios();
          },
        },
      ],
    });
    await alert.present();
  }

  // Confirmación antes de cancelar
  async confirmarCancelarEdicion() {
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

  // Método para editar la descripción del día
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