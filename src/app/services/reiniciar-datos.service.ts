import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { EjercicioService } from './database/ejercicio.service';
import { UsuarioService } from './database/usuario.service';
import { RutinaService } from './database/rutina.service';
import { DatabaseService } from './database/database.service';
import { HistorialService } from './database/historial-entrenamiento.service';
import { Ejercicio } from '../models/ejercicio.model';
import { DiaEntrenamiento, HistorialEntrenamiento } from '../models/historial-entrenamiento';
import { DiaRutina, Rutina } from '../models/rutina.model';
import { Usuario } from '../models/usuario.model';
import { v4 as uuidv4 } from 'uuid';


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
          entidad: 'usuario',
          nombre: 'AutoUsuario',
          email: 'auto@pruebas.com',
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
      { entidad: 'ejercicio', nombre: 'Jalón de Espalda', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { entidad: 'ejercicio', nombre: 'Remo Agarre Cerrado (Cuernos)', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { entidad: 'ejercicio', nombre: 'Jalón Cerrado', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { entidad: 'ejercicio', nombre: 'Martillo (Mancuernas)', tipoPeso: 'mancuernas', musculoPrincipal: 'Bíceps' },
      { entidad: 'ejercicio', nombre: 'Press Banco Tumbado (Mancuernas)', tipoPeso: 'mancuernas', musculoPrincipal: 'Pecho' },
      { entidad: 'ejercicio', nombre: 'Máquina Aperturas', tipoPeso: 'máquina', musculoPrincipal: 'Pecho' },
      { entidad: 'ejercicio', nombre: 'Fondos en Paralelas', tipoPeso: 'peso corporal', musculoPrincipal: 'Tríceps' },
      { entidad: 'ejercicio', nombre: 'Sentadillas Multipower', tipoPeso: 'barra', musculoPrincipal: 'Piernas' },
      { entidad: 'ejercicio', nombre: 'Elevaciones Laterales', tipoPeso: 'mancuernas', musculoPrincipal: 'Hombro' },
      { entidad: 'ejercicio', nombre: 'Prensa de Piernas', tipoPeso: 'máquina', musculoPrincipal: 'Piernas' },
    ];

    const ejerciciosMap: { [key: string]: string } = {};

    try {
      const ejerciciosExistentes = await this.ejercicioService.obtenerEjercicios();
      if (ejerciciosExistentes.length === 0) {
        for (const ejercicio of ejercicios) {
          const response = await this.ejercicioService.agregarEjercicio(ejercicio);
          ejerciciosMap[ejercicio.nombre] = response.id;
         // console.log(`Ejercicio ${ejercicio.nombre} añadido correctamente con ID: ${response.id}`);
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
          diaNombre: 'Día 1',
          descripcion: 'Espalda y bíceps',
          ejercicios: [
            { ejercicioId: ejerciciosMap['Jalón de Espalda'], nombreEjercicio: 'Jalón de Espalda', series: 4, repeticiones: 10 },
            { ejercicioId: ejerciciosMap['Remo Agarre Cerrado (Cuernos)'], nombreEjercicio: 'Remo Agarre Cerrado (Cuernos)', series: 4, repeticiones: 10 },
            { ejercicioId: ejerciciosMap['Martillo (Mancuernas)'], nombreEjercicio: 'Martillo (Mancuernas)', series: 4, repeticiones: 10 },
          ]
        },
        {
          diaNombre: 'Día 2',
          descripcion: 'Pecho y tríceps',
          ejercicios: [
            { ejercicioId: ejerciciosMap['Press Banco Tumbado (Mancuernas)'], nombreEjercicio: 'Press Banco Tumbado (Mancuernas)', series: 4, repeticiones: 10 },
            { ejercicioId: ejerciciosMap['Máquina Aperturas'], nombreEjercicio: 'Máquina Aperturas', series: 4, repeticiones: 10 },
            { ejercicioId: ejerciciosMap['Fondos en Paralelas'], nombreEjercicio: 'Fondos en Paralelas', series: 4, repeticiones: 10 },
          ]
        },
        {
          diaNombre: 'Día 3',
          descripcion: 'Pierna y hombro',
          ejercicios: [
            { ejercicioId: ejerciciosMap['Sentadillas Multipower'], nombreEjercicio: 'Sentadillas Multipower', series: 4, repeticiones: 10 },
            { ejercicioId: ejerciciosMap['Elevaciones Laterales'], nombreEjercicio: 'Elevaciones Laterales', series: 4, repeticiones: 12 },
            { ejercicioId: ejerciciosMap['Prensa de Piernas'], nombreEjercicio: 'Prensa de Piernas', series: 4, repeticiones: 10 },
          ]
        }
      ];

      const rutinasExistentes = await this.rutinaService.obtenerRutinasPorUsuario(usuarioLogeado._id!);
      if (rutinasExistentes.length === 0) {
        const nuevaRutina: Rutina = {
          entidad: 'rutina',
          nombre: 'Rutina 1',
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
          ejercicioPlanId: ejerciciosPredefinidos['Jalón de Espalda'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Jalón de Espalda',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, peso: 60, },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, peso: 65 },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, peso: 70 },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, peso: 70 }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Remo Agarre Cerrado (Cuernos)'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Remo Agarre Cerrado (Cuernos)',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, peso: 50 },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, peso: 50 },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, peso: 55 },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, peso: 55 }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Martillo (Mancuernas)'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Martillo (Mancuernas)',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 8, peso: 20 },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 8, peso: 20 },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 6, peso: 25 },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 6, peso: 25 }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        }
      ];

      const dia2Entrenamiento1 = [
        {
          ejercicioPlanId: ejerciciosPredefinidos['Press Banco Tumbado (Mancuernas)'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Press Banco Tumbado (Mancuernas)',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, peso: 60 },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, peso: 60 },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, peso: 65 },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, peso: 65 }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Máquina Aperturas'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Máquina Aperturas',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 12, peso: 40 },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 12, peso: 40 },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 10, peso: 45 },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 10, peso: 45 }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Fondos en Paralelas'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Fondos en Paralelas',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, peso: 50 },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, peso: 50 },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, peso: 55 },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, peso: 55 }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        }
      ];

      const dia3Entrenamiento1 = [
        {
          ejercicioPlanId: ejerciciosPredefinidos['Sentadillas Multipower'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Sentadillas Multipower',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, peso: 100, alFallo: false, dolor: false, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, peso: 105, alFallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, peso: 110, alFallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, peso: 110, alFallo: false, dolor: true, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Elevaciones Laterales'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Elevaciones Laterales',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 12, peso: 10, alFallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 12, peso: 12, alFallo: true, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 10, peso: 14, alFallo: true, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 10, peso: 14, alFallo: true, dolor: true, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Prensa de Piernas'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Prensa de Piernas',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, peso: 120, alFallo: false, dolor: true, ayuda: true },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, peso: 125, alFallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, peso: 130, alFallo: true, dolor: true, ayuda: true },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, peso: 130, alFallo: true, dolor: true, ayuda: true }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        }
      ];

      // Segunda ronda (usamos el peso anterior donde corresponde)
      const dia1Entrenamiento2 = [
        {
          ejercicioPlanId: ejerciciosPredefinidos['Jalón de Espalda'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Jalón de Espalda',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, repeticionesAnterior: 10, peso: 82, pesoAnterior: 80, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, repeticionesAnterior: 10, peso: 84, pesoAnterior: 82, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, repeticionesAnterior: 10, peso: 86, pesoAnterior: 84, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, repeticionesAnterior: 10, peso: 86, pesoAnterior: 84, alfallo: false, dolor: true, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Remo Agarre Cerrado (Cuernos)'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Remo Agarre Cerrado (Cuernos)',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, repeticionesAnterior: 10, peso: 87, pesoAnterior: 85, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, repeticionesAnterior: 10, peso: 89, pesoAnterior: 87, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, repeticionesAnterior: 10, peso: 91, pesoAnterior: 89, alfallo: true, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, repeticionesAnterior: 10, peso: 91, pesoAnterior: 89, alfallo: true, dolor: true, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Martillo (Mancuernas)'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Martillo (Mancuernas)',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 8, repeticionesAnterior: 10, peso: 22, pesoAnterior: 20, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 8, repeticionesAnterior: 10, peso: 24, pesoAnterior: 22, alfallo: false, dolor: true, ayuda: true },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 6, repeticionesAnterior: 10, peso: 26, pesoAnterior: 24, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 6, repeticionesAnterior: 10, peso: 26, pesoAnterior: 24, alfallo: false, dolor: true, ayuda: false },
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        }
      ];

      const dia3Entrenamiento2 = [
        {
          ejercicioPlanId: ejerciciosPredefinidos['Sentadillas Multipower'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Sentadillas Multipower',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, repeticionesAnterior: 10, peso: 105, pesoAnterior: 100, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, repeticionesAnterior: 10, peso: 110, pesoAnterior: 105, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, repeticionesAnterior: 10, peso: 115, pesoAnterior: 110, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, repeticionesAnterior: 10, peso: 115, pesoAnterior: 110, alfallo: false, dolor: true, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Elevaciones Laterales'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Elevaciones Laterales',
          series: [

          ],
          seriesCompletadas: 0,
          seriesTotal: 4
        }, // No se registran seriees para este ejercicio
        {
          ejercicioPlanId: ejerciciosPredefinidos['Prensa de Piernas'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Prensa de Piernas',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, repeticionesAnterior: 10, peso: 125, pesoAnterior: 120, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, repeticionesAnterior: 10, peso: 130, pesoAnterior: 125, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, repeticionesAnterior: 10, peso: 135, pesoAnterior: 130, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, repeticionesAnterior: 10, peso: 135, pesoAnterior: 130, alfallo: false, dolor: true, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        }
      ];

      const dia1Entrenamiento3 = [
        {
          ejercicioPlanId: ejerciciosPredefinidos['Jalón de Espalda'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Jalón de Espalda',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, repeticionesAnterior: 10, peso: 84, pesoAnterior: 82, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, repeticionesAnterior: 10, peso: 86, pesoAnterior: 84, alfallo: false, dolor: false, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, repeticionesAnterior: 10, peso: 88, pesoAnterior: 86, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, repeticionesAnterior: 10, peso: 88, pesoAnterior: 86, alfallo: false, dolor: true, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Remo Agarre Cerrado (Cuernos)'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Remo Agarre Cerrado (Cuernos)',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, repeticionesAnterior: 10, peso: 90, pesoAnterior: 87, alfallo: true, dolor: false, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, repeticionesAnterior: 10, peso: 92, pesoAnterior: 90, alfallo: false, dolor: false, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, repeticionesAnterior: 10, peso: 94, pesoAnterior: 92, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, repeticionesAnterior: 10, peso: 94, pesoAnterior: 92, alfallo: false, dolor: true, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Martillo (Mancuernas)'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Martillo (Mancuernas)',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 8, repeticionesAnterior: 10, peso: 24, pesoAnterior: 22, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 8, repeticionesAnterior: 10, peso: 26, pesoAnterior: 24, alfallo: true, dolor: true, ayuda: true },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 6, repeticionesAnterior: 10, peso: 28, pesoAnterior: 26, alfallo: false, dolor: false, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 6, repeticionesAnterior: 10, peso: 28, pesoAnterior: 26, alfallo: false, dolor: false, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        }
      ];

      const dia2Entrenamiento2 = [
        {
          ejercicioPlanId: ejerciciosPredefinidos['Press Banco Tumbado (Mancuernas)'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Press Banco Tumbado (Mancuernas)',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, repeticionesAnterior: 10, peso: 65, pesoAnterior: 60, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, repeticionesAnterior: 10, peso: 67, pesoAnterior: 65, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, repeticionesAnterior: 10, peso: 70, pesoAnterior: 67, alfallo: true, dolor: false, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, repeticionesAnterior: 10, peso: 70, pesoAnterior: 67, alfallo: true, dolor: false, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Máquina Aperturas'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Máquina Aperturas',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 12, repeticionesAnterior: 10, peso: 45, pesoAnterior: 40, alfallo: false, dolor: false, ayuda: true },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 12, repeticionesAnterior: 10, peso: 47, pesoAnterior: 45, alfallo: false, dolor: false, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 10, repeticionesAnterior: 10, peso: 50, pesoAnterior: 47, alfallo: true, dolor: false, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 10, repeticionesAnterior: 10, peso: 50, pesoAnterior: 47, alfallo: true, dolor: false, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Fondos en Paralelas'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Fondos en Paralelas',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, repeticionesAnterior: 10, peso: 50, pesoAnterior: 50 },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, repeticionesAnterior: 10, peso: 55, pesoAnterior: 50 },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 10, repeticionesAnterior: 10, peso: 55, pesoAnterior: 55 },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 10, repeticionesAnterior: 10, peso: 55, pesoAnterior: 55 }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        }
      ];

      const dia3Entrenamiento3 = [
        {
          ejercicioPlanId: ejerciciosPredefinidos['Sentadillas Multipower'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Sentadillas Multipower',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, repeticionesAnterior: 10, peso: 110, pesoAnterior: 105, alfallo: true, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, repeticionesAnterior: 10, peso: 115, pesoAnterior: 110, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, repeticionesAnterior: 10, peso: 120, pesoAnterior: 115, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, repeticionesAnterior: 10, peso: 120, pesoAnterior: 115, alfallo: false, dolor: true, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Elevaciones Laterales'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Elevaciones Laterales',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 12, repeticionesAnterior: 10, peso: 12, pesoAnterior: 10, alfallo: false, dolor: true, ayuda: true },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 12, repeticionesAnterior: 10, peso: 14, pesoAnterior: 12, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 10, repeticionesAnterior: 10, peso: 16, pesoAnterior: 14, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 10, repeticionesAnterior: 10, peso: 16, pesoAnterior: 14, alfallo: false, dolor: true, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: ejerciciosPredefinidos['Prensa de Piernas'],
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Prensa de Piernas',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, repeticionesAnterior: 10, peso: 130, pesoAnterior: 125, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, repeticionesAnterior: 10, peso: 135, pesoAnterior: 130, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, repeticionesAnterior: 10, peso: 140, pesoAnterior: 135, alfallo: false, dolor: true, ayuda: false },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, repeticionesAnterior: 10, peso: 140, pesoAnterior: 135, alfallo: false, dolor: true, ayuda: false }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        }
      ];

      // Generamos los días de entrenamiento con fechas asignadas
      const diasEntrenamientos = [
        { fechaEntrenamiento: '2024-10-01', diaRutinaId: 'Día 1', nombreRutinaEntrenamiento: 'Rutina 1', descripcion: 'Espalda y bíceps', ejercicioRealizado: dia1Entrenamiento1 },
        { fechaEntrenamiento: '2024-10-02', diaRutinaId: 'Día 2', nombreRutinaEntrenamiento: 'Rutina 1', descripcion: 'Pecho y tríceps', ejercicioRealizado: dia2Entrenamiento1 },
        { fechaEntrenamiento: '2024-10-03', diaRutinaId: 'Día 3', nombreRutinaEntrenamiento: 'Rutina 1', descripcion: 'Hombro y pierna', ejercicioRealizado: dia3Entrenamiento1 },
        { fechaEntrenamiento: '2024-10-04', diaRutinaId: 'Día 1', nombreRutinaEntrenamiento: 'Rutina 1', descripcion: 'Espalda y Bíceps', ejercicioRealizado: dia1Entrenamiento2 },
        { fechaEntrenamiento: '2024-10-05', diaRutinaId: 'Día 3', nombreRutinaEntrenamiento: 'Rutina 1', descripcion: 'Hombro y pierna', ejercicioRealizado: dia3Entrenamiento2 }, // Sin series en un ejercicio
        { fechaEntrenamiento: '2024-10-06', diaRutinaId: 'Día 1', nombreRutinaEntrenamiento: 'Rutina 1', descripcion: 'Espalda y Bíceps', ejercicioRealizado: dia1Entrenamiento3 },
        { fechaEntrenamiento: '2024-10-07', diaRutinaId: 'Día 2', nombreRutinaEntrenamiento: 'Rutina 1', descripcion: 'Pecho y tríceps', ejercicioRealizado: dia2Entrenamiento2 },
        { fechaEntrenamiento: '2024-10-08', diaRutinaId: 'Día 3', nombreRutinaEntrenamiento: 'Rutina 1', descripcion: 'Hombro y pierna', ejercicioRealizado: dia3Entrenamiento3 },
        { fechaEntrenamiento: '2024-10-09', diaRutinaId: 'Día 1', nombreRutinaEntrenamiento: 'Rutina 1', descripcion: 'Espalda y Bíceps', ejercicioRealizado: dia1Entrenamiento3 }
      ];

      // Obtener todos los historiales del usuario logeado
      const historialesExistentes = await this.historialService.obtenerHistorialesPorUsuario(usuarioLogeado._id!);

      let historial: HistorialEntrenamiento;

      if (historialesExistentes.length > 0) {
        historial = historialesExistentes[0];
      } else {
        historial = {
          entidad: 'historialEntrenamiento',
          usuarioId: usuarioLogeado._id!,
          entrenamientos: []
        };
      }

      // Agregar o actualizar los días de entrenamiento en el historial
      for (const diaEntrenamiento of diasEntrenamientos) {
        const diaExistente = historial.entrenamientos.find(dia =>
          dia.fechaEntrenamiento === diaEntrenamiento.fechaEntrenamiento &&
          dia.diaRutinaId === diaEntrenamiento.diaRutinaId
        );

        if (!diaExistente) {
          const nuevoDiaEntrenamiento: DiaEntrenamiento = {
            _id: uuidv4(),
            fechaEntrenamiento: diaEntrenamiento.fechaEntrenamiento,
            diaRutinaId: diaEntrenamiento.diaRutinaId,
            nombreRutinaEntrenamiento: diaEntrenamiento.nombreRutinaEntrenamiento,
            descripcion: diaEntrenamiento.descripcion,
            ejerciciosRealizados: diaEntrenamiento.ejercicioRealizado
          };

          historial.entrenamientos.push(nuevoDiaEntrenamiento);
        }
      }

      // Actualizar el historial existente
      await this.historialService.agregarHistorial(historial);
      console.log('Historial de entrenamientos actualizado correctamente.');
    } catch (error) {
      console.error('Error al actualizar el historial de entrenamientos:', error);
      throw error;
    }
  }
}