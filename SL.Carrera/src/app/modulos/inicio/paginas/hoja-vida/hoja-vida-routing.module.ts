import { ProduccionIntelectualComponent } from './produccion-intelectual/produccion-intelectual.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HojaVidaComponent } from './hoja-vida.component';
import { DatosPersonalesComponent } from './datos-personales/datos-personales.component';
import { InformacionFamiliarComponent } from './informacion-familiar/informacion-familiar.component';
import { ActividadesPersonalesComponent } from './actividades-personales/actividades-personales.component';
import { ExperienciaLaboralComponent } from './experiencia-laboral/experiencia-laboral.component';
import { InformacionAcademicaComponent } from './informacion-academica/informacion-academica.component';
import { ResumenComponent } from './resumen/resumen.component';
import { AnexosComponent } from './anexos/anexos.component';



const routes: Routes = [
  {
    path: '',
    component: HojaVidaComponent,
    children: [
      {
        path: 'datos-personales',
        component: DatosPersonalesComponent
      },
      {
        path: 'informacion-familiar',
        component: InformacionFamiliarComponent
      },
      {
        path: 'actividades-personales',
        component: ActividadesPersonalesComponent
      },
      {
        path: 'experiencia-laboral',
        component: ExperienciaLaboralComponent
      },
      {
        path: 'informacion-academica',
        component: InformacionAcademicaComponent
      },
      {
        path: 'resumen-hoja-de-vida',
        component: ResumenComponent
      },
      {
        path: 'anexo',
        component: AnexosComponent
      },
      {
        path: '',
        redirectTo: '/cv/datos-personales',
        pathMatch: 'full'
      },
      {
        path: 'produccion-intelectual',
        component: ProduccionIntelectualComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HojaVidaRoutingModule { }
