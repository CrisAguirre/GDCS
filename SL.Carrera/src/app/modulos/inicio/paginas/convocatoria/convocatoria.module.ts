import { NgModule, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConvocatoriaRoutingModule } from './convocatoria-routing.module';
import { ConvocatoriaComponent } from './convocatoria.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CronogramaComponent } from './cronograma/cronograma.component';
import { CrearSeccionesComponent } from './crear-secciones/crear-secciones.component';
import { CrearSubseccionesComponent } from './crear-subsecciones/crear-subsecciones.component';
import { EtapasComponent } from './etapas/etapas.component';
import { AdicionalComponent } from './adicional/adicional.component';
import { ConvocatoriaAdminComponent } from './convocatoria-admin/convocatoria-admin.component';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { PdfComponent } from './pdf/pdf.component';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { ResumenComponent } from './resumen/resumen.component';
import { AclaracionesModificacionesComponent } from './aclaraciones-modificaciones/aclaraciones-modificaciones.component';
import { ConvocatoriaInfoComponent } from './convocatoria-info/convocatoria-info.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '@app/compartido/helpers/format-datepicker';
import { FasePruebaComponent } from './fase-prueba/fase-prueba.component';
import { PresentacionPruebasComponent } from './presentacion-pruebas/presentacion-pruebas.component';
import { CitacionPruebasComponent } from './citacion-pruebas/citacion-pruebas.component';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { RequisitosConvocatoriaComponent } from './requisitos-convocatoria/requisitos-convocatoria.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OpcionesRecalificacionComponent } from './opciones-recalificacion/opciones-recalificacion.component';
import { InscripcionVacantesComponent } from './inscripcion-vacantes/inscripcion-vacantes.component';
// import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';



@NgModule({
  declarations: [
    ConvocatoriaComponent,
    CronogramaComponent,
    CrearSeccionesComponent,
    CrearSubseccionesComponent,
    EtapasComponent,
    AdicionalComponent,
    ConvocatoriaAdminComponent,
    PdfComponent,
    ResumenComponent,
    AclaracionesModificacionesComponent,
    ConvocatoriaInfoComponent,
    FasePruebaComponent,
    PresentacionPruebasComponent,
    CitacionPruebasComponent,
    RequisitosConvocatoriaComponent,
    OpcionesRecalificacionComponent,
    InscripcionVacantesComponent
  ],
  imports: [
    CommonModule,
    ConvocatoriaRoutingModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    InputModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    NgMultiSelectDropDownModule.forRoot()
    // PdfJsViewerModule
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
  ]
  // schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConvocatoriaModule { }
