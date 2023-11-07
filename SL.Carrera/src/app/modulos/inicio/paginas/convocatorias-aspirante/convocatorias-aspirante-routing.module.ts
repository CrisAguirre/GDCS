import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VacantesPublicadasUsuariosComponent } from './vacantes-publicadas-usuarios/vacantes-publicadas-usuarios.component';
import { InscripcionConvocatoriaComponent } from './inscripcion-convocatoria/inscripcion-convocatoria.component';
import { ConvocatoriasAspiranteComponent } from './convocatorias-aspirante.component';
import { CargosConvocatoriaComponent } from './cargos-convocatoria/cargos-convocatoria.component';
import { MisConvocatoriasComponent } from './mis-convocatorias/mis-convocatorias.component';


export const routesConvocatoriaAspirante: Routes = [
  {
    path: '',
    component: ConvocatoriasAspiranteComponent,
    children: [
      {
        path: 'inscripcion-convocatoria',
        component: InscripcionConvocatoriaComponent
      },
      {
        path: 'cargos-convocatoria',
        component: CargosConvocatoriaComponent
      },
      {
        path: 'mis-convocatorias',
        component: MisConvocatoriasComponent
      },
      {
        path: 'opcion-sedes',
        component: VacantesPublicadasUsuariosComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routesConvocatoriaAspirante)],
  exports: [RouterModule]
})
export class ConvocatoriasAspiranteRoutingModule { }
