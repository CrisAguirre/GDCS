import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants } from '@app/compartido/helpers/constants';
import { ReportModel } from '@app/compartido/modelos/reportes/report-model';
import { UsuariosReportModel } from '@app/compartido/modelos/reportes/usuarios-report-model';

@Component({
  selector: 'app-reporte-base',
  templateUrl: './reporte-base.component.html',
  styleUrls: ['./reporte-base.component.scss']
})
export class ReporteBaseComponent extends BaseController implements OnInit, AfterViewChecked {

  public form: FormGroup;

  @Output() emitFormOk = new EventEmitter<ReportModel>();
  @Output() emitFormBad = new EventEmitter<any>();
  @ViewChild('formV', { static: false }) formV: NgForm;

  constructor(
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        nombre: new FormControl('', [Validators.required]),
      }
    );

    this.f.nombre.valueChanges.subscribe(val => this.formValid(val));
  }


  public formValid(val) {
    if (val && this.form.valid) {
      const dataReport: UsuariosReportModel = Constants.initReportModel();
      dataReport.idUsuario = this.f.nombre.value;
      dataReport.idConvocatoria = '';
      dataReport.dataSetName = 'DSCarrera';

      this.emitFormOk.emit(dataReport);
    } else {
      this.emitFormBad.emit(false);
    }
  }

  get f() {
    return this.form.controls;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
}
