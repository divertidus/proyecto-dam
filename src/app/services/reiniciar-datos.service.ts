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

  diasRutina: DiaRutina[] = [];
  usuarioPruebas: Usuario
  ejerciciosPorDefecto: Ejercicio[] = [];

  // Verifica si la base de datos está vacía e inicializa los datos en el orden especificado
  async verificarYInicializarDatos(): Promise<void> {
    const baseDatosVacia = await this.comprobarBaseDatosVacia();

    if (baseDatosVacia) {
      console.log('No se encontraron datos en la base de datos. Cargando datos iniciales.');

      // 1. Crear usuario
      await this.inicializarUsuario();

      // 2. Crear ejercicios
      await this.inicializarEjercicios();

      // 3. Crear rutina
      await this.inicializarRutina();

      // 4. Crear historial
      await this.inicializarHistorial();

      console.log("Datos iniciales cargados correctamente.");
    } else {
      console.log('Datos ya existentes en la base de datos. No se cargarán los datos iniciales.');
    }
  }

  // Elimina todos los documentos de la base de datos y reinicia la inicialización
  async reiniciarYInicializarDatos(): Promise<void> {
    try {
      await this.databaseService.eliminarTodosLosDocumentos();
      await this.inicializarUsuario();
      await this.inicializarEjercicios();
      await this.inicializarRutina();
      await this.inicializarHistorial();
      this.authService.autoLoginPrimerUsuario();
    } catch (error) {
      console.error('Error al reiniciar e inicializar la base de datos:', error);
    }
  }

  // Comprueba si la base de datos está vacía
  private async comprobarBaseDatosVacia(): Promise<boolean> {
    try {
      const usuarios = await this.usuarioService.obtenerUsuarios();
      const ejercicios = await this.ejercicioService.obtenerEjercicios();

      return usuarios.length === 0 && ejercicios.length === 0;
    } catch (error) {
      console.error('Error al comprobar la base de datos:', error);
      return false;
    }
  }


  async inicializarUsuario(): Promise<Usuario | null> {
    try {
      const usuariosExistentes = await this.usuarioService.obtenerUsuarios();
      if (usuariosExistentes.length === 0) {
        const nuevoUsuario: Usuario = {
          _id: uuidv4(),
          entidad: 'usuario',
          nombre: 'AutoUsuario',
          email: 'auto@pruebas.com',
          timestamp: new Date().toISOString(),
        };
        await this.usuarioService.agregarUsuario(nuevoUsuario);
        //  console.log('Usuario inicializado correctamente:', nuevoUsuario);
        this.usuarioPruebas = nuevoUsuario; // Asegurarse de asignarlo aquí.
        return nuevoUsuario;
      } else {
        console.log('Usuarios ya existentes:', usuariosExistentes);
        this.usuarioPruebas = usuariosExistentes[0]; // Asegurarse de asignarlo aquí también.
        return usuariosExistentes[0];
      }
    } catch (error) {
      console.error('Error al inicializar el usuario:', error);
      return null;
    }
  }

  // Inicializar ejercicios si no existen
  async inicializarEjercicios(): Promise<void> {
    // Solo inicializa los ejercicios si aún no están cargados
    if (this.ejerciciosPorDefecto.length === 0) {
      const ejerciciosPorDefecto: Ejercicio[] = [
        { entidad: 'ejercicio', _id: uuidv4(), nombre: 'Jalón de Espalda', tipoPeso: 'Máquina', musculoPrincipal: 'Espalda', ejercicioPersonalizado: false, descripcion: 'Ejercicio de tracción vertical para trabajar la espalda alta y dorsales.' },
        { entidad: 'ejercicio', _id: uuidv4(), nombre: 'Remo Cerrado', tipoPeso: 'Máquina', musculoPrincipal: 'Espalda', ejercicioPersonalizado: true, descripcion: 'Ejercicio de tracción horizontal para fortalecer la espalda media y baja.' },
        { entidad: 'ejercicio', _id: uuidv4(), nombre: 'Jalón Cerrado', tipoPeso: 'Máquina', musculoPrincipal: 'Espalda', ejercicioPersonalizado: false, descripcion: 'Ejercicio para trabajar los dorsales y la espalda alta con agarre cerrado.' },
        { entidad: 'ejercicio', _id: uuidv4(), nombre: 'Martillo', tipoPeso: 'Mancuernas', musculoPrincipal: 'Bíceps', ejercicioPersonalizado: false, descripcion: 'Ejercicio de aislamiento para los bíceps y antebrazos, ideal para fortalecer los brazos.' },
        { entidad: 'ejercicio', _id: uuidv4(), nombre: 'Press Banco Tumbado', tipoPeso: 'Mancuernas', musculoPrincipal: 'Pecho', ejercicioPersonalizado: false, descripcion: 'Ejercicio para el desarrollo del pecho, especialmente la parte media y baja del pectoral.' },
        { entidad: 'ejercicio', _id: uuidv4(), nombre: 'Máquina Aperturas', tipoPeso: 'Máquina', musculoPrincipal: 'Pecho', ejercicioPersonalizado: false, descripcion: 'Ejercicio para aislar los pectorales, enfocado en el estiramiento y contracción del músculo.' },
        { entidad: 'ejercicio', _id: uuidv4(), nombre: 'Fondos en Paralelas', tipoPeso: 'Peso Corporal', musculoPrincipal: 'Tríceps', ejercicioPersonalizado: false, descripcion: 'Ejercicio compuesto para trabajar tríceps, pecho y hombros, utilizando el peso corporal.' },
        { entidad: 'ejercicio', _id: uuidv4(), nombre: 'Sentadillas Multipower', tipoPeso: 'Barra', musculoPrincipal: 'Pierna', ejercicioPersonalizado: false, descripcion: 'Ejercicio para el desarrollo de piernas, especialmente cuadríceps y glúteos, en la máquina multipower.' },
        { entidad: 'ejercicio', _id: uuidv4(), nombre: 'Elevaciones Laterales', tipoPeso: 'Mancuernas', musculoPrincipal: 'Hombro', ejercicioPersonalizado: false, descripcion: 'Ejercicio de aislamiento para los hombros, enfocado en el deltoides lateral.' },
        { entidad: 'ejercicio', _id: uuidv4(), nombre: 'Prensa de Piernas', tipoPeso: 'Máquina', musculoPrincipal: 'Pierna', ejercicioPersonalizado: true, descripcion: 'Ejercicio de empuje para trabajar piernas, principalmente cuadríceps y glúteos.' },
      ];

      try {
        const ejerciciosExistentes = await this.ejercicioService.obtenerEjercicios();
        if (ejerciciosExistentes.length === 0) {
          for (const ejercicio of ejerciciosPorDefecto) {
            await this.ejercicioService.agregarEjercicio(ejercicio);
          }
          console.log('Ejercicios inicializados correctamente:', ejerciciosPorDefecto);
          this.ejerciciosPorDefecto = ejerciciosPorDefecto;
        } else {
          console.log('Ejercicios ya existen en la base de datos.');
          this.ejerciciosPorDefecto = ejerciciosExistentes;
        }
      } catch (error) {
        console.error('Error al añadir ejercicios:', error);
      }
    }
  }

  // Inicializar rutina si no existe
  async inicializarRutina() {
    console.log('Entrando en inicializar Rutina')
    if (!this.usuarioPruebas) {  // Cambiar a this.usuarioPruebas
      console.log('mensaje de inicializarRutina porque if (!this.usuarioPruebas) es ', !this.usuarioPruebas)
      return;
    }

    try {

      const diasRutina: DiaRutina[] = [
        {
          _id: uuidv4(),
          diaNombre: 'Día 1',
          descripcion: 'Espalda y bíceps',
          ejercicios: [
            { _id: uuidv4(), ejercicioId: this.ejerciciosPorDefecto.find(e => e.nombre === 'Jalón de Espalda')!._id!, nombreEjercicio: 'Jalón de Espalda', tipoPeso: 'Máquina', series: 4, repeticiones: 10 },
            { _id: uuidv4(), ejercicioId: this.ejerciciosPorDefecto.find(e => e.nombre === 'Remo Cerrado')!._id!, nombreEjercicio: 'Remo Cerrado', tipoPeso: 'Máquina', series: 4, repeticiones: 10 },
            { _id: uuidv4(), ejercicioId: this.ejerciciosPorDefecto.find(e => e.nombre === 'Martillo')!._id!, nombreEjercicio: 'Martillo', tipoPeso: 'Mancuernas', series: 4, repeticiones: 10 },
          ]
        },
        {
          _id: uuidv4(),
          diaNombre: 'Día 2',
          descripcion: 'Pecho y tríceps',
          ejercicios: [
            { _id: uuidv4(), ejercicioId: this.ejerciciosPorDefecto.find(e => e.nombre === 'Press Banco Tumbado')!._id!, nombreEjercicio: 'Press Banco Tumbado', tipoPeso: 'Mancuernas', series: 4, repeticiones: 10 },
            { _id: uuidv4(), ejercicioId: this.ejerciciosPorDefecto.find(e => e.nombre === 'Máquina Aperturas')!._id!, nombreEjercicio: 'Máquina Aperturas', tipoPeso: 'Máquina', series: 4, repeticiones: 10 },
            { _id: uuidv4(), ejercicioId: this.ejerciciosPorDefecto.find(e => e.nombre === 'Fondos en Paralelas')!._id!, nombreEjercicio: 'Fondos en Paralelas', tipoPeso: 'Peso Corporal', series: 4, repeticiones: 10 },
          ]
        },
        {
          _id: uuidv4(),
          diaNombre: 'Día 3',
          descripcion: 'Pierna y hombro',
          ejercicios: [
            { _id: uuidv4(), ejercicioId: this.ejerciciosPorDefecto.find(e => e.nombre === 'Sentadillas Multipower')!._id!, nombreEjercicio: 'Sentadillas Multipower', tipoPeso: 'Barra', series: 4, repeticiones: 10 },
            { _id: uuidv4(), ejercicioId: this.ejerciciosPorDefecto.find(e => e.nombre === 'Elevaciones Laterales')!._id!, nombreEjercicio: 'Elevaciones Laterales', tipoPeso: 'Mancuernas', series: 4, repeticiones: 12 },
            { _id: uuidv4(), ejercicioId: this.ejerciciosPorDefecto.find(e => e.nombre === 'Prensa de Piernas')!._id!, nombreEjercicio: 'Prensa de Piernas', tipoPeso: 'Máquina', series: 4, repeticiones: 10 },
          ]
        }
      ];

      // Validar que todos los `ejercicioId` estén correctamente asignados
      diasRutina.forEach(dia => {
        dia.ejercicios.forEach(e => {
          if (!e.ejercicioId) {
            console.error(`ID no encontrado para el ejercicio: ${e.nombreEjercicio}`);
          }
        });
      });

      const rutinasExistentes = await this.rutinaService.obtenerRutinasPorUsuario(this.usuarioPruebas._id!);

      if (rutinasExistentes.length === 0) {
        const nuevaRutina: Rutina = {
          _id: uuidv4(),
          entidad: 'rutina',
          nombre: 'Rutina 1',
          descripcion: 'Mi primera rutina',
          usuarioId: this.usuarioPruebas._id,
          dias: diasRutina,  // Añade los días con los ejercicios aquí.
          timestamp: new Date().toISOString(),
        };
        await this.rutinaService.agregarRutina(nuevaRutina);

        console.log('Inicializar Rutina -> Rutina añadida con éxito:', nuevaRutina);
      } else {
        console.log('Ya existen rutinas en la base de datos.');
      }

      // Asegura que los días de rutina estén actualizados con los IDs correctos
      const rutinaActualizada = await this.rutinaService.obtenerRutinasPorUsuario(this.usuarioPruebas._id!);
      this.diasRutina = rutinaActualizada[0].dias; // Se asegura de que los días tengan los IDs correctos

    } catch (error) {
      console.error('Error al añadir la rutina:', error);
    }
  }

  // Inicializar historial de entrenamiento con nueve sesiones en días diferentes
  async inicializarHistorial() {
    console.log('InicializarHistorial -> Entrando en inicializarHistorial');
    if (!this.usuarioPruebas || !this.usuarioPruebas._id) {
      console.error('InicializarHistorial -> Error: usuarioPruebas no está definido o no tiene _id.');
      return;
    }

    try {
      const usuarios = await this.usuarioService.obtenerUsuarios();
      if (usuarios.length === 0) return;

      const rutinas = await this.rutinaService.obtenerRutinasPorUsuario(this.usuarioPruebas._id!);
      if (rutinas.length === 0) return;

      this.diasRutina = rutinas[0].dias;

      // Obtenemos los ejercicios y mapeamos los nombres a sus IDs
      // Mapeo de ejercicios a IDs
      const ejerciciosExistentes = await this.ejercicioService.obtenerEjercicios();
      const ejerciciosPredefinidos = ejerciciosExistentes.reduce((map, ejercicio) => {
        if (ejercicio._id) {
          map[ejercicio.nombre] = ejercicio._id;
        }
        return map;
      }, {} as { [nombre: string]: string });

      if (Object.keys(ejerciciosPredefinidos).length === 0) {
        console.error('InicializarHistorial -> No se encontraron ejercicios predefinidos.');
        return;
      }
      console.log('INICIALIZAR HISTORIAL -> justo antes de empezar a meter dias ', this.diasRutina)
      // Días de entrenamientos con información del peso anterior manualmente asignada
      const dia1Entrenamiento1 = [
        {
          // Primero, verifica si encuentra el día correctamente
          ejercicioPlanId: (() => {
            const dia = this.diasRutina.find(dia => dia.diaNombre === 'Día 1');
            console.log('DEBUG -> Día encontrado para "Día 1":', dia);

            // Luego, verifica si encuentra el ejercicio dentro del día
            const ejercicio = dia?.ejercicios.find(e => e.nombreEjercicio === 'Jalón de Espalda');
            console.log('DEBUG -> Ejercicio encontrado para "Jalón de Espalda" en "Día 1":', ejercicio);

            // Si ambos son correctos, debería tener un _id, de lo contrario dará undefined
            return ejercicio ? ejercicio._id : undefined;
          })(),
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Jalón de Espalda',
          series: [
            { _id: uuidv4(), numeroSerie: 1, repeticiones: 10, peso: 60 },
            { _id: uuidv4(), numeroSerie: 2, repeticiones: 10, peso: 65 },
            { _id: uuidv4(), numeroSerie: 3, repeticiones: 8, peso: 70 },
            { _id: uuidv4(), numeroSerie: 4, repeticiones: 8, peso: 70 }
          ],
          seriesCompletadas: 4,
          seriesTotal: 4
        },
        {
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 1')?.ejercicios.find(e => e.nombreEjercicio === 'Remo Cerrado')!._id,
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Remo Cerrado',
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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 1')?.ejercicios.find(e => e.nombreEjercicio === 'Martillo')!._id,
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Martillo',
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
      console.log('DEBUG DE dia1Entrenamiento1 - ', dia1Entrenamiento1)

      const dia2Entrenamiento1 = [
        {
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 2')?.ejercicios.find(e => e.nombreEjercicio === 'Press Banco Tumbado')!._id,
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Press Banco Tumbado',
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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 2')?.ejercicios.find(e => e.nombreEjercicio === 'Máquina Aperturas')!._id,
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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 2')?.ejercicios.find(e => e.nombreEjercicio === 'Fondos en Paralelas')!._id,
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

      console.log('DEBUG DE dia2Entrenamiento1 - ', dia2Entrenamiento1)

      const dia3Entrenamiento1 = [
        {
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?.ejercicios.find(e => e.nombreEjercicio === 'Sentadillas Multipower')!._id,
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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?.ejercicios.find(e => e.nombreEjercicio === 'Elevaciones Laterales')!._id,
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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?.ejercicios.find(e => e.nombreEjercicio === 'Prensa de Piernas')!._id,
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

      console.log('DEBUG DE dia3Entrenamiento1 - ', dia3Entrenamiento1)

      // Segunda ronda (usamos el peso anterior donde corresponde)
      // Depuración para la segunda ronda
      console.log('INICIALIZAR HISTORIAL -> Iniciando segunda ronda de entrenamientos para "Día 1"');

      const dia1Entrenamiento2 = [
        {
          // Depuración para verificar que se obtenga correctamente el `ejercicioPlanId`
          ejercicioPlanId: (() => {
            // Paso 1: Buscar el día 'Día 1'
            const diaEncontrado = this.diasRutina.find(dia => dia.diaNombre === 'Día 1');
            console.log('DEBUG -> Día encontrado para "Día 1" en segunda ronda:', diaEncontrado);

            if (!diaEncontrado) {
              console.warn('WARNING -> No se encontró "Día 1" en diasRutina durante la segunda ronda');
              return undefined;
            }

            // Paso 2: Buscar el ejercicio 'Jalón de Espalda' en el día encontrado
            const ejercicioEncontrado = diaEncontrado.ejercicios.find(e => e.nombreEjercicio === 'Jalón de Espalda');
            console.log('DEBUG -> Ejercicio encontrado para "Jalón de Espalda" en "Día 1" (segunda ronda):', ejercicioEncontrado);

            if (!ejercicioEncontrado) {
              console.warn('WARNING -> No se encontró el ejercicio "Jalón de Espalda" en "Día 1" (segunda ronda)');
              return undefined;
            }

            // Paso 3: Retornar el `_id` del ejercicio si todo está correcto
            console.log('DEBUG -> _id del ejercicio "Jalón de Espalda" en segunda ronda:', ejercicioEncontrado._id);
            return ejercicioEncontrado._id;
          })(),

          // Otros campos del ejercicio
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
          // Depuración para verificar que se obtenga correctamente el `ejercicioPlanId`
          ejercicioPlanId: (() => {
            // Paso 1: Buscar el día 'Día 1'
            const diaEncontrado = this.diasRutina.find(dia => dia.diaNombre === 'Día 1');
            console.log('DEBUG -> Día encontrado para "Día 1" en segunda ronda:', diaEncontrado);

            if (!diaEncontrado) {
              console.warn('WARNING -> No se encontró "Día 1" en diasRutina durante la segunda ronda');
              return undefined;
            }

            // Paso 2: Buscar el ejercicio 'Remo Cerrado' en el día encontrado
            const ejercicioEncontrado = diaEncontrado.ejercicios.find(e => e.nombreEjercicio === 'Remo Cerrado');
            console.log('DEBUG -> Ejercicio encontrado para "Remo Cerrado" en "Día 1" (segunda ronda):', ejercicioEncontrado);

            if (!ejercicioEncontrado) {
              console.warn('WARNING -> No se encontró el ejercicio "Remo Cerrado" en "Día 1" (segunda ronda)');
              return undefined;
            }

            // Paso 3: Retornar el `_id` del ejercicio si todo está correcto
            console.log('DEBUG -> _id del ejercicio "Remo Cerrado" en segunda ronda:', ejercicioEncontrado._id);
            return ejercicioEncontrado._id;
          })(),
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Remo Cerrado',
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
          // Depuración para verificar que se obtenga correctamente el `ejercicioPlanId`
          ejercicioPlanId: (() => {
            // Paso 1: Buscar el día 'Día 1'
            const diaEncontrado = this.diasRutina.find(dia => dia.diaNombre === 'Día 1');
            console.log('DEBUG -> Día encontrado para "Día 1" en segunda ronda:', diaEncontrado);

            if (!diaEncontrado) {
              console.warn('WARNING -> No se encontró "Día 1" en diasRutina durante la segunda ronda');
              return undefined;
            }

            // Paso 2: Buscar el ejercicio 'Martillo' en el día encontrado
            const ejercicioEncontrado = diaEncontrado.ejercicios.find(e => e.nombreEjercicio === 'Martillo');
            console.log('DEBUG -> Ejercicio encontrado para "Martillo" en "Día 1" (segunda ronda):', ejercicioEncontrado);

            if (!ejercicioEncontrado) {
              console.warn('WARNING -> No se encontró el ejercicio "Martillo" en "Día 1" (segunda ronda)');
              return undefined;
            }

            // Paso 3: Retornar el `_id` del ejercicio si todo está correcto
            console.log('DEBUG -> _id del ejercicio "Martillo" en segunda ronda:', ejercicioEncontrado._id);
            return ejercicioEncontrado._id;
          })(),
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Martillo',
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

      console.log('DEBUG DE dia1Entrenamiento2 - ', dia1Entrenamiento2)


      const dia3Entrenamiento2 = [
        {
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?.ejercicios.find(e => e.nombreEjercicio === 'Sentadillas Multipower')!._id,
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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?.ejercicios.find(e => e.nombreEjercicio === 'Elevaciones Laterales')!._id,
          nombreEjercicioRealizado: 'Elevaciones Laterales',
          series: [

          ],
          seriesCompletadas: 0,
          seriesTotal: 4
        }, // No se registran seriees para este ejercicio
        {
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?.ejercicios.find(e => e.nombreEjercicio === 'Prensa de Piernas')!._id,
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

      console.log('DEBUG DE dia3Entrenamiento2 - ', dia3Entrenamiento2)

      const dia1Entrenamiento3 = [
        {
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 1')?.ejercicios.find(e => e.nombreEjercicio === 'Jalón de Espalda')!._id,

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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 1')?.ejercicios.find(e => e.nombreEjercicio === 'Remo Cerrado')!._id,
          _id: uuidv4(),
          nombreEjercicioRealizado: 'Remo Cerrado',
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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 1')?.ejercicios.find(e => e.nombreEjercicio === 'Martillo')!._id,
          nombreEjercicioRealizado: 'Martillo',
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

      console.log('DEBUG DE dia1Entrenamiento3 - ', dia1Entrenamiento3)

      const dia2Entrenamiento2 = [
        {
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 2')?.ejercicios.find(e => e.nombreEjercicio === 'Press Banco Tumbado')!._id,
          _id: uuidv4(),

          nombreEjercicioRealizado: 'Press Banco Tumbado',
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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 2')?.ejercicios.find(e => e.nombreEjercicio === 'Máquina Aperturas')!._id,
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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 2')?.ejercicios.find(e => e.nombreEjercicio === 'Fondos en Paralelas')!._id,
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
      console.log('DEBUG DE dia2Entrenamiento2 - ', dia2Entrenamiento2)

      const dia3Entrenamiento3 = [
        {
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?.ejercicios.find(e => e.nombreEjercicio === 'Sentadillas Multipower')!._id,
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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?.ejercicios.find(e => e.nombreEjercicio === 'Elevaciones Laterales')!._id,
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
          ejercicioPlanId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?.ejercicios.find(e => e.nombreEjercicio === 'Prensa de Piernas')!._id,
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

      console.log('DEBUG DE dia3Entrenamiento3 - ', dia3Entrenamiento3)


      // Generamos los días de entrenamiento con fechas asignadas
      const diasEntrenamientos = [
        {
          _id: uuidv4(),
          fechaEntrenamiento: '2024-10-01',
          diaRutinaId: this.diasRutina.find(dia => dia.diaNombre === 'Día 1')?._id,
          nombreRutinaEntrenamiento: 'Rutina 1',
          diaEntrenamientoNombre: 'Día 1',
          descripcion: 'Espalda y bíceps',
          ejercicioRealizado: dia1Entrenamiento1
        },
        {
          _id: uuidv4(),
          fechaEntrenamiento: '2024-10-02',
          diaRutinaId: this.diasRutina.find(dia => dia.diaNombre === 'Día 2')?._id,
          nombreRutinaEntrenamiento: 'Rutina 1',
          diaEntrenamientoNombre: 'Día 2',
          descripcion: 'Pecho y tríceps',
          ejercicioRealizado: dia2Entrenamiento1
        },
        { _id: uuidv4(), fechaEntrenamiento: '2024-10-03', diaRutinaId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?._id, nombreRutinaEntrenamiento: 'Rutina 1', diaEntrenamientoNombre: 'Día 3', descripcion: 'Hombro y pierna', ejercicioRealizado: dia3Entrenamiento1 },
        { _id: uuidv4(), fechaEntrenamiento: '2024-10-04', diaRutinaId: this.diasRutina.find(dia => dia.diaNombre === 'Día 1')?._id, nombreRutinaEntrenamiento: 'Rutina 1', diaEntrenamientoNombre: 'Día 1', descripcion: 'Espalda y Bíceps', ejercicioRealizado: dia1Entrenamiento2 },
        { _id: uuidv4(), fechaEntrenamiento: '2024-10-05', diaRutinaId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?._id, nombreRutinaEntrenamiento: 'Rutina 1', diaEntrenamientoNombre: 'Día 3', descripcion: 'Hombro y pierna', ejercicioRealizado: dia3Entrenamiento2 }, // Sin series en un ejercicio
        { _id: uuidv4(), fechaEntrenamiento: '2024-10-06', diaRutinaId: this.diasRutina.find(dia => dia.diaNombre === 'Día 1')?._id, nombreRutinaEntrenamiento: 'Rutina 1', diaEntrenamientoNombre: 'Día 1', descripcion: 'Espalda y Bíceps', ejercicioRealizado: dia1Entrenamiento3 },
        { _id: uuidv4(), fechaEntrenamiento: '2024-10-07', diaRutinaId: this.diasRutina.find(dia => dia.diaNombre === 'Día 2')?._id, nombreRutinaEntrenamiento: 'Rutina 1', diaEntrenamientoNombre: 'Día 2', descripcion: 'Pecho y tríceps', ejercicioRealizado: dia2Entrenamiento2 },
        { _id: uuidv4(), fechaEntrenamiento: '2024-10-08', diaRutinaId: this.diasRutina.find(dia => dia.diaNombre === 'Día 3')?._id, nombreRutinaEntrenamiento: 'Rutina 1', diaEntrenamientoNombre: 'Día 3', descripcion: 'Hombro y pierna', ejercicioRealizado: dia3Entrenamiento3 },
        { _id: uuidv4(), fechaEntrenamiento: '2024-10-09', diaRutinaId: this.diasRutina.find(dia => dia.diaNombre === 'Día 1')?._id, nombreRutinaEntrenamiento: 'Rutina 1', diaEntrenamientoNombre: 'Día 1', descripcion: 'Espalda y Bíceps', ejercicioRealizado: dia1Entrenamiento3 }
      ];

      console.log('DEBUG DE DIASENTRENAMIENTOS - ', diasEntrenamientos)

      // Obtener todos los historiales del usuario logeado
      const historialesExistentes = await this.historialService.obtenerHistorialesPorUsuario(this.usuarioPruebas._id!);

      let historial: HistorialEntrenamiento;
      if (historialesExistentes.length > 0) {
        historial = historialesExistentes[0];
      } else {
        historial = {

          entidad: 'historialEntrenamiento',
          usuarioId: this.usuarioPruebas._id!,
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
            rutinaId: rutinas.find(rutina => rutina.nombre === 'Rutina 1')?._id,
            fechaEntrenamiento: diaEntrenamiento.fechaEntrenamiento,
            diaRutinaId: diaEntrenamiento.diaRutinaId!,
            nombreRutinaEntrenamiento: diaEntrenamiento.nombreRutinaEntrenamiento,
            diaEntrenamientoNombre: diaEntrenamiento.diaEntrenamientoNombre,
            descripcion: diaEntrenamiento.descripcion,
            ejerciciosRealizados: diaEntrenamiento.ejercicioRealizado
          };

          historial.entrenamientos.push(nuevoDiaEntrenamiento);

        }
      }



      await this.historialService.agregarHistorial(historial);
      const historialesConfirmados = await this.historialService.obtenerHistorialesPorUsuario(this.usuarioPruebas._id!);
      console.log('Historiales confirmados tras inicialización:', historialesConfirmados);

      console.log('Historial de entrenamientos actualizado correctamente.');
    } catch (error) {
      console.error('Error al actualizar el historial de entrenamientos:', error);
      throw error;
    }
  }
}