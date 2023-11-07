import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { TiposArchivos } from '@app/compartido/helpers/enums';
import { ReportModel } from '@app/compartido/modelos/reportes/report-model';
import { ReporteGeneracion } from '@app/compartido/modelos/reportes/reporte-generacion';
import { AlertService } from '@app/core/servicios/alert.service';
import { FilesService } from '@app/core/servicios/files.service';

@Component({
  selector: 'app-generador-reportes',
  templateUrl: './generador-reportes.component.html',
  styleUrls: ['./generador-reportes.component.scss']
})
export class GeneradorReportesComponent extends BaseController implements OnInit, AfterViewChecked {

  public idReporte = new FormControl('');
  public idTipoReporte = new FormControl('');
  public lstReportes: ReporteGeneracion[] = [];
  public lstTipoReporte = TiposArchivos;
  public curReport: ReporteGeneracion;
  public dataReport: ReportModel;
  public submit = true;

  public rConfigInfoReport = 'ConfigInfoReport.rdlc';
  public rUsuariosReport = 'UsuariosReport.rdlc';
  public rAspiranteInscritoReport = 'RptAspirantesInscritos.rdlc';
  public rAspiranteAdmitidoReport = 'RptAspirantesAdmitidos.rdlc';
  public rAspiranteInadmitidoReport = 'RptAspirantesInadmitidos.rdlc';
  public rListadoPreseleccionadosReport = 'RptListadoPreseleccionados.rdlc';
  public rVacantesFuncionario = 'RptVacantesFuncionario.rdlc';
  public rVacantesEmpleado = 'RptVacantesEmpleado.rdlc';
  public rResultadoPruebaReport = 'RptResultadoPruebas.rdlc';
  public rInscritosAltasCortesReport = 'RptInscritosAltasCortes.rdlc';
  public rEstadisticaConvocatoriaReport = 'RptEstadisticasConvocatoria.rdlc';
  public rAspirantesExcluidosReport = 'RptAspirantesExcluidos.rdlc';
  public rVacanteDesiertaReport = 'RptVacanteDesierta.rdlc';
  public rElegiblesAltasCortesReport = 'RptElegiblesAltasCortes.rdlc';
  public rTrasladosReport = 'RptTraslados.rdlc';

  constructor(
    private cdRef: ChangeDetectorRef,
    private fileService: FilesService,
    private alertService: AlertService
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.fileService.getReporteGeneracion()
      .subscribe(
        (res: any) => {
          this.lstReportes = res.datos;
        }, err => {
          this.alertService.showError(err);
        }
      );

    this.idTipoReporte.valueChanges.subscribe(val => {
      if (val && this.dataReport) {
        this.submit = false;
      }
    });
  }

  public loadDataByReporte(pReporte: any) {
    this.curReport = undefined;
    if (pReporte.value) {
      const r = this.lstReportes.find(x => x.id === pReporte.value);
      this.curReport = r;
    }
  }

  public show(report: string) {
    return this.curReport ? this.curReport.nombreArchivo === report : false;
  }

  public formOk(data: ReportModel) {
    //data.dataSetName = 'DSCarrera';
    data.isHasParams = true;
    data.reportTitle = this.curReport.nombreDescarga;
    data.rptFileName = this.curReport.nombreArchivo;
    data.language = '';
    this.dataReport = data;
    if (this.idTipoReporte.value) {
      this.submit = false;
    }
  }

  public formBad(data: any) {
    this.submit = true;
    this.dataReport = undefined;
  }

  public getReport() {
    this.submit = true;
    this.alertService.loading();
    const tipoReporte = this.lstTipoReporte.find(x => this.idTipoReporte.value === x.extension);
    this.dataReport.exportExtension = tipoReporte.extensionType;
    this.dataReport.reportType = tipoReporte.extension;
    //this.fileService.getReport(this.dataReport).subscribe(
    this.fileService.getGenericReport(this.dataReport, this.curReport.nombreServicio).subscribe(
      (res: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(res);
        const fileName = this.dataReport.reportTitle + this.dataReport.reportType;
        link.download = fileName;
        link.click();
        this.alertService.close();
      }, error => {
        this.alertService.showError(error);
      }
    );
  }

  public clean() {
    this.submit = true;
    this.dataReport = undefined;
    this.idReporte.setValue('');
    this.idTipoReporte.setValue('');
    this.curReport = undefined;
  }


}
