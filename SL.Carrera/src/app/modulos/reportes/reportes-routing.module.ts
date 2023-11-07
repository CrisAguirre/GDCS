import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeneradorReportesComponent } from './generador-reportes/generador-reportes.component';
import { GestionarReportesComponent } from './gestionar-reportes/gestionar-reportes.component';


const routes: Routes = [
  {
    path: 'generador-reportes',
    component: GeneradorReportesComponent
  },
  {
    path: 'gestionar-reportes',
    component: GestionarReportesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesRoutingModule { }
