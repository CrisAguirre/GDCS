import { Component, OnInit, Input, Output, EventEmitter, forwardRef, AfterViewInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-date',
  templateUrl: './input-date.component.html',
  styleUrls: ['./input-date.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDateComponent),
      multi: true
    }
  ]
})
export class InputDateComponent extends BaseController implements OnInit, ControlValueAccessor, AfterViewInit {

  @Input() label: string;
  @Input() minDate: Date;
  @Input() maxDate: Date;
  @Input() required: boolean;
  @Input() inputModel: string;
  @Input() controll: FormControl = new FormControl();
  @Input() tooltip: string;
  // @ViewChild('inputDate', { static: false }) inputRef: ElementRef;
  //@Output() inputModelChange = new EventEmitter<string>();

  //value: string;
  isDisabled: boolean;
  onChange = (_: any) => { }
  onTouch = () => { }
  // errors: Array<any> = ['This field is required'];


  constructor() {
    super();
  }

  // val = "" // this is the updated value that the class accesses
  // set value(val) {  // this value is updated by programmatic changes 
  //   console.log('set value', val);
  //   if (val !== undefined && this.val !== val) {
  //     this.val = val
  //     this.onChange(val);
  //     this.onTouch();
  //     console.log('if', val);
  //   } else {
  //     console.log('else', val);
  //   }
  // }

  cleanValue() {
   // this.inputRef.nativeElement.value = "";
    // console.log('value', this.value);
    // this.value = '';
    // console.log('value', this.value);
    // console.log('cleanValue', this.controll);
    //this.inputRef.nativeElement.value = "";
    this.controll.setValue('');
    // [formControl]="controll"

  }

  ngOnInit() {
    //console.log(this.controll);
    if(!this.tooltip){
      if (this.label) {
        this.tooltip = this.label;
      }
    }
  }

  // ngOnChanges() {

  // }

  ngAfterViewInit() {

    // RESET the custom input form control UI when the form control is RESET
    this.controll.valueChanges.subscribe(
      () => {
        // check condition if the form control is RESET
        // console.log('valueChanges', this.controll.value);
        if (this.controll.value == "" || this.controll.value == null || this.controll.value == undefined) {
          // this.value = "";
          //this.inputRef.nativeElement.value = "";
        }
      }
    );
  }

  // textChange() {
  //   //this.inputModelChange.emit(this.inputModel);
  // }

  // onInput(value: string) {
  //   this.value = value;
  //   this.onTouch();
  //   this.onChange(this.value);
  //   console.log('onInput', value);
  //   console.log(this.controll);
  //   //reset errors 
  //   this.errors = [];
  //   //setting, resetting error messages into an array (to loop) and adding the validation messages to show below the field area
  //   // for (var key in this.controll.errors) {
  //   //   if (this.controll.errors.hasOwnProperty(key)) {
  //   //     if (key === "required") {
  //   //       this.errors.push("This field is required");
  //   //     } else {
  //   //       this.errors.push(this.controll.errors[key]);
  //   //     }
  //   //   }
  //   // }
  // }
  writeValue(value: any): void {
    // if (value) {
    //   this.value = value || '';
    // } else {
    //   this.value = '';
    // }
    // this.value = value;
    // console.log('writeValue', value);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
    // console.log('registerOnChange', fn);
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
    // console.log('registerOnTouched', fn);
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    // console.log('setDisabledState', isDisabled);
  }

}
