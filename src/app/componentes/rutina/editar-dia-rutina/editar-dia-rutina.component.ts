import { Component, OnInit, Input } from '@angular/core';
import { DiaRutina, EjercicioPlan } from 'src/app/models/rutina.model';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { ModalController, AlertController } from '@ionic/angular';
import {
  IonHeader, IonTitle, IonButtons, IonToolbar,
  IonButton, IonContent, IonItem, IonTextarea, IonLabel,
  IonList, IonSelect, IonSelectOption, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonIcon, IonInput, IonFooter
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EditarDiaRutinaAgregarEjercicioSueltoComponent } from '../editar-dia-rutina-agregar-ejercicio-suelto/editar-dia-rutina-agregar-ejercicio-suelto.component';

@Component({
  selector: 'app-editar-dia-rutina',
  templateUrl: './editar-dia-rutina.component.html',
  styleUrls: ['./editar-dia-rutina.component.scss'],
  standalone: true,
  imports: [IonFooter,
    IonHeader, IonToolbar, IonTitle, IonButton, IonContent,
    IonList,
    FormsModule, NgIf, NgFor, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonIcon
  ],
  providers: []
})
export class EditarDiaRutinaComponent implements OnInit {

  @Input() diaRutina: DiaRutina;
  ejercicioEnEdicion: EjercicioPlan | null = null;
  ejercicios: Ejercicio[] = []; // Agregamos esta propiedad para almacenar ejercicios


  constructor(private modalController: ModalController, private alertController: AlertController) { }

  async ngOnInit() {
    console.log('Datos de diaRutina recibidos:', this.diaRutina);
  }

  // Verifica si el ejercicio está en modo edición
  isEditing(ejercicio: EjercicioPlan): boolean {
    return this.ejercicioEnEdicion?.ejercicioId === ejercicio.ejercicioId;
  }



  iniciarEdicionEjercicio(ejercicio: EjercicioPlan) {
    this.ejercicioEnEdicion = { ...ejercicio }; // Crea una copia del ejercicio seleccionado
  }

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

  async agregarEjercicioSuelto() {
    const modal = await this.modalController.create({
      component: EditarDiaRutinaAgregarEjercicioSueltoComponent,
    });

    modal.onDidDismiss().then((result) => {
      const ejercicioSeleccionado = result.data as EjercicioPlan;

      console.log('Ejercicio recibido en padre:', ejercicioSeleccionado); // <--- LOG aquí

      if (ejercicioSeleccionado) {
        this.diaRutina.ejercicios.push(ejercicioSeleccionado);
      }
    });

    await modal.present();
  }


  guardarCambios() {
    console.log('Ejercicios en diaRutina al guardar:', this.diaRutina.ejercicios); // <--- LOG aquí
    // Aquí iría la lógica para guardar o enviar los cambios
    this.modalController.dismiss(this.diaRutina);
  }

  // Cancelar y cerrar el modal sin guardar
  async cancelar() {
    console.log("Modal cancelado sin guardar cambios.");
    await this.modalController.dismiss();
  }

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

  async confirmarCancelar() {
    const alert = await this.alertController.create({
      header: 'Confirmar Cancelación',
      message: '¿Deseas cancelar y perder los cambios?',
      buttons: [
        {
          text: 'Continuar Editando',
          role: 'cancel',
        },
        {
          text: 'Cancelar',
          handler: () => {
            this.cancelar();
          },
        },
      ],
    });
    await alert.present();
  }

  // Método para confirmar la cancelación de la edición
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
            await this.modalController.dismiss(); // Cierra el modal sin guardar cambios
          }
        }
      ]
    });

    await alert.present(); // Muestra la alerta de confirmación
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
          value: this.diaRutina.descripcion
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.descripcion && data.descripcion.trim() !== '') {
              this.diaRutina.descripcion = data.descripcion.trim();
            }
          }
        }
      ]
    });

    await alert.present();
  }




}