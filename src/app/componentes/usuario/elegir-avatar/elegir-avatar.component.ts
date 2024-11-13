import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonContent, IonButtons } from "@ionic/angular/standalone";

@Component({
  selector: 'app-elegir-avatar',
  templateUrl: './elegir-avatar.component.html',
  styleUrls: ['./elegir-avatar.component.scss'],
  standalone: true,
  imports: [IonContent, IonButton, NgFor, NgIf],
  providers: []
})
export class ElegirAvatarComponent implements OnInit {

  @Output() avatarSeleccionado = new EventEmitter<string>(); // Para enviar la ruta seleccionada
  avatares: string[] = [];
  avatarSeleccionadoIndex: number | null = null;
  avatarActual: string; // Avatar mostrado en grande inicialmente
  modoSeleccionAvanzado = false; // Alterna entre vista seleccionada y galería

  paginaActual = 0;
  avataresPorPagina = 6; // Configura la cantidad de avatares por página
  totalPaginas = 0;

  ngOnInit() {
    this.cargarAvatares();
    this.avatarSeleccionadoIndex = Math.floor(Math.random() * this.avatares.length);
    this.avatarActual = this.avatares[this.avatarSeleccionadoIndex];
    this.totalPaginas = Math.ceil(this.avatares.length / this.avataresPorPagina);
    this.avatarActual = this.avatares[this.avatarSeleccionadoIndex];
    this.avatarSeleccionado.emit(this.avatarActual);

  }

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
    console.log("Avatares cargados:", this.avatares);
  }

  activarModoSeleccion() {
    this.modoSeleccionAvanzado = true;
  }

  seleccionarAvatar(index: number) {
    this.avatarSeleccionadoIndex = index;
  }

  confirmarSeleccion() {
    if (this.avatarSeleccionadoIndex !== null) {
      this.avatarActual = this.avatares[this.avatarSeleccionadoIndex];
      this.avatarSeleccionado.emit(this.avatarActual);
      this.modoSeleccionAvanzado = false;
    }
  }

  cancelarSeleccion() {
    this.modoSeleccionAvanzado = false;
  }

  get avataresPaginaActual(): string[] {
    const inicio = this.paginaActual * this.avataresPorPagina;
    return this.avatares.slice(inicio, inicio + this.avataresPorPagina);
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas - 1) {
      this.paginaActual++;
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 0) {
      this.paginaActual--;
    }
  }
}