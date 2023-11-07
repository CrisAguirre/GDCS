import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CargarInformacionCursoComponent } from './cargar-informacion-curso/cargar-informacion-curso.component';
import { PublicarResultadosComponent } from './publicar-resultados/publicar-resultados.component';


const routes: Routes = [
  {
    path: 'cargar-informacion-curso', component: CargarInformacionCursoComponent,
  },
  {
    path: 'publicar-resultados', component: PublicarResultadosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultadosRoutingModule { }
