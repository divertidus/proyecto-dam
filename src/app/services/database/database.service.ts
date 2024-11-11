// service/database.service.ts
import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb/dist/pouchdb.js';
import PouchDBFind from 'pouchdb-find';


// Habilitar el plugin de búsqueda
PouchDB.plugin(PouchDBFind);


@Injectable({
  providedIn: 'root'
})

export class DatabaseService {
  private baseDatos: any;

  constructor() {
    // Inicializar la base de datos, puedes hacer esto dinámico según la entidad
    this.baseDatos = new PouchDB('myappdb');

    // Opcional: Verificar la base de datos
    this.baseDatos.info().then((info: any) => {
      console.log('BASE DE DATOS INICIALIZADA', info);
    }).catch((err: any) => {
      console.error('ERROR AL INICIAR LA BASE DE DATOS', err);
    });
  }

  // Método para obtener la instancia de la base de datos (compartida entre otros servicios)
  obtenerBaseDatos() {
    return this.baseDatos;
  }

  /* EXTRAS*/

  // Método para listar todos los documentos en la base de datos
  listarTodosLosDocumentos(): Promise<any> {
    return this.baseDatos.allDocs({ include_docs: true }).then((result: any) => {
      return result.rows.map((row: any) => row.doc);
    }).catch((err: any) => {
      console.error('Error al listar documentos:', err);
    });
  }

  // Método para exportar los documentos como JSON
  exportarDocumentosAJson(): Promise<void> {
    return this.listarTodosLosDocumentos().then((docs: any) => {
      const jsonData = JSON.stringify(docs, null, 2); // Convierte los documentos a formato JSON
      console.log(jsonData); // Muestra el JSON en consola
      this.descargarArchivo('backup.json', jsonData); // Descarga el archivo JSON
    }).catch((err: any) => {
      console.error('Error al exportar documentos:', err);
    });
  }

  // Método para descargar un archivo JSON
  private descargarArchivo(nombreArchivo: string, contenido: string) {
    const blob = new Blob([contenido], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Inicializar la base de datos
  private inicializarBaseDatos() {
    this.baseDatos = new PouchDB('myappdb');
    this.baseDatos.info().then((info: any) => {
      console.log('BASE DE DATOS INICIALIZADA', info);
    }).catch((err: any) => {
      console.error('ERROR AL INICIAR LA BASE DE DATOS', err);
    });
  }

  // Método para eliminar la base de datos y recrearla
  async eliminarBaseDatos() {
    try {
      await this.baseDatos.destroy(); // Destruye la base de datos actual
      console.log('Base de datos eliminada correctamente');
      this.inicializarBaseDatos(); // Re-inicializa la base de datos
    } catch (error) {
      console.error('Error al eliminar la base de datos:', error);
    }
  }

  // Método para eliminar todos los documentos de la base de datos
  async eliminarTodosLosDocumentos(): Promise<void> {
    try {
      // Obtener todos los documentos incluyendo sus IDs y _revs
      const result = await this.baseDatos.allDocs();

      // Mapear los documentos a un formato necesario para la eliminación masiva
      const documentosAEliminar = result.rows.map((row: any) => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true  // Flag para marcar los documentos como eliminados
      }));

      // Usar el método bulkDocs para eliminar todos los documentos de una sola vez
      const respuesta = await this.baseDatos.bulkDocs(documentosAEliminar);
      console.log("Todos los documentos han sido eliminados:", respuesta);
    } catch (error) {
      console.error("Error al eliminar todos los documentos:", error);
    }
  }

}

/*
// Sincronización con base de datos remota (opcional)
sync(remoteDbUrl: string) {
  const remoteDb = new PouchDB(remoteDbUrl);
  this.db.sync(remoteDb, {
    live: true,
    retry: true
  }).on('change', (info: any) => {
    console.log('Sync change', info);
  }).on('error', (err: any) => {
    console.error('Sync error', err);
  });
}
  }
  */

