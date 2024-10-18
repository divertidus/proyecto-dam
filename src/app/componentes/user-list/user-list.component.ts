// componentes/user-list/user-list.component.html
import { Component, Input, OnInit } from '@angular/core';
import { UserDocument } from 'src/app/interfaces/interfaces';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class UserListComponent implements OnInit {
  @Input() usuarios: UserDocument[] = [];

  selectedUser: UserDocument | null = null; // Agregar una propiedad para el usuario seleccionado

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    // Se puede realizar alguna acción cuando el componente se inicializa
  }

  elegirUsuarioDeLista(user: UserDocument): void {
    this.authService.elegirUsuario(user); // Establece el usuario seleccionado
    this.selectedUser = user; // Guarda el usuario seleccionado en el componente
    this.login();
  }

  async login(): Promise<void> {
    console.log('soy el login en list')
    if (this.selectedUser) {
      await this.authService.loginConUsuarioSeleccionado(); // Inicia sesión con el usuario seleccionado
      this.router.navigate(['']);
    } else {
      console.error('No hay usuario seleccionado para iniciar sesión'); // Manejo de error si no hay usuario
    }
  }
}
