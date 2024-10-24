/* tab4.page.ts */

import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons'
import { ToolbarLoggedComponent } from 'src/app/componentes/shared/toolbar-logged/toolbar-logged.component';
import { VistaEntrenoComponent } from "../../componentes/shared/vista-entreno/vista-entreno.component";
import { IonContent } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [IonContent, ToolbarLoggedComponent,FormsModule, VistaEntrenoComponent],
  providers: [ModalController,PopoverController]
})
export class Tab4Page implements OnInit {


  constructor() { addIcons(todosLosIconos) }

  ngOnInit() {

  }

}
