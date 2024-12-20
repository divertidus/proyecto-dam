//  // servicio/ejercicio.service.ts
import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service'; // Importamos el servicio de base de datos
import { BehaviorSubject } from 'rxjs'; // Importamos BehaviorSubject para manejar la lista de ejercicios de manera reactiva
import { Ejercicio } from 'src/app/models/ejercicio.model';
import { v4 as uuidv4 } from 'uuid';

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
      // Agregamos el ejercicio a la base de datos usando las propiedades del objeto `Ejercicio`
      const respuesta = await this.baseDatos.post({
        _id:nuevoEjercicio._id,
        entidad: 'ejercicio',
        nombre: nuevoEjercicio.nombre, // Nombre del ejercicio
        descripcion: nuevoEjercicio.descripcion, // Descripción opcional del ejercicio
        tipoPeso: nuevoEjercicio.tipoPeso, // Tipo de ejercicio (mancuernas, barra, peso corporal, etc.)
        musculoPrincipal: nuevoEjercicio.musculoPrincipal, // Grupo muscular principal trabajado
        imagen: nuevoEjercicio.imagen || '', // Imagen opcional del ejercicio, vacía si no se proporciona
        ejercicioPersonalizado: nuevoEjercicio.ejercicioPersonalizado,
        timestamp: new Date().toISOString() // Fecha y hora en que se añade el ejercicio
      });

      // Actualizamos los ejercicios en la aplicación
      await this.cargarEjercicios(); // Actualiza ejercicios tras eliminar
      console.log(respuesta)
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
      //  console.log('Ejercicio.Service -> Ejercicios obtenidos:', resultado.docs);

      // Extraemos los ejercicios de los documentos
      const ejercicios = resultado.docs;
      return ejercicios; // Devolvemos la lista de ejercicios
    } catch (error) {
      //  console.error('Ejercicio.Service -> Error al obtener ejercicios:', error); // Mostramos en consola si ocurre un error
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
      //  console.log('Ejercicio.Service -> Obtenido ejercicio por nombre')
      return resultado.docs; // Devolvemos los documentos que coinciden con la consulta
    } catch (error) {
      //  console.error('Ejercicio.Service -> Error al obtener ejercicio por nombre:', error); // Mostramos el error si ocurre
      throw error; // Lanzamos el error para manejarlo fuera de esta función
    }
  }

  // Método para obtener un ejercicio específico por su ID
  async obtenerEjercicioPorId(idEjercicio: string): Promise<Ejercicio> {
    try {
      const resultado = await this.baseDatos.get(idEjercicio); // Obtener el documento por ID
      //  console.log('Ejercicio.Service -> Obtenido ejercicio por ID:', resultado);
      return resultado; // Retornar el ejercicio encontrado
    } catch (error) {
      //  console.error('Ejercicio.Service -> Error al obtener ejercicio por ID:', error);
      throw error; // Lanzar el error para manejarlo fuera de esta función
    }
  }


  // Método para actualizar un ejercicio
  async actualizarEjercicio(ejercicio: Ejercicio) {
    try {
      // Actualizamos el ejercicio en la base de datos usando `put`
      const respuesta = await this.baseDatos.put(ejercicio);
      //  console.log('Ejercicio.Service -> Ejercicio actualizado con éxito', respuesta); // Mostramos un mensaje si la actualización fue exitosa
      await this.cargarEjercicios(); // Actualiza ejercicios tras eliminar
      return respuesta; // Devolvemos la respuesta de la base de datos
    } catch (error) {
      //  console.error('Ejercicio.Service -> Error al actualizar ejercicio:', error); // Mostramos el error si ocurre uno
      throw error; // Lanzamos el error para manejarlo fuera de la función
    }
  }

  // Método para eliminar un ejercicio de la base de datos
  async eliminarEjercicio(ejercicio: Ejercicio) {
    try {
      // Eliminamos el ejercicio usando `remove`
      const respuesta = await this.baseDatos.remove(ejercicio);
      //  console.log('Ejercicio.Service -> Ejercicio eliminado con éxito', respuesta); // Mensaje si se eliminó correctamente
      await this.cargarEjercicios(); // Actualiza ejercicios tras eliminar
      return respuesta; // Devolvemos la respuesta de la base de datos
    } catch (error) {
      //  console.error('Ejercicio.Service -> Error al eliminar ejercicio:', error); // Mostramos el error si ocurre
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
      //  console.log('Ejercicio.Service -> Cargados ejercicios en BehaviorSubject');
      this.ejerciciosSubject.next(ejercicios); // Emitimos los ejercicios para que todos los suscriptores los reciban
    } catch (error) {
      //  console.error('Ejercicio.Service -> Error al cargar ejercicios:', error);
      throw error; // Lanzamos el error para manejarlo externamente
    }
  }
  /*          */
  async autoEjercicios() {

    const ejercicios = [
      { nombre: 'Jalón de Espalda', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Remo Agarre Cerrado', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Jalón Cerrado', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Remo Agarre Ancho - Menos Peso', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Curl Martillo', tipoPeso: 'mancuernas', musculoPrincipal: 'Bíceps' },
      { nombre: 'Máquina Bíceps Sentado', tipoPeso: 'máquina', musculoPrincipal: 'Bíceps' },
      { nombre: 'Press de Banca Tumbado', tipoPeso: 'mancuernas', musculoPrincipal: 'Pecho' },
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
        { nombre: 'Remo Agarre Cerrado', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
        { nombre: 'Jalón Cerrado', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
        { nombre: 'Remo Agarre Ancho - Menos Peso', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
        { nombre: 'Curl Martillo', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Bíceps' },
        { nombre: 'Máquina Bíceps Sentado', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Bíceps' },
        { nombre: 'Press de Banca Tumbado', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Pecho' },
        { nombre: 'Aperturas Máquina', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Pecho' },
        { nombre: 'Elevaciones Laterales', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Hombro' },
        { nombre: 'Sentadillas Multipower', entidad: 'ejercicio', tipoPeso: 'barra', musculoPrincipal: 'Piernas' },

      ];

      // Agregar los ejercicios iniciales
      const resultados = await this.baseDatos.bulkDocs(ejerciciosIniciales);
      //  console.log('Ejercicio.Service -> Ejercicios iniciales agregados:', resultados);
    }
  }

  async verificarOCrearEjercicio(ejercicio: Partial<Ejercicio>): Promise<Ejercicio> {
    try {
      // Buscar ejercicios existentes en la base de datos
      const ejerciciosExistentes = await this.obtenerEjercicios();
      const ejercicioCoincidente = ejerciciosExistentes.find(e =>
        e.nombre === ejercicio.nombre &&
        e.tipoPeso === ejercicio.tipoPeso &&
        e.musculoPrincipal === ejercicio.musculoPrincipal &&
        e.descripcion === ejercicio.descripcion
      );
  
      if (ejercicioCoincidente) {
        console.log('Ejercicio existente encontrado:', ejercicioCoincidente);
        return ejercicioCoincidente; // Devolver el ejercicio existente completo
      }
  
      // Si no existe coincidencia, crear un nuevo ejercicio
      const nuevoEjercicio: Ejercicio = {
        _id: uuidv4(),
        entidad: 'ejercicio',
        nombre: ejercicio.nombre || 'Ejercicio sin nombre', // Nombre por defecto si no se proporciona
        tipoPeso: ejercicio.tipoPeso || 'Barra', // Tipo de peso por defecto
        musculoPrincipal: ejercicio.musculoPrincipal || 'Sin Categoría', // Valor por defecto para músculo principal
        descripcion: ejercicio.descripcion || 'Sin descripción', // Valor por defecto para descripción
        ejercicioPersonalizado: true, // Por defecto, lo marcamos como personalizado
        imagen: ejercicio.imagen || '', // Imagen opcional        
      };
  
      // Guardar el nuevo ejercicio en la base de datos
      const respuesta = await this.agregarEjercicio(nuevoEjercicio);
      console.log('Nuevo ejercicio creado:', respuesta);
  
      return nuevoEjercicio; // Devolver el nuevo ejercicio completo
    } catch (error) {
      console.error('Error al verificar o crear ejercicio:', error);
      throw error;
    }
  }
  



}
