import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { UserFormComponent } from "../../componentes/usuario/user-form/user-form.component";
import { Router } from '@angular/router';


@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.page.html',
  styleUrls: ['./crear-usuario.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, UserFormComponent]
})
export class CrearUsuarioPage implements OnInit {

  @Output() usuarioAgregado = new EventEmitter<void>(); // Emitir un evento

  constructor(private router: Router) { }

  ngOnInit() {
  }

  // Método que se ejecuta cuando un nuevo usuario es añadido, recargando la lista de usuarios.
  manejadorUsuarioAdded(): void {
    this.usuarioAgregado.emit();
    // this.cargarUsuarios(); // Se vuelve a cargar la lista de usuarios después de añadir uno nuevo.
    this.router.navigate(['/seleccionar-usuario'])
  }

}
