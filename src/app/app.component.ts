import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './auth/auth.service';
import { Ejercicio } from './models/ejercicio.model';
import { DiaRutina, Rutina, Serie } from './models/rutina.model';
import { Usuario } from './models/usuario.model';
import { HistorialEntrenamiento } from './models/historial-entrenamiento';
import { EjercicioService } from './services/database/ejercicio.service';
import { UsuarioService } from './services/database/usuario.service';
import { RutinaService } from './services/database/rutina.service';
import { DatabaseService } from './services/database/database.service';
import { HistorialService } from './services/database/historial-entrenamiento.service';

/* import { defineCustomElement } from '@ionic/core/components/ion-modal.js';
import { defineCustomElement as defineModal } from '@ionic/core/components/ion-modal.js';
import { defineCustomElement as defineLoading } from '@ionic/core/components/ion-loading.js'; */

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  constructor(
    private ejercicioService: EjercicioService,
    private usuarioService: UsuarioService,
    private rutinaService: RutinaService,
    private historialService: HistorialService,  // Importamos el HistorialService
    private databaseService: DatabaseService,
    private authService: AuthService) { /* defineCustomElement(); */ }

  private usuarioLogeado: Usuario | null = null; // Variable para almacenar el usuario logeado actual

  async ngOnInit() {
    // Verifica si hay datos en la base de datos antes de inicializar
    const baseDatosVacia = await this.comprobarBaseDatosVacia();

    if (baseDatosVacia) {
      console.log('No se encontraron datos en la base de datos. Cargando datos iniciales.');
      await this.inicializarUsuario(); // Inicializamos el usuario
      await this.inicializarEjercicios(); // Inicializamos los ejercicios
      await this.inicializarRutina(); // Inicializamos las rutinas con los días y ejercicios
      await this.inicializarHistorial(); // Inicializamos el historial con dos entrenamientos
    } else {
      console.log('Datos ya existentes en la base de datos. No se cargarán los datos iniciales.');
    }

    this.authService.autoLoginPrimerUsuario(); // Intentamos iniciar sesión automáticamente

    /*   // CONSULTAS DOCUMENTOS Y DESCARGA JSON BBDD CON INFORMACION
      // Listar todos los documentos al iniciar el componente
      this.databaseService.listarTodosLosDocumentos().then((docs) => {
        console.log('Documentos encontrados:', docs);
      });
  
      // Exportar los documentos a un archivo JSON
      this.databaseService.exportarDocumentosAJson();
  
  */

  }

  // Método para comprobar si la base de datos está completamente vacía
  private async comprobarBaseDatosVacia(): Promise<boolean> {
    try {
      // Consultas a la base de datos para cada colección
      const usuarios = await this.usuarioService.obtenerUsuarios();
      const ejercicios = await this.ejercicioService.obtenerEjercicios();
      const rutinas = await this.rutinaService.obtenerRutinasPorUsuario("usuarioId");
      const historiales = await this.historialService.obtenerHistorialesPorUsuario("usuarioId");

      // Retorna true si todas las colecciones están vacías
      return usuarios.length === 0 && ejercicios.length === 0 && rutinas.length === 0 && historiales.length === 0;
    } catch (error) {
      console.error('Error al comprobar la base de datos:', error);
      return false; // En caso de error, asumimos que no hay datos para evitar recargar
    }
  }






  // Inicializar el usuario si no existe
  async inicializarUsuario() {
    try {
      const usuariosExistentes = await this.usuarioService.obtenerUsuarios();
      if (usuariosExistentes.length === 0) {
        const nuevoUsuario: Usuario = {
          nombre: 'AutoUsuario',
          email: 'auto@pruebas.com',
          entidad: 'usuario',
          timestamp: new Date().toISOString(),
        };
        await this.usuarioService.agregarUsuario(nuevoUsuario);
        console.log('Usuario inicializado correctamente:', nuevoUsuario.nombre);
      } else {
        console.log('Usuarios ya existentes.');
      }
    } catch (error) {
      console.error('Error al inicializar el usuario:', error);
    }
  }

  // Inicializar ejercicios si no existen
  async inicializarEjercicios(): Promise<{ [key: string]: string }> {
    const ejercicios: Ejercicio[] = [
      { nombre: 'Jalón de Espalda', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Remo Agarre Cerrado (Cuernos)', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Jalón Cerrado', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Martillo (Mancuernas)', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Bíceps' },
      { nombre: 'Press Banco Tumbado (Mancuernas)', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Pecho' },
      { nombre: 'Máquina Aperturas', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Pecho' },
      { nombre: 'Fondos en Paralelas', entidad: 'ejercicio', tipoPeso: 'peso corporal', musculoPrincipal: 'Tríceps' },
      { nombre: 'Sentadillas Multipower', entidad: 'ejercicio', tipoPeso: 'barra', musculoPrincipal: 'Piernas' },
      { nombre: 'Elevaciones Laterales', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Hombro' },
      { nombre: 'Prensa de Piernas', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Piernas' },
    ];

    const ejerciciosMap: { [key: string]: string } = {};

    try {
      const ejerciciosExistentes = await this.ejercicioService.obtenerEjercicios();
      if (ejerciciosExistentes.length === 0) {
        for (const ejercicio of ejercicios) {
          const response = await this.ejercicioService.agregarEjercicio(ejercicio);
          ejerciciosMap[ejercicio.nombre] = response.id;
          console.log(`Ejercicio ${ejercicio.nombre} añadido correctamente con ID: ${response.id}`);
        }
      } else {
        ejerciciosExistentes.forEach(e => {
          ejerciciosMap[e.nombre] = e._id!;
        });
        console.log('Ejercicios ya existen en la base de datos.');
      }
    } catch (error) {
      console.error('Error al añadir ejercicios:', error);
    }

    return ejerciciosMap;
  }

  // Inicializar rutina si no existe
  async inicializarRutina() {
    try {
      const usuarios = await this.usuarioService.obtenerUsuarios();
      if (usuarios.length === 0) {
        return;
      }
      const usuarioLogeado = usuarios[0];

      const ejerciciosMap = await this.inicializarEjercicios();

      const diasRutina: DiaRutina[] = [
        {
          diaNombre: 'Día 1: Espalda y Bíceps',
          descripcion: 'Entrenamiento de espalda y bíceps',
          ejercicios: [
            { ejercicioId: ejerciciosMap['Jalón de Espalda'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Remo Agarre Cerrado (Cuernos)'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Martillo (Mancuernas)'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) }
          ]
        },
        {
          diaNombre: 'Día 2: Pecho y Tríceps',
          descripcion: 'Entrenamiento de pecho y tríceps',
          ejercicios: [
            { ejercicioId: ejerciciosMap['Press Banco Tumbado (Mancuernas)'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Máquina Aperturas'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Fondos en Paralelas'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) }
          ]
        },
        {
          diaNombre: 'Día 3: Pierna y Hombro',
          descripcion: 'Entrenamiento de pierna y hombro',
          ejercicios: [
            { ejercicioId: ejerciciosMap['Sentadillas Multipower'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Elevaciones Laterales'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 12 }) },
            { ejercicioId: ejerciciosMap['Prensa de Piernas'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) }
          ]
        }
      ];

      const rutinasExistentes = await this.rutinaService.obtenerRutinasPorUsuario(usuarioLogeado._id!);
      if (rutinasExistentes.length === 0) {
        const nuevaRutina: Rutina = {
          nombre: 'Rutina 1',
          entidad: 'rutina',
          usuarioId: usuarioLogeado._id!,
          dias: diasRutina,
          timestamp: new Date().toISOString(),
        };
        await this.rutinaService.agregarRutina(nuevaRutina);
        console.log('Rutina añadida con éxito');
      } else {
        console.log('Ya existen rutinas en la base de datos.');
      }
    } catch (error) {
      console.error('Error al añadir la rutina:', error);
    }
  }

  // Inicializar historial de entrenamiento con nueve sesiones en días diferentes
  async inicializarHistorial() {
    try {
      const usuarios = await this.usuarioService.obtenerUsuarios();
      if (usuarios.length === 0) return;
      const usuarioLogeado = usuarios[0];

      const ejerciciosExistentes = await this.ejercicioService.obtenerEjercicios();

      // Mapear los nombres de los ejercicios a los IDs reales obtenidos de la base de datos
      const ejerciciosPredefinidos = ejerciciosExistentes.reduce((map, ejercicio) => {
        map[ejercicio.nombre] = ejercicio._id;
        return map;
      }, {} as { [nombre: string]: string });

      if (!ejerciciosPredefinidos) {
        console.error('No se encontraron ejercicios predefinidos.');
        return;
      }

      // Días de entrenamientos con información del peso anterior manualmente asignada
      const dia1Entrenamiento1 = [
        { ejercicioId: ejerciciosPredefinidos['Jalón de Espalda'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 80 }] },
        { ejercicioId: ejerciciosPredefinidos['Remo Agarre Cerrado (Cuernos)'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 85 }] },
        { ejercicioId: ejerciciosPredefinidos['Martillo (Mancuernas)'], series: [{ numeroSerie: 1, repeticiones: 8, peso: 20 }] }
      ];

      const dia2Entrenamiento1 = [
        { ejercicioId: ejerciciosPredefinidos['Press Banco Tumbado (Mancuernas)'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 60 }] },
        { ejercicioId: ejerciciosPredefinidos['Máquina Aperturas'], series: [{ numeroSerie: 1, repeticiones: 12, peso: 40 }] },
        { ejercicioId: ejerciciosPredefinidos['Fondos en Paralelas'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 0 }] }
      ];

      const dia3Entrenamiento1 = [
        { ejercicioId: ejerciciosPredefinidos['Sentadillas Multipower'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 100 }] },
        { ejercicioId: ejerciciosPredefinidos['Elevaciones Laterales'], series: [{ numeroSerie: 1, repeticiones: 12, peso: 10 }] },
        { ejercicioId: ejerciciosPredefinidos['Prensa de Piernas'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 120 }] }
      ];

      // Segunda ronda (usamos el peso anterior donde corresponde)
      const dia1Entrenamiento2 = [
        { ejercicioId: ejerciciosPredefinidos['Jalón de Espalda'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 82, pesoAnterior: 80 }] },
        { ejercicioId: ejerciciosPredefinidos['Remo Agarre Cerrado (Cuernos)'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 87, pesoAnterior: 85 }] },
        { ejercicioId: ejerciciosPredefinidos['Martillo (Mancuernas)'], series: [{ numeroSerie: 1, repeticiones: 8, peso: 22, pesoAnterior: 20 }] }
      ];

      const dia3Entrenamiento2 = [
        { ejercicioId: ejerciciosPredefinidos['Sentadillas Multipower'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 105, pesoAnterior: 100 }] },
        { ejercicioId: ejerciciosPredefinidos['Elevaciones Laterales'], series: [] }, // No se registran series para este ejercicio
        { ejercicioId: ejerciciosPredefinidos['Prensa de Piernas'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 125, pesoAnterior: 120 }] }
      ];

      const dia1Entrenamiento3 = [
        { ejercicioId: ejerciciosPredefinidos['Jalón de Espalda'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 84, pesoAnterior: 82 }] },
        { ejercicioId: ejerciciosPredefinidos['Remo Agarre Cerrado (Cuernos)'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 90, pesoAnterior: 87 }] },
        { ejercicioId: ejerciciosPredefinidos['Martillo (Mancuernas)'], series: [{ numeroSerie: 1, repeticiones: 8, peso: 24, pesoAnterior: 22 }] }
      ];

      const dia2Entrenamiento2 = [
        { ejercicioId: ejerciciosPredefinidos['Press Banco Tumbado (Mancuernas)'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 65, pesoAnterior: 60 }] },
        { ejercicioId: ejerciciosPredefinidos['Máquina Aperturas'], series: [{ numeroSerie: 1, repeticiones: 12, peso: 45, pesoAnterior: 40 }] },
        { ejercicioId: ejerciciosPredefinidos['Fondos en Paralelas'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 0, pesoAnterior: 0 }] }
      ];

      const dia3Entrenamiento3 = [
        { ejercicioId: ejerciciosPredefinidos['Sentadillas Multipower'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 110, pesoAnterior: 105 }] },
        { ejercicioId: ejerciciosPredefinidos['Elevaciones Laterales'], series: [{ numeroSerie: 1, repeticiones: 12, peso: 12, pesoAnterior: 10 }] },
        { ejercicioId: ejerciciosPredefinidos['Prensa de Piernas'], series: [{ numeroSerie: 1, repeticiones: 10, peso: 130, pesoAnterior: 125 }] }
      ];

      // Generamos los días de entrenamiento con fechas asignadas
      const historiales = [
        { fechaEntrenamiento: '2024-10-01', diaRutinaId: 'Día 1: Espalda y Bíceps', ejercicios: dia1Entrenamiento1 },
        { fechaEntrenamiento: '2024-10-02', diaRutinaId: 'Día 2: Pecho y Tríceps', ejercicios: dia2Entrenamiento1 },
        { fechaEntrenamiento: '2024-10-03', diaRutinaId: 'Día 3: Pierna y Hombro', ejercicios: dia3Entrenamiento1 },
        { fechaEntrenamiento: '2024-10-04', diaRutinaId: 'Día 1: Espalda y Bíceps', ejercicios: dia1Entrenamiento2 },
        { fechaEntrenamiento: '2024-10-05', diaRutinaId: 'Día 3: Pierna y Hombro', ejercicios: dia3Entrenamiento2 }, // Sin series en un ejercicio
        { fechaEntrenamiento: '2024-10-06', diaRutinaId: 'Día 1: Espalda y Bíceps', ejercicios: dia1Entrenamiento3 },
        { fechaEntrenamiento: '2024-10-07', diaRutinaId: 'Día 2: Pecho y Tríceps', ejercicios: dia2Entrenamiento2 },
        { fechaEntrenamiento: '2024-10-08', diaRutinaId: 'Día 3: Pierna y Hombro', ejercicios: dia3Entrenamiento3 },
        { fechaEntrenamiento: '2024-10-09', diaRutinaId: 'Día 1: Espalda y Bíceps', ejercicios: dia1Entrenamiento3 }
      ];

      // Agregamos los historiales a la base de datos
      for (const historial of historiales) {
        const nuevoHistorial: HistorialEntrenamiento = {
          entidad: 'historialEntrenamiento',
          usuarioId: usuarioLogeado._id!,
          entrenamientos: [
            {
              fechaEntrenamiento: historial.fechaEntrenamiento,
              diaRutinaId: historial.diaRutinaId,
              ejercicios: historial.ejercicios
            }
          ]
        };
        await this.historialService.agregarHistorial(nuevoHistorial);
      }

      console.log('Historial de entrenamientos añadido correctamente.');
    } catch (error) {
      console.error('Error al añadir el historial de entrenamientos:', error);
    }
  }
}