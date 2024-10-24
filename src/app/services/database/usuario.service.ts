// servicio/usuario.service.ts
import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { BehaviorSubject } from 'rxjs'; // Importamos BehaviorSubject para manejar la lista de usuarios de manera reactiva
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root' // Este decorador indica que el servicio está disponible en toda la aplicación
})
export class UsuarioService {
  private baseDatos: any; // Aquí guardamos la instancia de la base de datos que vamos a usar
  private usuariosSubject = new BehaviorSubject<Usuario[]>([]); // Este es el "sujeto" que contiene la lista de usuarios
  usuarios$ = this.usuariosSubject.asObservable();
  // Exponemos los usuarios como un "observable", 
  //para que otras partes del código puedan "escuchar" cuando cambien

  constructor(private servicioBaseDatos: DatabaseService) {
    // En el constructor obtenemos la base de datos usando el servicio general de base de datos
    this.baseDatos = this.servicioBaseDatos.obtenerBaseDatos();
  }

  // Método para agregar un nuevo usuario
  async agregarUsuario(usuario: Usuario) {
    // Si no se proporciona una imagen de perfil, usamos una imagen por defecto
    if (!usuario.imagenPerfil) {
      usuario.imagenPerfil = '/assets/imagenes/usuarios/avatar-default.png';
    }

    try {
      // Agregamos el nuevo usuario a la base de datos
      const respuesta = await this.baseDatos.post({
        entidad: 'usuario',
        nombre: usuario.nombre, // Nombre del usuario
        email: usuario.email, // Correo del usuario
        imagenPerfil: usuario.imagenPerfil, // Imagen de perfil del usuario
        timestamp: new Date().toISOString() // Fecha y hora en que se agrega el usuario
      });

      console.log('USUARIO.SERVICE -> Usuario añadido con éxito', respuesta); // Mostramos en consola si todo salió bien
      return respuesta; // Devolvemos la respuesta de la base de datos
    } catch (error) {
      console.error('USUARIO.SERVICE -> Error al agregar usuario:', error); // Si algo falla, mostramos el error en consola
      throw error; // Lanzamos el error para que pueda ser manejado por quien llame al método
    }
  }

  // Método para obtener todos los usuarios de la base de datos
  async obtenerUsuarios() {
    try {
      // Obtenemos todos los documentos de la base de datos que tienen documentType 'usuario'
      const resultado = await this.baseDatos.find({
        selector: { entidad: 'usuario' } // Filtramos por el tipo de documento 'usuario'
      });

      // Extraemos los usuarios de los documentos
      const usuarios = resultado.docs;
      console.log(resultado.docs)
      console.log('USUARIO.SERVICE -> obtenidos usuarios')
      return usuarios; // Devolvemos la lista de usuarios
    } catch (error) {
      console.error('USUARIO.SERVICE -> Error al obtener usuarios:', error); // Mostramos en consola si ocurre un error
      throw error; // Lanzamos el error para que pueda ser manejado externamente
    }
  }

  // Método para obtener un usuario específico por su nombre
  async obtenerUsuarioPorNombre(nombre: string) {
    // Creamos una consulta que busca al usuario por su nombre y aseguramos que sea del tipo 'usuario'
    const consulta = {
      selector: {
        documentType: 'usuario', // Filtramos por tipo de documento 'usuario'
        nombre: { $eq: nombre }   // Buscamos donde el nombre coincida exactamente
      }
    };

    try {
      // Ejecutamos la consulta en la base de datos
      const resultado = await this.baseDatos.find(consulta);
      console.log('USUARIO.SERVICE -> obtenido usuario por nombre')
      return resultado.docs; // Devolvemos los documentos que coinciden con la consulta
    } catch (error) {
      console.error('USUARIO.SERVICE -> Error al obtener usuario por nombre:', error); // Mostramos el error si algo sale mal
      throw error; // Lanzamos el error para manejarlo fuera de esta función
    }
  }

  // Método para obtener un usuario específico por su ID
  async obtenerUsuarioPorId(id: string) {
    try {
      // Utilizamos el método `get` para obtener el documento por su ID único
      const resultado = await this.baseDatos.get(id);
      console.log('USUARIO.SERVICE -> obtenido usuario por ID')
      return resultado; // Devolvemos el documento encontrado, ya que los IDs son únicos
    } catch (error) {
      console.error('USUARIO.SERVICE -> Error al obtener usuario por ID:', error); // Mostramos el error si ocurre
      throw error; // Lanzamos el error para manejarlo fuera
    }
  }

  /*  IINECESARIO PROQUE LOS ID SERAN UNICOS AL SER UNA UNICA BD PERO BUENO, AQUI LO DEJO, 
  // Método para obtener un usuario específico por su ID
async obtenerUsuarioPorId(id: string) {
  try {
    // Obtener el documento por ID
    const resultado = await this.baseDatos.get(id);

    // Si existe el campo documentType y es 'usuario', lo devolvemos
    if (resultado.documentType === 'usuario') {
      return resultado;
    } else {
      throw new Error('El documento no es del tipo usuario'); // Si el tipo no es 'usuario', lanzamos un error
    }
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    throw error;
  }
}
  */


  // Método para actualizar los datos de un usuario
  async actualizarUsuario(usuario: any) {
    try {
      // Actualizamos el usuario en la base de datos usando la función `put` que reemplaza el documento existente
      const respuesta = await this.baseDatos.put(usuario);
      console.log('USUARIO.SERVICE -> Usuario actualizado con éxito', respuesta); // Mostramos un mensaje si la actualización fue exitosa
      return respuesta; // Devolvemos la respuesta de la base de datos
    } catch (error) {
      console.error('USUARIO.SERVICE -> Error al actualizar usuario:', error); // Mostramos el error si ocurre uno
      throw error; // Lanzamos el error para manejarlo externamente
    }
  }

  // Método para eliminar un usuario de la base de datos
  async eliminarUsuario(usuario: any) {
    try {
      // Eliminamos el usuario usando la función `remove` que borra el documento de la base de datos
      const respuesta = await this.baseDatos.remove(usuario);
      console.log('USUARIO.SERVICE -> Usuario eliminado con éxito', respuesta); // Mostramos un mensaje si se elimina correctamente
      return respuesta; // Devolvemos la respuesta de la base de datos
    } catch (error) {
      console.error('USUARIO.SERVICE -> Error al eliminar usuario:', error); // Mostramos el error si ocurre uno
      throw error; // Lanzamos el error para manejarlo fuera del método
    }
  }

  // Método para cargar todos los usuarios y almacenarlos en el BehaviorSubject
  async cargarUsuarios() {
    try {
      // Obtenemos todos los usuarios
      const usuarios = await this.obtenerUsuarios();
      // Actualizamos el BehaviorSubject con la lista de usuarios
      this.usuariosSubject.next(usuarios);
      console.log('USUARIO.SERVICE -> Cargados usuarios en Behaviour')
    } catch (error) {
      console.error('USUARIO.SERVICE -> Error al cargar usuarios:', error); // Mostramos un error si no podemos cargar los usuarios
      throw error; // Lanzamos el error para manejarlo fuera de esta función
    }
  }
}
