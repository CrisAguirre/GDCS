import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqComponent } from '@app/compartido/componentes/ayuda/faq/faq.component';
import { TutorialComponent } from '@app/compartido/componentes/ayuda/tutorial/tutorial.component';
import { ManualComponent } from '@app/compartido/componentes/ayuda/manual/manual.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMaterialModule } from '../imports/angular-material.module';
import { PipesModule } from '@app/compartido/pipe/pipes.module';

@NgModule({
  declarations: [FaqComponent, ManualComponent, TutorialComponent],
  imports: [
    FormsModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    PipesModule
  ],
  entryComponents: [
    FaqComponent, ManualComponent, TutorialComponent
  ]
})
export class AyudaModule { }
