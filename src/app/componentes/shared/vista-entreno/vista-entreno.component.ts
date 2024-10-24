import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DiaRutina, EjercicioPlan, Rutina } from 'src/app/models/rutina.model';
import { IonInput, IonCheckbox, IonGrid, IonRow, IonCol, IonAlert } from '@ionic/angular/standalone';
import {
  IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonList, IonItem, IonIcon, IonFooter, IonButton
} from "@ionic/angular/standalone";
import { DiaEntrenamiento, HistorialEntrenamiento } from 'src/app/models/historial-entrenamiento';
import { AuthService } from 'src/app/auth/auth.service'; // Importamos AuthService
import { RutinaService } from 'src/app/services/database/rutina.service';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { HistorialService } from 'src/app/services/database/historial-entrenamiento.service';


@Component({
  selector: 'app-vista-entreno',
  templateUrl: './vista-entreno.component.html',
  styleUrls: ['./vista-entreno.component.scss'],
  standalone: true,
  imports: [IonAlert, IonCol, IonRow, IonGrid, IonButton, IonFooter, IonInput, IonIcon, IonItem, IonList,
    IonCardContent, IonCardTitle, IonCardHeader,
    IonCard, IonTitle, IonToolbar, IonHeader, FormsModule, NgFor, NgIf, IonCheckbox]
})
export class VistaEntrenoComponent implements OnInit {
toggleAllSeries(_t71: any) {
throw new Error('Method not implemented.');
}
checkAllSeriesCompleted(_t71: any) {
throw new Error('Method not implemented.');
}
  diaRutinaId: string | null = null; // Usamos diaRutinaId como el nombre del día
  ejercicios: any[] = []; // Aquí almacenaremos los ejercicios del día
  rutinaId: string | null = null; // ID de la rutina
  usuarioId: string | null = null; // Añadir esta propiedad

  constructor(
    private route: ActivatedRoute,
    private rutinaService: RutinaService,
    private ejercicioService: EjercicioService, // Servicio que te permite cargar los datos de la rutina
    private alertController: AlertController, // Para crear alertas
    private historialService: HistorialService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Capturamos los parámetros de la URL
    this.route.paramMap.subscribe(params => {
      this.diaRutinaId = params.get('diaRutinaId');
      this.rutinaId = params.get('rutinaId');
      if (this.diaRutinaId && this.rutinaId) {
        this.cargarDiaRutinaPorNombre(this.rutinaId, this.diaRutinaId);
      }
    });

    // Suscribirse al usuario logeado desde el AuthService
    this.authService.usuarioLogeado$.subscribe((usuario) => {
      if (usuario) {
        this.usuarioId = usuario._id; // Guardamos el ID del usuario
      } else {
        console.error('No hay usuario logueado.');
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

          // Buscar el último peso registrado para el ejercicio
          let ultimoPeso = null;
          if (this.usuarioId) {
            ultimoPeso = await this.historialService.obtenerUltimoPesoEjercicio(this.usuarioId, ej.ejercicioId);
          }

          // Imprimir el último peso encontrado y los datos de las series actuales
          console.log(`Ejercicio: ${ejercicioDetalles.nombre}`);
          console.log(`Último peso encontrado: ${ultimoPeso}`);
          console.log(`Series originales: `, ej.series);

          // Convertir las series a SerieReal y precargar las series con el último peso encontrado
          const seriesReal = ej.series.map((serie: any) => ({
            numeroSerie: serie.numeroSerie, // Asegúrate de que los campos existen
            repeticiones: serie.repeticiones, // Campo para las repeticiones
            peso: serie.peso || 0, // Precargamos el peso actual (o 0 si no hay)
            pesoAnterior: ultimoPeso || 0, // Precargamos el último peso (o 0 si no se encontró)
            dolor: false,
            conAyuda: false,
            alFallo: false,
          }));

          // Imprimir las series ya procesadas
          console.log(`Series procesadas: `, seriesReal);

          return {
            ...ej,
            nombreEjercicio: ejercicioDetalles.nombre,
            seriesReal: seriesReal,
          };
        }));
      } else {
        console.error(`Día de rutina con nombre ${diaNombre} no encontrado`);
      }
    } catch (error) {
      console.error('Error al cargar el día de la rutina:', error);
    }
  }

  // Método para abrir el alert para agregar notas
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
    if (this.ejercicios && this.ejercicios.length > 0) {
      // Creamos un nuevo registro de DiaEntrenamiento
      const nuevoDiaEntrenamiento: DiaEntrenamiento = {
        fechaEntrenamiento: new Date().toISOString(), // Fecha actual
        diaRutinaId: this.diaRutinaId, // ID del día de la rutina realizado
        ejercicios: this.ejercicios.map(ej => ({
          ejercicioId: ej.nombreEjercicio, // Usamos el nombre del ejercicio como identificador
          series: ej.seriesReal.map((serie, index) => ({
            numeroSerie: index + 1, // Asignamos el número de serie
            repeticiones: serie.repeticiones, // Corresponde al modelo
            peso: serie.peso, // Corresponde al modelo (opcional)
            alFallo: serie.alFallo, // Corresponde al modelo (opcional)
            conAyuda: serie.conAyuda, // Corresponde al modelo (opcional)
            dolor: serie.dolor, // Corresponde al modelo (opcional)
            notas: serie.notas || null, // Notas de la serie (opcional)
          })),
          notas: ej.notas || null, // Notas opcionales del ejercicio
        })),
        notas: '', // Notas opcionales para el día de entrenamiento
      };

      // Crear un nuevo historial si no existe o añadir este día al historial existente
      const nuevoHistorialEntrenamiento: HistorialEntrenamiento = {
        entidad: 'historialEntrenamiento',
        usuarioId: this.usuarioId, // Asignar el usuario actual
        entrenamientos: [nuevoDiaEntrenamiento], // Añadimos el día de entrenamiento
      };

      // Guardamos la nueva sesión de entrenamiento usando el HistorialService
      this.historialService.agregarHistorial(nuevoHistorialEntrenamiento)
        .then(() => {
          console.log('Nueva sesión de entrenamiento guardada:', nuevoDiaEntrenamiento);
          this.mostrarAlertaExito(); // Mostrar alerta de éxito
          this.router.navigate(['/tabs/tab3']); // Redirigir al usuario a otra página
        })
        .catch((error) => {
          console.error('Error al guardar la sesión de entrenamiento:', error);
          this.mostrarAlertaError(); // Mostrar alerta de error
        });
    } else {
      console.warn('No hay ejercicios para guardar en esta sesión');
    }
  }


  async mostrarAlertaExito() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El entrenamiento ha sido guardado correctamente.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async mostrarAlertaError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Hubo un problema al guardar el entrenamiento. Por favor, inténtalo de nuevo.',
      buttons: ['OK']
    });
    await alert.present();
  }

  decrementarPeso(j: number, i: number) {
    if (this.ejercicios[i].seriesReal[j].peso > 0) {
      this.ejercicios[i].seriesReal[j].peso--;
    }
  }

  incrementarPeso(j: number, i: number) {
    this.ejercicios[i].seriesReal[j].peso++;
  }
}