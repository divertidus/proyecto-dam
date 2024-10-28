import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { EjercicioService } from './database/ejercicio.service';
import { UsuarioService } from './database/usuario.service';
import { RutinaService } from './database/rutina.service';
import { DatabaseService } from './database/database.service';
import { HistorialService } from './database/historial-entrenamiento.service';
import { Ejercicio } from '../models/ejercicio.model';
import { HistorialEntrenamiento } from '../models/historial-entrenamiento';
import { DiaRutina, Rutina } from '../models/rutina.model';
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
        {
          ejercicioId: ejerciciosPredefinidos['Jalón de Espalda'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 80, },
            { numeroSerie: 2, repeticiones: 10, peso: 82 },
            { numeroSerie: 3, repeticiones: 8, peso: 84 }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Remo Agarre Cerrado (Cuernos)'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 85 },
            { numeroSerie: 2, repeticiones: 10, peso: 87 },
            { numeroSerie: 3, repeticiones: 8, peso: 90 }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Martillo (Mancuernas)'],
          series: [
            { numeroSerie: 1, repeticiones: 8, peso: 20 },
            { numeroSerie: 2, repeticiones: 8, peso: 22 },
            { numeroSerie: 3, repeticiones: 6, peso: 24 }
          ]
        }
      ];

      const dia2Entrenamiento1 = [
        {
          ejercicioId: ejerciciosPredefinidos['Press Banco Tumbado (Mancuernas)'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 60 },
            { numeroSerie: 2, repeticiones: 10, peso: 62 },
            { numeroSerie: 3, repeticiones: 8, peso: 65 }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Máquina Aperturas'],
          series: [
            { numeroSerie: 1, repeticiones: 12, peso: 40 },
            { numeroSerie: 2, repeticiones: 12, peso: 42 },
            { numeroSerie: 3, repeticiones: 10, peso: 45 }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Fondos en Paralelas'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 0 },
            { numeroSerie: 2, repeticiones: 10, peso: 0 }
          ]
        }
      ];

      const dia3Entrenamiento1 = [
        {
          ejercicioId: ejerciciosPredefinidos['Sentadillas Multipower'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 100, alFallo: false, dolor: false, ayuda: false },
            { numeroSerie: 2, repeticiones: 10, peso: 105, alFallo: false, dolor: true, ayuda: false },
            { numeroSerie: 3, repeticiones: 8, peso: 110, alFallo: false, dolor: true, ayuda: false }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Elevaciones Laterales'],
          series: [
            { numeroSerie: 1, repeticiones: 12, peso: 10, alFallo: false, dolor: true, ayuda: false },
            { numeroSerie: 2, repeticiones: 12, peso: 12, alFallo: true, dolor: true, ayuda: false },
            { numeroSerie: 3, repeticiones: 10, peso: 14, alFallo: true, dolor: true, ayuda: false }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Prensa de Piernas'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 120, alFallo: false, dolor: true, ayuda: true },
            { numeroSerie: 2, repeticiones: 10, peso: 125, alFallo: false, dolor: true, ayuda: false },
            { numeroSerie: 3, repeticiones: 8, peso: 130, alFallo: true, dolor: true, ayuda: true }
          ]
        }
      ];

      // Segunda ronda (usamos el peso anterior donde corresponde)
      const dia1Entrenamiento2 = [
        {
          ejercicioId: ejerciciosPredefinidos['Jalón de Espalda'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 82, pesoAnterior: 80, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 2, repeticiones: 10, peso: 84, pesoAnterior: 82, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 3, repeticiones: 8, peso: 86, pesoAnterior: 84, alfallo: false, dolor: true, ayuda: false }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Remo Agarre Cerrado (Cuernos)'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 87, pesoAnterior: 85, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 2, repeticiones: 10, peso: 89, pesoAnterior: 87, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 3, repeticiones: 8, peso: 91, pesoAnterior: 89, alfallo: true, dolor: true, ayuda: false }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Martillo (Mancuernas)'],
          series: [
            { numeroSerie: 1, repeticiones: 8, peso: 22, pesoAnterior: 20, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 2, repeticiones: 8, peso: 24, pesoAnterior: 22, alfallo: false, dolor: true, ayuda: true },
            { numeroSerie: 3, repeticiones: 6, peso: 26, pesoAnterior: 24, alfallo: false, dolor: true, ayuda: false }
          ]
        }
      ];

      const dia3Entrenamiento2 = [
        {
          ejercicioId: ejerciciosPredefinidos['Sentadillas Multipower'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 105, pesoAnterior: 100, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 2, repeticiones: 10, peso: 110, pesoAnterior: 105, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 3, repeticiones: 8, peso: 115, pesoAnterior: 110, alfallo: false, dolor: true, ayuda: false }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Elevaciones Laterales'],
          series: [

          ]
        }, // No se registran seriees para este ejercicio
        {
          ejercicioId: ejerciciosPredefinidos['Prensa de Piernas'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 125, pesoAnterior: 120, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 2, repeticiones: 10, peso: 130, pesoAnterior: 125, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 3, repeticiones: 8, peso: 135, pesoAnterior: 130, alfallo: false, dolor: true, ayuda: false }
          ]
        }
      ];

      const dia1Entrenamiento3 = [
        {
          ejercicioId: ejerciciosPredefinidos['Jalón de Espalda'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 84, pesoAnterior: 82, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 2, repeticiones: 10, peso: 86, pesoAnterior: 84, alfallo: false, dolor: false, ayuda: false },
            { numeroSerie: 3, repeticiones: 8, peso: 88, pesoAnterior: 86, alfallo: false, dolor: true, ayuda: false }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Remo Agarre Cerrado (Cuernos)'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 90, pesoAnterior: 87, alfallo: true, dolor: false, ayuda: false },
            { numeroSerie: 2, repeticiones: 10, peso: 92, pesoAnterior: 90, alfallo: false, dolor: false, ayuda: false },
            { numeroSerie: 3, repeticiones: 8, peso: 94, pesoAnterior: 92, alfallo: false, dolor: true, ayuda: false }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Martillo (Mancuernas)'],
          series: [
            { numeroSerie: 1, repeticiones: 8, peso: 24, pesoAnterior: 22, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 2, repeticiones: 8, peso: 26, pesoAnterior: 24, alfallo: true, dolor: true, ayuda: true },
            { numeroSerie: 3, repeticiones: 6, peso: 28, pesoAnterior: 26, alfallo: false, dolor: false, ayuda: false }]
        }
      ];

      const dia2Entrenamiento2 = [
        {
          ejercicioId: ejerciciosPredefinidos['Press Banco Tumbado (Mancuernas)'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 65, pesoAnterior: 60, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 2, repeticiones: 10, peso: 67, pesoAnterior: 65, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 3, repeticiones: 8, peso: 70, pesoAnterior: 67, alfallo: true, dolor: false, ayuda: false }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Máquina Aperturas'],
          series: [
            { numeroSerie: 1, repeticiones: 12, peso: 45, pesoAnterior: 40, alfallo: false, dolor: false, ayuda: true },
            { numeroSerie: 2, repeticiones: 12, peso: 47, pesoAnterior: 45, alfallo: false, dolor: false, ayuda: false },
            { numeroSerie: 3, repeticiones: 10, peso: 50, pesoAnterior: 47, alfallo: true, dolor: false, ayuda: false }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Fondos en Paralelas'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 0, pesoAnterior: 0 },
            { numeroSerie: 2, repeticiones: 10, peso: 0, pesoAnterior: 0 }
          ]
        }
      ];

      const dia3Entrenamiento3 = [
        {
          ejercicioId: ejerciciosPredefinidos['Sentadillas Multipower'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 110, pesoAnterior: 105, alfallo: true, dolor: true, ayuda: false },
            { numeroSerie: 2, repeticiones: 10, peso: 115, pesoAnterior: 110, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 3, repeticiones: 8, peso: 120, pesoAnterior: 115, alfallo: false, dolor: true, ayuda: false }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Elevaciones Laterales'],
          series: [
            { numeroSerie: 1, repeticiones: 12, peso: 12, pesoAnterior: 10, alfallo: false, dolor: true, ayuda: true },
            { numeroSerie: 2, repeticiones: 12, peso: 14, pesoAnterior: 12, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 3, repeticiones: 10, peso: 16, pesoAnterior: 14, alfallo: false, dolor: true, ayuda: false }
          ]
        },
        {
          ejercicioId: ejerciciosPredefinidos['Prensa de Piernas'],
          series: [
            { numeroSerie: 1, repeticiones: 10, peso: 130, pesoAnterior: 125, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 2, repeticiones: 10, peso: 135, pesoAnterior: 130, alfallo: false, dolor: true, ayuda: false },
            { numeroSerie: 3, repeticiones: 8, peso: 140, pesoAnterior: 135, alfallo: false, dolor: true, ayuda: false }
          ]
        }
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