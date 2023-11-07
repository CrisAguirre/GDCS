import { CitacionPruebasComponent } from './citacion-pruebas/citacion-pruebas.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConvocatoriaComponent } from './convocatoria.component';
import { CronogramaComponent } from './cronograma/cronograma.component';
import { CrearSeccionesComponent } from './crear-secciones/crear-secciones.component';
import { CrearSubseccionesComponent } from './crear-subsecciones/crear-subsecciones.component';
import { EtapasComponent } from './etapas/etapas.component';
import { AdicionalComponent } from './adicional/adicional.component';
import { ConvocatoriaAdminComponent } from './convocatoria-admin/convocatoria-admin.component';
import { PdfComponent } from './pdf/pdf.component';
import { ResumenComponent } from './resumen/resumen.component';
import { AclaracionesModificacionesComponent } from './aclaraciones-modificaciones/aclaraciones-modificaciones.component';
import { ConvocatoriaInfoComponent } from './convocatoria-info/convocatoria-info.component';
import { FasePruebaComponent } from './fase-prueba/fase-prueba.component';
import { PresentacionPruebasComponent } from './presentacion-pruebas/presentacion-pruebas.component';
import { RequisitosConvocatoriaComponent } from './requisitos-convocatoria/requisitos-convocatoria.component';
import { InscripcionVacantesComponent } from './inscripcion-vacantes/inscripcion-vacantes.component';
import { OpcionesRecalificacionComponent } from './opciones-recalificacion/opciones-recalificacion.component';




export const routesConvocatory: Routes = [
  {
    path: '',
    component: ConvocatoriaComponent,
    children: [
      {
        path: 'convocatoria-info', component: ConvocatoriaInfoComponent
      },
      {
        path: 'crear-convocatoria',
        component: ConvocatoriaAdminComponent,
      },
      {
        path: 'cronograma',
        component: CronogramaComponent
      },
      {
        path: 'crear-secciones',
        component: CrearSeccionesComponent
      },
      {
        path: 'crear-subsecciones',
        component: CrearSubseccionesComponent
      },
      {
        path: 'fase-pruebas',
        component: FasePruebaComponent
      },
      {
        path: 'presentacion-pruebas',
        component: PresentacionPruebasComponent
      },
      {
        path: 'etapas',
        component: EtapasComponent
      },
      {
        path: 'adicional',
        component: AdicionalComponent
      },
      {
        path: 'resumen',
        component: ResumenComponent
      },
      {
        path: 'pdf',
        component: PdfComponent
      },
      {
        path: 'aclaraciones-modificaciones',
        component: AclaracionesModificacionesComponent
      },
      {
        path: 'citacion-pruebas',
        component: CitacionPruebasComponent
      },
      {
        path: 'requisitos-convocatoria',
        component: RequisitosConvocatoriaComponent
      },      
      {
        path: 'opciones-reclasificacion',
        component: OpcionesRecalificacionComponent
      },
      {
        path: 'inscripcion-vacantes',
        component: InscripcionVacantesComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routesConvocatory)],
  exports: [RouterModule]
})
export class ConvocatoriaRoutingModule { }
