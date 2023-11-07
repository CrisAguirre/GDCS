import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProduccionIntelectualRoutingModule } from './produccion-intelectual-routing.module';
import { ProduccionIntelectualComponent } from './produccion-intelectual.component';
import { RegistrarPublicacionComponent } from './registrar-publicacion/registrar-publicacion.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMaterialModule } from '../../../../compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { InputModule } from '../../../../compartido/componentes/input/input.module';


@NgModule({
  declarations: [
    ProduccionIntelectualComponent, 
    RegistrarPublicacionComponent],
  imports: [
    FormsModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MaterialFileInputModule, 
    ProduccionIntelectualRoutingModule,
    InputModule
  ]
})
export class ProduccionIntelectualModule { }
