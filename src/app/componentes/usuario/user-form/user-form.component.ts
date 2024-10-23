// componentes/user-form/user-form.component.ts 
import { Component, EventEmitter, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/models/usuario.model';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class UserFormComponent {
  nombre: string = '';
  email: string = '';

  // por esto se puede usar luego el emit y emite al padre, hacia tab1
  @Output() eventoUsuarioAñadido = new EventEmitter<void>();

  constructor(private usuarioService: UsuarioService) { }

  //TODO AGREGAR VALIDACION FORMULARIO
  async guardarUsuario(): Promise<void> {
    if (this.nombre && this.email) {
      try {
        // Crear un objeto de tipo Usuario con los datos actuales
        const nuevoUsuario: Usuario = {
          entidad: 'usuario',
          nombre: this.nombre,
          email: this.email,
          imagenPerfil: '', // Si no tienes imagen en este punto, puedes asignar una cadena vacía
          timestamp: '' // Este valor lo añadirá el método agregarUsuario
        };

        // Llamamos al método del servicio pasando el objeto Usuario
        await this.usuarioService.agregarUsuario(nuevoUsuario);

        // Limpiamos los campos después de guardar el usuario
        this.nombre = '';
        this.email = '';

        // Emitimos el evento indicando que el usuario ha sido añadido
        this.eventoUsuarioAñadido.emit();
      } catch (err) {
        console.error('Error guardando usuario:', err);
      }
    } else {
      console.log('DATOS INCOMPLETOS - TODO TOAST');
    }
  }
}