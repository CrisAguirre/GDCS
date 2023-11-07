import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputDateComponent } from './input-date/input-date.component';
import { AngularMaterialModule } from '../imports/angular-material.module';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputGeneralComponent } from './input-general/input-general.component';
import { DirectivesModule } from '@app/compartido/directivas/directives.module';
import { InputSelectComponent } from './input-select/input-select.component';
import { ButtonsFotterComponent } from './buttons-fotter/buttons-fotter.component';
import { InputFileComponent } from './input-file/input-file.component';
import { InputSearchTableComponent } from './input-search-table/input-search-table.component';
import { InputSearchComponent } from './input-search/input-search.component';
import { InputSelectCustomComponent } from './input-select-custom/input-select-custom.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [InputDateComponent, InputGeneralComponent, InputSelectComponent, ButtonsFotterComponent, InputFileComponent, InputSearchTableComponent, InputSearchComponent, InputSelectCustomComponent],
  imports: [
    CommonModule,
    AngularMaterialModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    DirectivesModule,
    ScrollingModule
  ],
  exports: [InputDateComponent, InputGeneralComponent, InputSelectComponent, ButtonsFotterComponent, InputSearchTableComponent, InputSearchComponent, InputSelectCustomComponent]
})
export class InputModule { }
