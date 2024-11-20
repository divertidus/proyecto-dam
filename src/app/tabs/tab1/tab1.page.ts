import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, PopoverController } from '@ionic/angular';
import { AuthService } from '../../auth/auth.service';
import { Usuario } from '../../models/usuario.model';
import { ModalController } from '@ionic/angular';
import { DiaRutina, Rutina } from 'src/app/models/rutina.model';
import { Subscription } from 'rxjs';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { FormDiaComponent } from 'src/app/componentes/rutina/form-dia/form-dia.component';
import { ToolbarLoggedComponent } from 'src/app/componentes/shared/toolbar-logged/toolbar-logged.component';
import { IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonCardContent, IonContent, IonModal, IonAlert, IonTitle, IonFooter, IonToolbar } from "@ionic/angular/standalone";
import { EjercicioService } from 'src/app/services/database/ejercicio.service';
import { RutinaService } from 'src/app/services/database/rutina.service';
import { EditarDiaRutinaComponent } from 'src/app/componentes/rutina/editar-dia-rutina/editar-dia-rutina.component';
import { v4 as uuidv4 } from 'uuid';
import { ImportarExportarRutinaComponent } from 'src/app/componentes/importar-exportar-rutina/importar-exportar-rutina.component';


@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [IonFooter,  IonModal, IonContent, IonCardContent, IonList, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonIcon,
    IonButton, CommonModule, FormsModule, NgFor, NgIf, ToolbarLoggedComponent, FormsModule, ImportarExportarRutinaComponent],
  providers: [ModalController, PopoverController]
})
export class Tab1Page implements OnInit, OnDestroy {

  abrirModalAgregarDia(_t19: Rutina, $event: MouseEvent) {
    throw new Error('Method not implemented.');
  }

  usuarioLogeado: Usuario | null = null;
  rutinas: Rutina[] = [];
  ejercicios: Ejercicio[] = []; // Lista de todos los ejercicios
  rutinaExpandida: string | null = null; // Propiedad para controlar cuál rutina está expandida
  diaExpandido: string | null = null; // Nueva variable de control para el día expandido


  private rutinaSubscription: Subscription;
  private usuarioSubscription: Subscription;


  constructor(
    private authService: AuthService,
    private rutinaService: RutinaService,
    private ejercicioService: EjercicioService, // Añadimos el servicio de ejercicios   
    private modalController: ModalController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    // Suscribirse a cambios del usuario logueado
    this.usuarioSubscription = this.authService.usuarioLogeado$.subscribe(usuario => {
      this.usuarioLogeado = usuario;
      if (this.usuarioLogeado) {
        console.log("Usuario logueado en Tab1Page:", this.usuarioLogeado); // Verifica el usuario cargado
        this.rutinaService.cargarRutinas();
        this.cargarEjercicios();
      } else {
        this.rutinas = [];
      }
    });

    // Suscribirse a cambios en las rutinas almacenadas
    this.rutinaSubscription = this.rutinaService.rutinas$.subscribe(rutinas => {
      if (this.usuarioLogeado) {
        this.rutinas = rutinas.filter(rutina => rutina.usuarioId === this.usuarioLogeado?._id);
        //  console.log("Rutinas filtradas para usuario Tab1Page :", this.rutinas); this.ordenarRutinas();
      } else {
        this.rutinas = [];
      }
    });
  }

