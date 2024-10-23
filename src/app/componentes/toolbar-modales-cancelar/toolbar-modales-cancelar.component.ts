import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons';


@Component({
  selector: 'app-toolbar-modales-cancelar',
  templateUrl: './toolbar-modales-cancelar.component.html',
  styleUrls: ['./toolbar-modales-cancelar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule,]
})
export class ToolbarModalesCancelarComponent implements OnInit {

  @Input() titulo: string = ''; // Título de la pantalla (pasado como input desde los tabs)

  constructor(private modalController: ModalController) {
    addIcons(todosLosIconos);
  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }



  cancelar(): void {
    this.modalController.dismiss();
  }
}