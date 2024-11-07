import { Component, OnInit, Input } from '@angular/core';
import { DiaRutina, EjercicioPlan, Serie } from 'src/app/models/rutina.model';
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

@Component({
  selector: 'app-editar-dia-rutina',
  templateUrl: './editar-dia-rutina.component.html',
  styleUrls: ['./editar-dia-rutina.component.scss'],
  standalone: true,
  imports: [IonFooter, IonInput,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
    IonItem, IonLabel, IonTextarea, IonList, IonSelect, IonSelectOption,
    FormsModule, NgIf, NgFor, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonIcon
  ],
  providers: []
})
export class EditarDiaRutinaComponent implements OnInit {

  @Input() diaRutina: DiaRutina;
  ejercicioEnEdicion: EjercicioPlan | null = null;

  constructor(private modalController: ModalController, private alertController: AlertController) { }

  ngOnInit() {
    console.log('Datos de diaRutina recibidos:', this.diaRutina);
  }

  // Verifica si el ejercicio está en modo edición
  isEditing(ejercicio: EjercicioPlan): boolean {
    return this.ejercicioEnEdicion?.ejercicioId === ejercicio.ejercicioId;
  }

  iniciarEdicionEjercicio(ejercicio: EjercicioPlan) {
    this.ejercicioEnEdicion = {
      ...ejercicio,
      series: ejercicio.series && ejercicio.series.length > 0
        ? [...ejercicio.series]
        : [{ numeroSerie: 1, repeticiones: 10 }]
    };
    console.log("Modo de edición activado para el ejercicio:", this.ejercicioEnEdicion);
  }

  actualizarSeries(event: any) {
    const seriesCount = event.target.value;
    this.ejercicioEnEdicion.series = Array(seriesCount).fill({ repeticiones: this.ejercicioEnEdicion.series[0]?.repeticiones || 10 });
  }


  // Confirmar los cambios en el ejercicio editado
  confirmarEdicionEjercicio() {
    if (this.ejercicioEnEdicion) {
      const index = this.diaRutina.ejercicios.findIndex(e => e.ejercicioId === this.ejercicioEnEdicion?.ejercicioId);
      if (index !== -1) {
        this.diaRutina.ejercicios[index] = { ...this.ejercicioEnEdicion };
        console.log("Cambios guardados en ejercicio:", this.diaRutina.ejercicios[index]);
      }
      this.ejercicioEnEdicion = null; // Salir del modo de edición
    }
  }

  // Eliminar un ejercicio del día
  eliminarEjercicio(ejercicio: EjercicioPlan) {
    this.diaRutina.ejercicios = this.diaRutina.ejercicios.filter(e => e !== ejercicio);
    console.log("Ejercicio eliminado:", ejercicio);
  }

  // Agregar un nuevo ejercicio
  agregarNuevoEjercicio() {
    const nuevoEjercicio: EjercicioPlan = {
      ejercicioId: 'nuevo-ejercicio-' + (this.diaRutina.ejercicios.length + 1),
      nombreEjercicio: 'Nuevo Ejercicio',
      series: [{ numeroSerie: 1, repeticiones: 10 }],
      tipoPeso: 'mancuernas',
      notas: ''
    };
    this.diaRutina.ejercicios.push(nuevoEjercicio);
    console.log("Nuevo ejercicio agregado:", nuevoEjercicio);
  }

  // Guardar cambios y cerrar el modal
  async guardarCambios() {
    console.log("Guardar cambios y cerrar modal con diaRutina:", this.diaRutina);
    await this.modalController.dismiss(this.diaRutina);
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






}