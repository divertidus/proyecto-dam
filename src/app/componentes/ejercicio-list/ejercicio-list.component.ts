import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { Ejercicio } from '../../models/ejercicio.model';


@Component({
  selector: 'app-ejercicio-list',
  templateUrl: './ejercicio-list.component.html',
  styleUrls: ['./ejercicio-list.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class EjercicioListComponent implements OnInit {

  @Input() ejercicios: Ejercicio[] = [];

  constructor() { }

  ngOnInit() { }

}
