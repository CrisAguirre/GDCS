import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FaqComponent } from '@app/compartido/componentes/ayuda/faq/faq.component';
import { TutorialComponent } from '@app/compartido/componentes/ayuda/tutorial/tutorial.component';
import { ManualComponent } from '@app/compartido/componentes/ayuda/manual/manual.component';

const routes: Routes = [
  {
    path: 'tutorial', component: TutorialComponent,
  },
  {
    path: 'faq', component: FaqComponent,
  },
  {
    path: 'manual', component: ManualComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AyudaLoginRoutingModule { }
