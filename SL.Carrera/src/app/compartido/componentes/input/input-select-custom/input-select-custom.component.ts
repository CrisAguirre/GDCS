import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants } from '@app/compartido/helpers/constants';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

@Component({
  selector: 'app-input-select-custom',
  templateUrl: './input-select-custom.component.html',
  styleUrls: ['./input-select-custom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSelectCustomComponent),
      multi: true
    }
  ]

})
export class InputSelectCustomComponent extends BaseController implements OnInit, ControlValueAccessor, AfterViewInit {

  protected value: string;

  private lstAll: any;
  public lstFilter: any;
  private opcionesElement: Element;
  private itemSelected: any;


  @Input() label: string;
  @Input() required: boolean = true;
  @Input() cleanTextUnselected: boolean = true;//si es true limpia el texto si no selecciona un item de la lista
  @Input() controll: FormControl;
  @Input() tooltip: string;
  @Input() xOption: string;
  @Input() xOption2: string;
  @Input() xOptionSeparator: string = ' - ';
  @Input() xId: string;

  @Output() onBlurInput = new EventEmitter<string>();
  @Output() onSelectionChange = new EventEmitter<string>();

  @Input() set lst(value: any) {
    this.lstAll = value;
    this.lstFilter = Constants.cloneList(this.lstAll);
  }

  isDisabled: boolean;
  onChange = (_: any) => { }
  onTouch = () => { }

  constructor(private ct: CustomTranslateService) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    this.listeners();

    // const select = document.querySelector('#select');
    // const opciones = document.querySelector('#opciones');
    // const contenidoSelect = document.querySelector('#select .contenido-select');
    // const hiddenInput: any = document.querySelector('#inputSelect');

    // document.querySelectorAll('#opciones > .opcion').forEach((opcion) => {
    //   opcion.addEventListener('click', (e: any) => {
    //     e.preventDefault();
    //     contenidoSelect.innerHTML = e.currentTarget.innerHTML;
    //     select.classList.toggle('active');
    //     opciones.classList.toggle('active');
    //     hiddenInput.value = e.currentTarget.querySelector('.titulo').innerText;
    //   });
    // });


    const inputSelect = document.querySelector('#inputSelect');
    this.opcionesElement = document.querySelector('#opciones');
    inputSelect.addEventListener('click', () => {
      this.toggleOpciones();
    });

    // inputSelect.addEventListener('focusout', (e: any) => {
    //   this.toggleOpciones();
    // });

    //inputSelect.addEventListener('blur', (e: any) => {
    //this.toggleOpciones();
    //});
  }

  private listeners() {
    this.controll.valueChanges.subscribe(
      value => {
        if (!value || value === '') {
          this.lstFilter = Constants.cloneList(this.lstAll);
          return;
        }
        if (typeof value === "string") {
          const filterValue = value.toLowerCase();
          this.lstFilter = this.lstAll.filter(e => {
            const source: string = (this.getOption(e));
            return source.toLowerCase().includes(filterValue);
          });
        } else if (typeof value === "object") {
          this.itemSelected = value;
          const filterValue = this.getOption(value);
          this.lstFilter = this.lstAll.filter(e => {
            const source: string = (this.getOption(e));
            return source.toLowerCase().includes(filterValue.toLowerCase());
          });
          this.controll.setValue(this.getOption(this.controll.value));
        }
      }
    );
  }

  public selectItem(item: any) {
    this.itemSelected = item;
    this.controll.setValue(this.getOption(item));
    this.onSelectionChangeEvent(item);
    this.toggleOpciones();
  }

  public toggleOpciones() {
    this.opcionesElement.classList.toggle('active');
  }


  public onBlurInputEvent(option) {
    setTimeout(() => {
      if (this.cleanTextUnselected) {
        if (this.lstAll && this.lstAll.length > 0) {
          this.cleanControllBlur();
        }
      }
      this.onBlurInput.emit(option);
    }, 500);
  }


  private cleanControllBlur() {
    const model: string = this.controll.value;
    if (model) {
      const finded = this.lstAll.find(x => this.getOption(x).toUpperCase() === model.toUpperCase());
      if (!finded) {
        this.resetControll();
      }
    } else {
      this.resetControll();
    }
  }

  private resetControll() {
    this.controll.setValue('');
    this.onSelectionChangeEvent('');
    this.toggleOpciones();
    this.itemSelected = undefined;
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


  ngAfterViewInit() {
    // this.controll.valueChanges.subscribe(
    //   () => {
    //     if (this.controll.value == "" || this.controll.value == null || this.controll.value == undefined) {
    //       this.value = "";
    //     }
    //   }
    // );
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


  public onSelectionChangeEvent(event) {
    this.onSelectionChange.emit(event);
  }

}