  // Función para ordenar las rutinas por timestamp (las más recientes primero)
  ordenarRutinas() {
    this.rutinas.sort((b, a) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // Ordena de más antigua a más reciente
    });
  }

  // Método para abrir el formulario de creación de día
  async abrirFormularioDia(rutina?: Rutina, event?: Event) {
    if (event) {
      event.stopPropagation(); // Evitar la propagación del clic si es necesario
    }

    try {
      const modal = await this.modalController.create({
        component: FormDiaComponent,
        componentProps: {
          ejercicios: this.ejercicios, // Lista de ejercicios disponible
          diaExistente: null, // No se pasa un día existente porque es para añadir un nuevo día
          modo: 'crear', // Siempre es modo crear
          numeroDiasExistentes: rutina ? rutina.dias.length : 0
        }
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();

      if (data && data.ejercicios.length > 0) {
        if (rutina) {
          this.guardarNuevoDiaEnRutina(rutina, data);
        } else {
          this.crearRutinaConDia(data);
        }
      } else {
        console.log('No se añadió ningún día con ejercicios.');
      }
    } catch (error) {
      console.error('Error al intentar abrir el modal:', error);
    }
  }

  // Método para crear una nueva rutina con un día
  crearRutinaConDia(dia: DiaRutina) {
    const numeroRutina = this.rutinas.length + 1; // Definir el número de la nueva rutina
    const nuevaRutina: Rutina = {
      _id: uuidv4(), // Generar un _id único con uuidv4()
      entidad: 'rutina',
      nombre: `Rutina ${numeroRutina}`,
      usuarioId: this.usuarioLogeado?._id || '',
      descripcion: '',
      dias: [dia], // Añadir el día creado a la nueva rutina
      timestamp: new Date().toISOString()
    };

    // Agregar la rutina y refrescar la lista tras confirmación de éxito
    this.rutinaService.agregarRutina(nuevaRutina).then(() => {
      this.rutinas = [...this.rutinas, nuevaRutina];
      console.log('Nueva rutina creada y añadida a la lista local');
      this.rutinaService.cargarRutinas(); // Refrescar las rutinas
    });
  }

  // Método para guardar un nuevo día en una rutina existente
  guardarNuevoDiaEnRutina(rutina: Rutina, dia: DiaRutina) {
    rutina.dias.push(dia);
    this.rutinaService.actualizarRutina(rutina).then(() => {
      console.log('Nuevo día añadido y rutina actualizada');
      this.rutinaService.cargarRutinas(); // Refrescar la lista de rutinas después de añadir el nuevo día
    });
  }

  // Método para crear una nueva rutina (sin crearla directamente en la lista)
  crearNuevaRutina() {
    this.abrirFormularioDia(); // Abre directamente el modal para crear un nuevo día
  }

  ngOnDestroy() {
    // Desuscribimos para evitar fugas de memoria
    if (this.rutinaSubscription) {
      this.rutinaSubscription.unsubscribe();
    }
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  // Cargar los ejercicios desde el servicio
  async cargarEjercicios() {
    this.ejercicios = await this.ejercicioService.obtenerEjercicios();
  }

  // Obtener el nombre del ejercicio por ID
  obtenerNombreEjercicio(ejercicioId: string): string {
    const ejercicio = this.ejercicios.find(e => e._id === ejercicioId);
    return ejercicio ? ejercicio.nombre : 'Ejercicio desconocido';
  }

  // Alternar si la rutina está expandida o no
  toggleExpandirRutina(rutina: Rutina) {
    this.rutinaExpandida = this.rutinaExpandida === rutina._id ? null : rutina._id;
  }
  // Eliminar rutina con confirmación
  async eliminarRutina(rutina: Rutina, event: Event) {
    event.stopPropagation(); // Evitar que el clic se propague y active otros elementos
    const alert = await this.alertController.create({
      header: 'Eliminar Rutina',
      message: `¿Estás seguro de que deseas eliminar la rutina "${rutina.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.rutinaService.eliminarRutina(rutina._id);
            console.log('Rutina eliminada con éxito');
            this.rutinaService.cargarRutinas(); // Recargar la lista de rutinas después de eliminar
          }
        }
      ]
    });
    await alert.present();
  }

  // Cambiar el nombre y la descripción de la rutina
  async editarRutina(rutina: Rutina, event: Event) {
    event.stopPropagation(); // Evitar la propagación del clic
    const alert = await this.alertController.create({
      header: 'Editar Rutina',
      inputs: [
        /* {
            name: 'nombre',
            type: 'text',
            placeholder: 'Nuevo nombre de la rutina',
            value: rutina.nombre
        }, */
        {
          name: 'descripcion',
          type: 'textarea',
          placeholder: 'Descripción de la rutina',
          value: rutina.descripcion || '' // Mostrar la descripción existente o una cadena vacía
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            // Verifica que los campos de nombre y descripcion no estén vacíos antes de asignar
            if (data.descripcion && data.descripcion.trim() !== '') {
              rutina.descripcion = data.descripcion.trim(); // Actualizar la descripción también
            }
            if (data.nombre && data.nombre.trim() !== '') {
              rutina.nombre = data.nombre.trim();
            }
            // Asegúrate de llamar a actualizar siempre
            await this.rutinaService.actualizarRutina(rutina);
            console.log('Rutina actualizada con éxito');
            this.rutinaService.cargarRutinas(); // Recargar la lista de rutinas después de actualizar
          }
        }
      ]
    });
    await alert.present();
  }

  // Método para alternar si un día está expandido o colapsado
  toggleExpandirDia(diaRutina: DiaRutina) {
    // Al hacer clic en un día, alterna su estado expandido
    this.diaExpandido = this.diaExpandido === diaRutina._id ? null : diaRutina._id;
  }


  async eliminarDia(diaRutina: DiaRutina) {
    console.log('Se pulsa eliminar y TODO elimnar el dia: ', diaRutina)
  }

  async editarDiaRutina(rutina: Rutina, diaRutina: DiaRutina) {
    console.log('Click en editar Día');

    const modal = await this.modalController.create({
      component: EditarDiaRutinaComponent,
      componentProps: {
        diaRutina: JSON.parse(JSON.stringify(diaRutina)), // Pasar solo el día a editar como copia profunda
        rutinaId: rutina._id // Pasar el ID de la rutina
      }
    });

    await modal.present();
  }


}
