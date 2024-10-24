//gestion-usuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { Usuario } from 'src/app/models/usuario.model';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from 'src/app/services/database/usuario.service';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.scss'],
  imports: [NgFor, NgIf,FormsModule],
  standalone: true,
  providers: []
})
export class GestionUsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];
  usuarioSeleccionado: Usuario | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.usuarios = await this.usuarioService.obtenerUsuarios();
  }

  ionViewWillEnter() {
    this.cargarUsuarios(); // Recarga la lista de usuarios cuando la vista está activa
  }

  elegirUsuarioDeLista(usuario: Usuario): void {
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