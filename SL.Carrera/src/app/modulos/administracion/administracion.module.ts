import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdministracionRoutingModule } from './administracion-routing.module';
import { AdministracionComponent } from './administracion.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NivelEstudioAdminComponent } from './configuracion/componentes/nivel-estudio-admin/nivel-estudio-admin.component';
import { ConfiguracionAdminComponent } from './configuracion/componentes/configuracion-admin/configuracion-admin.component';
import { SectorExperienciaAdminComponent } from './configuracion/componentes/sector-experiencia-admin/sector-experiencia-admin.component';
import { ActividadPersonalAdminComponent } from './configuracion/componentes/actividad-personal-admin/actividad-personal-admin.component';
import { AreaConocimientoAdminComponent } from './configuracion/componentes/area-conocimiento-admin/area-conocimiento-admin.component';
import { FrecuenciaActividadAdminComponent } from './configuracion/componentes/frecuencia-actividad-admin/frecuencia-actividad-admin.component';
import { InstitucionAdminComponent } from './configuracion/componentes/institucion-admin/institucion-admin.component';
import { TranslateModule } from '@ngx-translate/core';
import { TipoArchivoAnexoAdminComponent } from './configuracion/componentes/tipo-archivo-anexo-admin/tipo-archivo-anexo-admin.component';
import { ConvocatoriaComponent } from './convocatoria/convocatoria.component';
import { TipoCursoAdminComponent } from './configuracion/componentes/tipo-curso-admin/tipo-curso-admin.component';
import { TipoConvocatoriaAdminComponent } from './convocatoria/tipo-convocatoria-admin/tipo-convocatoria-admin.component';
import { ActividadConvocatoriaAdminComponent } from './convocatoria/actividad-convocatoria-admin/actividad-convocatoria-admin.component';
import { TipoDocumentoAdminComponent } from './configuracion/componentes/tipo-documento-admin/tipo-documento-admin.component';
import { TipoLugarAdminComponent } from './convocatoria/tipo-lugar-admin/tipo-lugar-admin.component';
import { TipoSedeAdminComponent } from './convocatoria/tipo-sede-admin/tipo-sede-admin.component';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatPaginatorIntl, DateAdapter, MAT_DATE_FORMATS, MatToolbarModule, MatTableModule } from '@angular/material';
import { TipoAdicionalComponent } from './convocatoria/tipo-adicional/tipo-adicional.component';
import { TipoCalificacionComponent } from './convocatoria/tipo-calificacion/tipo-calificacion.component';
import { TipoPruebaComponent } from './convocatoria/tipo-prueba/tipo-prueba.component';
import { TipoEtapaComponent } from './convocatoria/tipo-etapa/tipo-etapa.component';
import { TipoSubEtapaComponent } from './convocatoria/tipo-sub-etapa/tipo-sub-etapa.component';
import { ComponentsModule } from '@app/compartido/componentes/components.module';
import { EstadoAspiranteComponent } from './convocatoria/estado-aspirante/estado-aspirante.component';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { DiscapacidadComponent } from './configuracion/componentes/tipo-discapacidad-admin/tipo-discapacidad-admin.component';
import { TituloObtenidoAdminComponent } from './configuracion/componentes/titulo-obtenido-admin/titulo-obtenido-admin.component';
import { TipoAjusteAcuerdoComponent } from './convocatoria/tipo-ajuste-acuerdo/tipo-ajuste-acuerdo.component';
import { PerfilesComponent } from './perfiles/perfiles.component';
import { TipoGrupoComponent } from './perfiles/tipo-grupo/tipo-grupo.component';
import { TipoFuncionComponent } from './perfiles/tipo-funcion/tipo-funcion.component';
import { CompetenciaRequeridaComponent } from './perfiles/competencia-requerida/competencia-requerida.component';
import { ServicioCargosComponent } from './perfiles/servicio-cargos/servicio-cargos.component';
import { TipoCargoComponent } from './convocatoria/tipo-cargo/tipo-cargo.component';
import { AppDateAdapter, APP_DATE_FORMATS } from '@app/compartido/helpers/format-datepicker';
import { TipoDependenciaLugarComponent } from './convocatoria/tipo-dependencia-lugar/tipo-dependencia-lugar.component';
import { TutorialAdminComponent } from './ayuda/tutorial-admin/tutorial-admin.component';
import { ManualAdminComponent } from './ayuda/manual-admin/manual-admin.component';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { CategoriaPublicacionAdminComponent } from './configuracion/componentes/categoria-publicacion-admin/categoria-publicacion-admin.component';
import { TipoFaseComponent } from './convocatoria/tipo-fase/tipo-fase.component';
import { EstadoAspiranteAdminComponent } from './configuracion/componentes/estado-aspirante-admin/estado-aspirante-admin.component';
import { TipoCategoriaAdmitidoComponent } from './convocatoria/tipo-categoria-admitido/tipo-categoria-admitido.component';
import { getDutchPaginatorIntl } from '@app/compartido/helpers/paginator-intl';
import { AyudaComponent } from './ayuda/ayuda.component';
import { PreguntasFrecuentesAdminComponent } from './ayuda/preguntas-frecuentes-admin/preguntas-frecuentes-admin.component';
import { UbicacionComponent } from './configuracion/componentes/ubicacion/ubicacion.component';
import { ConfiguracionTrasladosComponent } from './configuracion-traslados/configuracion-traslados.component';
import { TipoTrasladoComponent } from './configuracion-traslados/componentes/tipo-traslado/tipo-traslado.component';
import { TipoDocumentoTrasladoComponent } from './configuracion-traslados/componentes/tipo-documento-traslado/tipo-documento-traslado.component';
import { ConfiguracionTrasladoComponent } from './configuracion-traslados/componentes/configuracion-traslado/configuracion-traslado.component';
import { CalendarioComponent } from './configuracion/componentes/calendario/calendario.component';
import { SoporteTrasladoComponent } from './configuracion-traslados/componentes/soporte-traslado/soporte-traslado.component';
import { TipoExperienciaLaboralComponent } from './configuracion/componentes/tipo-experiencia-laboral/tipo-experiencia-laboral.component';


