import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { CargarInformacionEscalafonRoutingModule } from './cargar-informacion-escalafon-routing.module';
import { InfoEscalafonComponent } from './info-escalafon/info-escalafon.component';
import { CargarInformacionEscalafonComponent } from './cargar-informacion-escalafon.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../../../../compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { TranslateModule } from '@ngx-translate/core';
import { InputModule } from '../../../../compartido/componentes/input/input.module';
import { DirectivesModule } from '../../../../compartido/directivas/directives.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../compartido/helpers/format-datepicker';


@NgModule({
  declarations: [InfoEscalafonComponent, CargarInformacionEscalafonComponent],
  imports: [
    CommonModule,
    CargarInformacionEscalafonRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    TranslateModule,
    InputModule,
    DirectivesModule,
    NgMultiSelectDropDownModule.forRoot()
  ],

  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
  ]
})
export class CargarInformacionEscalafonModule { }
