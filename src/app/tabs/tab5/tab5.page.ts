import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { RutinaService } from 'src/app/services/rutina.service';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons';
import { EjercicioFormComponent } from 'src/app/componentes/ejercicio/ejercicio-form/ejercicio-form.component';
import { EjercicioListComponent } from "../../componentes/ejercicio/ejercicio-list/ejercicio-list.component";
import { DiaRutina, EjercicioPlan, Rutina } from 'src/app/models/rutina.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service'; // Importamos AuthService
import { ToolbarLoggedComponent } from 'src/app/componentes/toolbar-logged/toolbar-logged.component';
import { RutinaCrearDiaComponent } from 'src/app/componentes/rutina-crear-dia/rutina-crear-dia.component';


@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, EjercicioListComponent, EjercicioFormComponent, RutinaCrearDiaComponent, ToolbarLoggedComponent]
})
export class Tab5Page implements OnInit {


  constructor(
    private ejercicioService: EjercicioService,
    private rutinaService: RutinaService, // Añadimos RutinaService aquí
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService // Añadimos AuthService aquí
  ) {
    addIcons(todosLosIconos);
  }

  ngOnInit() {
  
  }

}
