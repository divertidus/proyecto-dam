import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { EjercicioListComponent } from 'src/app/componentes/ejercicio/ejercicio-list/ejercicio-list.component';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons'
import { EjercicioFormComponent } from 'src/app/componentes/ejercicio/ejercicio-form/ejercicio-form.component';
import { ToolbarLoggedComponent } from 'src/app/componentes/toolbar-logged/toolbar-logged.component';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [EjercicioListComponent, CommonModule, FormsModule, IonicModule,ToolbarLoggedComponent]
})
export class Tab4Page implements OnInit {

  ejercicios: Ejercicio[] = []; // Almacena todos los ejercicios
  ejerciciosFiltrados: Ejercicio[] = []; // Ejercicios filtrados por la barra de búsqueda
  buscando: string = ''; // Para controlar el valor de la búsqueda
  ejerciciosMarcados: string[] = []; // Cambia a un array

  constructor(private ejercicioService: EjercicioService, private modalController: ModalController) { addIcons(todosLosIconos) }

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
      (ejercicio.musculoPrincipal && ejercicio.musculoPrincipal.toLowerCase().includes(valorBusqueda))
    );
  }

  // Mostrar el formulario emergente para agregar ejercicio
  async mostrarFormularioAgregar() {
    const modal = await this.modalController.create({
      component: EjercicioFormComponent
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

  // Eliminar ejercicio
  async eliminarEjercicio(ejercicio: Ejercicio) {
    await this.ejercicioService.eliminarEjercicio(ejercicio);
    this.cargarEjercicios();
  }

  // Editar ejercicio
  editarEjercicio(ejercicio: Ejercicio) {
    console.log('Editar ejercicio:', ejercicio);
    // Lógica para editar
  }

  // Marcar o desmarcar ejercicio
  toggleMarcarEjercicio(ejercicio: Ejercicio) {
    // Verifica si el ID del ejercicio está definido
    if (!ejercicio._id) {
      console.error('ID de ejercicio no definido', ejercicio); // Salida en consola si el ID es undefined
      return; // Sale de la función si el ID no es válido
    }

    // Busca el índice del ID del ejercicio en el array de ejerciciosMarcados
    const index = this.ejerciciosMarcados.indexOf(ejercicio._id);

    if (index > -1) {
      // Si el ID está en el array, lo eliminamos (desmarcamos)
      this.ejerciciosMarcados.splice(index, 1); // Desmarcar
      console.log('Desmarcado', ejercicio._id); // Mensaje en consola para verificar que se desmarcó
    } else {
      // Si el ID no está en el array, lo agregamos (marcamos)
      this.ejerciciosMarcados.push(ejercicio._id); // Marcar
      console.log('Marcado', ejercicio._id); // Mensaje en consola para verificar que se marcó
    }
  }

  // Procesar los ejercicios marcados cuando se acepte
  procesarEjerciciosMarcados() {
    // Filtra los ejercicios que están marcados (su _id está en ejerciciosMarcados)
    const ejerciciosSeleccionados = this.ejercicios.filter(ejercicio => this.ejerciciosMarcados.includes(ejercicio._id));
    console.log('Ejercicios seleccionados:', ejerciciosSeleccionados); // Muestra en consola los ejercicios seleccionados

    // Aquí puedes enviar la información de los ejercicios seleccionados a un servicio o procesarlos

    // Desmarcar todos los ejercicios: vaciamos el array ejerciciosMarcados
    this.ejerciciosMarcados = []; // Reinicia el array para desmarcar todos
    // Al vaciar este array, Angular actualiza la interfaz y desmarca todos los checkboxes vinculados a ejerciciosMarcados
  }
}
