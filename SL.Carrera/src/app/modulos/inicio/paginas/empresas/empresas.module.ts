import { EmpresasComponent } from './empresas.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresasRoutingModule } from './empresas-routing.module';
import { CrearEmpresaComponent } from './crear-empresa/crear-empresa.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { DirectivesModule } from '@app/compartido/directivas/directives.module';
import { ComponentsModule } from '@app/compartido/componentes/components.module';


@NgModule({
  declarations: [
    EmpresasComponent,
    CrearEmpresaComponent,
  ],
  imports: [
    CommonModule,
    EmpresasRoutingModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    InputModule,
    DirectivesModule,
    ComponentsModule,
  ]
})
export class EmpresasModule { }
