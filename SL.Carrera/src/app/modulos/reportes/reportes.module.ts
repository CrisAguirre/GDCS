import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesRoutingModule } from './reportes-routing.module';
import { GeneradorReportesComponent } from './generador-reportes/generador-reportes.component';
import { ReporteBaseComponent } from './generador-reportes/reportes/reporte-base/reporte-base.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { DirectivesModule } from '@app/compartido/directivas/directives.module';
import { ComponentsModule } from '@app/compartido/componentes/components.module';
import { GestionarReportesComponent } from './gestionar-reportes/gestionar-reportes.component';
import { ReporteAspiranteInscritoComponent } from './generador-reportes/reportes/reporte-aspirante-inscrito/reporte-aspirante-inscrito.component';
import { ReportePreseleccionadosComponent } from './generador-reportes/reportes/reporte-preseleccionados/reporte-preseleccionados.component';
import { ReporteVacantesFuncionariosComponent } from './generador-reportes/reportes/reporte-vacantes-funcionarios/reporte-vacantes-funcionarios.component';
import { ReporteInscritosAltasCortesComponent } from './generador-reportes/reportes/reporte-inscritos-altas-cortes/reporte-inscritos-altas-cortes.component';
import { ReporteResultadoPruebaComponent } from './generador-reportes/reportes/reporte-resultado-prueba/reporte-resultado-prueba.component';
import { ReporteEstadisticaConvocatoriaComponent } from './generador-reportes/reportes/reporte-estadistica-convocatoria/reporte-estadistica-convocatoria.component';
import { ReporteAspirantesExcluidosComponent } from './generador-reportes/reportes/reporte-aspirantes-excluidos/reporte-aspirantes-excluidos.component';
import { ReporteVacanteDesiertaComponent } from './generador-reportes/reportes/reporte-vacante-desierta/reporte-vacante-desierta.component';
import { ReporteElegiblesAltasCortesComponent } from './generador-reportes/reportes/reporte-elegibles-altas-cortes/reporte-elegibles-altas-cortes.component';
import { ReporteTrasladosComponent } from './generador-reportes/reportes/reporte-traslados/reporte-traslados.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { AppDateAdapter, APP_DATE_FORMATS } from '@app/compartido/helpers/format-datepicker';


@NgModule({
  declarations: [
    GeneradorReportesComponent,
    ReporteBaseComponent,
    GestionarReportesComponent,
    ReporteAspiranteInscritoComponent,
    ReportePreseleccionadosComponent,
    ReporteVacantesFuncionariosComponent,
    ReporteInscritosAltasCortesComponent,
    ReporteResultadoPruebaComponent,
    ReporteEstadisticaConvocatoriaComponent,
    ReporteAspirantesExcluidosComponent,
    ReporteVacanteDesiertaComponent,
    ReporteElegiblesAltasCortesComponent, 
    ReporteTrasladosComponent],
  imports: [
    CommonModule,
    ReportesRoutingModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
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
export class ReportesModule { }
