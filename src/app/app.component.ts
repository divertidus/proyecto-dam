import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { EjercicioService } from './services/ejercicio.service';
import { AuthService } from './auth/auth.service';
import { Ejercicio } from './models/ejercicio.model';
import { DiaRutina, Rutina, Serie } from './models/rutina.model';
import { UsuarioService } from './services/usuario.service';
import { RutinaService } from './services/rutina.service';
import { Usuario } from './models/usuario.model';
import { DatabaseService } from './services/database.service';
import { HistorialService } from './services/historial-entreno.service';
import { HistorialEntrenamiento } from './interfaces/posiblesNuevasEntidades';

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
    private authService: AuthService) { }

  private usuarioLogeado: Usuario | null = null; // Variable para almacenar el usuario logeado actual

  async ngOnInit() {
    await this.inicializarUsuario(); // Inicializamos el usuario
    await this.inicializarEjercicios(); // Inicializamos los ejercicios
    await this.inicializarRutina(); // Inicializamos las rutinas con los días y ejercicios
    await this.inicializarHistorial(); // Inicializamos el historial con dos entrenamientos

    this.authService.autoLoginPrimerUsuario(); // Intentamos iniciar sesión automáticamente


    /* CONSULTAS DOCUMENTOS Y DESCARGA JSON BBDD CON INFORMACION
        // Listar todos los documentos al iniciar el componente
        this.databaseService.listarTodosLosDocumentos().then((docs) => {
          console.log('Documentos encontrados:', docs);
        });
    
        // Exportar los documentos a un archivo JSON
        this.databaseService.exportarDocumentosAJson();
    
    */

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
    ];

    const ejerciciosMap: { [key: string]: string } = {};
    try {
      const ejerciciosExistentes = await this.ejercicioService.obtenerEjercicios();
      if (ejerciciosExistentes.length === 0) {
        for (const ejercicio of ejercicios) {
          const response = await this.ejercicioService.agregarEjercicio(ejercicio);
          ejerciciosMap[ejercicio.nombre] = response.id;
        }
      } else {
        ejerciciosExistentes.forEach(e => {
          ejerciciosMap[e.nombre] = e._id!;
        });
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
            { ejercicioId: ejerciciosMap['Martillo (Mancuernas)'], series: Array(4).fill({ numeroSerie: 1, repeticiones: 10 }) }
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

  // Inicializar historial de entrenamiento con dos sesiones en días diferentes
  async inicializarHistorial() {
    try {
      const usuarios = await this.usuarioService.obtenerUsuarios();
      if (usuarios.length === 0) return;
      const usuarioLogeado = usuarios[0];

      const historialesExistentes = await this.historialService.obtenerHistorialesPorUsuario(usuarioLogeado._id!);
      if (historialesExistentes.length === 0) {
        const historial1: HistorialEntrenamiento = {
          entidad: 'historialEntrenamiento',  // El literal específico
          usuarioId: usuarioLogeado._id!,
          entrenamientos: [
            {
              fechaEntrenamiento: '2024-10-10',
              diaRutinaId: 'Día 1: Espalda y Bíceps',
              ejercicios: [
                { ejercicioId: 'Jalón de Espalda', series: [{ numeroSerie: 1, repeticiones: 10, peso: 80 }, { numeroSerie: 2, repeticiones: 10, peso: 80 }] },
                { ejercicioId: 'Martillo (Mancuernas)', series: [{ numeroSerie: 1, repeticiones: 10, peso: 20 }, { numeroSerie: 2, repeticiones: 10, peso: 20 }] }
              ]
            }
          ]
        };

        const historial2: HistorialEntrenamiento = {
          entidad: 'historialEntrenamiento',
          usuarioId: usuarioLogeado._id!,
          entrenamientos: [
            {
              fechaEntrenamiento: '2024-10-12',
              diaRutinaId: 'Día 1: Espalda y Bíceps',
              ejercicios: [
                { ejercicioId: 'Jalón de Espalda', series: [{ numeroSerie: 1, repeticiones: 10, peso: 85 }, { numeroSerie: 2, repeticiones: 10, peso: 85 }] },
                { ejercicioId: 'Martillo (Mancuernas)', series: [{ numeroSerie: 1, repeticiones: 10, peso: 25 }, { numeroSerie: 2, repeticiones: 10, peso: 25 }] }
              ]
            }
          ]
        };

        await this.historialService.agregarHistorial(historial1);
        await this.historialService.agregarHistorial(historial2);

        console.log('Historial de entrenamientos añadido correctamente.');
      } else {
        console.log('Historial ya existe, no se agregará nada.');
      }
    } catch (error) {
      console.error('Error al añadir el historial de entrenamientos:', error);
    }
  }
}