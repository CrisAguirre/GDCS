import { Component, OnInit, Input, Output, EventEmitter, forwardRef, AfterViewInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, FormGroup, ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-input-general',
  templateUrl: './input-general.component.html',
  styleUrls: ['./input-general.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputGeneralComponent),
      multi: true
    }
  ]
})
export class InputGeneralComponent extends BaseController implements OnInit, ControlValueAccessor, AfterViewInit, OnChanges {

  protected value: string;
  public isNumber: boolean = false;
  public isOnlyText: boolean = false;
  private validatorRangeNumber = false;

  @Input() label: string;
  @Input() labelTranslate: string;
  @Input() placeholder: string;
  @Input() typeField: string = 'text';//'number','onlyText'
  @Input() autocomplete: string = 'off';
  @Input() required: boolean = true;
  @Input() maxlength: number;
  @Input() controll: FormControl;
  @Input() nameControll: string;
  @Input() xform: FormGroup;
  @Input() tooltip: string;
  @Input() numMin?: string;
  @Input() numMax?: string;
  @Input() readOnly?: boolean = false;

  // @Output() valueChangesInput = new EventEmitter<any>();

  @Output() onBlurInput = new EventEmitter<string>();

  isDisabled: boolean;
  onChange = (_: any) => { }
  onTouch = () => { }


  constructor() {
    super();
  }

  ngOnInit() {
    //this.controll = <FormControl>this.xform.controls[this.nameControll];
    if (!this.placeholder) {
      if (this.label) {
        this.placeholder = this.label;
      }
    }
    if (this.typeField == 'number') {
      this.isNumber = true;
    } else if (this.typeField == 'onlyText') {
      this.isOnlyText = true;
    }

    if (!this.tooltip) {
      if (this.label) {
        this.tooltip = this.label;
      }
    }


    if (this.isNumber && (this.numMin || this.numMax)) {
      // this.controll.setValidators(this.ValidatorNumber());
      // this.controll.updateValueAndValidity();
    }

    this.controll.registerOnDisabledChange((val) => {
      if (val && this.isNumber && (this.numMin || this.numMax)) {
        this.addValidatorNumberRange();

      }
      if (this.isNumber && !val) {
        this.validatorRangeNumber = false;
      }
    });

    // this.controll.statusChanges.subscribe(res => {

    //   if (this.isNumber && (this.numMin || this.numMax)) {
    //     //console.log('statusChanges', res);
    //   }
    // });

  }

  addValidatorNumberRange() {
    this.validatorRangeNumber = true;
    this.controll.setValidators(this.controll.validator ? [this.controll.validator, this.ValidatorNumber()] : this.ValidatorNumber());
    this.controll.updateValueAndValidity();
  }

  ngOnChanges(changes: any): void {
    if (changes.numMin != "" || changes.numMax != "") {
      // this.controll.setValidators(this.ValidatorNumber({ min: changes.numMin.currentValue }));
      this.controll.setValidators(this.ValidatorNumber());
      this.controll.updateValueAndValidity();
    }
  }


  ngAfterViewInit() {
    this.controll.valueChanges.pipe(distinctUntilChanged()).subscribe(
      // this.controll.valueChanges.subscribe(
      (val) => {
        if (this.controll.value == "" || this.controll.value == null || this.controll.value == undefined) {
          this.value = "";
        }


        if (this.isNumber && (this.numMin || this.numMax)) {
          if (!this.controll.disabled && !this.validatorRangeNumber) {
            this.addValidatorNumberRange();
          }
        }

        if (this.controll.value) {
          // if (this.numMin) {
          //this.controll.updateValueAndValidity();
          // this.controll.setValidators(this.ValidatorNumber({ min: 0 }));
          // if (Number(this.numMin) > this.controll.value) {
          //   this.controll.setErrors({ numMin: "true" });
          // }
          // }
          // if (this.numMax) {
          //   if (Number(this.numMax) < this.controll.value) {
          //     this.controll.setErrors({ numMax: "true" });
          //   }
          // }
        }

        //this.onChange(val);
        // this.valueChangesInput.emit(val);
      }
    );
  }

  ValidatorNumber(prms: any = {}): ValidatorFn {
    return (control: FormControl): { [key: string]: any } => {
      let val: number = control.value;
      if (control.hasError('required') && !val) {
        return null;
      }

      if (this.numMin == "" && this.numMax == "") {
        return null;
      }

      if (this.numMin != "" && !isNaN(Number(this.numMin)) && this.numMax != "" && !isNaN(Number(this.numMax))) {
        return val < Number(this.numMin) || val > Number(this.numMax) ? { "numMin": true } : null;
      } else if (this.numMin != "" && !isNaN(Number(this.numMin))) {
        return val < Number(this.numMin) ? { "numMin": true } : null;
      } else if (this.numMax != "" && !isNaN(Number(this.numMax))) {
        return val > Number(this.numMax) ? { "numMax": true } : null;
      } else {
        return null;
      }
    };
  }

  onInput(value: string) {
    //this.value = value;
    this.onTouch();
    this.onChange(value);
    //this.valueChanges.emit(value);
  }
  writeValue(value: any): void {
    if (value) {
      this.value = value || '';
    } else {
      this.value = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }


  public onBlurInputEvent(value) {
    this.onBlurInput.emit(value);
  }

}
