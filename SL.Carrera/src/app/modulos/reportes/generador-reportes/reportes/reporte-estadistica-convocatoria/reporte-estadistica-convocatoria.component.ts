import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants } from '@app/compartido/helpers/constants';
import { configMsg, stateConvocatoria } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Empresa } from '@app/compartido/modelos/empresa';
import { RptEstadisticaConvocatoriaModel } from '@app/compartido/modelos/reportes/rpt-id-convocatoria-model';
import { ReportModel } from '@app/compartido/modelos/reportes/report-model';
import { AlertService } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { TYPES } from '../../../../../core/servicios/alert.service';

@Component({
  selector: 'app-reporte-estadistica-convocatoria',
  templateUrl: './reporte-estadistica-convocatoria.component.html',
  styleUrls: ['./reporte-estadistica-convocatoria.component.scss']
})
export class ReporteEstadisticaConvocatoriaComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstConvocatoria: Convocatoria[] = [];
  public lstEmpresa: Empresa[] = [];
  public idEmpresaT = null;
  public company: any;
  public showSelectCompany = false;
  public dataConvocatory: Convocatoria;
  public lstConvocatoriaAux: Convocatoria[] = [];

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
    private convocatoryServices: ConvocatoriaService,
    private empresaService: EmpresaService,
    private ct: CustomTranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.alertService.loading();
    this.loadData().then(() => this.alertService.close());

    this.form = this.fb.group({
      idConvocatoria: new FormControl('', [Validators.required]),
      fechaInicio: new FormControl('', [Validators.required]),
      fechaFin: new FormControl('', [Validators.required]),
    });
    this.company = new FormControl('');

    this.f.fechaInicio.valueChanges.subscribe(val => this.formValid(val));
    this.f.fechaFin.valueChanges.subscribe(val => this.formValid(val));
  }

  public async loadData() {
    this.company = null;
    this.idEmpresaT = null;
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      this.lstEmpresa = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
    } else {
      this.showSelectCompany = false;
      this.idEmpresaT = this.user.idEmpresa;
      this.loadDataEmpresa(this.idEmpresaT);
    }
  }

  public async loadConvocatoriasByEmpresa(empresaEvent: any) {

    this.lstConvocatoria = [];
    this.lstConvocatoriaAux = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(empresaEvent.value).toPromise() as any).datos as Convocatoria[];
    if (this.lstConvocatoriaAux.length > 0) {
      this.lstConvocatoriaAux.forEach(g => {
        if (g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
          g.estadoConvocatoria === stateConvocatoria.CERRADA ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
          this.lstConvocatoria.push(g);
        }
      });
    }
  }

  public async loadDataEmpresa(empresa: string) {
    this.lstConvocatoria = [];
    const lstConvocatoriaAux = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(empresa).toPromise() as any).datos as Convocatoria[];
    if (lstConvocatoriaAux.length > 0) {
      lstConvocatoriaAux.forEach(g => {
        if (g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
          this.lstConvocatoria.push(g);
        }
      });
    }
  }

  public formValid(val) {
    if (val && this.form.valid) {
      const dataReport: RptEstadisticaConvocatoriaModel = Constants.initReportModel();
      dataReport.idConvocatoria = this.f.idConvocatoria.value;
      dataReport.fechaInicio = this.f.fechaInicio.value;
      dataReport.fechaFin = this.f.fechaFin.value;
      this.emitFormOk.emit(dataReport);
    } else {
      this.emitFormBad.emit(false);
    }
  }

  public eventConvocatoria(event: any) {
    this.formValid(event.value);
    this.dataConvocatory = this.lstConvocatoriaAux.find((x: any) => x.id === this.f.idConvocatoria.value);

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  get f() {
    return this.form.controls;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
}
