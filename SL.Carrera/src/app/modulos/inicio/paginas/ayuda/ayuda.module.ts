import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AyudaRoutingModule } from './ayuda-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { FaqComponent } from '@app/compartido/componentes/ayuda/faq/faq.component';
import { TutorialComponent } from '@app/compartido/componentes/ayuda/tutorial/tutorial.component';
import { ManualComponent } from '@app/compartido/componentes/ayuda/manual/manual.component';
import { PipesModule } from '@app/compartido/pipe/pipes.module';
import { ComponentsModule } from '@app/compartido/componentes/components.module';


@NgModule({
  declarations: [  ],
  imports: [
    FormsModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MaterialFileInputModule,
    AyudaRoutingModule,
    PipesModule,
    ComponentsModule
  ],
  entryComponents: [
    TutorialComponent,
    ManualComponent,
    FaqComponent
  ]
})
export class AyudaModule { }
