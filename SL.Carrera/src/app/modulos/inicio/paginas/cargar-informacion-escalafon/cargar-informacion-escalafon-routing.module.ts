import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InfoEscalafonComponent } from './info-escalafon/info-escalafon.component';
import { CargarInformacionEscalafonComponent } from './cargar-informacion-escalafon.component';


const routes: Routes = [
  {
    path: '',
    component: CargarInformacionEscalafonComponent,
    children: [
      {
        path: 'info-escalafon',
        component: InfoEscalafonComponent
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CargarInformacionEscalafonRoutingModule { }
