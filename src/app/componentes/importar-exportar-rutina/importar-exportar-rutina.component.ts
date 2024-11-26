import { Component, OnInit } from '@angular/core';
import { IonButton, IonIcon, IonAlert } from '@ionic/angular/standalone';
import { RutinaService } from 'src/app/services/database/rutina.service';
import { AlertController } from '@ionic/angular';
import { Rutina } from 'src/app/models/rutina.model';
import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from 'src/app/models/usuario.model';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { v4 as uuidv4 } from 'uuid'; // Asegúrate de instalar e importar uuid
import { Capacitor } from '@capacitor/core';




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

  async solicitarPermisos(): Promise<boolean> {
    try {
      const status = await Filesystem.checkPermissions();
      if (status.publicStorage === 'granted') {
        console.log('Permisos ya otorgados.');
        return true;
      }

      const request = await Filesystem.requestPermissions();
      if (request.publicStorage === 'granted') {
        console.log('Permisos concedidos.');
        return true;
      } else {
        console.warn('Permisos denegados.');
        return false;
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }







  /* --------- METODOS DE IMPORTACION --------------*/

  // Método para importar rutina (punto 2, pendiente de implementación)


  /*  async onClickImportarRutina() {
     try {
       // Paso 1: Seleccionar archivo
       const archivoSeleccionado = await this.seleccionarArchivo();
       if (!archivoSeleccionado) {
         console.warn('No se seleccionó ningún archivo.');
         return;
       }
 
       // Paso 2: Leer contenido del archivo
       const rutinaImportada = await this.leerContenidoArchivo({
         path: archivoSeleccionado.path,
         blob: archivoSeleccionado.blob,
       });
       if (!rutinaImportada) {
         console.warn('El contenido del archivo no es válido.');
         return;
       }
 
       // Paso 3: Procesar la rutina importada
       await this.procesarRutinaImportada(rutinaImportada);
     } catch (error) {
       console.error('Error al importar la rutina:', error);
     }
   }
 
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
 
       // Verificar si el _id de la rutina ya existe en la base de datos
       const rutinaDuplicada = this.rutinas.find((r) => r._id === rutina._id);
 
       if (rutinaDuplicada) {
         const alertaDuplicada = await this.alertController.create({
           header: 'Rutina duplicada',
           message: 'Esta rutina ya existe en la BBDD. ¿Deseas importarla nuevamente?',
           buttons: [
             {
               text: 'Cancelar',
               role: 'cancel',
             },
             {
               text: 'Reimportar',
               handler: async () => {
                 // Generar un nuevo ID para la rutina duplicada
                 rutina._id = uuidv4();
                 console.log('Nuevo ID generado para rutina duplicada:', rutina._id); // Consola: Nuevo ID
                 await this.importarRutinaNueva(rutina);
               },
             },
           ],
         });
 
         await alertaDuplicada.present();
       } else {
         // Rutina no duplicada, importar directamente con el _id original
         console.log('ID original de la rutina importada:', rutina._id); // Consola: ID Original
         await this.importarRutinaNueva(rutina, true); // Indica que se respeta el _id original
       }
     } catch (error) {
       console.error('Error al procesar la rutina importada:', error);
     }
   }
 
   async importarRutinaNueva(rutina: any, usarIdOriginal: boolean = false) {
     try {
       // Calcular el nombre de la nueva rutina
       const numeroRutina = this.calcularNumeroRutina();
       const nombreRutina = `Rutina Importada ${numeroRutina}`;
 
       // Crear una nueva rutina con los datos ajustados
       const nuevaRutina: Rutina = {
         ...rutina,
         nombre: nombreRutina,
         usuarioId: this.usuarioLogeado?._id,
         _id: usarIdOriginal ? rutina._id : uuidv4(), // Respetar el _id original si es la primera importación
         _rev: undefined, // No es necesario para una nueva entrada
       };
 
       // Guardar la nueva rutina en la base de datos
       await this.guardarRutinaEnBBDD(nuevaRutina);
 
       // Consola: ID tras guardar
       console.log('ID asignado tras guardar la rutina:', nuevaRutina._id);
 
       // Mostrar alerta de éxito
       const alertaExito = await this.alertController.create({
         header: 'Éxito',
         message: 'Rutina importada con éxito.',
         buttons: ['OK'],
         cssClass: 'alert-success',
       });
 
       await alertaExito.present();
       console.log('Rutina importada y guardada correctamente:', nuevaRutina);
     } catch (error) {
       console.error('Error al guardar la rutina nueva:', error);
     }
   }
 
   calcularNumeroRutina(): number {
     const nombresExistentes = this.rutinas.map((rutina) => rutina.nombre);
     let contador = 1;
     let nombrePropuesto = `Rutina Importada ${contador}`;
 
     while (nombresExistentes.includes(nombrePropuesto)) {
       contador++;
       nombrePropuesto = `Rutina Importada ${contador}`;
     }
 
     return contador;
   }
 
   async guardarRutinaEnBBDD(rutina: Rutina) {
     try {
       await this.rutinaService.agregarRutina(rutina);
       console.log('Rutina guardada en la base de datos:', rutina);
     } catch (error) {
       console.error('Error al guardar la rutina en la base de datos:', error);
     }
   }
  */



  /* --------- METODOS DE EXPORTACION --------------*/

  onClickExportarRutina() {
    this.mostrarRutinasParaExportar()
    console.log('Exportar rutina');
    // Lógica futura para exportar rutina
  }

  // Método para mostrar el alert con las rutinas disponibles
  async mostrarRutinasParaExportar() {
    // Obtener el ID de la rutina por defecto
    const rutinaPorDefectoId = this.rutinas.length > 0 ? this.rutinas[0]._id : null;

    // Crear los inputs del alert con una rutina marcada por defecto
    const inputs = this.rutinas.map((rutina) => ({
      type: 'radio' as const,
      label: rutina.nombre,
      value: rutina._id,
      checked: rutina._id === rutinaPorDefectoId, // Marcar la rutina por defecto
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

  /*  async exportarRutinaSeleccionada(rutinaSeleccionada: Rutina) {
     if (!rutinaSeleccionada) {
       console.error('No se seleccionó ninguna rutina para exportar.');
       return;
     }
   
     try {
       // Solicitar permisos antes de exportar
       const permisosConcedidos = await this.solicitarPermisos();
       if (!permisosConcedidos) {
         console.warn('No se puede proceder sin permisos.');
         return;
       }
   
       // Clonamos la rutina y eliminamos el usuarioId y otros campos innecesarios
       const rutinaParaExportar = {
         ...rutinaSeleccionada,
         usuarioId: undefined,
         _rev: undefined,
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
   
       // Opcional: Mostrar confirmación
       const alertaExito = await this.alertController.create({
         header: 'Éxito',
         message: 'Rutina exportada correctamente.',
         buttons: ['OK'],
         cssClass: 'alert-success',
       });
   
       await alertaExito.present();
     } catch (error) {
       console.error('Error al exportar la rutina:', error);
     }
   }
    */


  async exportarRutinaSeleccionada(rutinaSeleccionada: Rutina) {
    if (!rutinaSeleccionada) {
      console.error('No se seleccionó ninguna rutina para exportar.');
      return;
    }

    try {
      // Clonar la rutina y eliminar campos innecesarios
      const rutinaParaExportar = {
        ...rutinaSeleccionada,
        usuarioId: undefined,
        _rev: undefined,
      };

      // Generar el nombre del archivo
      const nombreArchivo = `Rutina_${rutinaSeleccionada.nombre.replace(/\s+/g, '_')}_${rutinaSeleccionada._id.substring(0, 6)}.json`;

      // Convertir la rutina a JSON
      const rutinaJSON = JSON.stringify(rutinaParaExportar, null, 2);

      // Detectar si estamos en navegador o en dispositivo
      const isBrowser = !Capacitor.isNativePlatform();

      if (isBrowser) {
        // Descargar directamente en el navegador
        this.descargarArchivoEnNavegador(nombreArchivo, rutinaJSON);
      } else {
        // Guardar el archivo en el dispositivo
        const permisosConcedidos = await this.solicitarPermisos();
        if (!permisosConcedidos) {
          console.warn('No se puede proceder sin permisos.');
          return;
        }

        const result = await Filesystem.writeFile({
          path: nombreArchivo,
          data: rutinaJSON,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });

        console.log('Archivo exportado correctamente al dispositivo:', result);

        // Mostrar alerta de éxito en el dispositivo
        const alertaExito = await this.alertController.create({
          header: 'Éxito',
          message: 'Rutina exportada correctamente al almacenamiento del dispositivo.',
          buttons: ['OK'],
          cssClass: 'alert-success',
        });

        await alertaExito.present();
      }
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






  /*ESTOS METODOS COMENTADOS SON LOS QUE HABRA QUE USAR PARA USAR DIRECTAMENTE EN DISPOSITIVOS. LOS DE ARRIBA QUE COINCIDEN ESTAN ADAPTADOS PARA FUNCIONAR EN EMULADOR DE NAVEGADOR*/


  async onClickImportarRutina() {
    try {
        const archivoSeleccionado = await this.seleccionarArchivo();
        if (!archivoSeleccionado) {
            console.warn('No se seleccionó ningún archivo.');
            return;
        }

        console.log('Archivo seleccionado:', archivoSeleccionado);

        let contenidoArchivo: string;

        if (archivoSeleccionado.path) {
            // Leer contenido desde una ruta o URI
            contenidoArchivo = await this.leerContenidoDesdeArchivo(archivoSeleccionado.path);
        } else if (archivoSeleccionado.blob) {
            // Leer contenido directamente desde el Blob
            contenidoArchivo = await this.leerContenidoDesdeBlob(archivoSeleccionado.blob);
        } else {
            throw new Error('Archivo no válido para leer contenido.');
        }

        console.log('Contenido del archivo importado:', contenidoArchivo);

        const rutinaImportada = JSON.parse(contenidoArchivo);
        await this.procesarRutinaImportada(rutinaImportada);
    } catch (error) {
        console.error('Error al importar la rutina:', error);
    }
}


  async seleccionarArchivo(): Promise<{ path?: string; blob?: Blob } | null> {
    try {
      const result = await FilePicker.pickFiles({
        types: ['application/json'],
      });

      if (result.files.length > 0) {
        const archivo = result.files[0];

        console.log('Archivo seleccionado:', archivo);

        // Si el archivo tiene un path, devolverlo como string
        if (archivo.path) {
          return { path: archivo.path }; // Retornar solo el path
        }

        // Si el archivo es un blob, devolverlo como Blob
        else if (archivo.blob) {
          return { blob: archivo.blob }; // Retornar solo el blob
        }
      }
      console.warn('No se seleccionó ningún archivo.');
      return null;
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      return null;
    }
  }



  /* async leerContenidoArchivo(archivo: { path?: string; blob?: Blob }): Promise<any | null> {
    try {
      // Si el archivo tiene una ruta, lo leemos como archivo de texto
      if (archivo.path) {
        const contenido = await Filesystem.readFile({
          path: archivo.path,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
  
        // Aseguramos que el contenido es un string y lo parseamos
        if (typeof contenido.data === 'string') {
          console.log('Contenido del archivo desde ruta:', contenido.data);
          return JSON.parse(contenido.data); // Parseamos el contenido a JSON
        } else {
          throw new Error('El contenido del archivo no es un string válido.');
        }
      }
      // Si el archivo tiene un Blob, lo leemos como texto
      else if (archivo.blob) {
        if (archivo.blob instanceof Blob) {
          const reader = new FileReader();
          return new Promise<any>((resolve, reject) => {
            reader.onload = () => {
              try {
                // Convertimos el resultado de la lectura en texto
                const resultado = reader.result as string;
                console.log('Contenido del archivo desde Blob:', resultado);
                resolve(JSON.parse(resultado)); // Parseamos el contenido
              } catch (error) {
                reject('Error al parsear el archivo JSON.');
              }
            };
            reader.onerror = () => reject('Error al leer el archivo Blob.');
            reader.readAsText(archivo.blob); // Leemos el Blob como texto
          });
        } else {
          throw new Error('El archivo no es un Blob válido.');
        }
      } else {
        throw new Error('El archivo no tiene una ruta ni un Blob válido.');
      }
    } catch (error) {
      console.error('Error al leer el archivo seleccionado:', error);
      return null; // Devuelvo null en caso de error
    }
  } */

  /*  async leerContenidoArchivo(archivo: { path?: string; blob?: Blob }): Promise<any | null> {
     try {
       if (archivo.path?.startsWith('content://')) {
         // Manejo de URI `content://`
         const path = await this.convertirUriARuta(archivo.path);
         if (path) {
           const contenido = await Filesystem.readFile({
             path,
             encoding: Encoding.UTF8,
           });
           console.log('Contenido del archivo desde URI convertido:', contenido.data);
           return JSON.parse(contenido.data); // Parseamos el contenido a JSON
         } else {
           throw new Error('No se pudo convertir el URI a una ruta válida.');
         }
       } else if (archivo.path) {
         // Manejo de rutas normales
         const contenido = await Filesystem.readFile({
           path: archivo.path,
           directory: Directory.Documents,
           encoding: Encoding.UTF8,
         });
         console.log('Contenido del archivo desde ruta:', contenido.data);
         return JSON.parse(contenido.data); // Parseamos el contenido a JSON
       } else if (archivo.blob) {
         // Manejo de Blob directamente
         const data = await this.leerContenidoDesdeBlob(archivo.blob);
         console.log('Contenido del archivo desde Blob:', data);
         return JSON.parse(data); // Parseamos a JSON
       } else {
         throw new Error('El archivo no tiene una ruta ni un Blob válido.');
       }
     } catch (error) {
       console.error('Error al leer el archivo seleccionado:', error);
       return null; // Devolvemos null en caso de error
     }
   }
 
   async leerContenidoDesdeURI(uri: string): Promise<string> {
     try {
       const response = await fetch(uri); // Fetch para leer contenido del URI
       const data = await response.text(); // Convertir a texto
       return data;
     } catch (error) {
       console.error('Error al leer contenido desde URI:', error);
       throw error;
     }
   }
 
   async leerContenidoDesdeBlob(blob: Blob): Promise<string> {
     return new Promise<string>((resolve, reject) => {
       const reader = new FileReader();
       reader.onload = () => resolve(reader.result as string);
       reader.onerror = () => reject('Error al leer Blob.');
       reader.readAsText(blob); // Leer como texto
     });
   }
  */



  async leerContenidoArchivo(archivo: { path?: string; blob?: Blob }): Promise<any | null> {
    try {
      if (archivo.path?.startsWith('content://')) {
        // Usamos el esquema content://
        const contenido = await this.leerContenidoDesdeContentUri(archivo.path);
        console.log('Contenido del archivo desde URI (content://):', contenido);
        return JSON.parse(contenido); // Parseamos el contenido a JSON
      } else if (archivo.blob) {
        // Convertimos el Blob a texto
        const contenido = await archivo.blob.text();
        console.log('Contenido del archivo desde Blob:', contenido);
        return JSON.parse(contenido); // Parseamos el contenido a JSON
      } else {
        throw new Error('El archivo no tiene un esquema válido.');
      }
    } catch (error) {
      console.error('Error al leer el archivo:', error);
      return null;
    }
  }

  async leerContenidoDesdeContentUri(uri: string): Promise<string> {
    try {
      console.log('Intentando leer desde URI:', uri);

      // Usar `Filesystem.readFile` para leer el contenido
      const contenido = await Filesystem.readFile({
        path: uri, // Proporcionamos la URI completa
        encoding: Encoding.UTF8, // Asegurar que se lee como UTF-8
      });

      // Verificamos si `contenido.data` es un string
      if (typeof contenido.data === 'string') {
        console.log('Contenido leído desde URI:', contenido.data);
        return contenido.data; // Devolvemos el contenido del archivo como texto
      } else {
        throw new Error('El contenido leído no es un string válido.');
      }
    } catch (error) {
      console.error('Error al leer contenido desde URI (content://):', error);
      throw new Error('No se pudo leer el archivo desde el URI.');
    }
  }

  async getBlobFromContentUri(uri: string): Promise<Blob> {
    try {
        console.log('Obteniendo Blob desde URI:', uri);
        const response = await fetch(uri);

        if (!response.ok) {
            throw new Error(`Error al obtener contenido desde URI: ${response.statusText}`);
        }

        const blob = await response.blob();
        console.log('Blob obtenido desde URI:', blob);
        return blob;
    } catch (error) {
        console.error('Error al obtener Blob desde URI:', error);
        throw error;
    }
}



async leerContenidoDesdeBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject('Error al leer Blob.');
      reader.readAsText(blob); // Leer el Blob como texto
  });
}


  async convertirContentUriAPath(uri: string): Promise<string> {
    try {
      const stat = await Filesystem.stat({ path: uri });
      console.log('Ruta convertida:', stat.uri);
      return stat.uri;
    } catch (error) {
      console.error('Error al convertir content:// a ruta:', error);
      throw error;
    }
  }

  async leerContenidoDesdeArchivo(uri: string): Promise<string> {
    if (uri.startsWith('content://')) {
      try {
        console.log('Intentando leer archivo desde URI:', uri);

        // Usar Filesystem si es posible
        const contenido = await Filesystem.readFile({
          path: uri,
          encoding: Encoding.UTF8,
        });

        // Verificar que el contenido sea un string
        if (typeof contenido.data === 'string') {
          console.log('Contenido leído desde Filesystem:', contenido.data);
          return contenido.data;
        }
      } catch (error) {
        console.warn('Filesystem falló, intentando leer con fetch...', error);
      }

      // Si Filesystem falla, intenta con fetch y Blob
      const blob = await this.getBlobFromContentUri(uri);
      return await this.leerContenidoDesdeBlob(blob);
    } else {
      throw new Error('El esquema de URI no es compatible.');
    }
  }











  async procesarRutinaImportada(rutina: any) {
    try {
      if (!this.usuarioLogeado) {
        console.error('No hay usuario logueado para asignar la rutina importada.');
        return;
      }

      const rutinaDuplicada = this.rutinas.find((r) => r._id === rutina._id);

      if (rutinaDuplicada) {
        const alertaDuplicada = await this.alertController.create({
          header: 'Rutina duplicada',
          message: 'Esta rutina ya existe en la BBDD. ¿Deseas importarla nuevamente?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Reimportar',
              handler: async () => {
                rutina._id = uuidv4(); // Generar un nuevo ID
                console.log('Nuevo ID generado para rutina duplicada:', rutina._id);
                await this.importarRutinaNueva(rutina);
              },
            },
          ],
        });

        await alertaDuplicada.present();
      } else {
        await this.importarRutinaNueva(rutina, true); // Respetar el ID original
      }
    } catch (error) {
      console.error('Error al procesar la rutina importada:', error);
    }
  }



  async importarRutinaNueva(rutina: any, usarIdOriginal: boolean = false) {
    try {
      const numeroRutina = this.calcularNumeroRutina();
      const nombreRutina = `Rutina Importada ${numeroRutina}`;

      const nuevaRutina: Rutina = {
        ...rutina,
        nombre: nombreRutina,
        usuarioId: this.usuarioLogeado?._id,
        _id: usarIdOriginal ? rutina._id : uuidv4(),
        _rev: undefined,
      };

      await this.guardarRutinaEnBBDD(nuevaRutina);

      const alertaExito = await this.alertController.create({
        header: 'Éxito',
        message: 'Rutina importada con éxito.',
        buttons: ['OK'],
        cssClass: 'alert-success',
      });

      await alertaExito.present();
      console.log('Rutina importada y guardada correctamente:', nuevaRutina);
    } catch (error) {
      console.error('Error al guardar la rutina nueva:', error);
    }
  }


  calcularNumeroRutina(): number {
    const nombresExistentes = this.rutinas.map((rutina) => rutina.nombre);
    let contador = 1;
    let nombrePropuesto = `Rutina Importada ${contador}`;

    while (nombresExistentes.includes(nombrePropuesto)) {
      contador++;
      nombrePropuesto = `Rutina Importada ${contador}`;
    }

    return contador;
  }



  async guardarRutinaEnBBDD(rutina: Rutina) {
    try {
      await this.rutinaService.agregarRutina(rutina);
      console.log('Rutina guardada en la base de datos:', rutina);
    } catch (error) {
      console.error('Error al guardar la rutina en la base de datos:', error);
    }
  }


}