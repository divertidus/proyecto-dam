// servicio/ejercicio.service.ts
import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de base de datos
import { BehaviorSubject } from 'rxjs'; // Importamos BehaviorSubject para manejar la lista de ejercicios de manera reactiva
import { Ejercicio } from '../models/ejercicio.model';

@Injectable({
  providedIn: 'root' // El servicio está disponible en toda la aplicación
})

export class EjercicioService {
  private baseDatos: any; // Aquí almacenamos la instancia de la base de datos
  private ejerciciosSubject = new BehaviorSubject<Ejercicio[]>([]); // Creamos el "sujeto" que contiene la lista de ejercicios
  ejercicios$ = this.ejerciciosSubject.asObservable(); // Exponemos los ejercicios como un observable para "escuchar" cambios

  constructor(private servicioBaseDatos: DatabaseService) {
    // Obtenemos la base de datos usando el servicio general de base de datos
    this.baseDatos = this.servicioBaseDatos.obtenerBaseDatos();
  }

  // Método para agregar un nuevo ejercicio
  //async agregarEjercicio(nombre: string, tipo: string, descripcion?: string) {
  async agregarEjercicio(nuevoEjercicio: Ejercicio) {
    // Si no se proporciona una descripción, se asigna una vacía por defecto
    if (!nuevoEjercicio.descripcion) {
      nuevoEjercicio.descripcion = '';
    }

    try {
      // Agregamos el ejercicio a la base de datos usando las propiedades del objeto
      const respuesta = await this.baseDatos.post({
        entidad: 'ejercicio',
        nombre: nuevoEjercicio.nombre, // Nombre del ejercicio
        equipamiento: nuevoEjercicio.equipamiento, // Tipo de ejercicio (mancuernas, barra, peso corporal, etc.)
        descripcion: nuevoEjercicio.descripcion, // Descripción opcional del ejercicio
        imagen: nuevoEjercicio.imagen || '', // Imagen opcional del ejercicio, vacía si no se proporciona
        timestamp: new Date().toISOString() // Fecha y hora en que se añade el ejercicio
      });

      console.log('Ejercicio añadido con éxito', respuesta); // Mensaje en consola si todo salió bien
      return respuesta; // Devolvemos la respuesta de la base de datos
    } catch (error) {
      console.error('Error al agregar ejercicio:', error); // Si hay un error, lo mostramos
      throw error; // Lanzamos el error para manejarlo fuera de esta función
    }
  }

  // Método para obtener todos los ejercicios
  async obtenerEjercicios() {
    try {
      // Obtenemos todos los documentos de la base de datos que tienen 'entidad' con valor 'ejercicio'
      const resultado = await this.baseDatos.find({
        selector: { entidad: 'ejercicio' } // Filtramos por el campo 'entidad' con valor 'ejercicio'
      });

      // Verificamos que se están obteniendo los ejercicios
      console.log('Ejercicios obtenidos:', resultado.docs);

      // Extraemos los ejercicios de los documentos
      const ejercicios = resultado.docs;
      return ejercicios; // Devolvemos la lista de ejercicios
    } catch (error) {
      console.error('Error al obtener ejercicios:', error); // Mostramos en consola si ocurre un error
      throw error; // Lanzamos el error para manejarlo externamente
    }
  }

  // Método para obtener un ejercicio específico por su nombre
  async obtenerEjercicioPorNombre(nombre: string) {
    // Creamos una consulta que busca ejercicios por nombre y filtramos por entidad 'ejercicio'
    const consulta = {
      selector: {
        entidad: 'ejercicio', // Filtramos por el campo 'entidad' que debe ser 'ejercicio'
        nombre: { $eq: nombre } // Buscamos ejercicios cuyo nombre coincida exactamente
      }
    };

    try {
      // Ejecutamos la consulta en la base de datos
      const resultado = await this.baseDatos.find(consulta);
      return resultado.docs; // Devolvemos los documentos que coinciden con la consulta
    } catch (error) {
      console.error('Error al obtener ejercicio por nombre:', error); // Mostramos el error si ocurre
      throw error; // Lanzamos el error para manejarlo fuera de esta función
    }
  }

  // Método para obtener un ejercicio específico por su ID
  async obtenerEjercicioPorId(id: string) {
    try {
      // Utilizamos el método `get` para obtener el documento por ID
      const resultado = await this.baseDatos.get(id);
      return resultado; // Devolvemos el ejercicio encontrado
    } catch (error) {
      console.error('Error al obtener ejercicio por ID:', error); // Mostramos el error si ocurre
      throw error; // Lanzamos el error para manejarlo fuera
    }
  }

