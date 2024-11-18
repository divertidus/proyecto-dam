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
import { ToastController } from '@ionic/angular/standalone';
import { groupBy } from 'lodash'; // Puedes usar lodash para simplificar el agrupamiento

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
  ejerciciosAgrupados: { [key: string]: Ejercicio[] } = {}; // Nueva propiedad para almacenar ejercicios agrupados
  estadoGrupo: { [key: string]: boolean } = {};



  filtroTipoPeso: TipoPesoFiltro = {
    Barra: false,
    Mancuernas: false,
    Máquina: false,
    "Peso Corporal": false,

  };

  filtroMusculoPrincipal: { [key: string]: boolean } = {}; // Filtros de grupo muscular

  constructor(private ejercicioService: EjercicioService,
    private popoverController: PopoverController,
    private alertController: AlertController,
    private toastController: ToastController) {
    addIcons(todosLosIconos);
    this.updateScreenSize(); // Inicializar el valor al cargar
  }

  ngOnInit() {
    // Cargar ejercicios iniciales y suscribirse para actualizaciones
    this.ejercicioService.ejercicios$.subscribe(ejercicios => {
      this.ejercicios = ejercicios;
      this.aplicarFiltros();

      // Orden alfabético por defecto
      this.ejercicios.sort((a, b) => a.nombre.localeCompare(b.nombre));

      // Agrupar ejercicios por grupo muscular
      this.ejerciciosAgrupados = groupBy(this.ejercicios, 'musculoPrincipal');

      // Inicializar estado desplegable de cada grupo como cerrado
      Object.keys(this.ejerciciosAgrupados).forEach(grupo => {
        this.estadoGrupo[grupo] = false; // Por defecto, los grupos están cerrados
      });

      // Ordenar alfabéticamente los ejercicios dentro de cada grupo
      Object.keys(this.ejerciciosAgrupados).forEach(grupo => {
        this.ejerciciosAgrupados[grupo].sort((a, b) => a.nombre.localeCompare(b.nombre));
      });

      // Inicialización de la lista filtrada (sin filtros aplicados al inicio)
      this.ejerciciosFiltrados = [...this.ejercicios];
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
    this.ejerciciosFiltrados = this.ejercicios.filter(ejercicio => {
      // Filtrado por texto
      const coincideBusqueda = ejercicio.nombre.toLowerCase().includes(valorBusqueda) ||
        (ejercicio.descripcion && ejercicio.descripcion.toLowerCase().includes(valorBusqueda));

      // Filtrado por tipo de peso
      const tipoPesoActivo = Object.values(this.filtroTipoPeso).some(valor => valor);
      const tipoPesoSeleccionado = tipoPesoActivo ?
        this.filtroTipoPeso[ejercicio.tipoPeso as keyof TipoPesoFiltro] : true;

      // Filtrado por grupo muscular
      const musculoActivo = Object.values(this.filtroMusculoPrincipal).some(valor => valor);
      const musculoSeleccionado = musculoActivo ?
        this.filtroMusculoPrincipal[ejercicio.musculoPrincipal] : true;

      return coincideBusqueda && tipoPesoSeleccionado && musculoSeleccionado;
    });

    // Agrupar los ejercicios filtrados
    this.ejerciciosAgrupados = this.agruparEjerciciosPorMusculo(this.ejerciciosFiltrados);

    // Ajustar estados de los grupos según los filtros
    Object.keys(this.ejerciciosAgrupados).forEach(grupo => {
      if (!(grupo in this.estadoGrupo)) {
        this.estadoGrupo[grupo] = false;
      }
    });
  }

  toggleGrupo(grupo: string) {
    this.estadoGrupo[grupo] = !this.estadoGrupo[grupo];
  }


  // Método para mostrar un mensaje Toast cuando se crea un ejercicio
  async abrirFormularioEjercicio() {
    const popover = await this.popoverController.create({
      component: EjercicioFormComponent,
      cssClass: 'popover-ejercicio-compacto',
      backdropDismiss: true,
      mode: 'md', // Fuerza el modo android
      showBackdrop: true,
      animated: true, // Habilita animaciones
    });

    popover.onDidDismiss().then(async (result) => {
      if (result.data) {
        // Actualizar lista de ejercicios tras la creación de uno nuevo
        this.actualizarListaEjercicios();

        // Mostramos el Toast de confirmación
        const toast = await this.toastController.create({
          message: 'Ejercicio creado correctamente',
          duration: 2000, // Duración en milisegundos (2 segundos)
          color: 'success', // Color de éxito (opcional)
          position: 'bottom', // Posición del Toast
        });
        await toast.present();
      }
    });

    await popover.present();
  }

  private actualizarListaEjercicios() {
    // Refrescar los ejercicios en caso de cambios
    this.ejercicioService.ejercicios$.subscribe((ejercicios) => {
      this.ejercicios = ejercicios;
      // Re-aplicar el orden y el agrupamiento
      this.ejercicios.sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.ejerciciosAgrupados = groupBy(this.ejercicios, 'musculoPrincipal');
      Object.keys(this.ejerciciosAgrupados).forEach(grupo => {
        this.ejerciciosAgrupados[grupo].sort((a, b) => a.nombre.localeCompare(b.nombre));
      });
      this.ejerciciosFiltrados = [...this.ejercicios];
    });
  }


  async abrirPopoverEjercicio(ejercicio: Ejercicio) {
    const popover = await this.popoverController.create({
      component: EjercicioVerEditarPopoverComponent,
      componentProps: { ejercicio: { ...ejercicio } }, // Pasar una copia del ejercicio
      cssClass: 'popover-ejercicio-compacto',
      backdropDismiss: true,
      mode: 'md', // Fuerza el modo android
      showBackdrop: true,
      animated: true, // Habilita animaciones
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
      cssClass: 'popover-ejercicio-compacto',
      backdropDismiss: true,
      mode: 'md', // Fuerza el modo android
      showBackdrop: true,
      animated: true, // Habilita animaciones
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

  // Función para agrupar ejercicios por grupo muscular
  private agruparEjerciciosPorMusculo(ejercicios: Ejercicio[]): { [key: string]: Ejercicio[] } {
    return ejercicios.reduce((grupos, ejercicio) => {
      const grupo = ejercicio.musculoPrincipal || 'Otros';
      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }
      grupos[grupo].push(ejercicio);
      return grupos;
    }, {});
  }
}