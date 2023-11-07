import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PerfilRoutingModule } from './perfil-routing.module';
import { PerfilComponent } from './perfil.component';
import { EquivalenciasComponent } from './equivalencias/equivalencias.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { PerfilAdminComponent } from './perfil-admin/perfil-admin.component';
import { DirectivesModule } from '@app/compartido/directivas/directives.module';
import { ComponentsModule } from '@app/compartido/componentes/components.module';
import { PerfilInfoComponent } from './perfil-info/perfil-info.component';
import { CargosComponent } from './cargos/cargos.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '@app/compartido/helpers/format-datepicker';
import { DialogSelectCargosComponent } from '@app/compartido/componentes/dialog-select-cargos/dialog-select-cargos.component';


@NgModule({
  declarations: [
    PerfilComponent,
    EquivalenciasComponent,
    PerfilAdminComponent,
    PerfilInfoComponent,
    CargosComponent,
    DialogSelectCargosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PerfilRoutingModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    InputModule,
    DirectivesModule,
    ComponentsModule,
  ],

  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
  ],
  entryComponents: [
    DialogSelectCargosComponent
  ]
})
export class PerfilModule { }
