import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioPlan } from 'src/app/models/rutina.model';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { AlertController, ModalController } from '@ionic/angular';
import {
  IonItem, IonSearchbar, IonGrid, IonRow, IonCol, IonCardHeader,
  IonCardContent, IonCard, IonCardTitle, IonHeader, IonToolbar, IonContent, IonButton, IonFooter
} from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-editar-dia-rutina-agregar-ejercicio-suelto',
  templateUrl: './editar-dia-rutina-agregar-ejercicio-suelto.component.html',
  styleUrls: ['./editar-dia-rutina-agregar-ejercicio-suelto.component.scss'],
  imports: [IonFooter, IonButton, IonContent, IonToolbar, IonHeader, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonCol, FormsModule, IonRow, IonGrid, IonSearchbar, IonItem, NgFor, NgIf],
  standalone: true,
  providers: []
})
export class EditarDiaRutinaAgregarEjercicioSueltoComponent implements OnInit {

  @Output() ejercicioSeleccionado = new EventEmitter<EjercicioPlan>(); // Emisor para comunicar con el padre

  ejercicios: Ejercicio[] = []; // Lista de ejercicios obtenidos del servicio
  ejerciciosFiltrados: Ejercicio[] = []; // Lista para los ejercicios filtrados en tiempo real
  private ejerciciosSub: Subscription; // Suscripción para manejar actualizaciones en tiempo real

  constructor(
    private ejercicioService: EjercicioService,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.ejerciciosSub = this.ejercicioService.ejercicios$.subscribe(data => {
      console.log('Ejercicios recibidos:', data); // Verificar datos en consola
      this.ejercicios = data;
      this.ejerciciosFiltrados = [...this.ejercicios];
      console.log('Ejercicios filtrados iniciales:', this.ejerciciosFiltrados);
    });
  }

  // Filtro de búsqueda para los ejercicios
  buscarEjercicios(event: any) {
    const valorBusqueda = event.detail.value ? event.detail.value.toLowerCase() : '';
    if (valorBusqueda === '') {
      this.ejerciciosFiltrados = [...this.ejercicios];
    } else {
      this.ejerciciosFiltrados = this.ejercicios.filter(ejercicio =>
        ejercicio.nombre.toLowerCase().includes(valorBusqueda) ||
        (ejercicio.descripcion && ejercicio.descripcion.toLowerCase().includes(valorBusqueda)) ||
        (ejercicio.musculoPrincipal && ejercicio.musculoPrincipal.toLowerCase().includes(valorBusqueda))
      );
    }
    console.log('Ejercicios después de filtrar:', this.ejerciciosFiltrados); // Confirmación de datos filtrados
  }

  // Método para seleccionar un ejercicio y pedir sus detalles
  async seleccionarEjercicio(ejercicio: Ejercicio) {
    const alert = await this.alertController.create({
      header: `Agregar ${ejercicio.nombre}`,
      inputs: [
        { name: 'series', type: 'number', placeholder: 'Número de Series', min: 1 },
        { name: 'repeticiones', type: 'number', placeholder: 'Repeticiones', min: 1 },
        { name: 'notas', type: 'textarea', placeholder: 'Notas adicionales (opcional)' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Agregar',
          handler: (data) => {
            if (!data.series || !data.repeticiones) {
              return false;
            }
            const ejercicioPlan: EjercicioPlan = {
              ejercicioId: ejercicio._id!,
              nombreEjercicio: ejercicio.nombre,
              series: +data.series,
              repeticiones: +data.repeticiones,
              notas: data.notas || '',
              tipoPeso: ejercicio.tipoPeso,
            };
  
            console.log('Ejercicio seleccionado en hijo:', ejercicioPlan); // <--- LOG aquí
            
            // Emitimos el ejercicio al cerrar el modal
            this.modalController.dismiss(ejercicioPlan);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  cerrarModal() {
    this.modalController.dismiss();
  }


  //Mostrar mensaje de error
  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  // Limpiar la suscripción cuando se destruye el componente
  ngOnDestroy() {
    if (this.ejerciciosSub) {
      this.ejerciciosSub.unsubscribe();
    }
  }
}