import { Component, OnInit, Input, forwardRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';

@Component({
  selector: 'app-buttons-fotter',
  templateUrl: './buttons-fotter.component.html',
  styleUrls: ['./buttons-fotter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonsFotterComponent),
      multi: true
    }
  ]
})
export class ButtonsFotterComponent extends BaseController implements OnInit, ControlValueAccessor, AfterViewInit {

  @Input() showBtnAccept: boolean;
  @Input() showBtnCancel: boolean;
  @Input() submit: boolean = true;
  @Input() labelBtnAccept: string = 'btn.guardar';
  @Input() labelBtnCancel: string = 'btn.limpiar';
  @Input() iconAccept: string = 'save';
  @Input() iconCancel: string = 'clear_all';
  @Input() controll: FormControl;

  @Output() eventEmmitterAccept = new EventEmitter<string>();
  @Output() eventEmmitterCancel = new EventEmitter<string>();


  isDisabled: boolean;
  onChange = (_: any) => { }
  onTouch = () => { }


  constructor() {
    super();
  }

  ngOnInit() {

  }

  ngAfterViewInit() {

  }

  onInput(value: string) {
    this.onTouch();
    this.onChange(value);
  }
  writeValue(value: any): void {
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

  public clickAccept(event: any) {
    this.eventEmmitterAccept.emit(event);
  }

  public clickCancel(event: any) {
    this.eventEmmitterCancel.emit(event);
  }

}

