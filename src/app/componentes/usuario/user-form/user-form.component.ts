import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuario } from 'src/app/models/usuario.model';
import { IonCard, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonButton, IonCardContent, IonIcon } from "@ionic/angular/standalone";
import { IonInput, ToastController } from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/services/database/usuario.service';
import { NgFor, NgIf } from '@angular/common';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons'
import { Swiper } from 'swiper';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [IonIcon,
    IonCardContent, IonButton, NgIf, IonLabel, IonItem,
    IonCard, NgFor, FormsModule, IonInput,
  ],
})
export class UserFormComponent {

  nombre: string = '';
  email: string = '';
  avatarSeleccionado: string | null = null;
  avatares: string[] = [];
  avatarSeleccionadoIndex: number | null = null;
  avatarActual: string; // Avatar inicial mostrado
  modoSeleccionAvanzado = false; // Alterna entre vista de galería y vista seleccionada
  avataresPorPagina = 6; // Cantidad de avatares por página
  avatarPaginas: string[][] = []; // Nueva propiedad para dividir avatares en páginas

  @Output() eventoUsuarioAñadido = new EventEmitter<void>();
  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef;

  constructor(private usuarioService: UsuarioService,
    private toastController: ToastController) {
    addIcons(todosLosIconos);
  }

  ngOnInit() {
    this.cargarAvatares();
    this.avatarSeleccionadoIndex = Math.floor(Math.random() * this.avatares.length);
    this.avatarActual = this.avatares[this.avatarSeleccionadoIndex];
    this.avatarSeleccionado = this.avatarActual; // Asegura que el avatar aleatorio se seleccione por defecto
    this.dividirAvataresEnPaginas(); // Llamar aquí después de cargar los avatares
  }

  // Cargar avatares estáticos
  cargarAvatares() {
    this.avatares = [
      'assets/imagenes/usuarios/avatares/av001.png',
      'assets/imagenes/usuarios/avatares/av002.png',
      'assets/imagenes/usuarios/avatares/av003.png',
      'assets/imagenes/usuarios/avatares/av004.png',
      'assets/imagenes/usuarios/avatares/av005.png',
      'assets/imagenes/usuarios/avatares/av006.png',
      'assets/imagenes/usuarios/avatares/av007.png',
      'assets/imagenes/usuarios/avatares/av008.png',
      'assets/imagenes/usuarios/avatares/av009.png',
      'assets/imagenes/usuarios/avatares/av010.png',
      'assets/imagenes/usuarios/avatares/av011.png',
      'assets/imagenes/usuarios/avatares/av012.png',
    ];
  }

  // Divide los avatares en "páginas" para usarlos en Swiper
  dividirAvataresEnPaginas() {
    this.avatarPaginas = []; // Reinicia la lista para evitar duplicados
    for (let i = 0; i < this.avatares.length; i += this.avataresPorPagina) {
      this.avatarPaginas.push(this.avatares.slice(i, i + this.avataresPorPagina));
    }
    console.log("Avatar Paginas:", this.avatarPaginas);
  }

  activarModoSeleccion() {
    this.modoSeleccionAvanzado = true;

    // Inicializar Swiper después de un pequeño retraso para asegurar que el DOM esté listo
    setTimeout(() => {
      if (this.swiperContainer) {
        new Swiper(this.swiperContainer.nativeElement, {
          slidesPerView: 1.2,
          spaceBetween: 5,
          pagination: { clickable: true },
          navigation: true,
        });
      }
    }, 0);
  }

  seleccionarAvatar(index: number) {
    this.avatarSeleccionadoIndex = index; // Ahora se basa en el índice global
    this.avatarActual = this.avatares[index];
  }

  confirmarSeleccion() {
    if (this.avatarSeleccionadoIndex !== null) {
      this.avatarActual = this.avatares[this.avatarSeleccionadoIndex];
      this.avatarSeleccionado = this.avatarActual;
      this.modoSeleccionAvanzado = false;
    }
  }

  cancelarSeleccion() {
    this.modoSeleccionAvanzado = false;
  }

  async guardarUsuario(): Promise<void> {
    if (this.validarFormulario()) {
      try {
        // Asegura que `avatarSeleccionado` tenga el valor de `avatarActual` si no se ha cambiado
        if (!this.avatarSeleccionado) {
          this.avatarSeleccionado = this.avatarActual;
        }

        const nuevoUsuario: Usuario = {
          entidad: 'usuario',
          nombre: this.nombre,
          email: this.email,
          imagenPerfil: this.avatarSeleccionado,
          timestamp: ''
        };
        await this.usuarioService.agregarUsuario(nuevoUsuario);
        this.nombre = '';
        this.email = '';
        this.eventoUsuarioAñadido.emit();
        await this.presentToast('Usuario guardado exitosamente', 'success');
      } catch (err) {
        console.error('Error guardando usuario:', err);
        await this.presentToast('Error guardando usuario', 'danger');
      }
    } else {
      await this.presentToast('Por favor, completa todos los campos correctamente', 'warning');
    }
  }

  private validarFormulario(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.nombre.trim() !== '' && emailRegex.test(this.email);
  }

  async presentToast(mensaje: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}
