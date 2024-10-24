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
    await this.inicializarUsuario(); // Inicializamos el usuario
    await this.inicializarEjercicios(); // Inicializamos los ejercicios
    await this.inicializarRutina(); // Inicializamos las rutinas con los días y ejercicios
    await this.inicializarHistorial(); // Inicializamos el historial con dos entrenamientos

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

      const historialesExistentes = await this.historialService.obtenerHistorialesPorUsuario(usuarioLogeado._id!);
      if (historialesExistentes.length === 0) {
        // Día 1: Espalda y Bíceps - Ejercicios (sin peso anterior)
        const ejerciciosDia1 = [
          { ejercicioId: 'Jalón de Espalda', series: [{ numeroSerie: 1, repeticiones: 10, peso: 80 }, { numeroSerie: 2, repeticiones: 10, peso: 85, alFallo: true, notas: 'No pude completar las últimas 2 repeticiones' }] },
          { ejercicioId: 'Martillo (Mancuernas)', series: [{ numeroSerie: 1, repeticiones: 8, peso: 20, conAyuda: true, notas: 'Me ayudaron a terminar las últimas 2 repeticiones' }, { numeroSerie: 2, repeticiones: 10, peso: 25 }] },
          { ejercicioId: 'Remo Agarre Cerrado (Cuernos)', series: [{ numeroSerie: 1, repeticiones: 12, peso: 50 }, { numeroSerie: 2, repeticiones: 12, peso: 55, alFallo: true, notas: 'Al fallo en la última repetición' }] }
        ];

        // Día 2: Pecho y Tríceps - Ejercicios (con peso anterior)
        const ejerciciosDia2 = [
          { ejercicioId: 'Press Banco Tumbado (Mancuernas)', series: [{ numeroSerie: 1, repeticiones: 10, peso: 60, pesoAnterior: 55 }, { numeroSerie: 2, repeticiones: 8, peso: 65, pesoAnterior: 60, alFallo: true, notas: 'No pude completar las últimas 2 repeticiones' }] },
          { ejercicioId: 'Máquina Aperturas', series: [{ numeroSerie: 1, repeticiones: 12, peso: 40, pesoAnterior: 35 }, { numeroSerie: 2, repeticiones: 12, peso: 45, pesoAnterior: 40 }] },
          { ejercicioId: 'Fondos en Paralelas', series: [{ numeroSerie: 1, repeticiones: 10, peso: 0, pesoAnterior: 0 }, { numeroSerie: 2, repeticiones: 10, peso: 0, pesoAnterior: 0 }] }
        ];

        // Día 3: Pierna y Hombro - Ejercicios (con peso anterior)
        const ejerciciosDia3 = [
          { ejercicioId: 'Sentadillas Multipower', series: [{ numeroSerie: 1, repeticiones: 10, peso: 100, pesoAnterior: 95 }, { numeroSerie: 2, repeticiones: 10, peso: 105, pesoAnterior: 100 }] },
          { ejercicioId: 'Elevaciones Laterales', series: [{ numeroSerie: 1, repeticiones: 12, peso: 10, pesoAnterior: 8, dolor: true, notas: 'Dolor leve en el hombro izquierdo' }, { numeroSerie: 2, repeticiones: 12, peso: 12, pesoAnterior: 10 }] },
          { ejercicioId: 'Prensa de Piernas', series: [{ numeroSerie: 1, repeticiones: 10, peso: 120, pesoAnterior: 115 }, { numeroSerie: 2, repeticiones: 10, peso: 125, pesoAnterior: 120 }] }
        ];

        // Generamos 9 días de entrenamiento
        const historiales = [
          { fechaEntrenamiento: '2024-10-01', diaRutinaId: 'Día 1: Espalda y Bíceps', ejercicios: ejerciciosDia1 },
          { fechaEntrenamiento: '2024-10-03', diaRutinaId: 'Día 2: Pecho y Tríceps', ejercicios: ejerciciosDia2 },
          { fechaEntrenamiento: '2024-10-05', diaRutinaId: 'Día 3: Pierna y Hombro', ejercicios: ejerciciosDia3 },
          { fechaEntrenamiento: '2024-10-07', diaRutinaId: 'Día 1: Espalda y Bíceps', ejercicios: ejerciciosDia1.map(e => ({ ...e, series: e.series.map(s => ({ ...s, pesoAnterior: s.peso })) })) },
          {
            fechaEntrenamiento: '2024-10-09',
            diaRutinaId: 'Día 3: Pierna y Hombro',
            notas: 'Saltamos día 2 por dolor en el brazo',
            ejercicios: [
              {
                ejercicioId: 'Sentadillas Multipower',
                series: [
                  { numeroSerie: 1, repeticiones: 10, peso: 100, pesoAnterior: 105 },
                  { numeroSerie: 2, repeticiones: 10, peso: 105, pesoAnterior: 100 }
                ]
              },
              {
                ejercicioId: 'Prensa de Piernas',
                series: [
                  { numeroSerie: 1, repeticiones: 10, peso: 120, pesoAnterior: 125 },
                  { numeroSerie: 2, repeticiones: 10, peso: 125, pesoAnterior: 120 }
                ]
              },
              {
                ejercicioId: 'Elevaciones Laterales',
                series: [], // No se realiza el ejercicio
                notas: 'Hoy no se realiza por dolor en el brazo'
              }
            ]
          },
          { fechaEntrenamiento: '2024-10-11', diaRutinaId: 'Día 1: Espalda y Bíceps', ejercicios: ejerciciosDia1.map(e => ({ ...e, series: e.series.map(s => ({ ...s, pesoAnterior: s.peso })) })) },
          { fechaEntrenamiento: '2024-10-13', diaRutinaId: 'Día 2: Pecho y Tríceps', ejercicios: ejerciciosDia2.map(e => ({ ...e, series: e.series.map(s => ({ ...s, pesoAnterior: s.peso })) })) },
          { fechaEntrenamiento: '2024-10-15', diaRutinaId: 'Día 3: Pierna y Hombro', ejercicios: ejerciciosDia3.map(e => ({ ...e, series: e.series.map(s => ({ ...s, pesoAnterior: s.peso })) })) },
          { fechaEntrenamiento: '2024-10-17', diaRutinaId: 'Día 1: Espalda y Bíceps', ejercicios: ejerciciosDia1.map(e => ({ ...e, series: e.series.map(s => ({ ...s, pesoAnterior: s.peso })) })) }
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
                ejercicios: historial.ejercicios,
                notas: historial.notas
              }
            ]
          };
          await this.historialService.agregarHistorial(nuevoHistorial);
        }

        console.log('Historial de entrenamientos para 9 días añadido correctamente.');
      } else {
        console.log('Historial ya existe, no se agregará nada.');
      }
    } catch (error) {
      console.error('Error al añadir el historial de entrenamientos:', error);
    }
  }
}