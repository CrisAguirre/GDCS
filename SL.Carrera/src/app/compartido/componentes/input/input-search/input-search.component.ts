import { Component, OnInit, Input, forwardRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, FormGroup } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-input-search',
  templateUrl: './input-search.component.html',
  styleUrls: ['./input-search.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSearchComponent),
      multi: true
    }
  ]
})
export class InputSearchComponent extends BaseController implements OnInit, ControlValueAccessor, AfterViewInit {

  protected value: string;
  public isNumber: boolean = false;

  @Input() label: string;
  @Input() required: boolean = true;
  @Input() cleanTextUnselected: boolean = true;//si es true limpia el texto si no selecciona un item de la lista
  @Input() controll: FormControl;
  @Input() tooltip: string;
  @Input() xOption: string;
  @Input() xOption2: string;
  @Input() xOptionSeparator: string = ' - ';
  @Input() xId: string;
  @Input() lst: any;

  @Input() displayLabel: ((value: any) => string) | null;
  @Input() filteredList: Observable<any[]>;

  @Output() onBlurInput = new EventEmitter<string>();
  @Output() onSelectionChange = new EventEmitter<string>();



  isDisabled: boolean;
  onChange = (_: any) => { }
  onTouch = () => { }


  constructor(private ct: CustomTranslateService) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    if (!this.tooltip) {
      if (this.label) {
        this.tooltip = this.label;
      }
    }
  }

  ngAfterViewInit() {
    this.controll.valueChanges.subscribe(
      () => {
        if (this.controll.value == "" || this.controll.value == null || this.controll.value == undefined) {
          this.value = "";
        }
      }
    );
  }

  onInput(value: string) {
    this.onTouch();
    this.onChange(value);
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

  public getOption(item: any) {
    let val: string = '';
    if (this.lang != '' && item[this.xOption + this.lang]) {
      val = item[this.xOption + this.lang];
    } else {
      val = item[this.xOption];
    }
    if (this.xOption2) {
      if (this.lang != '' && item[this.xOption2 + this.lang]) {
        val += this.xOptionSeparator + item[this.xOption2 + this.lang];
      } else {
        val += this.xOptionSeparator + item[this.xOption2];
      }
    }
    return val;
  }


  public onBlurInputEvent(option) {
    setTimeout(() => {
      if (this.cleanTextUnselected) {
        if (this.lst && this.lst.length > 0) {
          if (this.lang != '') {
            const model: any = this.controll.value;
            if (model[this.xOption + this.lang]) {
              const finded = this.lst.find(x => String(x[this.xOption + this.lang]) === String(model[this.xOption + this.lang]));
              if (!finded) {
                this.controll.setValue('');
              }
            } else {
              this.cleanControllBlur();
            }
          } else {
            this.cleanControllBlur();
          }
        }
      }
      this.onBlurInput.emit(option);
    }, 500);
  }

  private cleanControllBlur() {
    const model: any = this.controll.value;
    if (model[this.xOption]) {
      const finded = this.lst.find(x => String(x[this.xOption]) === model[this.xOption]);
      if (!finded) {
        this.controll.setValue('');
      }
    } else {
      this.controll.setValue('');
    }
  }


  public onSelectionChangeEvent(event) {
    this.onSelectionChange.emit(event);
  }



}

