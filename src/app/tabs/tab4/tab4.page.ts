import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EjercicioService } from 'src/app/services/ejercicio.service';
import { addIcons } from 'ionicons';
import * as todosLosIconos from 'ionicons/icons'
import { ToolbarLoggedComponent } from 'src/app/componentes/shared/toolbar-logged/toolbar-logged.component';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [ToolbarLoggedComponent]
})
export class Tab4Page implements OnInit {


  constructor() { addIcons(todosLosIconos) }

  ngOnInit() {

  }

}
