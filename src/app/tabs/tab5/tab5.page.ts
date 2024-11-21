import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToolbarLoggedComponent } from 'src/app/componentes/shared/toolbar-logged/toolbar-logged.component';
import { IonContent, IonButton, IonToolbar, IonFooter, IonModal } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { PopoverController, ModalController } from '@ionic/angular';
import { HistorialEntrenamientoComponent } from 'src/app/componentes/historial/historial-entrenamiento/historial-entrenamiento.component';
import { CalendarioHistorialComponent } from 'src/app/componentes/historial/calendario-historial/calendario-historial.component';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonModal, IonFooter, IonToolbar, IonButton, IonContent, CommonModule,
    CalendarioHistorialComponent,
    ToolbarLoggedComponent, FormsModule],
  providers: [ModalController, PopoverController]
})
export class Tab5Page implements OnInit {


  constructor(private modalController: ModalController
  ) { }

  async ngOnInit() {
  }

  async mostrarHistorialCompleto() {
    const modal = await this.modalController.create({
      component: HistorialEntrenamientoComponent,
      cssClass: 'fullscreen-modal', // Clase opcional si quieres ajustar el diseño
      showBackdrop: true,
    });
    await modal.present();
  }
}
