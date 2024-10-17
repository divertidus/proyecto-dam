// 3. Componente Tab1 corregido (src/app/tab1/tab1.page.ts)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { UserDocument } from '../interfaces/interfaces';
import { UserFormComponent } from "../componentes/user-form/user-form.component";
import { UserListComponent } from "../componentes/user-list/user-list.component";


@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, UserFormComponent, UserListComponent]
})
export class Tab1Page {

  users: UserDocument[] = [];

  constructor(private dbService: DatabaseService) {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      this.users = await this.dbService.getAllUsers();
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  }

  // Método para manejar el evento cuando un usuario es agregado
  handleUserAdded(): void {
    //console.log('Recibido evento por guardar usuario');
    this.loadUsers(); // en este caso vuelve a cargar los usuarios tras guardar uno.
  }
}