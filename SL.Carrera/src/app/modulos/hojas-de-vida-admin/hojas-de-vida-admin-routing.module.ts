import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BancoHojaDeVidaComponent } from './banco-hoja-de-vida/banco-hoja-de-vida.component';


const routes: Routes = [
  {
    path: 'banco-hoja-de-vida', component: BancoHojaDeVidaComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HojasDeVidaAdminRoutingModule { }
