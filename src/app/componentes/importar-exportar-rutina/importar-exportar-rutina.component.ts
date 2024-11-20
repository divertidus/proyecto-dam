import { Component, OnInit } from '@angular/core';
import { IonButton, IonIcon, IonAlert } from '@ionic/angular/standalone';
import { RutinaService } from 'src/app/services/database/rutina.service';
import { AlertController } from '@ionic/angular';
import { Rutina } from 'src/app/models/rutina.model';
import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from 'src/app/models/usuario.model';

@Component({
  selector: 'app-importar-exportar-rutina',
  templateUrl: './importar-exportar-rutina.component.html',
  styleUrls: ['./importar-exportar-rutina.component.scss'],
  standalone: true,
  imports: [IonAlert, IonButton, IonIcon],
  providers: []
})
export class ImportarExportarRutinaComponent implements OnInit {

  rutinas: Rutina[] = []; // Lista de rutinas cargadas
  usuarioLogeado: Usuario | null = null;


  constructor(
    private rutinaService: RutinaService,
    private alertController: AlertController,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    // Suscribirse al usuario logueado
    this.authService.usuarioLogeado$.subscribe((usuario) => {
      this.usuarioLogeado = usuario;
      if (usuario) {
        this.cargarRutinasPorUsuario(usuario._id);
      } else {
        this.rutinas = [];
      }
    });
  }

  // Método para cargar las rutinas de un usuario específico
  cargarRutinasPorUsuario(usuarioId: string) {
    this.rutinaService.rutinas$.subscribe((rutinas) => {
      this.rutinas = rutinas.filter((rutina) => rutina.usuarioId === usuarioId);
      console.log('Rutinas cargadas para exportar:', this.rutinas);
    });
  }

  // Método para mostrar el alert con las rutinas disponibles
  async mostrarRutinasParaExportar() {
    const inputs = this.rutinas.map((rutina) => ({
      type: 'radio' as const,
      label: rutina.nombre,
      value: rutina._id,
    }));

    const alert = await this.alertController.create({
      header: 'Selecciona una rutina para exportar',
      inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Exportar',
          handler: (rutinaIdSeleccionada: string) => {
            const rutinaSeleccionada = this.rutinas.find(
              (rutina) => rutina._id === rutinaIdSeleccionada
            );
            console.log('Rutina seleccionada para exportar:', rutinaSeleccionada);
          },
        },
      ],
    });

    await alert.present();
  }


  // Método para importar rutina (punto 2, pendiente de implementación)
  importarRutina() {
    console.log('Importar rutina (pendiente de implementación)');
  }

  exportarRutina() {
    this.mostrarRutinasParaExportar()
    console.log('Exportar rutina');
    // Lógica futura para exportar rutina
  }

}