import { TrasladosInfoComponent } from './traslados-info/traslados-info.component';
import { GestionarTrasladoComponent } from './gestionar-traslado/gestionar-traslado.component';
import { TrasladosComponent } from './traslados.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


export const routesTraslados: Routes = [
  {
    path: '',
    component: TrasladosComponent,
    children: [
      {
        path: 'gestionar-traslado',
        component: GestionarTrasladoComponent
      },
      {
        path: 'informacion-traslados',
        component: TrasladosInfoComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routesTraslados)],
  exports: [RouterModule]
})
export class TrasladosRoutingModule { }
