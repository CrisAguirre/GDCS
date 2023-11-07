import { Routes, RouterModule } from "@angular/router";

import { NgModule } from "@angular/core";

export const routes: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("../../../modulos/inicio/inicio.module").then(m => m.InicioModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminLayoutRoutingModule { }
