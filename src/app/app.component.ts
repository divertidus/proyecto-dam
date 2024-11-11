import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './auth/auth.service';
import { ReiniciarDatosService } from './services/reiniciar-datos.service';
import { DatabaseService } from './services/database/database.service';

/* import { defineCustomElement } from '@ionic/core/components/ion-modal.js';
import { defineCustomElement as defineModal } from '@ionic/core/components/ion-modal.js';
import { defineCustomElement as defineLoading } from '@ionic/core/components/ion-loading.js'; */

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  constructor(
    private reiniciarDatosService: ReiniciarDatosService,
    private authService: AuthService,
    private databaseService:DatabaseService
  ) { }

  async ngOnInit() {
    // Reinicia la base de datos y carga los datos iniciales directamente usando el servicio
    //await this.reiniciarDatosService.reiniciarYInicializarDatos();
    //this.databaseService.exportarDocumentosAJson();
  }
}