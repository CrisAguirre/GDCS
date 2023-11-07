import { VacanteDesiertaModel } from './../../../../../compartido/modelos/reportes/vacante-desierta-model';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { configMsg, stateConvocatoria } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Empresa } from '@app/compartido/modelos/empresa';
import { ReportModel } from '@app/compartido/modelos/reportes/report-model';
import { AlertService } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { Constants } from '@app/compartido/helpers/constants';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { TYPES } from '../../../../../core/servicios/alert.service';

@Component({
  selector: 'app-reporte-vacante-desierta',
  templateUrl: './reporte-vacante-desierta.component.html',
  styleUrls: ['./reporte-vacante-desierta.component.scss']
})
export class ReporteVacanteDesiertaComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstConvocatoria: Convocatoria[] = [];
  public lstConvocatoriaAux: Convocatoria[] = [];
  public lstEmpresa: Empresa[] = [];
  public idEstado: string;
  public idEmpresaT = null;
  public company: any;
  public showSelectCompany = false;
  public dataConvocatory: Convocatoria;

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
      idConvocatoria: new FormControl('', [Validators.required])
    });
    this.company = new FormControl('');
  }

  public async loadData() {
    this.company = null;
    this.idEmpresaT = null;
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      this.lstEmpresa = (<any>await this.empresaService.getListarEmpresas().toPromise()).datos;
    } else {
      this.showSelectCompany = false;
      this.idEmpresaT = this.user.idEmpresa;
      this.loadDataEmpresa(this.idEmpresaT);
    }
  }

  public async loadEmpresa(empresa: any) {
    this.lstConvocatoria = [];
    this.lstConvocatoriaAux = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(empresa.value).toPromise()).datos;
    if (this.lstConvocatoriaAux.length > 0) {
      this.lstConvocatoriaAux.forEach(g => {
        if (g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES ||
          g.estadoConvocatoria === stateConvocatoria.CERRADA) {
          this.lstConvocatoria.push(g);
        }
      });
    }
  }

  public async loadDataEmpresa(empresa: string) {
    this.lstConvocatoria = [];
    this.lstConvocatoriaAux = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(empresa).toPromise()).datos;
    if (this.lstConvocatoriaAux.length > 0) {
      this.lstConvocatoriaAux.forEach(g => {
        if (g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES ||
          g.estadoConvocatoria === stateConvocatoria.CERRADA) {
          this.lstConvocatoria.push(g);
        }
      });
    }
  }

  public formValid(val) {
    if (val && this.form.valid) {
      const dataReport: VacanteDesiertaModel = Constants.initReportModel();
      dataReport.idConvocatoria = this.f.idConvocatoria.value;
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
