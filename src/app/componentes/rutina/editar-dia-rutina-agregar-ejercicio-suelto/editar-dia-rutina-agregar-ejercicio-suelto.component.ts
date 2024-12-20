import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioPlan } from 'src/app/models/rutina.model';
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import {
  IonItem, IonSearchbar, IonGrid, IonRow, IonCol, IonCardHeader,
  IonCardContent, IonCard, IonCardTitle, IonHeader, IonToolbar, IonContent, IonButton, IonFooter, IonIcon, IonPopover, IonTitle, IonModal, IonButtons } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import { FiltroEjercicioComponent, TipoPesoFiltro, MusculoPrincipalFiltro } from '../../filtros/filtro-ejercicio/filtro-ejercicio.component';
import { v4 as uuidv4 } from 'uuid';
import { EjercicioRealizado } from 'src/app/models/historial-entrenamiento';
import { EjercicioFormComponent } from '../../ejercicio/ejercicio-form/ejercicio-form.component';

@Component({
  selector: 'app-editar-dia-rutina-agregar-ejercicio-suelto',
  templateUrl: './editar-dia-rutina-agregar-ejercicio-suelto.component.html',
  styleUrls: ['./editar-dia-rutina-agregar-ejercicio-suelto.component.scss'],
  imports: [IonButtons,IonTitle, IonPopover, IonIcon, IonFooter, IonButton,
    IonContent, IonToolbar, IonHeader, IonCardTitle,
    IonCard, IonCardContent, IonCardHeader, IonCol,
    FormsModule, IonRow, IonGrid, IonSearchbar, IonItem,
    NgFor, FiltroEjercicioComponent,NgIf],
  standalone: true,
  providers: []
})
export class EditarDiaRutinaAgregarEjercicioSueltoComponent implements OnInit {

  @Output() ejercicioSeleccionado = new EventEmitter<EjercicioPlan>(); // Emisor para comunicar con el padre

  ejercicios: Ejercicio[] = []; // Lista de ejercicios obtenidos del servicio
  ejerciciosFiltrados: Ejercicio[] = []; // Lista para los ejercicios filtrados en tiempo real
  private ejerciciosSub: Subscription; // Suscripción para manejar actualizaciones en tiempo real

  filtroTipoPeso: TipoPesoFiltro = {
    Barra: false,
    Mancuernas: false,
    Máquina: false,
    "Peso Corporal": false,
  };

  filtroMusculoPrincipal: { [key: string]: boolean } = {};   // Filtros de grupo muscular


  constructor(
    private ejercicioService: EjercicioService,
    private alertController: AlertController,
    private modalController: ModalController,
    private popoverController: PopoverController,
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

  async seleccionarEjercicio(ejercicio: Ejercicio) {
    const alert = await this.alertController.create({
      header: `Agregar ${ejercicio.nombre}`,
      backdropDismiss: false,
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
            console.log('Datos ingresados:', data);
            if (!data.series || !data.repeticiones) {
              console.warn('Series o repeticiones no válidas');
              return false;
            }
  
            const ejercicioPlan: EjercicioPlan = {
              _id: uuidv4(),
              ejercicioId: ejercicio._id!,
              nombreEjercicio: ejercicio.nombre,
              series: data.series,
              repeticiones: data.repeticiones,
              notas: data.notas || '',
              tipoPeso: ejercicio.tipoPeso,
            };
  
            console.log('EjercicioPlan creado:', ejercicioPlan);
  
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


  aplicarFiltrosDesdeFiltro(event: { tipoPeso: TipoPesoFiltro; musculoPrincipal: MusculoPrincipalFiltro }) {
    console.log('Filtros recibidos desde el popover:', event); // Depuración
    this.filtroTipoPeso = event.tipoPeso;
    this.filtroMusculoPrincipal = event.musculoPrincipal;
    this.aplicarFiltros();
  }



  aplicarFiltros(valorBusqueda: string = '') {
    console.log('Aplicando filtros con valores:', this.filtroTipoPeso, this.filtroMusculoPrincipal); // Depuración

    this.ejerciciosFiltrados = this.ejercicios.filter(ejercicio => {
      const coincideBusqueda = ejercicio.nombre.toLowerCase().includes(valorBusqueda) ||
        (ejercicio.descripcion && ejercicio.descripcion.toLowerCase().includes(valorBusqueda)) ||
        (ejercicio.musculoPrincipal && ejercicio.musculoPrincipal.toLowerCase().includes(valorBusqueda));

      // Verificamos si hay algún tipo de peso marcado en los filtros
      const tipoPesoActivo = Object.values(this.filtroTipoPeso).some(v => v);
      const tipoPesoSeleccionado = tipoPesoActivo ?
        this.filtroTipoPeso[ejercicio.tipoPeso as keyof TipoPesoFiltro] : true;

      // Verificamos si hay algún grupo muscular marcado en los filtros
      const musculoActivo = Object.values(this.filtroMusculoPrincipal).some(v => v);
      const musculoSeleccionado = musculoActivo ?
        this.filtroMusculoPrincipal[ejercicio.musculoPrincipal] : true;

      // Combinamos todos los criterios para determinar si el ejercicio pasa el filtro
      const resultado = coincideBusqueda && tipoPesoSeleccionado && musculoSeleccionado;

      console.log(`Ejercicio: ${ejercicio.nombre} - Pasa filtro: ${resultado}`); // Depuración de cada ejercicio
      return resultado;
    });

    console.log('Lista de ejercicios después de aplicar filtros:', this.ejerciciosFiltrados); // Resultado final
  }
  async crearNuevoEjercicio() {
    const popover = await this.popoverController.create({
      component: EjercicioFormComponent,
      cssClass: 'popover-ejercicio-compacto',
      backdropDismiss: true,
      mode: 'md', // Puedes ajustar a 'ios' si estás en iOS
      showBackdrop: true,
    });
  
    popover.onDidDismiss().then(async (result) => {
      if (result.data) {
        console.log('Ejercicio creado desde EditarDiaRutinaAgregarEjercicioSuelto:', result.data);
  
        // Actualizar lista de ejercicios
        await this.actualizarListaEjercicios();
  
        // Emitir el nuevo ejercicio al componente padre
        this.seleccionarEjercicio(result.data);
      } else {
        console.log('No se creó ningún ejercicio.');
      }
    });
  
    await popover.present();
  }
  
  private async actualizarListaEjercicios() {
    // Refrescar la lista de ejercicios desde el servicio
    const ejercicios = await this.ejercicioService.obtenerEjercicios();
    this.ejercicios = ejercicios;
  
    // Ordenar y actualizar lista filtrada
    this.ejercicios.sort((a, b) => a.nombre.localeCompare(b.nombre));
    this.ejerciciosFiltrados = [...this.ejercicios];
  }

}