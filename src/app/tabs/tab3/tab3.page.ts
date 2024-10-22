import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DiaRutina, Rutina, EjercicioPlan } from 'src/app/models/rutina.model';
import { RutinaService } from 'src/app/services/rutina.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [NgIf, NgFor],
})
export class Tab3Page implements OnInit {
  ultimoEntreno: { rutina: Rutina; dia: DiaRutina; fecha: string } | null = null;
  usuarios: any[] = [];
  usuarioSeleccionado: any = null;

  constructor(
    private rutinaService: RutinaService,
    private usuarioService: UsuarioService
  ) { }

  async ngOnInit() {
    try {
      // Obtener la lista de usuarios
      this.usuarios = await this.usuarioService.obtenerUsuarios();
      console.log('Usuarios obtenidos:', this.usuarios);
      if (this.usuarios.length > 0) {
        this.usuarioSeleccionado = this.usuarios[0];
        console.log('Usuario seleccionado:', this.usuarioSeleccionado);
        await this.cargarUltimoEntreno();
      }
    } catch (error) {
      console.error('Error al cargar los usuarios:', error);
    }
  }

  async cargarUltimoEntreno() {
    try {
      if (this.usuarioSeleccionado) {
        const rutinas = await this.rutinaService.obtenerRutinasPorUsuario(
          this.usuarioSeleccionado._id
        );
        console.log('Rutinas obtenidas:', rutinas);
        if (rutinas.length > 0) {
          const ultimaRutina = rutinas[0]; // Asumimos que la primera rutina es la más reciente
          console.log('Última rutina encontrada:', ultimaRutina);
          let ultimoDia: DiaRutina | null = null;
          let fechaEntrenamiento = 'No especificada';

          // Buscar el día más reciente que tenga ejercicios con fecha de entrenamiento
          for (let dia of ultimaRutina.dias) {
            console.log('Revisando día de la rutina:', dia);
            if (dia.ejercicios.length === 0) {
              console.log('El día no tiene ejercicios.');
              continue;
            }
            for (let ejercicio of dia.ejercicios) {
              console.log('Revisando ejercicio:', ejercicio);
              if (ejercicio.fechaEntrenamiento && ejercicio.fechaEntrenamiento.trim() !== '') {
                console.log('Ejercicio con fecha encontrado:', ejercicio);
                ultimoDia = dia;
                fechaEntrenamiento = ejercicio.fechaEntrenamiento;
                break;
              } else if (!ejercicio.fechaEntrenamiento || ejercicio.fechaEntrenamiento.trim() === '') {
                console.log('Fecha de entrenamiento vacía, asignando fecha actual por defecto.');
                ejercicio.fechaEntrenamiento = new Date().toISOString();
                ultimoDia = dia;
                fechaEntrenamiento = ejercicio.fechaEntrenamiento;
                break;
              }
            }
            if (ultimoDia) {
              break;
            }
          }

          if (ultimoDia) {
            console.log('Último día encontrado con fecha:', ultimoDia);
            this.ultimoEntreno = {
              rutina: ultimaRutina,
              dia: ultimoDia,
              fecha: fechaEntrenamiento,
            };
          } else {
            console.log('No se encontró un entrenamiento reciente con una fecha especificada.');
          }
        } else {
          console.log('No se encontraron rutinas para el usuario seleccionado.');
        }
      }
    } catch (error) {
      console.error('Error al cargar el último entreno:', error);
    }
  }
}