import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DiaRutina, EjercicioPlan, Rutina } from 'src/app/models/rutina.model';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { RutinaService } from 'src/app/services/rutina.service';
import { IonInput, IonCheckbox } from '@ionic/angular/standalone';
import {
  IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonList, IonItem, IonIcon, IonFooter, IonButton
} from "@ionic/angular/standalone";


@Component({
  selector: 'app-vista-entreno',
  templateUrl: './vista-entreno.component.html',
  styleUrls: ['./vista-entreno.component.scss'],
  standalone: true,
  imports: [IonButton, IonFooter, IonInput, IonIcon, IonItem, IonList,
    IonCardContent, IonCardTitle, IonCardHeader,
    IonCard, IonTitle, IonToolbar, IonHeader, FormsModule, NgFor, NgIf,IonCheckbox]
})
export class VistaEntrenoComponent implements OnInit {
  diaRutinaId: string | null = null; // Usamos diaRutinaId como el nombre del día
  ejercicios: any[] = []; // Aquí almacenaremos los ejercicios del día
  rutinaId: string | null = null; // ID de la rutina

  constructor(
    private route: ActivatedRoute,
    private rutinaService: RutinaService,
    private ejercicioService: EjercicioService, // Servicio que te permite cargar los datos de la rutina
    private alertController: AlertController // Para crear alertas
  ) { }

  ngOnInit() {
    // Capturamos los parámetros 'rutinaId' y 'diaRutinaId' (que es el nombre del día) de la URL
    this.route.paramMap.subscribe(params => {
      this.diaRutinaId = params.get('diaRutinaId'); // Obtener el nombre del día de la URL
      this.rutinaId = params.get('rutinaId'); // Obtener el ID de la rutina de la URL
      if (this.diaRutinaId && this.rutinaId) {
        console.log('Nombre del día de rutina:', this.diaRutinaId);
        this.cargarDiaRutinaPorNombre(this.rutinaId, this.diaRutinaId);
      } else {
        console.error('Faltan parámetros: diaRutinaId o rutinaId');
      }
    });
  }

  async cargarDiaRutinaPorNombre(rutinaId: string, diaNombre: string) {
    try {
      const diaRutina: DiaRutina = await this.rutinaService.obtenerDiaRutinaPorNombre(rutinaId, diaNombre);
      if (diaRutina) {
        // Asignar los ejercicios del día
        this.ejercicios = await Promise.all(diaRutina.ejercicios.map(async (ej) => {
          // Obtener el nombre del ejercicio mediante el ID
          const ejercicioDetalles = await this.ejercicioService.obtenerEjercicioPorId(ej.ejercicioId);
          return {
            ...ej,
            nombreEjercicio: ejercicioDetalles.nombre, // Asignar el nombre del ejercicio
            seriesReal: ej.series.map(serie => ({
              ...serie,
              dolor: false,
              conAyuda: false,
              alFallo: false,
            })),
          };
        }));
      } else {
        console.error(`Día de rutina con nombre ${diaNombre} no encontrado`);
      }
    } catch (error) {
      console.error('Error al cargar el día de la rutina:', error);
    }
  }

  async abrirNotas(index: number) {
    const alert = await this.alertController.create({
      header: 'Añadir Nota',
      inputs: [
        {
          name: 'nota',
          type: 'text',
          placeholder: 'Escribe tu nota aquí'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Nota cancelada');
          }
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.ejercicios[index].notas = data.nota; // Guardamos la nota en el ejercicio correspondiente
            console.log('Nota guardada:', data.nota);
          }
        }
      ]
    });

    await alert.present();
  }

  guardarEntrenamiento() {
    console.log('Entrenamiento guardado:', this.ejercicios);
    // Implementa la lógica para guardar el entrenamiento real
  }
}