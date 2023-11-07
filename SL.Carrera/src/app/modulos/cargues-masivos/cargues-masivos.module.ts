import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarguesMasivosRoutingModule } from './cargues-masivos-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '@app/compartido/componentes/components.module';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { DirectivesModule } from '@app/compartido/directivas/directives.module';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableExporterModule } from 'mat-table-exporter';

import { CargarInfoArchivoComponent } from './cargar-info-archivo/cargar-info-archivo.component';

import { CargueResultadosPruebasComponent } from './cargar-info-archivo/archivos/cargue-resultados-pruebas/cargue-resultados-pruebas.component';
import { CargarInfoEscalafonComponent } from './cargar-info-archivo/archivos/cargar-info-escalafon/cargar-info-escalafon.component';
import { CitacionesAspiranteComponent } from './cargar-info-archivo/archivos/cargar-citaciones-aspirante/citaciones-aspirante.component';
import { VacantesComponent } from './cargar-info-archivo/archivos/cargar-vacantes/vacantes.component';
import { CargarResultadosCursoFormacionComponent } from './cargar-info-archivo/archivos/cargar-resultados-curso-formacion/cargar-resultados-curso-formacion.component';
import { CargarInfoDespachosComponent } from './cargar-info-archivo/archivos/cargar-info-despachos/cargar-info-despachos.component';



@NgModule({
  declarations: [
    CargarInfoArchivoComponent,
    CitacionesAspiranteComponent,
    VacantesComponent,
    CargueResultadosPruebasComponent,
    CargarInfoEscalafonComponent,
    CargarResultadosCursoFormacionComponent,
    CargarInfoDespachosComponent
  ],
  imports: [
    CommonModule,
    CarguesMasivosRoutingModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    InputModule,
    DirectivesModule,
    ComponentsModule,
    MaterialFileInputModule,
    MatFormFieldModule,
    MatTableExporterModule
  ]
})
export class CarguesMasivosModule { }
