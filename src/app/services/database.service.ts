// Importar decorador Injectable desde Angular, que permite que esta clase se use como servicio inyectable
import { Injectable } from '@angular/core';
// Importar PouchDB de esta manera, asegurando que se incluya la versión correcta
import PouchDB from 'pouchdb/dist/pouchdb.js';


// Decorador Injectable que indica que este servicio puede ser inyectado en otros componentes
@Injectable({
  providedIn: 'root'      // Hace que el servicio esté disponible en toda la aplicación
})
export class DatabaseService {
  private db: any;         // Propiedad privada para almacenar la instancia de PouchDB

  // Constructor que se llama al crear una instancia de la clase
  constructor() {
    // Inicializar PouchDB creando o abriendo la base de datos llamada 'myusersdb1'
    this.db = new PouchDB('myusersdb1');




    // Recuperar todos los documentos de la base de datos, incluyendo su contenido
    this.db.allDocs({ include_docs: true }).then(result => {
      // Iterar sobre cada fila de resultado para imprimir los documentos
      result.rows.forEach(row => {
        console.log('Documento:', row.doc);  // Mostrar cada documento en la consola
      });
    });

    // Opcional: verificar que la base de datos se creó correctamente
    this.db.info().then((info: any) => {
      // Imprimir información sobre la base de datos en la consola
      console.log('Database created successfully', info);
    }).catch((err: any) => {
      // Manejar errores en caso de que la base de datos no se cree correctamente
      console.error('Error creating database', err);
    });
  }

  // Método para agregar un nuevo usuario a la base de datos
  async addUsuario(nombre: string, email: string) {
    try {
      // Guardar un nuevo documento en la base de datos con el nombre, correo y timestamp actual
      const response = await this.db.post({
        nombre,
        email,
        timestamp: new Date().toISOString() // Obtener la fecha y hora actual en formato ISO
      });
      console.log('Usuario añadido con éxito', response); // Imprimir el resultado de la operación en consola
      return response;  // Retornar la respuesta (detalles del documento agregado)
    } catch (err) {
      // Manejar errores durante el intento de agregar el usuario
      console.error('Error al guardar usuario:', err);
      throw err;  // Lanzar el error para manejarlo más arriba si es necesario
    }
  }



  // Método para obtener todos los usuarios de la base de datos
  async getAllUsers() {
    try {
      // Recuperar todos los documentos de la base de datos
      const result = await this.db.allDocs({
        include_docs: true, // Incluir el contenido de los documentos
        attachments: false   // No incluir los adjuntos (opcional)
      });
      // Retornar un arreglo de documentos a partir del resultado obtenido
      return result.rows.map(row => row.doc);
    } catch (err) {
      // Manejar errores durante la obtención de usuarios
      console.error('Error al obtener usuarios:', err);
      throw err;  // Lanzar el error para manejarlo más arriba si es necesario
    }
  }


}






/* PARA CAMBIAR NOMBRES DE CAMPOS... IRIA EN EL CONSTRUCTOS

 // Migrar documentos para renombrar el campo 'name' a 'nombre'
     this.db.allDocs({ include_docs: true }).then(result => {
      result.rows.forEach(async row => {
        const doc = row.doc;
        // Verificar si el documento tiene el campo 'name'
        if (doc.name) {
          // Renombrar el campo 'name' a 'nombre'
          doc.nombre = doc.name;
          delete doc.name; // Eliminar el campo 'name'
          // Guardar el documento actualizado
          await this.db.put(doc);
          console.log(`Documento migrado: ${doc._id}`);
        }
      });
    }).catch(err => {
      console.error('Error migrando los documentos:', err);
    });

    this.db.info().then((info: any) => {
      console.log('Database created successfully', info);
    }).catch((err: any) => {
      console.error('Error creating database', err);
    });
*/