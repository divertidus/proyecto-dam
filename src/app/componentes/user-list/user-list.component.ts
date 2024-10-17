import { Component, Input, OnInit } from '@angular/core';
import { UserDocument } from 'src/app/interfaces/interfaces';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class UserListComponent implements OnInit {
  @Input() users: UserDocument[] = [];

  ngOnInit() {
    // Se puede realizar alguna acción cuando el componente se inicializa
  }
}