import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuentaRoutingModule } from './cuenta-routing.module';
import { CambiarContraseniaComponent } from './cambiar-contrasenia/cambiar-contrasenia.component';
import { CuentaComponent } from './cuenta.component';
import { DesactivarCuentaComponent } from './desactivar-cuenta/desactivar-cuenta.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { CuentaUsuarioAdminComponent } from './cuenta-usuario-admin/cuenta-usuario-admin.component';



@NgModule({
  declarations: [
    CuentaComponent,
    CambiarContraseniaComponent,
    DesactivarCuentaComponent,
    CuentaUsuarioAdminComponent,
  ],
  imports: [
    CommonModule,
    CuentaRoutingModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    InputModule
  ]
})
export class CuentaModule { }
