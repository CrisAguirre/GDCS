import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CursoDesiertoRoutingModule } from './curso-desierto-routing.module';
import { CursoDesiertoComponent } from './curso-desierto.component';
import { DesiertoComponent } from './desierto/desierto.component';


@NgModule({
  declarations: [CursoDesiertoComponent, DesiertoComponent],
  imports: [
    CommonModule,
    CursoDesiertoRoutingModule
  ]
})
export class CursoDesiertoModule { }
