import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HojasDeVidaAdminRoutingModule } from './hojas-de-vida-admin-routing.module';
import { BancoHojaDeVidaComponent } from './banco-hoja-de-vida/banco-hoja-de-vida.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { DirectivesModule } from '@app/compartido/directivas/directives.module';
import { ComponentsModule } from '@app/compartido/componentes/components.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { APP_DATE_FORMATS, AppDateAdapter } from '../../compartido/helpers/format-datepicker';


@NgModule({
  declarations: [BancoHojaDeVidaComponent],
  imports: [
    CommonModule,
    HojasDeVidaAdminRoutingModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    InputModule,
    DirectivesModule,
    ComponentsModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
  ]
})
export class HojasDeVidaAdminModule { }
