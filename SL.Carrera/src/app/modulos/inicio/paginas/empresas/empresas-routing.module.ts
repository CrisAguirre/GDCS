import { CrearEmpresaComponent } from './crear-empresa/crear-empresa.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmpresasComponent } from './empresas.component';


export const routesEmpresa: Routes = [
  {
    path: '',
    component: EmpresasComponent,
    children: [
      {
        path: 'crear-entidad',
        component: CrearEmpresaComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routesEmpresa)],
  exports: [RouterModule]
})
export class EmpresasRoutingModule { }
