import { Component, OnInit } from '@angular/core';
import { IonButton, IonIcon, IonAlert } from '@ionic/angular/standalone';
import { RutinaService } from 'src/app/services/database/rutina.service';
import { AlertController } from '@ionic/angular';
import { Rutina } from 'src/app/models/rutina.model';
import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from 'src/app/models/usuario.model';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


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


  /*--------------- METODOS GENERALES --------------- */

  // Método para cargar las rutinas de un usuario específico
  cargarRutinasPorUsuario(usuarioId: string) {
    this.rutinaService.rutinas$.subscribe((rutinas) => {
      this.rutinas = rutinas.filter((rutina) => rutina.usuarioId === usuarioId);
      console.log('Rutinas cargadas para exportar:', this.rutinas);
    });
  }

  // Método para mostrar el alert con las rutinas disponibles



  /* --------- METODOS DE IMPORTACION --------------*/

  // Método para importar rutina (punto 2, pendiente de implementación)
  /* async importarRutina() {
    try {
      const archivoSeleccionado = await this.seleccionarArchivo();
      if (archivoSeleccionado?.path) {
        const rutinaImportada = await this.leerContenidoArchivo({ path: archivoSeleccionado.path });
        if (rutinaImportada) {
          await this.procesarRutinaImportada(rutinaImportada);
        }
      } else {
        console.warn('El archivo seleccionado no contiene una ruta válida.');
      }
    } catch (error) {
      console.error('Error al importar la rutina:', error);
    }
  } */

  async importarRutina() {
    try {
      const archivoSeleccionado = await this.seleccionarArchivo();
      if (archivoSeleccionado) {
        const rutinaImportada = await this.leerContenidoArchivo({
          path: archivoSeleccionado.path,
          blob: archivoSeleccionado.blob,
        });
        if (rutinaImportada) {
          await this.procesarRutinaImportada(rutinaImportada);
        }
      } else {
        console.warn('El archivo seleccionado no contiene una ruta válida.');
      }
    } catch (error) {
      console.error('Error al importar la rutina:', error);
    }
  }

  /* async seleccionarArchivo() {
    try {
      const result = await FilePicker.pickFiles({
        types: ['application/json'],
      });

      if (result.files.length > 0) {
        console.log('Archivo seleccionado:', result.files[0]);
        return result.files[0];
      } else {
        console.warn('No se seleccionó ningún archivo.');
        return null;
      }
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      return null;
    }
  } */

  async seleccionarArchivo() {
    try {
      const result = await FilePicker.pickFiles({
        types: ['application/json'],
      });

      if (result.files.length > 0) {
        console.log('Archivo seleccionado:', result.files[0]);
        return result.files[0];
      } else {
        console.warn('No se seleccionó ningún archivo.');
        return null;
      }
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      return null;
    }
  }


  /* async leerContenidoArchivo(archivo: { path: string }) {
    try {
      const contenido = await Filesystem.readFile({
        path: archivo.path,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      const data = typeof contenido.data === 'string' ? contenido.data : await contenido.data.text();
      console.log('Contenido del archivo:', data);
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al leer el archivo seleccionado:', error);
      return null;
    }
  } */

  async leerContenidoArchivo(archivo: { path?: string; blob?: Blob }) {
    try {
      if (archivo.path) {
        const contenido = await Filesystem.readFile({
          path: archivo.path,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });

        if (typeof contenido.data === 'string') {
          console.log('Contenido del archivo desde path:', contenido.data);
          return JSON.parse(contenido.data);
        } else {
          throw new Error('El contenido del archivo no es un string válido.');
        }
      } else if (archivo.blob) {
        if (archivo.blob instanceof Blob) {
          const reader = new FileReader();
          return new Promise<any>((resolve, reject) => {
            reader.onload = () => {
              try {
                const data = JSON.parse(reader.result as string);
                console.log('Contenido del archivo desde blob:', data);
                resolve(data);
              } catch (error) {
                reject('Error al parsear el archivo JSON.');
              }
            };
            reader.onerror = () => reject('Error al leer el archivo.');
            reader.readAsText(archivo.blob); // Ahora el compilador lo acepta correctamente
          });
        } else {
          throw new Error('El archivo no es un Blob válido.');
        }
      } else {
        throw new Error('El archivo no tiene una ruta ni un blob válido.');
      }
    } catch (error) {
      console.error('Error al leer el archivo seleccionado:', error);
      return null;
    }
  }




  async procesarRutinaImportada(rutina: any) {
    try {
      if (!this.usuarioLogeado) {
        console.error('No hay usuario logueado para asignar la rutina importada.');
        return;
      }

      // Calcular el nombre de la nueva rutina
      const numeroRutina = this.calcularNumeroRutina();
      const nombreRutina = `Rutina ${numeroRutina}`;

      // Crear una nueva rutina con los datos ajustados
      const nuevaRutina: Rutina = {
        ...rutina,
        nombre: nombreRutina,
        usuarioId: this.usuarioLogeado._id,
        _id: undefined, // PouchDB asignará un nuevo _id
        _rev: undefined, // No es necesario para una nueva entrada
      };

      // Guardar la nueva rutina en la base de datos
      await this.guardarRutinaEnBBDD(nuevaRutina);
      console.log('Rutina importada y guardada correctamente:', nuevaRutina);
    } catch (error) {
      console.error('Error al procesar la rutina importada:', error);
    }
  }

  calcularNumeroRutina(): number {
    if (!this.rutinas || this.rutinas.length === 0) {
      return 1; // Si no hay rutinas, la primera será la número 1
    }

    const numeros = this.rutinas.map((rutina) => {
      const match = rutina.nombre.match(/Rutina (\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });

    return Math.max(...numeros) + 1; // Incrementar el número más alto
  }

  async guardarRutinaEnBBDD(rutina: Rutina) {
    try {
      await this.rutinaService.agregarRutina(rutina);
      console.log('Rutina guardada en la base de datos:', rutina);
    } catch (error) {
      console.error('Error al guardar la rutina en la base de datos:', error);
    }
  }


  /* --------- METODOS DE EXPORTACION --------------*/

  exportarRutina() {
    this.mostrarRutinasParaExportar()
    console.log('Exportar rutina');
    // Lógica futura para exportar rutina
  }

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
          handler: async (rutinaIdSeleccionada: string) => {
            const rutinaSeleccionada = this.rutinas.find(
              (rutina) => rutina._id === rutinaIdSeleccionada
            );

            if (rutinaSeleccionada) {
              console.log('Rutina seleccionada para exportar:', rutinaSeleccionada);
              await this.exportarRutinaSeleccionada(rutinaSeleccionada);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async exportarRutinaSeleccionada(rutinaSeleccionada: Rutina) {
    if (!rutinaSeleccionada) {
      console.error('No se seleccionó ninguna rutina para exportar.');
      return;
    }

    try {
      // Clonamos la rutina y eliminamos el usuarioId y otros campos innecesarios
      const rutinaParaExportar = {
        ...rutinaSeleccionada,
        usuarioId: undefined, // Eliminar usuarioId
        _id: undefined, // Eliminar _id
        _rev: undefined, // Eliminar _rev
      };

      // Generar el nombre del archivo
      const nombreArchivo = `Rutina_${rutinaSeleccionada.nombre.replace(/\s+/g, '_')}_${rutinaSeleccionada._id.substring(0, 6)}.json`;

      // Convertir la rutina a JSON
      const rutinaJSON = JSON.stringify(rutinaParaExportar, null, 2);

      // Guardar el archivo en el almacenamiento del dispositivo
      const result = await Filesystem.writeFile({
        path: nombreArchivo,
        data: rutinaJSON,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      console.log('Archivo exportado correctamente:', result);

      // Lógica adicional para descargar el archivo en el navegador
      this.descargarArchivoEnNavegador(nombreArchivo, rutinaJSON);
    } catch (error) {
      console.error('Error al exportar la rutina:', error);
    }
  }

  // Método para descargar el archivo en el navegador
  descargarArchivoEnNavegador(nombreArchivo: string, rutinaJSON: string) {
    try {
      // Crear un Blob con el contenido del archivo
      const blob = new Blob([rutinaJSON], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Crear un enlace para descargar
      const enlaceDescarga = document.createElement('a');
      enlaceDescarga.href = url;
      enlaceDescarga.download = nombreArchivo;

      // Hacer clic en el enlace para iniciar la descarga
      document.body.appendChild(enlaceDescarga);
      enlaceDescarga.click();
      document.body.removeChild(enlaceDescarga);

      console.log(`Archivo descargado: ${nombreArchivo}`);
    } catch (error) {
      console.error('Error al descargar el archivo en el navegador:', error);
    }
  }




}