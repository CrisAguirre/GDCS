import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { TrasladosRoutingModule } from './traslados-routing.module';
import { TrasladosComponent } from './traslados.component';
import { GestionarTrasladoComponent } from './gestionar-traslado/gestionar-traslado.component';
import { TrasladosInfoComponent } from './traslados-info/traslados-info.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { DirectivesModule } from '@app/compartido/directivas/directives.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '@app/compartido/helpers/format-datepicker';
import { ComponentsModule } from '@app/compartido/componentes/components.module';


@NgModule({
  declarations: [
    TrasladosComponent,
    GestionarTrasladoComponent,
    TrasladosInfoComponent
  ],
  imports: [
    CommonModule,
    TrasladosRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    TranslateModule,
    InputModule,
    DirectivesModule,
    ComponentsModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
  ]
})
export class TrasladosModule { }
