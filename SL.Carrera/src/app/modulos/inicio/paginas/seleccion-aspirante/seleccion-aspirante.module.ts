import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { SeleccionAspiranteRoutingModule } from './seleccion-aspirante-routing.module';
import { SeleccionAspiranteComponent } from './seleccion-aspirante.component';
import { ValidarDocsAspiranteComponent } from './validar-docs-aspirante/validar-docs-aspirante.component';
import { ResultadosPruebasComponent } from './resultados-pruebas/resultados-pruebas.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '@app/compartido/directivas/directives.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { RegistroVacantesComponent } from './registro-vacantes/registro-vacantes.component';
import { ElegibleAltaCorteComponent } from './elegible-alta-corte/elegible-alta-corte.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
// import { SatPopoverModule } from '@ncstate/sat-popover';
import { AppDateAdapter, APP_DATE_FORMATS } from '@app/compartido/helpers/format-datepicker';
import { ResultadosCursoFormacionComponent } from './resultados-curso-formacion/resultados-curso-formacion.component';
import { ProcesoSeleccionComponent } from './proceso-seleccion/proceso-seleccion.component';
import { ValidarCursoFormacionComponent } from './validar-curso-formacion/validar-curso-formacion.component';
import { GeneracionListaElegiblesComponent } from './generacion-lista-elegibles/generacion-lista-elegibles.component';
import { GestionarVacantesComponent } from './gestionar-vacantes/gestionar-vacantes.component';
import { ExclusionFraudeCumplimientoComponent } from './exclusion-fraude-cumplimiento/exclusion-fraude-cumplimiento.component';
import { TablaInformacionAspirantesComponent } from './tabla-informacion-aspirantes/tabla-informacion-aspirantes.component';
import { ValidarDocsReclasificacionComponent } from './validar-docs-reclasificacion/validar-docs-reclasificacion.component';
import { ResolucionCursoFormacionComponent } from './resolucion-curso-formacion/resolucion-curso-formacion.component';
import { BuscadorEstadoAspiranteComponent } from './buscador-estado-aspirante/buscador-estado-aspirante.component';
import { ProcesoAltaCorteComponent } from './proceso-alta-corte/proceso-alta-corte.component';
import { DeclinarVacanteComponent } from './declinar-vacante/declinar-vacante.component';


@NgModule({
  declarations: [
    SeleccionAspiranteComponent,
    ResultadosPruebasComponent,
    ValidarDocsAspiranteComponent,
    RegistroVacantesComponent,
    ElegibleAltaCorteComponent,
    ResultadosCursoFormacionComponent,
    ProcesoSeleccionComponent,
    ValidarCursoFormacionComponent,
    GeneracionListaElegiblesComponent,
    GestionarVacantesComponent,
    ExclusionFraudeCumplimientoComponent,
    TablaInformacionAspirantesComponent,
    ValidarDocsReclasificacionComponent,
    ResolucionCursoFormacionComponent,
    BuscadorEstadoAspiranteComponent,
    ProcesoAltaCorteComponent,
    DeclinarVacanteComponent
  ],
  imports: [
    CommonModule,
    SeleccionAspiranteRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    TranslateModule,
    InputModule,
    DirectivesModule,
    NgMultiSelectDropDownModule.forRoot()
    // SatPopoverModule
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
  ]
})
export class SeleccionAspiranteModule { }
