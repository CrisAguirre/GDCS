import { ConfiguracionTrasladosComponent } from './configuracion-traslados/configuracion-traslados.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdministracionComponent } from './administracion.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { ConvocatoriaComponent } from './convocatoria/convocatoria.component';
import { PerfilesComponent } from './perfiles/perfiles.component';
import { AyudaComponent } from './ayuda/ayuda.component';


const routes: Routes = [
  {
    path: '',
    component: AdministracionComponent,
    children: [
      {
        path: 'configuracion',
        component: ConfiguracionComponent
      },
      {
        path: 'convocatorias',
        component: ConvocatoriaComponent
      },
      {
        path: 'perfiles',
        component: PerfilesComponent
      },
      {
        path: 'ayuda',
        component: AyudaComponent
      },
      {
        path: 'configuracion-traslados',
        component: ConfiguracionTrasladosComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministracionRoutingModule { }
