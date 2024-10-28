// servicio/ejercicio.service.ts
import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de base de datos
import { BehaviorSubject } from 'rxjs'; // Importamos BehaviorSubject para manejar la lista de ejercicios de manera reactiva
import { Ejercicio } from 'src/app/models/ejercicio.model';

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
    this.cargarEjercicios()
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

        nombre: nuevoEjercicio.nombre, // Nombre del ejercicio
        descripcion: nuevoEjercicio.descripcion,// Descripción opcional del ejercicio
        equipamiento: nuevoEjercicio.tipoPeso, // Tipo de ejercicio (mancuernas, barra, peso corporal, etc.)
        entidad: 'ejercicio',
        imagen: nuevoEjercicio.imagen || '', // Imagen opcional del ejercicio, vacía si no se proporciona
        timestamp: new Date().toISOString() // Fecha y hora en que se añade el ejercicio
      });

    //  console.log('Ejercicio.Service -> Ejercicio añadido con éxito', respuesta); // Mensaje en consola si todo salió bien
      await this.cargarEjercicios(); // Actualiza ejercicios tras eliminar
      return respuesta; // Devolvemos la respuesta de la base de datos
    } catch (error) {
      console.error('Ejercicio.Service -> Error al agregar ejercicio:', error); // Si hay un error, lo mostramos
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
      console.log('Ejercicio.Service -> Ejercicios obtenidos:', resultado.docs);

      // Extraemos los ejercicios de los documentos
      const ejercicios = resultado.docs;
      return ejercicios; // Devolvemos la lista de ejercicios
    } catch (error) {
      console.error('Ejercicio.Service -> Error al obtener ejercicios:', error); // Mostramos en consola si ocurre un error
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
      console.log('Ejercicio.Service -> Obtenido ejercicio por nombre')
      return resultado.docs; // Devolvemos los documentos que coinciden con la consulta
    } catch (error) {
      console.error('Ejercicio.Service -> Error al obtener ejercicio por nombre:', error); // Mostramos el error si ocurre
      throw error; // Lanzamos el error para manejarlo fuera de esta función
    }
  }

  // Método para obtener un ejercicio específico por su ID
  async obtenerEjercicioPorId(id: string): Promise<Ejercicio> {
    try {
      const resultado = await this.baseDatos.get(id); // Obtener el documento por ID
      console.log('Ejercicio.Service -> Obtenido ejercicio por ID:', resultado);
      return resultado; // Retornar el ejercicio encontrado
    } catch (error) {
      console.error('Ejercicio.Service -> Error al obtener ejercicio por ID:', error);
      throw error; // Lanzar el error para manejarlo fuera de esta función
    }
  }

  // Método para obtener un ejercicio específico por su ID
  /*async obtenerEjercicioPorId(id: string) {
    try {
      // Utilizamos el método `get` para obtener el documento por ID
      const resultado = await this.baseDatos.get(id);
      console.log('Ejercicio.Service -> Obtenido ejercicio por id')
      return resultado; // Devolvemos el ejercicio encontrado
    } catch (error) {
      console.error('Ejercicio.Service -> Error al obtener ejercicio por ID:', error); // Mostramos el error si ocurre
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
      console.log('Ejercicio.Service -> Obtenidos ejercicios por musculo')
      return ejercicios;
    } catch (err) {
      console.error('Ejercicio.Service -> Error al obtener ejercicios por músculo:', err);
      throw err;
    }
  }*/

  // Método para actualizar un ejercicio
  async actualizarEjercicio(ejercicio: Ejercicio) {
    try {
      // Actualizamos el ejercicio en la base de datos usando `put`
      const respuesta = await this.baseDatos.put(ejercicio);
      console.log('Ejercicio.Service -> Ejercicio actualizado con éxito', respuesta); // Mostramos un mensaje si la actualización fue exitosa
      await this.cargarEjercicios(); // Actualiza ejercicios tras eliminar
      return respuesta; // Devolvemos la respuesta de la base de datos
    } catch (error) {
      console.error('Ejercicio.Service -> Error al actualizar ejercicio:', error); // Mostramos el error si ocurre uno
      throw error; // Lanzamos el error para manejarlo fuera de la función
    }
  }

  // Método para eliminar un ejercicio de la base de datos
  async eliminarEjercicio(ejercicio: Ejercicio) {
    try {
      // Eliminamos el ejercicio usando `remove`
      const respuesta = await this.baseDatos.remove(ejercicio);
      console.log('Ejercicio.Service -> Ejercicio eliminado con éxito', respuesta); // Mensaje si se eliminó correctamente
      await this.cargarEjercicios(); // Actualiza ejercicios tras eliminar
      return respuesta; // Devolvemos la respuesta de la base de datos
    } catch (error) {
      console.error('Ejercicio.Service -> Error al eliminar ejercicio:', error); // Mostramos el error si ocurre
      throw error; // Lanzamos el error para manejarlo fuera de esta función
    }
  }

  // Método para cargar todos los ejercicios y emitirlos en el BehaviorSubject
  async cargarEjercicios() {
    try {
      const result = await this.baseDatos.find({
        selector: { entidad: 'ejercicio' } // Filtramos por el campo 'entidad' que debe ser 'ejercicio'
      });
      const ejercicios = result.docs;
      this.ejerciciosSubject.next(ejercicios); // Emite la lista actualizada
   //   console.log('Ejercicio.Service -> Cargados ejercicios en BehaviorSubject');
      this.ejerciciosSubject.next(ejercicios); // Emitimos los ejercicios para que todos los suscriptores los reciban
    } catch (error) {
      console.error('Ejercicio.Service -> Error al cargar ejercicios:', error);
      throw error; // Lanzamos el error para manejarlo externamente
    }
  }
  /*          */
  async autoEjercicios() {

    const ejercicios = [
      { nombre: 'Jalón de Espalda', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Remo Agarre Cerrado (Cuernos)', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Jalón Cerrado', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Remo Agarre Ancho - Menos Peso', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Curl Martillo', tipoPeso: 'mancuernas', musculoPrincipal: 'Bíceps' },
      { nombre: 'Máquina Bíceps Sentado', tipoPeso: 'máquina', musculoPrincipal: 'Bíceps' },
      { nombre: 'Press de Banca Tumbado (Mancuernas)', tipoPeso: 'mancuernas', musculoPrincipal: 'Pecho' },
      { nombre: 'Aperturas Máquina', tipoPeso: 'máquina', musculoPrincipal: 'Pecho' },
      { nombre: 'Elevaciones Laterales', tipoPeso: 'mancuernas', musculoPrincipal: 'Hombro' },
      { nombre: 'Sentadillas Multipower', tipoPeso: 'barra', musculoPrincipal: 'Piernas' },
      // Añadir más según los ejercicios necesarios...
    ];

  }

  async inicializarEjercicios() {
    const ejerciciosExistentes = await this.baseDatos.find({ selector: { entidad: 'ejercicio' } });

    if (ejerciciosExistentes.docs.length === 0) {
      const ejerciciosIniciales = [
        { nombre: 'Jalón de Espalda', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
        { nombre: 'Remo Agarre Cerrado (Cuernos)', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
        { nombre: 'Jalón Cerrado', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
        { nombre: 'Remo Agarre Ancho - Menos Peso', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
        { nombre: 'Curl Martillo', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Bíceps' },
        { nombre: 'Máquina Bíceps Sentado', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Bíceps' },
        { nombre: 'Press de Banca Tumbado (Mancuernas)', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Pecho' },
        { nombre: 'Aperturas Máquina', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Pecho' },
        { nombre: 'Elevaciones Laterales', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Hombro' },
        { nombre: 'Sentadillas Multipower', entidad: 'ejercicio', tipoPeso: 'barra', musculoPrincipal: 'Piernas' },

      ];

      // Agregar los ejercicios iniciales
      const resultados = await this.baseDatos.bulkDocs(ejerciciosIniciales);
      console.log('Ejercicio.Service -> Ejercicios iniciales agregados:', resultados);
    }
  }



}
