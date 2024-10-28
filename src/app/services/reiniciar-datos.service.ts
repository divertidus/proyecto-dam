import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { EjercicioService } from './database/ejercicio.service';
import { UsuarioService } from './database/usuario.service';
import { RutinaService } from './database/rutina.service';
import { DatabaseService } from './database/database.service';
import { HistorialService } from './database/historial-entrenamiento.service';
import { Ejercicio } from '../models/ejercicio.model';
import { EjercicioSesion, HistorialEntrenamiento, SesionEntrenamiento } from '../models/historial-entrenamiento';
import { SesionPlanificada, Rutina } from '../models/rutina.model';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class ReiniciarDatosService {

  constructor(
    private ejercicioService: EjercicioService,
    private usuarioService: UsuarioService,
    private rutinaService: RutinaService,
    private historialService: HistorialService,
    private databaseService: DatabaseService,
    private authService: AuthService
  ) { }

  // Método principal que verifica e inicializa los datos en la base de datos
  async verificarYInicializarDatos(): Promise<void> {
    const baseDatosVacia = await this.comprobarBaseDatosVacia();

    if (baseDatosVacia) {
      console.log('No se encontraron datos en la base de datos. Cargando datos iniciales.');
      await this.inicializarUsuario();    // Inicializa el usuario
      await this.inicializarEjercicios(); // Inicializa los ejercicios
      await this.inicializarRutina();     // Inicializa las rutinas
      await this.inicializarHistorial();  // Inicializa el historial
    } else {
      console.log('Datos ya existentes en la base de datos. No se cargarán los datos iniciales.');
    }

    this.authService.autoLoginPrimerUsuario(); // Inicia sesión automáticamente con el primer usuario
  }

  // Método para comprobar si la base de datos está completamente vacía
  private async comprobarBaseDatosVacia(): Promise<boolean> {
    try {
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

  // Método para reiniciar directamente la base de datos e inicializar los datos nuevos
  async reiniciarYInicializarDatos(): Promise<void> {
    try {
      // Borrar todos los documentos de la base de datos
      await this.databaseService.eliminarTodosLosDocumentos();

      // Inicializar los datos sin verificar si existen
      await this.inicializarUsuario();
      await this.inicializarEjercicios();
      await this.inicializarRutina();
      await this.inicializarHistorial();

      // Iniciar sesión automáticamente con el primer usuario
      this.authService.autoLoginPrimerUsuario();

    } catch (error) {
      console.error('Error al reiniciar e inicializar la base de datos:', error);
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
  //        console.log(`Ejercicio ${ejercicio.nombre} añadido correctamente con ID: ${response.id}`);
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
      const usuarios: Usuario[] = await this.usuarioService.obtenerUsuarios();
      if (usuarios.length === 0) {
        return;
      }
      const usuarioLogeado: Usuario = usuarios[0];

      const ejerciciosMap = await this.inicializarEjercicios();

      const sesionesPlanificadas: SesionPlanificada[] = [
        {
          nombreSesion: 'Día 1: Espalda y Bíceps',
          descripcion: 'Entrenamiento de espalda y bíceps',
          ejerciciosPlanificados: [
            { idEjercicioOriginal: ejerciciosMap['Jalón de Espalda'], seriesPlanificadas: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { idEjercicioOriginal: ejerciciosMap['Remo Agarre Cerrado (Cuernos)'], seriesPlanificadas: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { idEjercicioOriginal: ejerciciosMap['Martillo (Mancuernas)'], seriesPlanificadas: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) }
          ]
        },
        {
          nombreSesion: 'Día 2: Pecho y Tríceps',
          descripcion: 'Entrenamiento de pecho y tríceps',
          ejerciciosPlanificados: [
            { idEjercicioOriginal: ejerciciosMap['Press Banco Tumbado (Mancuernas)'], seriesPlanificadas: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { idEjercicioOriginal: ejerciciosMap['Máquina Aperturas'], seriesPlanificadas: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { idEjercicioOriginal: ejerciciosMap['Fondos en Paralelas'], seriesPlanificadas: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) }
          ]
        },
        {
          nombreSesion: 'Día 3: Pierna y Hombro',
          descripcion: 'Entrenamiento de pierna y hombro',
          ejerciciosPlanificados: [
            { idEjercicioOriginal: ejerciciosMap['Sentadillas Multipower'], seriesPlanificadas: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { idEjercicioOriginal: ejerciciosMap['Elevaciones Laterales'], seriesPlanificadas: Array(4).fill({ numeroSerie: 1, repeticiones: 12 }) },
            { idEjercicioOriginal: ejerciciosMap['Prensa de Piernas'], seriesPlanificadas: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) }
          ]
        }
      ];

      const rutinasExistentes: Rutina[] = await this.rutinaService.obtenerRutinasPorUsuario(usuarioLogeado._id!);
      if (rutinasExistentes.length === 0) {
        const nuevaRutina: Rutina = {
          nombre: 'Rutina 1',
          entidad: 'rutina',
          usuarioId: usuarioLogeado._id!,
          sesionesPlanificadas: sesionesPlanificadas,
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

  // Inicializar historial de entrenamiento con sesiones en días diferentes
  async inicializarHistorial() {
    try {
      const usuarios: Usuario[] = await this.usuarioService.obtenerUsuarios();
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

      // Definición de sesiones de entrenamiento por día
      const ejerciciosSesionDia1_01Oct: EjercicioSesion[] = [
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Jalón de Espalda'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 10, peso: 80 },
            { numeroSerie: 2, repeticiones: 10, peso: 82 },
            { numeroSerie: 3, repeticiones: 8, peso: 84, notas: 'Buen control en la fase excéntrica' }
          ]
        },
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Remo Agarre Cerrado (Cuernos)'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 10, peso: 85 },
            { numeroSerie: 2, repeticiones: 10, peso: 87 },
            { numeroSerie: 3, repeticiones: 8, peso: 90 }
          ]
        },
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Martillo (Mancuernas)'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 8, peso: 20 },
            { numeroSerie: 2, repeticiones: 8, peso: 22 },
            { numeroSerie: 3, repeticiones: 6, peso: 24 }
          ]
        }
      ];

      const ejerciciosSesionDia2_02Oct: EjercicioSesion[] = [
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Press Banco Tumbado (Mancuernas)'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 10, peso: 60 },
            { numeroSerie: 2, repeticiones: 10, peso: 62 },
            { numeroSerie: 3, repeticiones: 8, peso: 65, alFallo: true }
          ]
        },
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Máquina Aperturas'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 12, peso: 40 },
            { numeroSerie: 2, repeticiones: 12, peso: 42 },
            { numeroSerie: 3, repeticiones: 10, peso: 45, conAyuda: true }
          ]
        },
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Fondos en Paralelas'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 10, peso: 0, dolor: true, notas: 'Dolor leve en hombro derecho' },
            { numeroSerie: 2, repeticiones: 10, peso: 0 }
          ]
        }
      ];

      const ejerciciosSesionDia3_03Oct: EjercicioSesion[] = [
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Sentadillas Multipower'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 10, peso: 100 },
            { numeroSerie: 2, repeticiones: 10, peso: 105, dolor: true },
            { numeroSerie: 3, repeticiones: 8, peso: 110, conAyuda: true }
          ]
        },
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Elevaciones Laterales'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 12, peso: 10 },
            { numeroSerie: 2, repeticiones: 12, peso: 12, alFallo: true },
            { numeroSerie: 3, repeticiones: 10, peso: 14, notas: 'Sentí mejor control' }
          ]
        },
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Prensa de Piernas'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 10, peso: 120 },
            { numeroSerie: 2, repeticiones: 10, peso: 125, conAyuda: true },
            { numeroSerie: 3, repeticiones: 8, peso: 130 }
          ]
        }
      ];

      const ejerciciosSesionDia1_04Oct: EjercicioSesion[] = [
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Jalón de Espalda'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 10, peso: 82, pesoAnterior: 80 },
            { numeroSerie: 2, repeticiones: 10, peso: 84, pesoAnterior: 82 },
            { numeroSerie: 3, repeticiones: 8, peso: 86, pesoAnterior: 84 }
          ]
        },
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Remo Agarre Cerrado (Cuernos)'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 10, peso: 87, pesoAnterior: 85 },
            { numeroSerie: 2, repeticiones: 10, peso: 89, pesoAnterior: 87 },
            { numeroSerie: 3, repeticiones: 8, peso: 91, pesoAnterior: 89, alFallo: true }
          ]
        },
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Martillo (Mancuernas)'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 8, peso: 22, pesoAnterior: 20 },
            { numeroSerie: 2, repeticiones: 8, peso: 24, pesoAnterior: 22 },
            { numeroSerie: 3, repeticiones: 6, peso: 26, pesoAnterior: 24 }
          ]
        }
      ];

      const ejerciciosSesionDia2_05Oct: EjercicioSesion[] = [
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Press Banco Tumbado (Mancuernas)'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 10, peso: 65, pesoAnterior: 60 },
            { numeroSerie: 2, repeticiones: 10, peso: 67, pesoAnterior: 65 },
            { numeroSerie: 3, repeticiones: 8, peso: 70, pesoAnterior: 67 }
          ]
        },
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Máquina Aperturas'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 12, peso: 45, pesoAnterior: 40 },
            { numeroSerie: 2, repeticiones: 12, peso: 47, pesoAnterior: 45 },
            { numeroSerie: 3, repeticiones: 10, peso: 50, pesoAnterior: 47, conAyuda: true }
          ]
        },
        {
          idEjercicioPlanificado: ejerciciosPredefinidos['Fondos en Paralelas'],
          seriesSesion: [
            { numeroSerie: 1, repeticiones: 10, peso: 0, pesoAnterior: 0 },
            { numeroSerie: 2, repeticiones: 10, peso: 0, pesoAnterior: 0, notas: 'Mejor control' }
          ]
        }
      ];

      // Agregamos los historiales a la base de datos
      const sesionesDeEntrenamiento: SesionEntrenamiento[] = [
        { fechaSesion: '2024-10-01', sesionPlanificadaId: 'Día 1: Espalda y Bíceps', ejerciciosSesion: ejerciciosSesionDia1_01Oct, notas: 'Inicio de rutina, buena sesión' },
        { fechaSesion: '2024-10-02', sesionPlanificadaId: 'Día 2: Pecho y Tríceps', ejerciciosSesion: ejerciciosSesionDia2_02Oct },
        { fechaSesion: '2024-10-03', sesionPlanificadaId: 'Día 3: Pierna y Hombro', ejerciciosSesion: ejerciciosSesionDia3_03Oct, notas: 'Sentí molestias en el hombro' },
        { fechaSesion: '2024-10-04', sesionPlanificadaId: 'Día 1: Espalda y Bíceps', ejerciciosSesion: ejerciciosSesionDia1_04Oct },
        { fechaSesion: '2024-10-05', sesionPlanificadaId: 'Día 2: Pecho y Tríceps', ejerciciosSesion: ejerciciosSesionDia2_05Oct },
        { fechaSesion: '2024-10-06', sesionPlanificadaId: 'Día 1: Espalda y Bíceps', ejerciciosSesion: ejerciciosSesionDia1_01Oct },
        { fechaSesion: '2024-10-07', sesionPlanificadaId: 'Día 2: Pecho y Tríceps', ejerciciosSesion: ejerciciosSesionDia2_02Oct, notas: 'Aumenté el peso en algunos ejercicios' },
        { fechaSesion: '2024-10-08', sesionPlanificadaId: 'Día 3: Pierna y Hombro', ejerciciosSesion: ejerciciosSesionDia3_03Oct },
        { fechaSesion: '2024-10-09', sesionPlanificadaId: 'Día 1: Espalda y Bíceps', ejerciciosSesion: ejerciciosSesionDia1_04Oct, notas: 'Mayor energía hoy' }
      ];

      for (const sesion of sesionesDeEntrenamiento) {
        const nuevoHistorial: HistorialEntrenamiento = {
          entidad: 'historialEntrenamiento',
          usuarioId: usuarioLogeado._id!,
          sesionesRealizadas: [sesion]
        };
        await this.historialService.agregarHistorial(nuevoHistorial);
      }

      console.log('Historial de entrenamientos añadido correctamente.');
    } catch (error) {
      console.error('Error al añadir el historial de entrenamientos:', error);
    }
  }
}