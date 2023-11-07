import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AngularMaterialModule } from 'src/app/compartido/componentes/imports/angular-material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HojaVidaComponent } from './hoja-vida.component';
import { InformacionFamiliarComponent } from './informacion-familiar/informacion-familiar.component';
import { DatosPersonalesComponent } from './datos-personales/datos-personales.component';
import { HojaVidaRoutingModule } from './hoja-vida-routing.module';
import { ActividadesPersonalesComponent } from './actividades-personales/actividades-personales.component';
import { ExperienciaLaboralComponent } from './experiencia-laboral/experiencia-laboral.component';
import { InformacionAcademicaComponent } from './informacion-academica/informacion-academica.component';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { DialogHabeasComponent } from '@app/compartido/componentes/dialog-habeas/dialog-habeas.component';
import { MAT_DIALOG_DEFAULT_OPTIONS, DateAdapter, MAT_DATE_FORMATS, } from '@angular/material';
import { ResumenComponent } from './resumen/resumen.component';
import { AnexosComponent } from './anexos/anexos.component';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@app/compartido/directivas/directives.module';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { ProgressBarComponent } from '@app/compartido/componentes/progress-bar/progress-bar.component';
import { ComponentsModule } from '@app/compartido/componentes/components.module';
import { AppDateAdapter, APP_DATE_FORMATS } from '@app/compartido/helpers/format-datepicker';
import { ProduccionIntelectualComponent } from './produccion-intelectual/produccion-intelectual.component';


@NgModule({
  declarations: [
    HojaVidaComponent,
    DatosPersonalesComponent,
    InformacionFamiliarComponent,
    ActividadesPersonalesComponent,
    ExperienciaLaboralComponent,
    InformacionAcademicaComponent,
    DialogHabeasComponent,
    ResumenComponent,
    AnexosComponent,
    ProduccionIntelectualComponent
  ],

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HojaVidaRoutingModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    TranslateModule,
    InputModule,
    DirectivesModule,
    ComponentsModule
  ],
  entryComponents: [
    DialogHabeasComponent,
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, } },
    //{ provide: MatPaginatorIntl, useValue: getDutchPaginatorIntl() },
    //MatDatepickerModule,
    DatePipe,
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ]
  //schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HojaVidaModule { }