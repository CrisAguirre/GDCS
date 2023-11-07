import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants } from '@app/compartido/helpers/constants';
import { configMsg, stateConvocatoria } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Empresa } from '@app/compartido/modelos/empresa';
import { PreseleccionadoModel } from '@app/compartido/modelos/reportes/preseleccionados-model';
import { ReportModel } from '@app/compartido/modelos/reportes/report-model';
import { AlertService } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { TYPES } from '../../../../../core/servicios/alert.service';

@Component({
  selector: 'app-reporte-inscritos-altas-cortes',
  templateUrl: './reporte-inscritos-altas-cortes.component.html',
  styleUrls: ['./reporte-inscritos-altas-cortes.component.scss']
})
export class ReporteInscritosAltasCortesComponent extends BaseController implements OnInit, AfterViewChecked {

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
      detalle1: new FormControl({ value: '', disabled: true }),
      detalle2: new FormControl({ value: '', disabled: true }),
      nombreFirma: new FormControl({ value: '', disabled: true }),
      cargoFirma: new FormControl({ value: '', disabled: true }),
      despachoFirma: new FormControl({ value: '', disabled: true }),
      nombreCreador: new FormControl({ value: '', disabled: true }),
      tituloCreador: new FormControl({ value: '', disabled: true }),
      ciudadPiePagina: new FormControl({ value: '', disabled: true }),
    });
    this.company = new FormControl('');

    this.commonService.getVarConfig(configMsg.RPT_PARAMETROS_INSCRITOS_AC).then(v => {
      this.setJson(v);
      this.f.detalle1.setValue(v.valorObj.detalle1);
      this.f.detalle2.setValue(v.valorObj.detalle2);
      this.f.nombreFirma.setValue(v.valorObj.nombreFirma);
      this.f.cargoFirma.setValue(v.valorObj.cargoFirma);
      this.f.despachoFirma.setValue(v.valorObj.despachoFirma);
      this.f.nombreCreador.setValue(v.valorObj.nombreCreador);
      this.f.tituloCreador.setValue(v.valorObj.tituloCreador);
      this.f.ciudadPiePagina.setValue(v.valorObj.ciudadPiePagina);
    });

    //this.f.idConvocatoria.valueChanges.subscribe(val => this.formValid(val));
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
    const varFuncAlta = await this.commonService.getVarConfig(configMsg.FUNCIONARIOS_ALTAS_CORTES);
    this.setJson(varFuncAlta);
    this.lstConvocatoriaAux = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(empresaEvent.value).toPromise() as any).datos as Convocatoria[];
    if (this.lstConvocatoriaAux.length > 0) {
      this.lstConvocatoriaAux.forEach(g => {
        if (g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
          g.estadoConvocatoria === stateConvocatoria.CERRADA ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
          if (g.idTipoCargo.toUpperCase() === String(varFuncAlta.valorObj.id_funcionarios).toUpperCase()) {
            if (g.idTipoLugar.toUpperCase().includes(varFuncAlta.valorObj.id_altas_cortes.toUpperCase())) {
              this.lstConvocatoria.push(g);
            }
          }
        }
      });
    }
  }

  public async loadDataEmpresa(empresa: string) {
    this.lstConvocatoria = [];
    this.lstConvocatoriaAux = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(empresa).toPromise() as any).datos as Convocatoria[];
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

  public formValid(val) {
    if (val && this.form.valid) {
      const dataReport: PreseleccionadoModel = Constants.initReportModel();
      dataReport.idConvocatoria = this.f.idConvocatoria.value;
      dataReport.detalle1 = this.f.detalle1.value;
      dataReport.detalle2 = this.f.detalle2.value;
      dataReport.nombreFirma = this.f.nombreFirma.value;
      dataReport.cargoFirma = this.f.cargoFirma.value;
      dataReport.despachoFirma = this.f.despachoFirma.value;
      dataReport.nombreCreador = this.f.nombreCreador.value;
      dataReport.tituloCreador = this.f.tituloCreador.value;
      dataReport.ciudadPiePagina = this.f.ciudadPiePagina.value;
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

