import { NotificacionesComponent } from './paginas/notificaciones/notificaciones.component';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { InicioRoutingModule } from "./inicio-routing.module";
import { InicioComponent } from './paginas/inicio/inicio.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/compartido/componentes/imports/angular-material.module';
import { TranslateModule } from '@ngx-translate/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { InputModule } from '@app/compartido/componentes/input/input.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { getDutchPaginatorIntl } from '@app/compartido/helpers/paginator-intl';
import { MatPaginatorIntl } from '@angular/material';

@NgModule({
  declarations: [
    InicioComponent,
    NotificacionesComponent,
  ],
  imports: [
    CommonModule,
    InicioRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AngularMaterialModule,
    TranslateModule,
    PdfViewerModule,
    InputModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  exports: [
  ],
  providers: [
    { provide: MatPaginatorIntl, useValue: getDutchPaginatorIntl() },
  ]
  //schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InicioModule { }
