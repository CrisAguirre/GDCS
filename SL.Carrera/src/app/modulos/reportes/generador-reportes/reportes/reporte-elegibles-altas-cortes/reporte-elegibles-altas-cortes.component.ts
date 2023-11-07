import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants } from '@app/compartido/helpers/constants';
import { configMsg, stateConvocatoria } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Empresa } from '@app/compartido/modelos/empresa';
import { ReportModel } from '@app/compartido/modelos/reportes/report-model';
import { AlertService } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { ElegiblesAltasCortesModel } from '../../../../../compartido/modelos/reportes/elegibles-altas-cortes-model';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { TYPES } from '../../../../../core/servicios/alert.service';

@Component({
  selector: 'app-reporte-elegibles-altas-cortes',
  templateUrl: './reporte-elegibles-altas-cortes.component.html',
  styleUrls: ['./reporte-elegibles-altas-cortes.component.scss']
})
export class ReporteElegiblesAltasCortesComponent extends BaseController implements OnInit, AfterViewChecked {

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
      acuerdo: new FormControl({ value: '', disabled: false }),
      fechaAcuerdo: new FormControl({ value: '', disabled: false }),
      informacionElegible: new FormControl({ value: '', disabled: false }),
      informacionAcuerdo: new FormControl({ value: '', disabled: false }),
      articuloPrincipal: new FormControl({ value: '', disabled: false }),
      articuloSecundario: new FormControl({ value: '', disabled: false }),
      informacionPublicacion: new FormControl({ value: '', disabled: false }),
      nombreFirma: new FormControl({ value: '', disabled: false }),      
      cargoFirma: new FormControl({ value: '', disabled: false }),      
    });
    this.company = new FormControl('');

    this.commonService.getVarConfig(configMsg.RPT_ELEGIBLES_ALTAS_CORTES).then(v => {
      this.setJson(v);
      this.f.acuerdo.setValue(v.valorObj.acuerdo);
      this.f.informacionElegible.setValue(v.valorObj.informacionElegible);
      this.f.informacionAcuerdo.setValue(v.valorObj.informacionAcuerdo);
      this.f.articuloPrincipal.setValue(v.valorObj.articuloPrincipal);
      this.f.articuloSecundario.setValue(v.valorObj.articuloSecundario);
      this.f.informacionPublicacion.setValue(v.valorObj.informacionPublicacion);
      this.f.nombreFirma.setValue(v.valorObj.nombreFirma);
      this.f.cargoFirma.setValue(v.valorObj.cargoFirma);            
    });

    this.f.idConvocatoria.valueChanges.subscribe(val => this.formValid(val));
      
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
    const lstConvocatoriaAux = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(empresa).toPromise() as any).datos as Convocatoria[];
    if (lstConvocatoriaAux.length > 0) {
      lstConvocatoriaAux.forEach(g => {
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
      const dataReport: ElegiblesAltasCortesModel = Constants.initReportModel();
      dataReport.idConvocatoria = this.f.idConvocatoria.value;
      dataReport.acuerdo = this.f.acuerdo.value;
      dataReport.fechaAcuerdo = this.f.fechaAcuerdo.value;
      dataReport.informacionElegible = this.f.informacionElegible.value;
      dataReport.informacionAcuerdo = this.f.informacionAcuerdo.value;
      dataReport.articuloPrincipal = this.f.articuloPrincipal.value;
      dataReport.articuloSecundario = this.f.articuloSecundario.value;
      dataReport.informacionPublicacion = this.f.informacionPublicacion.value;
      dataReport.nombreFirma = this.f.nombreFirma.value;
      dataReport.cargoFirma = this.f.cargoFirma.value;
     
      this.emitFormOk.emit(dataReport);
    } else {
      this.emitFormBad.emit(false);
    }
  }

  public estadoFecha(){    
    if (this.form.valid) {
      const dataReport: ElegiblesAltasCortesModel = Constants.initReportModel();
      dataReport.idConvocatoria = this.f.idConvocatoria.value;
      dataReport.acuerdo = this.f.acuerdo.value;
      dataReport.fechaAcuerdo = this.f.fechaAcuerdo.value;
      dataReport.informacionElegible = this.f.informacionElegible.value;
      dataReport.informacionAcuerdo = this.f.informacionAcuerdo.value;
      dataReport.articuloPrincipal = this.f.articuloPrincipal.value;
      dataReport.articuloSecundario = this.f.articuloSecundario.value;
      dataReport.informacionPublicacion = this.f.informacionPublicacion.value;
      dataReport.nombreFirma = this.f.nombreFirma.value;
      dataReport.cargoFirma = this.f.cargoFirma.value;
     
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