@NgModule({
  declarations:
    [AdministracionComponent,
      ConfiguracionComponent,
      NivelEstudioAdminComponent,
      SectorExperienciaAdminComponent,
      ConfiguracionAdminComponent,
      ActividadPersonalAdminComponent,
      AreaConocimientoAdminComponent,
      FrecuenciaActividadAdminComponent,
      InstitucionAdminComponent,
      TipoArchivoAnexoAdminComponent,
      ConvocatoriaComponent,
      ActividadConvocatoriaAdminComponent,
      TipoConvocatoriaAdminComponent,
      TipoCursoAdminComponent,
      TipoDocumentoAdminComponent,
      TipoLugarAdminComponent,
      TipoSedeAdminComponent,
      TipoAdicionalComponent,
      TipoCalificacionComponent,
      TipoPruebaComponent,
      TipoEtapaComponent,
      TipoSubEtapaComponent,
      EstadoAspiranteComponent,
      DiscapacidadComponent,
      TituloObtenidoAdminComponent,
      TipoAjusteAcuerdoComponent,
      PerfilesComponent,
      TipoGrupoComponent,
      TipoFuncionComponent,
      CompetenciaRequeridaComponent,
      TipoCargoComponent,
      TipoDependenciaLugarComponent,
      ServicioCargosComponent,
      TutorialAdminComponent,
      ManualAdminComponent,
      PreguntasFrecuentesAdminComponent,
      CategoriaPublicacionAdminComponent,
      TipoFaseComponent,
      EstadoAspiranteAdminComponent,
      TipoCategoriaAdmitidoComponent,
      AyudaComponent,
      UbicacionComponent,
      ConfiguracionTrasladosComponent,
      TipoTrasladoComponent,
      TipoDocumentoTrasladoComponent,
      ConfiguracionTrasladoComponent,
      CalendarioComponent,
      SoporteTrasladoComponent,
      TipoExperienciaLaboralComponent
    ],
  imports: [
    CommonModule,
    AdministracionRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialFileInputModule,
    AngularMaterialModule,
    ComponentsModule,
    InputModule,
    MatToolbarModule,
    MatTableModule,
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, } },
    { provide: MatPaginatorIntl, useValue: getDutchPaginatorIntl() },
    //MatDatepickerModule,
    DatePipe,
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  entryComponents: [
    //ProgressBarComponent
  ],
})
export class AdministracionModule { }
