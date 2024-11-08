import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Ejercicio } from '../../../models/ejercicio.model';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons'
import { IonGrid, IonRow, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonCardContent, IonCard, IonCol, IonFooter, IonToolbar, IonPopover, IonItem, IonSearchbar, IonHeader, IonTitle, IonContent, IonFabButton, IonFab } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { FiltroEjercicioComponent, TipoPesoFiltro } from '../../filtros/filtro-ejercicio/filtro-ejercicio.component';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-ejercicio-list',
  templateUrl: './ejercicio-list.component.html',
  styleUrls: ['./ejercicio-list.component.scss'],
  standalone: true,
  imports: [IonFab, IonFabButton, IonContent, IonTitle, IonHeader, IonSearchbar, IonItem,
    IonPopover, IonToolbar, IonFooter, IonCol, IonCard, FormsModule,
    IonCardContent, IonIcon, IonButton, IonCardSubtitle, IonCardTitle,
    IonCardHeader, IonRow, IonGrid, CommonModule, FiltroEjercicioComponent]
})
export class EjercicioListComponent implements OnInit {

  ejercicios$: Observable<Ejercicio[]>; // Observable que maneja la lista reactiva de ejercicios
  ejercicios: Ejercicio[] = []; // Lista de ejercicios originales
  ejerciciosFiltrados: Ejercicio[] = []; // Lista para la búsqueda y filtrado en tiempo real

  @Output() editarEjercicio = new EventEmitter<Ejercicio>();
  @Output() eliminarEjercicio = new EventEmitter<Ejercicio>();

  filtroTipoPeso: TipoPesoFiltro = {
    Barra: false,
    Mancuernas: false,
    Máquina: false,
    "Peso Corporal": false,
  };

  filtroMusculoPrincipal: { [key: string]: boolean } = {}; // Filtros de grupo muscular

  constructor(private ejercicioService: EjercicioService, private modalController: ModalController) {
    addIcons(todosLosIconos);
  }

  ngOnInit() {
    // Cargar ejercicios iniciales y suscribirse para actualizaciones
    this.ejercicioService.ejercicios$.subscribe(ejercicios => {
      this.ejercicios = ejercicios;
      this.ejerciciosFiltrados = [...this.ejercicios]; // Inicialización de la lista filtrada
    });
  }

  // Método para buscar ejercicios por texto
  buscarEjercicios(event: any) {
    const valorBusqueda = event.detail.value ? event.detail.value.toLowerCase() : '';
    this.aplicarFiltros(valorBusqueda); // Aplicar el filtro de texto junto con los demás filtros
  }

  // Método que recibe los filtros desde FiltroEjercicioComponent
  aplicarFiltrosDesdeFiltro(event: { tipoPeso: TipoPesoFiltro; musculoPrincipal: { [key: string]: boolean } }) {
    this.filtroTipoPeso = event.tipoPeso;
    this.filtroMusculoPrincipal = event.musculoPrincipal;
    this.aplicarFiltros(); // Aplicar los filtros tras actualizar los valores
  }

  aplicarFiltros(valorBusqueda: string = '') {
    // Filtrado similar al segundo componente, aplicando los mismos principios
    this.ejerciciosFiltrados = this.ejercicios.filter(ejercicio => {
      const coincideBusqueda = ejercicio.nombre.toLowerCase().includes(valorBusqueda) ||
        (ejercicio.descripcion && ejercicio.descripcion.toLowerCase().includes(valorBusqueda)) ||
        (ejercicio.musculoPrincipal && ejercicio.musculoPrincipal.toLowerCase().includes(valorBusqueda));

      // Verificar si hay algún filtro activo en `filtroTipoPeso`
      const tipoPesoActivo = Object.values(this.filtroTipoPeso).some(valor => valor);
      const tipoPesoSeleccionado = tipoPesoActivo ?
        this.filtroTipoPeso[ejercicio.tipoPeso as keyof TipoPesoFiltro] : true;

      // Verificar si hay algún filtro activo en `filtroMusculoPrincipal`
      const musculoActivo = Object.values(this.filtroMusculoPrincipal).some(valor => valor);
      const musculoSeleccionado = musculoActivo ?
        this.filtroMusculoPrincipal[ejercicio.musculoPrincipal] : true;

      // Combinar todos los criterios para determinar si el ejercicio pasa el filtro
      return coincideBusqueda && tipoPesoSeleccionado && musculoSeleccionado;
    });

    console.log('Ejercicios después de aplicar filtros:', this.ejerciciosFiltrados);
  }

  // Métodos para emitir eventos de edición y eliminación
  onEditarEjercicio(ejercicio: Ejercicio) {
    this.editarEjercicio.emit(ejercicio);
  }

  onEliminarEjercicio(ejercicio: Ejercicio) {
    this.eliminarEjercicio.emit(ejercicio);
  }

  // Define el método cerrarModal()
  cerrarModal() {
    this.modalController.dismiss();
  }

  abrirModalNuevoEjercicio() {
    // Abre el modal o ejecuta la función que se debe realizar al presionar el botón "+"
    console.log('Botón de agregar nuevo ejercicio presionado');
    // Implementa la lógica para abrir un modal o añadir un nuevo ejercicio aquí
  }
}