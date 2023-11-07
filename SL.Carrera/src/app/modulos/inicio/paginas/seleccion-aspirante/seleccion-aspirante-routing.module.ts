import { DeclinarVacanteComponent } from './declinar-vacante/declinar-vacante.component';
import { BuscadorEstadoAspiranteComponent } from './buscador-estado-aspirante/buscador-estado-aspirante.component';
import { GestionarVacantesComponent } from './gestionar-vacantes/gestionar-vacantes.component';
import { GeneracionListaElegiblesComponent } from './generacion-lista-elegibles/generacion-lista-elegibles.component';
import { ValidarCursoFormacionComponent } from './validar-curso-formacion/validar-curso-formacion.component';
import { ResultadosCursoFormacionComponent } from './resultados-curso-formacion/resultados-curso-formacion.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResultadosPruebasComponent } from './resultados-pruebas/resultados-pruebas.component';
import { ValidarDocsAspiranteComponent } from './validar-docs-aspirante/validar-docs-aspirante.component';
import { SeleccionAspiranteComponent } from './seleccion-aspirante.component';
import { RegistroVacantesComponent } from './registro-vacantes/registro-vacantes.component';
import { ElegibleAltaCorteComponent } from './elegible-alta-corte/elegible-alta-corte.component';
import { ProcesoSeleccionComponent } from './proceso-seleccion/proceso-seleccion.component';
import { ExclusionFraudeCumplimientoComponent } from './exclusion-fraude-cumplimiento/exclusion-fraude-cumplimiento.component';
import { ValidarDocsReclasificacionComponent } from './validar-docs-reclasificacion/validar-docs-reclasificacion.component';
import { ResolucionCursoFormacionComponent } from './resolucion-curso-formacion/resolucion-curso-formacion.component';
import { ProcesoAltaCorteComponent } from './proceso-alta-corte/proceso-alta-corte.component';


export const routesSeleccionAspirante: Routes = [
  {
    path: '',
    component: SeleccionAspiranteComponent,
    children: [
      {
        path: 'validar-docs-aspirante',
        component: ValidarDocsAspiranteComponent
      },
      {
        path: 'proceso-alta-corte',
        component: ProcesoAltaCorteComponent
      },
      {
        path: 'elegible-alta-corte',
        component: ElegibleAltaCorteComponent
      },
      {
        path: 'resultados-pruebas',
        component: ResultadosPruebasComponent
      },
      {
        path: 'proceso-seleccion',
        component: ProcesoSeleccionComponent
      },
      {
        path: 'resultados-curso-formacion',
        component: ResultadosCursoFormacionComponent
      },
      {
        path: 'resolucion-curso-formacion',
        component: ResolucionCursoFormacionComponent
      },
      {
        path: 'validar-curso-formacion',
        component: ValidarCursoFormacionComponent
      },
      {
        path: 'generacion-lista-elegibles',
        component: GeneracionListaElegiblesComponent
      },
      {
        path: 'registro-vacantes',
        component: RegistroVacantesComponent
      },
      {
        path: 'opcion-sedes',
        component: GestionarVacantesComponent
      },
      {
        path: 'buscador-estado-aspirante',
        component: BuscadorEstadoAspiranteComponent
      },
      {
        path: 'declinar-vacante',
        component: DeclinarVacanteComponent
      },
      {
        path: 'exclusion-fraude-cumplimiento',
        component: ExclusionFraudeCumplimientoComponent
      },
      {
        path: 'validar-docs-reclasificacion',
        component: ValidarDocsReclasificacionComponent
      }    
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routesSeleccionAspirante)],
  exports: [RouterModule]
})
export class SeleccionAspiranteRoutingModule { }
