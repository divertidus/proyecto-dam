import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { EjercicioService } from './services/ejercicio.service';
import { AuthService } from './auth/auth.service';
import { Ejercicio } from './models/ejercicio.model';
import { DiaRutina, Rutina, Serie } from './models/rutina.model';
import { UsuarioService } from './services/usuario.service';
import { RutinaService } from './services/rutina.service';
import { Usuario } from './models/usuario.model';

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
    private authService: AuthService) { }

  private usuarioLogeado: Usuario | null = null; // Variable para almacenar el usuario logeado actual

  async ngOnInit() {
    await this.inicializarUsuario(); // Inicializamos el usuario
    //   await this.inicializarEjercicios(); // Inicializamos los ejercicios
    //  await this.inicializarRutina(); // Inicializamos las rutinas con los días y ejercicios

    this.authService.autoLoginPrimerUsuario(); // Intentamos iniciar sesión automáticamente
  }

  // Método para inicializar un usuario por defecto
  async inicializarUsuario() {
    try {
      const usuariosExistentes = await this.usuarioService.obtenerUsuarios();
      if (usuariosExistentes.length === 0) {
        // Si no hay usuarios existentes, creamos uno nuevo
        const nuevoUsuario: Usuario = {
          nombre: 'AutoUsuario',
          email: 'auto@pruebas.com',
          entidad: 'usuario',
          timestamp: new Date().toISOString(),
        };
        await this.usuarioService.agregarUsuario(nuevoUsuario);
        console.log('Usuario inicializado correctamente:', nuevoUsuario.nombre);
      } else {
        console.log('Usuarios ya existentes, no se añadirá AutoUsuario.');
      }
    } catch (error) {
      console.error('Error al inicializar el usuario:', error);
    }
  }

  async inicializarEjercicios(): Promise<{ [key: string]: string }> {
    const ejercicios: Ejercicio[] = [
      { nombre: 'Jalón de Espalda', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Remo Agarre Cerrado (Cuernos)', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Jalón Cerrado', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Remo Agarre Ancho - Menos Peso', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Espalda' },
      { nombre: 'Martillo (Mancuernas)', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Bíceps' },
      { nombre: 'Máquina Bíceps Sentado', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Bíceps' },
      { nombre: 'Press Banco Tumbado (Mancuernas)', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Pecho' },
      { nombre: 'Máquina Aperturas', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Pecho' },
      { nombre: 'Elevaciones Laterales', entidad: 'ejercicio', tipoPeso: 'mancuernas', musculoPrincipal: 'Hombro' },
      { nombre: 'Sentadillas Multipower', entidad: 'ejercicio', tipoPeso: 'barra', musculoPrincipal: 'Piernas' },
      { nombre: 'Isquiotibiales', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Piernas' },
      { nombre: 'Cuádriceps', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Piernas' },
      { nombre: 'Gemelos', entidad: 'ejercicio', tipoPeso: 'máquina', musculoPrincipal: 'Piernas' },
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
        console.log('Ejercicios ya existen en la base de datos, no se agregarán duplicados.');
        ejerciciosExistentes.forEach(e => {
          ejerciciosMap[e.nombre] = e._id!;
        });
      }
    } catch (error) {
      console.error('Error al añadir ejercicios:', error);
    }

    return ejerciciosMap;
  }

  // Método para inicializar la rutina con los días y ejercicios definidos
  // Método para inicializar la rutina con los días y ejercicios definidos
  /* async inicializarRutina() {
    try {
      const usuarios = await this.usuarioService.obtenerUsuarios();
      if (usuarios.length === 0) {
        console.log('No hay usuarios para asociar la rutina.');
        return;
      }
      const usuarioLogeado = usuarios[0]; // Tomamos el primer usuario

      const ejerciciosMap = await this.inicializarEjercicios(); // Asegurarse de inicializar y obtener los IDs de ejercicios

      const diasRutina: DiaRutina[] = [
        {
          diaNombre: 'Día 1: Espalda y Bíceps',
          descripcion: 'Trabajo de espalda y bíceps',
          ejercicios: [
            { ejercicioId: ejerciciosMap['Jalón de Espalda'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Remo Agarre Cerrado (Cuernos)'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Jalón Cerrado'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Remo Agarre Ancho - Menos Peso'], series: Array(3).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Martillo (Mancuernas)'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Máquina Bíceps Sentado'], series: Array(6).fill({ numeroSerie: 1, repeticiones: 20 }) },
          ],
        },
        {
          diaNombre: 'Día 2: Pecho y Tríceps',
          descripcion: 'Entrenamiento de pecho y tríceps',
          ejercicios: [
            { ejercicioId: ejerciciosMap['Press Banco Tumbado (Mancuernas)'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Máquina Aperturas'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            // Añadir los ejercicios restantes de acuerdo con tu descripción...
          ],
        },
        {
          diaNombre: 'Día 3: Hombro y Piernas',
          descripcion: 'Entrenamiento de hombros y piernas',
          ejercicios: [
            { ejercicioId: ejerciciosMap['Elevaciones Laterales'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Sentadillas Multipower'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Isquiotibiales'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Cuádriceps'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
            { ejercicioId: ejerciciosMap['Gemelos'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) },
          ],
        },
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
        console.log('Ya existen rutinas en la base de datos, no se añadirá ninguna nueva.');
      }
    } catch (error) {
      console.error('Error al añadir la rutina:', error);
    }
  } */


}