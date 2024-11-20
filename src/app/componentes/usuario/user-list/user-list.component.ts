import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario.model';
import { IonList, IonListHeader, IonLabel, IonItem, IonAvatar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonContent, IonHeader, IonToolbar, IonTitle, IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [IonAvatar, FormsModule, CommonModule]
})
export class UserListComponent implements OnInit {

  @Input() usuarios: Usuario[] = [];

  usuarioSeleccionado: Usuario | null = null; // Agregar una propiedad para el usuario seleccionado

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    // Se puede realizar alguna acción cuando el componente se inicializa
  }

  elegirUsuarioDeLista(user: Usuario): void {
    this.authService.elegirUsuario(user); // Establece el usuario seleccionado
    this.usuarioSeleccionado = user; // Guarda el usuario seleccionado en el componente
    console.log('Usuario seleccionado:', this.usuarioSeleccionado); // Verificar que el usuario se seleccione
    this.login(); // Iniciar sesión después de seleccionar
  }

  async login(): Promise<void> {
    if (this.usuarioSeleccionado) {
      await this.authService.loginConUsuarioSeleccionado(); // Inicia sesión con el usuario seleccionado
      this.router.navigate(['/tabs']); // Redirige a la tab1 después de iniciar sesión
    } else {
      console.error('No hay usuario seleccionado para iniciar sesión');
    }
  }

  irCrearUsuario(): void {
    this.router.navigate(['/crear-usuario']); // Navega a la página de creación de usuario
  }
}
