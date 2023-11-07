import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { P404Component } from "./core/error/404.component";
import { P500Component } from "./core/error/500.component";
import { AdminLayoutComponent } from "./core/layouts/admin-layout/admin-layout.component";
import { LoginGuard } from './core/guardias/login-guard.guard';
import { enableDebugTools } from '@angular/platform-browser';

const routes: Routes = [
  {
    path: "404",
    component: P404Component,
    data: {
      title: "Page 404"
    }
  },
  {
    path: "500",
    component: P500Component,
    data: {
      title: "Page 500"
    }
  },
  {
    path: 'login',
    loadChildren: () => import('./modulos/login/login-template.module').then(m => m.LoginModule),
  },
  /* {
    path: 'administrator',
    loadChildren: () => import('./modulos/login-admin/login-admin.module').then(m => m.LoginAdminModule),

  }, */
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [LoginGuard],
    canActivateChild: [LoginGuard],//para que las rutas hijas se verifiquen
    children: [
      {
        path: '',
        loadChildren: () =>
          import("./core/layouts/admin-layout/admin-layout.module").then(
            m => m.AdminLayoutModule
          )
      },
      {
        path: 'administrar-usuarios',
        loadChildren: () => import('./modulos/administrar-usuarios/administrar-usuarios.module').then(m => m.AdministrarUsuariosModule),
      },
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, enableTracing: false, })], // scrollPositionRestoration: 'enabled'
  exports: [RouterModule]
})
export class AppRoutingModule { }
