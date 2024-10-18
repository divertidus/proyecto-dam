// componentes/user-form/user-form.component.ts 
import { Component, EventEmitter, Output } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class UserFormComponent {
  name: string = '';
  email: string = '';

  // por esto se puede usar luego el emit y emite al padre, hacia tab1
  @Output() eventoUsuarioAñadido = new EventEmitter<void>();

  constructor(private dbService: DatabaseService) { }

  async guardarUsuario(): Promise<void> {
    if (this.name && this.email) {
      try {
        await this.dbService.addUsuario(this.name, this.email);
        this.name = '';
        this.email = '';
        this.eventoUsuarioAñadido.emit(); // Emitir un evento cuando el usuario es agregado
      } catch (err) {
        console.error('Error guardando usuario:', err);
      }
    } else {
      console.log('DATOS INCOMPLETOS - TODO TOAST')
    }
  }
}