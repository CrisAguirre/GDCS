import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdministrarUsuariosComponent } from './administrar-usuarios.component';
import { RolUsuarioEmpresaComponent } from './rol-usuario-empresa/rol-usuario-empresa.component';
import { CrearUsuariosComponent } from './crear-usuarios/crear-usuarios.component';
import { ClonarRolComponent } from './clonar-rol/clonar-rol.component';
import { RolesVistaComponent } from './roles-vista/roles-vista.component';
import { VistaComponent } from './vista/vista.component';
import { UsuariosComponent } from './usuarios/usuarios.component';


export const routesAdminUsuarios: Routes = [
  {
    path: '',
    component: AdministrarUsuariosComponent,
    children: [
      {
        path: 'crear-usuarios-administrativos', component: CrearUsuariosComponent
      },
      {
        path: 'rol-usuario-empresa', component: RolUsuarioEmpresaComponent
      },
      {
        path: 'vista', component: VistaComponent
      },
      {
        path: 'clonar-rol', component: ClonarRolComponent
      },
      {
        path: 'gestionar-usuarios', component: UsuariosComponent
      },
      {
        path: 'roles-vista', component: RolesVistaComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routesAdminUsuarios)],
  exports: [RouterModule]
})
export class AdministrarUsuariosRoutingModule { }
