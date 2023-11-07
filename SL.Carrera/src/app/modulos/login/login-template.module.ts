import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-template-routing.module';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
import { LoginComponent } from './log-in/login.component';
import { LoginTemplateComponent } from './login-template.component';
import { RegisterComponent } from './register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RecoveryPasswordComponent } from './recovery-password/recovery-password.component';
import { TranslateModule } from '@ngx-translate/core';
import { TraductionComponent } from '@app/core/traduction/traduction.component';
import { CoreModule } from '@app/core/core.module';
import { PoliticaPrivacidadComponent } from '../../compartido/componentes/politica-privacidad/politica-privacidad.component';
import { RecaptchaModule, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { DialogEmpresaLoginComponent } from '@app/compartido/componentes/dialog-empresa-login/dialog-empresa-login.component';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import {AyudaSelectComponent} from './ayuda-select/ayuda-select.component';
import {TutorialComponent} from '@app/compartido/componentes/ayuda/tutorial/tutorial.component';
import { ComponentsModule } from '@app/compartido/componentes/components.module';

@NgModule({
  declarations: [
    LoginComponent,
    LoginTemplateComponent,
    RegisterComponent,
    RecoveryPasswordComponent,
    PoliticaPrivacidadComponent,
    DialogEmpresaLoginComponent,
    AyudaSelectComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    AngularMaterialModule,
    CoreModule,
    RecaptchaModule,
    ComponentsModule
  ],
  entryComponents: [
    TraductionComponent,
    PoliticaPrivacidadComponent,
    DialogEmpresaLoginComponent,
    TutorialComponent
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, } },
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6Lev7qMZAAAAAGIu0IP7UjlyEDbh5lMmRko2EKhD' },
  ]
})
export class LoginModule { }
