import { CambiarContraseniaComponent } from './cambiar-contrasenia/cambiar-contrasenia.component';
import { DesactivarCuentaComponent } from './desactivar-cuenta/desactivar-cuenta.component';
import { CuentaComponent } from './cuenta.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CuentaUsuarioAdminComponent } from './cuenta-usuario-admin/cuenta-usuario-admin.component';


export const routesAccount: Routes = [
  {
    path: '',
    component: CuentaComponent,
    children: [
      {
        path: 'cambiar-contrasenia',
        component: CambiarContraseniaComponent
      },
      {
        path: 'cuenta-usuario',
        component: CuentaUsuarioAdminComponent
      },
      {
        path: 'desactivar-cuenta',
        component: DesactivarCuentaComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routesAccount)],
  exports: [RouterModule]
})
export class CuentaRoutingModule { }
