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
  private db: any;

  constructor() {
    // Inicializar la base de datos, puedes hacer esto dinámico según la entidad
    this.db = new PouchDB('myappdb');

    // Opcional: Verificar la base de datos
    this.db.info().then((info: any) => {
      console.log('BASE DE DATOS INICIALIZADA', info);
    }).catch((err: any) => {
      console.error('ERROR AL INICIAR LA BASE DE DATOS', err);
    });
  }

  // Método para obtener la instancia de la base de datos (compartida entre otros servicios)
  obtenerBaseDatos() {
    return this.db;
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
    */

  // Otros métodos relacionados a la configuración general de la base de datos podrían ir aquí
}

/* 
 
// service/database.service.ts
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


  // --------------------------------- PARTE DE USUARIOS ------------------------------------


  // Método para agregar un nuevo usuario a la base de datos
  async addUsuario(nombre: string, email: string, imagenPerfil?: string) {
    if (!imagenPerfil) {
      imagenPerfil = '/assets/imagenes/usuarios/avatar-default.png'
    }
    try {
      // Guardar un nuevo documento en la base de datos con el nombre, correo y timestamp actual
      const response = await this.db.post({
        nombre,
        email,
        imagenPerfil,  // Incluir imagen de perfil si se proporciona
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

  // Método para obtener un usuario específico
  async getUsuario(query: any) {
    try {
      const response = await this.db.find(query);
      console.log('Usuario localizado', response);
      return response.docs; // Devolver solo los documentos encontrados
    } catch (err) {
      console.error('Error al obtener usuario:', err);
      throw err;
    }
  }

  // Método para actualizar un usuario
  async updateUsuario(usuario: any) {
    try {
      const response = await this.db.put(usuario);
      console.log('Usuario actualizado con éxito', response);
      return response;
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      throw err;
    }
  }

  // Método para eliminar un usuario
  async deleteUsuario(usuario: any) {
    try {
      const response = await this.db.remove(usuario);
      console.log('Usuario eliminado con éxito', response);
      return response;
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      throw err;
    }
  }
}

*/