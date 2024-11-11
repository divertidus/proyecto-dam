import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Ejercicio } from '../../../models/ejercicio.model';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons'
import {
  IonGrid, IonRow, IonCardHeader, IonCardTitle,
  IonButton, IonIcon, IonCardContent,
  IonCard, IonCol, IonToolbar, IonPopover,
  IonItem, IonSearchbar, IonHeader, IonContent,
  IonFabButton, IonFab
} from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { FiltroEjercicioComponent, TipoPesoFiltro } from '../../filtros/filtro-ejercicio/filtro-ejercicio.component';
import { PopoverController, AlertController } from '@ionic/angular';
import { EjercicioFormComponent } from '../ejercicio-form/ejercicio-form.component';
import { EjercicioVerEditarPopoverComponent } from '../../ejercicio-ver-editar-popover/ejercicio-ver-editar-popover.component';
@Component({
  selector: 'app-ejercicio-list',
  templateUrl: './ejercicio-list.component.html',
  styleUrls: ['./ejercicio-list.component.scss'],
  standalone: true,
  imports: [IonFab, IonFabButton, IonContent, IonHeader, IonSearchbar, IonItem,
    IonPopover, IonToolbar, IonCol, IonCard, FormsModule,
    IonCardContent, IonIcon, IonButton, IonCardTitle,
    IonCardHeader, IonRow, IonGrid, CommonModule, FiltroEjercicioComponent]
})
export class EjercicioListComponent implements OnInit {

  @ViewChild(IonContent) content: IonContent;
  private scrollPosition = 0;

  @Output() eliminarEjercicio = new EventEmitter<Ejercicio>();

  ejercicios$: Observable<Ejercicio[]>; // Observable que maneja la lista reactiva de ejercicios
  ejercicios: Ejercicio[] = []; // Lista de ejercicios originales
  ejerciciosFiltrados: Ejercicio[] = []; // Lista para la búsqueda y filtrado en tiempo real
  ejercicioSeleccionadoId: string | null = null; // ID del ejercicio actualmente "dado la vuelta"

  isSmallScreen: boolean; // Nueva propiedad para detectar pantalla pequeña



  filtroTipoPeso: TipoPesoFiltro = {
    Barra: false,
    Mancuernas: false,
    Máquina: false,
    "Peso Corporal": false,

  };

  filtroMusculoPrincipal: { [key: string]: boolean } = {}; // Filtros de grupo muscular

  constructor(private ejercicioService: EjercicioService,
    private popoverController: PopoverController,
    private alertController: AlertController) {
    addIcons(todosLosIconos);
    this.updateScreenSize(); // Inicializar el valor al cargar
  }

  ngOnInit() {
    // Cargar ejercicios iniciales y suscribirse para actualizaciones
    this.ejercicioService.ejercicios$.subscribe(ejercicios => {
      this.ejercicios = ejercicios;
      this.ejerciciosFiltrados = [...this.ejercicios]; // Inicialización de la lista filtrada

    });
  }

  // Detectar cambios en el tamaño de la ventana para actualizar isSmallScreen
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateScreenSize();
  }

  private updateScreenSize() {
    // Definimos 768px como límite para una pantalla pequeña (mobile-first)
    this.isSmallScreen = window.innerWidth < 768;
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


  async abrirFormularioEjercicio() {
    const popover = await this.popoverController.create({
      component: EjercicioFormComponent,
      cssClass: 'popover-ejercicio-compacto',
      backdropDismiss: true,
    });

    popover.onDidDismiss().then((result) => {
      if (result.data) {
        // Llamamos al método para actualizar la lista
        this.actualizarListaEjercicios();
      }
    });

    await popover.present();
  }

  private actualizarListaEjercicios() {
    // Refrescar los ejercicios en caso de cambios
    this.ejercicioService.ejercicios$.subscribe((ejercicios) => {
      this.ejerciciosFiltrados = ejercicios;
    });
  }


  async abrirPopoverEjercicio(ejercicio: Ejercicio) {
    const popover = await this.popoverController.create({
      component: EjercicioVerEditarPopoverComponent,
      componentProps: { ejercicio: { ...ejercicio } }, // Pasar una copia del ejercicio
      cssClass: 'popover-ejercicio-compacto',
      backdropDismiss: true,
    });

    popover.onDidDismiss().then((result) => {
      if (result.data) {
        // Actualizar el ejercicio si se ha editado
        const index = this.ejercicios.findIndex(e => e.nombre === result.data.nombre);
        if (index !== -1) {
          this.ejercicios[index] = result.data;
          this.ejerciciosFiltrados = [...this.ejercicios]; // Actualiza la lista filtrada
        }
      }
    });

    await popover.present();
  }

  toggleDetalle(ejercicioId: string) {
    this.ejercicioSeleccionadoId = this.ejercicioSeleccionadoId === ejercicioId ? null : ejercicioId;
  }

  // Métodos de edición y eliminación
  async editarEjercicio(ejercicio: Ejercicio) {
    // Guarda la posición actual del scroll
    this.scrollPosition = await this.content.getScrollElement().then(el => el.scrollTop);
    console.log('Ejercicio seleccionado para editar:', ejercicio);
    console.log('Y por tanto su descripcion:', ejercicio.descripcion);


    const popover = await this.popoverController.create({
      component: EjercicioFormComponent,
      componentProps: {
        ejercicio: { ...ejercicio }, // Pasamos una copia del ejercicio para editar
        modoEdicion: true
      },
      cssClass: 'popover-ejercicio-compacto'
    });

    popover.onDidDismiss().then((result) => {
      if (result.data) {
        // Refrescar la lista si es necesario
      }

      // Restaura la posición del scroll
      this.content.scrollToPoint(0, this.scrollPosition, 0);
    });

    await popover.present();
  }

  async confirmarEliminar(ejercicio: Ejercicio) {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de que deseas eliminar este ejercicio?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            // Lógica opcional al cancelar
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.ejercicioService.eliminarEjercicio(ejercicio).then(() => {
              // Actualización de la lista o lógica adicional post-eliminación
            }).catch(error => {
              console.error('Error al eliminar el ejercicio:', error);
              // Manejo adicional de errores si es necesario
            });
          }
        }
      ]
    });

    await alert.present();
  }
}