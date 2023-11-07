import { Component, OnInit, Input, forwardRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, FormGroup } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

@Component({
  selector: 'app-input-select',
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSelectComponent),
      multi: true
    }
  ]
})
export class InputSelectComponent extends BaseController implements OnInit, ControlValueAccessor, AfterViewInit {

  protected value: string;
  public isNumber: boolean = false;

  @Input() label: string;
  @Input() required: boolean = true;
  @Input() controll: FormControl;
  @Input() tooltip: string;
  @Input() xOption: string;
  @Input() xOption2: string;
  @Input() xOptionSeparator: string = ' - ';
  @Input() xId: string;
  @Input() lst: any;
  @Input() optionNone: boolean = true;//para mostrar la opcion de ninguno
  @Input() optionNoneLabel: string = 'lbl.seleccioneUnaOpcion';//para mostrar la opcion de ninguno

  @Output() eventEmmitter = new EventEmitter<string>();


  isDisabled: boolean;
  onChange = (_: any) => { }
  onTouch = () => { }


  constructor(private ct: CustomTranslateService) {
    super();
    this.lang = this.ct.getLangDefault().langBd;//{{item['attr'+lang]}}
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

  public selectEvent(event: any) {
    this.eventEmmitter.emit(event);
  }

  public getOption(item: any) {
    let val: string = '';
    if (this.lang != '' && item[this.xOption + this.lang]) {
      val = item[this.xOption + this.lang];
    } else {
      val = item[this.xOption];
    }
    if (this.xOption2) {
      val += this.xOptionSeparator + item[this.xOption2];
    }
    return val;
  }

}