  // Método para obtener ejercicios por músculo
  async obtenerEjerciciosPorMusculo(musculo: string) {
    try {
      const result = await this.baseDatos.find({
        selector: {
          entidad: 'ejercicio',
          musculo: { $eq: musculo } // Filtramos por el campo musculo
        }
      });
      const ejercicios = result.docs;
      return ejercicios;
    } catch (err) {
      console.error('Error al obtener ejercicios por músculo:', err);
      throw err;
    }
  }

  // Método para actualizar un ejercicio
  async actualizarEjercicio(ejercicio: Ejercicio) {
    try {
      // Actualizamos el ejercicio en la base de datos usando `put`
      const respuesta = await this.baseDatos.put(ejercicio);
      console.log('Ejercicio actualizado con éxito', respuesta); // Mostramos un mensaje si la actualización fue exitosa
      return respuesta; // Devolvemos la respuesta de la base de datos
    } catch (error) {
      console.error('Error al actualizar ejercicio:', error); // Mostramos el error si ocurre uno
      throw error; // Lanzamos el error para manejarlo fuera de la función
    }
  }

  // Método para eliminar un ejercicio de la base de datos
  async eliminarEjercicio(ejercicio: Ejercicio) {
    try {
      // Eliminamos el ejercicio usando `remove`
      const respuesta = await this.baseDatos.remove(ejercicio);
      console.log('Ejercicio eliminado con éxito', respuesta); // Mensaje si se eliminó correctamente
      return respuesta; // Devolvemos la respuesta de la base de datos
    } catch (error) {
      console.error('Error al eliminar ejercicio:', error); // Mostramos el error si ocurre
      throw error; // Lanzamos el error para manejarlo fuera de esta función
    }
  }

  // Método para cargar todos los ejercicios en el BehaviorSubject
  async cargarEjercicios() {
    try {
      // Obtenemos todos los ejercicios
      const ejercicios = await this.obtenerEjercicios();
      // Actualizamos el BehaviorSubject con la lista de ejercicios
      this.ejerciciosSubject.next(ejercicios);
    } catch (error) {
      console.error('Error al cargar ejercicios:', error); // Mostramos el error si ocurre
      throw error; // Lanzamos el error para manejarlo externamente
    }
  }



  async inicializarEjercicios() {
    const ejerciciosExistentes = await this.baseDatos.find({ selector: { entidad: 'ejercicio' } });

    if (ejerciciosExistentes.docs.length === 0) {
      const ejerciciosIniciales = [
        {
          nombre: 'Press de Banca',
          descripcion: 'Ejercicio para fortalecer el pecho',
          equipamiento: 'barra',
          entidad: 'ejercicio',
          musculo: 'Pectorales'
        },
        {
          nombre: 'Sentadillas',
          descripcion: 'Ejercicio para trabajar las piernas y glúteos',
          equipamiento: 'barra',
          entidad: 'ejercicio',
          musculo: 'Cuádriceps'
        },
        {
          nombre: 'Curl de Bíceps',
          descripcion: 'Ejercicio para fortalecer los bíceps',
          equipamiento: 'mancuerna',
          entidad: 'ejercicio',
          musculo: 'Bíceps'
        },
        {
          nombre: 'Peso Muerto',
          descripcion: 'Ejercicio para trabajar la espalda baja y glúteos',
          equipamiento: 'barra',
          entidad: 'ejercicio',
          musculo: 'Espalda baja'
        },
        {
          nombre: 'Elevación de Talones',
          descripcion: 'Ejercicio para fortalecer las pantorrillas',
          equipamiento: 'peso corporal',
          entidad: 'ejercicio',
          musculo: 'Pantorrillas'
        },
        {
          nombre: 'Press Militar',
          descripcion: 'Ejercicio para trabajar los hombros',
          equipamiento: 'barra',
          entidad: 'ejercicio',
          musculo: 'Hombros'
        },
        {
          nombre: 'Remo con Mancuernas',
          descripcion: 'Ejercicio para fortalecer la espalda media',
          equipamiento: 'mancuerna',
          entidad: 'ejercicio',
          musculo: 'Espalda'
        },
        {
          nombre: 'Dominadas',
          descripcion: 'Ejercicio para trabajar la espalda y bíceps',
          equipamiento: 'peso corporal',
          entidad: 'ejercicio',
          musculo: 'Espalda y Bíceps'
        }
      ];

      // Agregar los ejercicios iniciales
      const resultados = await this.baseDatos.bulkDocs(ejerciciosIniciales);
      console.log('Ejercicios iniciales agregados:', resultados);
    }
  }



}
