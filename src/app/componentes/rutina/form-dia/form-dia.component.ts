/* form-dia.component.ts */

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioPlan, DiaRutina } from 'src/app/models/rutina.model';
import { IonicModule } from '@ionic/angular';
import { ToolbarLoggedComponent } from '../../shared/toolbar-logged/toolbar-logged.component';
import { ToolbarModalesCancelarComponent } from "../../shared/toolbar-modales-cancelar/toolbar-modales-cancelar.component";
import { Subscription } from 'rxjs';
import { EjercicioService } from 'src/app/services/ejercicio.service';


@Component({
  selector: 'app-form-dia',
  templateUrl: './form-dia.component.html',
  styleUrls: ['./form-dia.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ToolbarModalesCancelarComponent]

})
export class FormDiaComponent implements OnInit {

  //@Input() ejercicios: Ejercicio[] = []; // Lista de ejercicios disponibles
  @Input() diaExistente: DiaRutina | null = null; // Día ya existente, si estamos editando
  @Input() modo: 'crear' | 'editar' = 'crear'; // Modo de operación (crear o editar)
  @Input() numeroDiasExistentes: number = 0; // Número de días ya existentes en la rutina

  nombreDia: string = '';
  descripcionDia: string = '';
  ejerciciosEnRutina: EjercicioPlan[] = []; // Ejercicios añadidos al día
  ejerciciosFiltrados: Ejercicio[] = []; // Para no modificar la lista original
  ejercicios: Ejercicio[] = []; // Lista de ejercicios obtenidos del servicio
  private ejerciciosSub: Subscription; // Para manejar la suscripción

  constructor(
    private ejercicioService: EjercicioService,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    //this.ejercicioService.cargarEjercicios() // O los cargo en el controlador del Ejercicios-service o aqui.
    // Nos suscribimos al observable ejercicios$ que expone los ejercicios cargados
    this.ejerciciosSub = this.ejercicioService.ejercicios$.subscribe(data => {
      this.ejercicios = data;
      this.ejerciciosFiltrados = [...this.ejercicios]; // Inicializa los ejercicios filtrados
    });

    if (this.modo === 'editar') {
      // Si estamos en modo edición, cargamos los datos del día existente
      this.nombreDia = this.diaExistente ? this.diaExistente.diaNombre : '';
      this.ejerciciosEnRutina = [...(this.diaExistente?.ejercicios || [])]; // Copia los ejercicios existentes para edición
    } else {
      // Si estamos creando un nuevo día, aseguramos que no haya ejercicios añadidos y asignamos nombre por defecto
      this.nombreDia = `Día ${this.numeroDiasExistentes + 1}`;
      this.ejerciciosEnRutina = [];
    }

    this.descripcionDia = '';
  }

  // Filtrar los ejercicios cuando el usuario realiza una búsqueda
  buscarEjercicios(event: any) {
    const valorBusqueda = event.target.value.toLowerCase();
    this.ejercicios = this.ejercicios.filter(ejercicio =>
      ejercicio.nombre.toLowerCase().includes(valorBusqueda) ||
      (ejercicio.descripcion && ejercicio.descripcion.toLowerCase().includes(valorBusqueda)) ||
      (ejercicio.musculoPrincipal && ejercicio.musculoPrincipal.toLowerCase().includes(valorBusqueda))
    );
  }

  async seleccionarEjercicio(ejercicio: Ejercicio) {
    const alert = await this.alertController.create({
      header: `Detalles de: ${ejercicio.nombre}`,
      inputs: [
        {
          name: 'series',
          type: 'number',
          placeholder: 'Número de Series',
          min: 1
        },
        {
          name: 'repeticiones',
          type: 'number',
          placeholder: 'Repeticiones por Serie',
          min: 1
        },
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas adicionales (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Operación cancelada'); // Podrías retornar 'false' o simplemente dejar el log.
            return false; // Devolvemos 'false' para indicar que no se hizo nada.
          }
        },
        {
          text: 'Agregar',
          handler: (data) => {
            // Validamos y agregamos el ejercicio
            if (!data.series || !data.repeticiones || data.series <= 0 || data.repeticiones <= 0) {
              console.error('Datos incompletos o incorrectos al agregar ejercicio');
              // Mostrar mensaje de error al usuario
              this.alertController.create({
                header: 'Error',
                message: 'Por favor, asegúrate de ingresar un número válido de series y repeticiones.',
                buttons: ['Aceptar']
              }).then(alert => alert.present());

              return false; // Devolvemos 'false' si los datos no son válidos.
            }

            this.agregarEjercicio(
              ejercicio,
              parseInt(data.series),
              parseInt(data.repeticiones),
              data.notas
            );

            return true; // Retornamos 'true' para indicar que se agregó el ejercicio correctamente.
          }
        }
      ]
    });

    await alert.present();
  }


  // Agregar un ejercicio con los detalles ingresados
  agregarEjercicio(ejercicio: Ejercicio, series: number, repeticiones: number, notas: string) {
    const ejercicioPlan: EjercicioPlan = {
      ejercicioId: ejercicio._id!,
      series: Array(series).fill({ repeticiones }), // Crea las series con el número de repeticiones
      notas: notas || '',

    };

    this.ejerciciosEnRutina.push(ejercicioPlan); // Añadir el ejercicio a la rutina
  }

  guardar() {
    // Verificar si se ingresó una descripción
    if (!this.descripcionDia || this.descripcionDia.trim() === '') {
      // Mostrar una alerta si la descripción está vacía
      this.alertController.create({
        header: 'Error',
        message: 'Por favor, ingrese una descripción para el día.',
        buttons: ['Aceptar']
      }).then(alert => alert.present());

      return; // Detener el guardado hasta que se ingrese la descripción
    }

    // Verificar si se seleccionó al menos un ejercicio
    if (this.ejerciciosEnRutina.length === 0) {
      // Mostrar una alerta si no hay ejercicios seleccionados
      this.alertController.create({
        header: 'Error',
        message: 'Por favor, seleccione al menos un ejercicio para el día.',
        buttons: ['Aceptar']
      }).then(alert => alert.present());

      return; // Detener el guardado hasta que se seleccione un ejercicio
    }

    /*   // Si el nombre del día no se especifica, asignamos un nombre automático basado en el número de días existentes en la rutina
      if (!this.nombreDia || this.nombreDia.trim() === '') {
        const diaIndex = this.diaExistente ? this.diaExistente.ejercicios.length : 0; // Obtiene el número de días ya existentes
        this.nombreDia = `Día ${diaIndex + 1}`; // Asigna el nombre como "Día X", donde X es el siguiente número disponible
      } */

    const nuevoDia: DiaRutina = {
      diaNombre: this.nombreDia,
      ejercicios: this.ejerciciosEnRutina,
      descripcion: this.descripcionDia // Guarda la descripción proporcionada por el usuario
    };

    this.modalController.dismiss(nuevoDia); // Enviar los datos de vuelta al componente padre
  }

  // Cancelar la operación de creación o edición
  cancelarOperacion() {
    this.modalController.dismiss(); // Simplemente cierra el modal sin enviar datos
  }
}