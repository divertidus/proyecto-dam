import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons';
import { EjercicioFormComponent } from 'src/app/componentes/ejercicio/ejercicio-form/ejercicio-form.component';
import { EjercicioListComponent } from "../../componentes/ejercicio/ejercicio-list/ejercicio-list.component";
import { ElegirEjercicioComponent } from 'src/app/componentes/rutina/elegir-ejercicio/elegir-ejercicio.component';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, EjercicioListComponent, EjercicioFormComponent]
})
export class Tab5Page implements OnInit {

  ejercicios: Ejercicio[] = []; // Almacena todos los ejercicios
  ejerciciosFiltrados: Ejercicio[] = []; // Ejercicios filtrados por la barra de búsqueda
  buscando: string = ''; // Para controlar el valor de la búsqueda

  constructor(private ejercicioService: EjercicioService, private modalController: ModalController) {
    addIcons(todosLosIconos);
  }

  ngOnInit() {
    this.cargarEjercicios();
  }

  // Cargar los ejercicios desde el servicio
  async cargarEjercicios() {
    this.ejercicios = await this.ejercicioService.obtenerEjercicios();
    console.log(this.ejercicios); // Verifica que los ejercicios se carguen correctamente
    this.ejerciciosFiltrados = this.ejercicios; // Inicialmente mostrar todos
  }

  // Actualizar la lista filtrada cuando el usuario escribe en la barra de búsqueda
  buscarEjercicios(event: any) {
    const valorBusqueda = event.target.value.toLowerCase();
    this.ejerciciosFiltrados = this.ejercicios.filter(ejercicio =>
      ejercicio.nombre.toLowerCase().includes(valorBusqueda) ||
      (ejercicio.descripcion && ejercicio.descripcion.toLowerCase().includes(valorBusqueda)) ||
      (ejercicio.musculo && ejercicio.musculo.toLowerCase().includes(valorBusqueda))
    );
  }

  // Mostrar el formulario emergente para agregar un nuevo ejercicio
  async mostrarFormularioAgregar() {
    const modal = await this.modalController.create({
      component: EjercicioFormComponent,
      presentingElement: await this.modalController.getTop(), // Hace que el modal se presente encima de la vista actual
      cssClass: 'custom-modal'
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.onEjercicioAgregado(result.data);
      }
    });
  
    await modal.present();
  }

  // Agregar nuevo ejercicio desde el formulario
  onEjercicioAgregado(ejercicio: Ejercicio) {
    this.ejercicioService.agregarEjercicio(ejercicio).then(() => {
      this.cargarEjercicios();
    });
  }

  // Seleccionar un ejercicio y abrir el formulario para especificar series y repeticiones
  async seleccionarEjercicio(ejercicio: Ejercicio) {
    const modal = await this.modalController.create({
      component: ElegirEjercicioComponent, // Asumiendo que ya tienes un formulario para especificar los detalles del ejercicio
      componentProps: {
        ejercicioSeleccionado: ejercicio // Pasamos el ejercicio seleccionado como propiedad al formulario
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Aquí puedes procesar el ejercicio con series y repeticiones especificadas
        console.log('Ejercicio agregado a la rutina:', result.data);
        // Ejemplo: añadir el ejercicio al día en la rutina
      }
    });

    await modal.present();
  }
}