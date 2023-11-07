import { DialogCronogramaConComponent } from '@app/compartido/componentes/dialog-cronograma-con/dialog-cronograma-con.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConvocatoriasAspiranteRoutingModule } from './convocatorias-aspirante-routing.module';
import { ConvocatoriasAspiranteComponent } from './convocatorias-aspirante.component';
import { InscripcionConvocatoriaComponent } from './inscripcion-convocatoria/inscripcion-convocatoria.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { DirectivesModule } from '@app/compartido/directivas/directives.module';
import { ComponentsModule } from '@app/compartido/componentes/components.module';
import { CargosConvocatoriaComponent } from './cargos-convocatoria/cargos-convocatoria.component';
import { MisConvocatoriasComponent } from './mis-convocatorias/mis-convocatorias.component';
import { VacantesPublicadasUsuariosComponent } from './vacantes-publicadas-usuarios/vacantes-publicadas-usuarios.component';



@NgModule({
  declarations: [
    ConvocatoriasAspiranteComponent,
    InscripcionConvocatoriaComponent,
    CargosConvocatoriaComponent,
    MisConvocatoriasComponent,
    DialogCronogramaConComponent,
    VacantesPublicadasUsuariosComponent,
  ],
  imports: [
    CommonModule,
    ConvocatoriasAspiranteRoutingModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    InputModule,
    DirectivesModule,
    ComponentsModule
  ],
  entryComponents: [
    DialogCronogramaConComponent
  ]
})
export class ConvocatoriasAspiranteModule { }
