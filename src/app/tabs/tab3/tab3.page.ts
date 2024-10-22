import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { ToolbarLoggedComponent } from 'src/app/componentes/toolbar-logged/toolbar-logged.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ToolbarLoggedComponent]  // Importamos los módulos necesarios
})
export class Tab3Page implements OnInit {


  constructor() { }

  ngOnInit() {

  }


}
