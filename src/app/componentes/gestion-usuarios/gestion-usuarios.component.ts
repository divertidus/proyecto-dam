import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UserDocument } from 'src/app/interfaces/interfaces';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgFor, NgIf } from '@angular/common';


@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.scss'],
  imports: [IonicModule, NgFor, NgIf],
  standalone: true,
  providers: []
})
export class GestionUsuariosComponent implements OnInit {

  usuarios: UserDocument[] = [];
  usuarioSeleccionado: UserDocument | null = null;

  constructor(private usuarioService: UsuarioService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.usuarios = await this.usuarioService.obtenerUsuarios();
  }

  elegirUsuarioDeLista(usuario: UserDocument): void {
    this.usuarioSeleccionado = usuario;
    this.login();
  }

  async login(): Promise<void> {
    if (this.usuarioSeleccionado) {
      await this.authService.elegirUsuario(this.usuarioSeleccionado);
      await this.authService.loginConUsuarioSeleccionado();
      this.router.navigate(['']);
    } else {
      console.error('No hay usuario seleccionado para iniciar sesión');
    }
  }
}