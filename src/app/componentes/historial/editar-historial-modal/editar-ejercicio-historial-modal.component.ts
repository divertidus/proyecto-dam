import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { DiaEntrenamiento, EjercicioRealizado, SerieReal } from 'src/app/models/historial-entrenamiento';
import { IonHeader, IonContent, IonLabel, IonCheckbox, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonInput, IonTextarea, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFooter } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-editar-ejercicio-historia-modal',
  templateUrl: './editar-ejercicio-historial-modal.component.html',
  styleUrls: ['./editar-ejercicio-historial-modal.component.scss'],
  imports: [IonFooter, IonCardContent, CommonModule, IonCardTitle, IonCardHeader, IonCard, IonIcon, IonTextarea, IonInput, IonItem,
    IonList, IonButton, IonButtons, IonTitle, NgIf, NgFor,
    IonToolbar, IonCheckbox, IonLabel, IonContent, IonHeader, FormsModule],
  providers: [AlertController, ModalController],
  standalone: true
})
export class EditarEjercicioHistorialComponent implements OnInit {
  @Input() diaEntrenamiento: DiaEntrenamiento; // Recibe el ejercicio a editar
  @Input() editable: boolean; // Define si el modal permite edición
  @Input() historialId: string; // Recibe historialId

  ejercicioAbiertoIndex: number | null = null; // Índice del ejercicio actualmente abierto
  nuevaSerieEnEdicion: boolean = false; // Indicador de nueva serie en edición

  constructor(private modalController: ModalController, private alertController: AlertController) { }

  ngOnInit() {
    console.log('Día entrenamiento recibido en el modal:', this.diaEntrenamiento);
    console.log('Historial ID recibido en el modal:', this.historialId); // Verificar que historialId se recibe correctamente
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  guardarCambios() {
    // Incluye historialId en los datos devueltos
    this.modalController.dismiss({
      diaEntrenamiento: this.diaEntrenamiento,
      historialId: this.historialId, // Asegura historialId en el objeto resultante
      actualizado: true
    });
  }

  // Métodos para incrementar y decrementar peso en una serie específica
  incrementarPeso(serie: SerieReal) {
    if (serie.peso === undefined) serie.peso = 0;
    serie.peso += 1.25;
  }

  decrementarPeso(serie: SerieReal) {
    if (serie.peso === undefined) serie.peso = 0;
    if (serie.peso > 0) serie.peso -= 1.25;
  }

  async abrirNotasEjercicio(index: number) {
    const alert = await this.alertController.create({
      header: 'Editar Nota del Ejercicio',
      inputs: [
        {
          name: 'nota',
          type: 'text',
          placeholder: 'Escribe tu nota aquí',
          value: this.diaEntrenamiento.ejerciciosRealizados[index].notas || '',
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
            this.diaEntrenamiento.ejerciciosRealizados[index].notas = data.nota;
          },
        },
      ],
    });

    await alert.present();
  }

  async abrirNotasSerie(ejercicioIndex: number, serieIndex: number) {
    const serie = this.diaEntrenamiento.ejerciciosRealizados[ejercicioIndex].series[serieIndex];
    const alert = await this.alertController.create({
      header: 'Editar Nota de la Serie',
      inputs: [
        {
          name: 'nota',
          type: 'text',
          placeholder: 'Escribe tu nota aquí',
          value: serie.notas || '',
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
            serie.notas = data.nota;
          },
        },
      ],
    });

    await alert.present();
  }

  // Método para alternar el ejercicio abierto
  toggleEjercicio(index: number) {
    this.ejercicioAbiertoIndex = this.ejercicioAbiertoIndex === index ? null : index;
  }

  // Método para confirmar la adición de una serie
  async confirmarAnadirSerie(ejercicioIndex: number) {
    const alert = await this.alertController.create({
      header: 'Añadir Serie Extra',
      message: '¿Deseas añadir una serie extra a este ejercicio?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Añadir',
          handler: () => {
            this.anadirSerieExtra(ejercicioIndex);
          }
        }
      ]
    });
    await alert.present();
  }

  anadirSerieExtra(ejercicioIndex: number) {
    const ejercicio = this.diaEntrenamiento.ejerciciosRealizados[ejercicioIndex];
    const ultimaSerie = ejercicio.series[ejercicio.series.length - 1]; // Última serie de la misma sesión

    const nuevaSerie: SerieReal = {
      _id: '', // Define el ID de la serie si es necesario
      numeroSerie: ultimaSerie.numeroSerie + 1,
      repeticiones: ultimaSerie.repeticiones, // Mismo número de repeticiones de la última serie
      peso: ultimaSerie.peso, // Mismo peso de la última serie
      alFallo: false,
      conAyuda: false,
      dolor: false,
      enEdicion: true,
      notas: 'Serie extra', // Nota predeterminada
    };

    ejercicio.series.push(nuevaSerie); // Agrega la nueva serie al final del ejercicio
  }

  mostrarBotonAnadirSerie(ejercicio: any): boolean {
    return !ejercicio.series[ejercicio.series.length - 1].enEdicion;
  }


  // Método para confirmar la eliminación de una serie
  async confirmarEliminarSerie(ejercicioIndex: number, serieIndex: number) {
    const alert = await this.alertController.create({
      header: 'Eliminar Serie',
      message: '¿Estás seguro de que quieres eliminar la última serie?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarSerie(ejercicioIndex, serieIndex);
          },
        },
      ],
    });
    await alert.present();
  }

  eliminarSerie(ejercicioIndex: number, serieIndex: number) {
    const ejercicio = this.diaEntrenamiento.ejerciciosRealizados[ejercicioIndex];
    if (ejercicio.series.length > 0 && serieIndex === ejercicio.series.length - 1) {
      ejercicio.series.pop(); // Eliminar la última serie
    }
  }

  // Método para alternar entre edición y confirmación de la nueva serie
  toggleEditarSerie(ejercicioIndex: number, serieIndex: number) {
    const serie = this.diaEntrenamiento.ejerciciosRealizados[ejercicioIndex].series[serieIndex];
    serie.enEdicion = !serie.enEdicion;

    // Si la nueva serie se edita y se confirma (OK), se desactiva el estado de nueva serie
    if (!serie.enEdicion) {
      this.nuevaSerieEnEdicion = false;
    }
  }

  // Método para confirmar la salida sin guardar cambios
  confirmarCancelarEdicion() {
    this.alertController.create({
      header: 'Cancelar Edición',
      message: '¿Estás seguro de que quieres salir sin guardar los cambios?',
      buttons: [
        { text: 'Continuar Editando', role: 'cancel' },
        {
          text: 'Salir sin Guardar',
          handler: () => {
            this.modalController.dismiss(null, 'cancel');
          }
        }
      ]
    }).then(alert => alert.present());
  }
}