import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrarUsuariosRoutingModule } from './administrar-usuarios-routing.module';
import { AdministrarUsuariosComponent } from './administrar-usuarios.component';
import { RolUsuarioEmpresaComponent } from './rol-usuario-empresa/rol-usuario-empresa.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { DirectivesModule } from '@app/compartido/directivas/directives.module';
import { ComponentsModule } from '@app/compartido/componentes/components.module';
import { CrearUsuariosComponent } from './crear-usuarios/crear-usuarios.component';
import { ClonarRolComponent } from './clonar-rol/clonar-rol.component';
import { VistaComponent } from './vista/vista.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { RolesVistaComponent } from './roles-vista/roles-vista.component';
import { DialogRolVistaComponent } from '@app/compartido/componentes/dialog-rol-vista/dialog-rol-vista.component';
import { TableRolVistaComponent } from '@app/compartido/componentes/table-rol-vista/table-rol-vista.component';


@NgModule({
  declarations: [
    AdministrarUsuariosComponent,
    RolUsuarioEmpresaComponent,
    CrearUsuariosComponent,
    ClonarRolComponent,
    VistaComponent,
    UsuariosComponent,
    RolesVistaComponent,
    DialogRolVistaComponent,
    RolesVistaComponent,
    TableRolVistaComponent
  ],
  imports: [
    CommonModule,
    AdministrarUsuariosRoutingModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    InputModule,
    DirectivesModule,
    ComponentsModule,
  ],
  entryComponents: [DialogRolVistaComponent , TableRolVistaComponent]
})
export class AdministrarUsuariosModule { }
