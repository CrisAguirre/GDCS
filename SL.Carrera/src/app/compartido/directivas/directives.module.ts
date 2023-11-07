import { NgModule } from '@angular/core';
import { DigitOnlyDirective } from './digit-only.directive';
import { NumericDirective } from './numeric.directive';
import { OnlyTextDirective } from './only-text.directive';

@NgModule({
  imports: [],
  declarations: [DigitOnlyDirective, NumericDirective, OnlyTextDirective],
  exports: [DigitOnlyDirective, NumericDirective, OnlyTextDirective],
})

export class DirectivesModule { }
