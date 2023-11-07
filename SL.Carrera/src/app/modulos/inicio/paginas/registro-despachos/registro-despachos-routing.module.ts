import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistroDespachosComponent } from './registro-despachos.component';
import { DespachosComponent } from './despachos/despachos.component';


const routes: Routes = [
  {
    path: '',
    component: RegistroDespachosComponent,
    children: [
      {
        path: 'despachos',
        component: DespachosComponent
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistroDespachosRoutingModule { }
