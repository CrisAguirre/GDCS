import { ReporteTrasladosModel } from '@app/compartido/modelos/reportes/reporte-traslados-model';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Constants } from '@app/compartido/helpers/constants';
import { configMsg, stateConvocatoria } from '@app/compartido/helpers/enums';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { ReportModel } from '@app/compartido/modelos/reportes/report-model';
import { CommonService } from '@app/core/servicios/common.service';
import { AlertService } from '@app/core/servicios/alert.service';

@Component({
  selector: 'app-reporte-traslados',
  templateUrl: './reporte-traslados.component.html',
  styleUrls: ['./reporte-traslados.component.scss']
})
export class ReporteTrasladosComponent extends BaseController implements OnInit, AfterViewChecked {

  public idEstado: string;
  public idEmpresaT = null;
  public company: any;
  public showSelectCompany = false;

  public form: FormGroup;
  private user = this.commonService.getVar(configMsg.USER);

  @Output() emitFormOk = new EventEmitter<ReportModel>();
  @Output() emitFormBad = new EventEmitter<any>();
  @Input() reportName: string;
  @ViewChild('formV', { static: false }) formV: NgForm;

  constructor(
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private alertService: AlertService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.alertService.loading();

    this.form = this.fb.group({
      fechaInicial: new FormControl('', [Validators.required]),
      fechaFinal: new FormControl('', [Validators.required])
    });

    this.f.fechaInicial.valueChanges.subscribe(
      value => {
        this.eventFechas(value);
      }
    );

    this.f.fechaFinal.valueChanges.subscribe(
      value => {
        this.eventFechas(value);
      }
    );
    this.alertService.close();
  }

  public formValid() {
    if (this.form.valid) {
      const dataReport: ReporteTrasladosModel = Constants.initReportModel();
      dataReport.fechaInicial = this.f.fechaInicial.value;
      dataReport.fechaFinal = this.f.fechaFinal.value;
      this.emitFormOk.emit(dataReport);
    } else {
      this.emitFormBad.emit(false);
    }
  }

  public eventFechas(event: any) {
    this.formValid();
  }

  get f() {
    return this.form.controls;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

}
