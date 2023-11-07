import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CargarInfoArchivoComponent } from './cargar-info-archivo/cargar-info-archivo.component';


const routes: Routes = [
  {
    path: 'cargar-info',
    component: CargarInfoArchivoComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarguesMasivosRoutingModule { }
