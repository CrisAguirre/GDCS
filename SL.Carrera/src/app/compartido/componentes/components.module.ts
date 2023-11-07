import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { AyudaModule } from '@app/compartido/componentes/ayuda/ayuda.module';

@NgModule({
  declarations: [ProgressBarComponent],
  imports: [
    CommonModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    InputModule,
    AyudaModule
  ],
  exports: [ProgressBarComponent],
})
export class ComponentsModule { }
