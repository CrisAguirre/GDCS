import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegistroDespachosRoutingModule } from './registro-despachos-routing.module';
import { RegistroDespachosComponent } from './registro-despachos.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMaterialModule } from '../../../../compartido/componentes/imports/angular-material.module';
import { InputModule } from '../../../../compartido/componentes/input/input.module';
import { DirectivesModule } from '../../../../compartido/directivas/directives.module';
import { ComponentsModule } from '../../../../compartido/componentes/components.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableExporterModule } from 'mat-table-exporter';
import { DespachosComponent } from './despachos/despachos.component';


@NgModule({
  declarations: [
    RegistroDespachosComponent,
    DespachosComponent
  ],
  imports: [
    CommonModule,
    RegistroDespachosRoutingModule,
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
export class RegistroDespachosModule { }
