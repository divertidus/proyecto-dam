import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, PopoverController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons';
import { IonButton, IonButtons, IonToolbar, IonHeader, IonTitle } from "@ionic/angular/standalone";

@Component({
  selector: 'app-toolbar-modales-cancelar',
  templateUrl: './toolbar-modales-cancelar.component.html',
  styleUrls: ['./toolbar-modales-cancelar.component.scss'],
  standalone: true,
  imports: [IonTitle, IonHeader, FormsModule,IonToolbar, IonButtons, IonButton, CommonModule],
  providers: [ModalController,PopoverController]
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