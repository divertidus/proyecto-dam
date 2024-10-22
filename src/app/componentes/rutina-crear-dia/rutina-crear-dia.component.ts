import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioPlan, DiaRutina } from 'src/app/models/rutina.model';
import { IonicModule } from '@ionic/angular';
import { ToolbarLoggedComponent } from '../toolbar-logged/toolbar-logged.component';

@Component({
  selector: 'app-rutina-crear-dia',
  templateUrl: './rutina-crear-dia.component.html',
  styleUrls: ['./rutina-crear-dia.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ToolbarLoggedComponent]
})
export class RutinaCrearDiaComponent implements OnInit {


  @Input() ejercicios: Ejercicio[] = []; // Lista de ejercicios disponibles
  @Input() diaExistente: DiaRutina | null = null; // Día ya existente, si estamos editando
  @Input() modo: 'crear' | 'editar' = 'crear'; // Modo de operación (crear o editar)

  @Output() guardarDia = new EventEmitter<DiaRutina>(); // Evento para guardar el día
  @Output() cancelar = new EventEmitter<void>(); // Evento para cancelar

  nombreDia: string = '';
  ejerciciosEnRutina: EjercicioPlan[] = []; // Ejercicios añadidos al día

  constructor(private alertController: AlertController) { }

  ngOnInit() {
    if (this.diaExistente) {
      // Si estamos en modo edición, cargamos los datos del día existente
      this.nombreDia = this.diaExistente.diaNombre;
      this.ejerciciosEnRutina = this.diaExistente.ejercicios;
    }
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

  // Seleccionar un ejercicio y agregar detalles como series, repeticiones, etc.
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
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: (data) => {
            // Validamos y agregamos el ejercicio
            if (data.series && data.repeticiones) {
              this.agregarEjercicio(
                ejercicio,
                parseInt(data.series),
                parseInt(data.repeticiones),
                data.notas
              );
            } else {
              console.error('Datos incompletos al agregar ejercicio');
            }
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

  // Guardar el día con los ejercicios seleccionados
  guardar() {
    const nuevoDia: DiaRutina = {
      diaNombre: this.nombreDia,
      ejercicios: this.ejerciciosEnRutina,
      descripcion: '' // Se puede añadir una descripción adicional
    };

    this.guardarDia.emit(nuevoDia); // Emitimos el día creado o editado
  }

  // Cancelar la operación de creación o edición
  cancelarOperacion() {
    this.cancelar.emit(); // Emitimos el evento de cancelar
  }
}