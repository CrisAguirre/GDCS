import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProduccionIntelectualComponent } from './produccion-intelectual.component';
import { RegistrarPublicacionComponent } from './registrar-publicacion/registrar-publicacion.component';


const routes: Routes = [
  {
    path: '',
    component: ProduccionIntelectualComponent,
    children: [
      {
        path: "registrar-publicacion", component: RegistrarPublicacionComponent
      },      
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProduccionIntelectualRoutingModule { }
