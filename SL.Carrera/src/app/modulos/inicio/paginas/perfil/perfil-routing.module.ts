import { PerfilAdminComponent } from './perfil-admin/perfil-admin.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PerfilComponent } from './perfil.component';
import { EquivalenciasComponent } from './equivalencias/equivalencias.component';
import { PerfilInfoComponent } from './perfil-info/perfil-info.component';
import { CargosComponent } from './cargos/cargos.component';


export const routesPerfil: Routes = [
  {
    path: '',
    component: PerfilComponent,
    children: [
      {
        path: 'equivalencias',
        component: EquivalenciasComponent
      },
      {
        path: 'crear-perfil',
        component: PerfilAdminComponent
      },
      {
        path: "cargos",
        component: CargosComponent
      },
      {
        path: 'perfil-info',
        component: PerfilInfoComponent
      },
      {
        path: 'perfil-convocatoria',
        data: { perfilConvocatoria: true },
        component: PerfilAdminComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routesPerfil)],
  exports: [RouterModule]
})
export class PerfilRoutingModule { }
