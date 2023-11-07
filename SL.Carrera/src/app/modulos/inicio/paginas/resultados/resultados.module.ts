import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicarResultadosComponent } from './publicar-resultados/publicar-resultados.component';
import { CargarInformacionCursoComponent } from './cargar-informacion-curso/cargar-informacion-curso.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMaterialModule } from '../../../../compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { InputModule } from '../../../../compartido/componentes/input/input.module';
import { DirectivesModule } from '../../../../compartido/directivas/directives.module';
import { ComponentsModule } from '../../../../compartido/componentes/components.module';
import { ResultadosRoutingModule } from './resultados-routing.module';


@NgModule({
  declarations: [PublicarResultadosComponent, CargarInformacionCursoComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    ResultadosRoutingModule,
    InputModule,
    DirectivesModule,
    ComponentsModule,
  ]
})
export class ResultadosModule { }
