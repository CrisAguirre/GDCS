import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './log-in/login.component';
import { RegisterComponent } from './register/register.component';
import { LoginTemplateComponent } from './login-template.component';
import { RecoveryPasswordComponent } from './recovery-password/recovery-password.component';
import { TutorialComponent } from '@app/compartido/componentes/ayuda/tutorial/tutorial.component';

const routes: Routes = [
  {
    path: '',
    component: LoginTemplateComponent,
    children: [
      { path: '', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'recovery-password', component: RecoveryPasswordComponent },
      { path: 'administrator', component: LoginComponent, data: { administrator: true } },
      { path: 'tutorial', component: TutorialComponent },
      // {
      //   path: 'help',
      //   loadChildren: () =>
      //     import('./ayuda/ayuda-login.module').then(
      //       m => m.AyudaLoginModule
      //     )
      // },
    ]
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
