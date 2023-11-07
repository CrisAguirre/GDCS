import { DialogCronogramaConComponent } from './../../../../../compartido/componentes/dialog-cronograma-con/dialog-cronograma-con.component';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, TemplateRef, ViewChildren, QueryList, ElementRef, OnDestroy } from '@angular/core';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { configMsg, stateConvocatoria } from '@app/compartido/helpers/enums';
import { Observable } from 'rxjs';
import { FormGroup, NgForm, FormBuilder } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort, MatDialogRef, MatDialog, PageEvent } from '@angular/material';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CommonService } from '@app/core/servicios/common.service';
import { TypeSede } from '@app/compartido/modelos/type-sede';
import { TypeConvocatory } from '@app/compartido/modelos/type-convocatory';
import { TypePlace } from '@app/compartido/modelos/type-place';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { FilesService } from '@app/core/servicios/files.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { AcuerdoConvocatoria } from '@app/compartido/modelos/acuerdo-convocatoria';
import { Cronograma } from '@app/compartido/modelos/cronograma';
import { ConvocatoryActivity } from '@app/compartido/modelos/convocatory-activity';
import { Empresa } from '@app/compartido/modelos/empresa';
import { DataService } from '@app/core/servicios/data.service';
import { EmitterService } from '@app/core/servicios/emitter.service';
import { InscripcionAspiranteModel } from '@app/compartido/modelos/inscripcion-aspirante-model';

@Component({
  selector: 'app-inscripcion-convocatoria',
  templateUrl: './inscripcion-convocatoria.component.html',
  styleUrls: ['./inscripcion-convocatoria.component.scss'],
  /* animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*',  visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('125ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ], */
})
export class InscripcionConvocatoriaComponent extends BaseController implements OnInit, AfterViewChecked, OnDestroy {

  public lstConvocatory: Convocatoria[] = [];
  public lstTypeSede: TypeSede[] = [];
  public lstTypeConvocatory: TypeConvocatory[] = [];
  public lstTypePlace: TypePlace[] = [];
  public lstCronogramasByConvocatoria: Cronograma[] = [];
  public lstActivities: ConvocatoryActivity[] = [];
  public lstCompanies: Empresa[] = [];
  public lstInscripcionesByUsuario: InscripcionAspiranteModel[] = [];

  private user = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public idOtraActividad: any;
  public idConvocatoria: string = null;

  public form: FormGroup;
  //public displayedColumns: string[] = ['inscripcionesActivas', 'nombreConvocatoria', 'nombreTipoConvocatoria', 'nombreTipoSede', 'codigoAcuerdo', 'nombreSoporteAcuerdo', 'barraProgreso', 'cronograma', 'cargos'];
  public displayedColumns: string[] = ['inscripcionesActivas', 'nombreConvocatoria', 'nombreTipoConvocatoria', 'nombreTipoSede', 'codigoAcuerdo', 'nombreSoporteAcuerdo', 'soporteInscripcion', 'soporteInvitacion','barraProgreso', 'cronograma', 'cargos'];
  public dataSource = new MatTableDataSource<any>([]);

  /* Variables Barra de progreso */
  private valueProgress = 0;
  public progress = {
    valueFake: this.valueProgress,
    value: this.valueProgress,
    title: `${this.valueProgress}%`
  };
  public progresClass = 'progressBarColor0';
  public showProgressLoading = true;
  public estadoConvocatoriaCerrada = stateConvocatoria.CERRADA;

  // MatPaginator Output
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('matPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild('TableOneSort', { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private adminConvocatoryService: AdministracionConvocatoriaService,
    private convocatoryServices: ConvocatoriaService,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private dataService: DataService,
    private empresaService: EmpresaService,
    private emitter: EmitterService,
    private fb: FormBuilder,
    private fileService: FilesService,
    private dialogService: MatDialog,
    private router: Router,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
    this.listenEmitterProgressBar();
    this.getDetailPorcentage();
  }

  ngOnInit() {
    this.alertService.loading();
    this.loadForm();
    this.loadData()
      .catch(error => {
        console.log('Error', error);
      })
      .finally(() => {
        this.alertService.close();
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: Convocatoria, filter: string): boolean => {
      const dataCompare = [data.nombreConvocatoria, data.numeroConvocatoria, data.nombreTipoConvocatoria, data.nombreTipoSede, data.codigoAcuerdo];
      return C.filterTable(dataCompare, filter);
    };
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.emitter.unsubscribeEmitterCV();
  }

  public loadForm() {

  }

  public async loadData() {
    this.lstTypeConvocatory = (await this.adminConvocatoryService.getTipoConvocatoria().toPromise() as any).datos as TypeConvocatory[];
    this.lstTypeSede = (await this.adminConvocatoryService.getTipoSede().toPromise() as any).datos as TypeSede[];
    this.lstTypePlace = (await this.adminConvocatoryService.getTipoLugar().toPromise() as any).datos as TypePlace[];

    this.lstActivities = (await this.adminConvocatoryService.getActividadConvocatoria().toPromise() as any).datos as ConvocatoryActivity[];
    this.lstCompanies = (await this.empresaService.getListarEmpresas().toPromise() as any).datos as Empresa[];
    this.lstConvocatory = (await this.convocatoryServices.getListarConvocatoriasPorEstado(stateConvocatoria.PUBLICADA).toPromise() as any).datos as Convocatoria[];

    /* Lista de inscripciones por usuario */
    this.lstInscripcionesByUsuario = (await this.commonService.getInscripcionesUsuario(this.user.id).toPromise() as any).datos;

    if (this.lstConvocatory.length > 0) {
      this.lstConvocatory.forEach(async e => {

        this.lstTypeConvocatory.forEach(g => {
          if (e.idTipoConvocatoria === Number(g.id)) {
            e.nombreTipoConvocatoria = this.translateField(g, 'tipoConvocatoria', this.lang);
            return;
          }
        });

        this.lstTypePlace.forEach(g => {
          if (e.idTipoLugar === g.id) {
            e.nombreTipoLugar = this.translateField(g, 'lugar', this.lang);
            return;
          }
        });

        this.lstTypeSede.forEach(g => {
          if (e.idTipoSede === g.id) {
            e.nombreTipoSede = this.translateField(g, 'sede', this.lang);
            return;
          }
        });

        this.lstCompanies.forEach(g => {
          if (e.idEmpresa === g.id) {
            e.nombreEmpresa = g.nombreEmpresa;
            return;
          }
        });

        const lstAgreementsByConvocatory: AcuerdoConvocatoria[] = (await this.convocatoryServices.getAcuerdoConvocatoriaByConvocatoria({ idConvocatoria: e.id }).toPromise() as any).datos as AcuerdoConvocatoria[];
        if (lstAgreementsByConvocatory.length > 0) {
          lstAgreementsByConvocatory.sort((a, b) => new Date(b.fechaAcuerdo).getTime() - new Date(a.fechaAcuerdo).getTime());
          e.fechaAcuerdo = lstAgreementsByConvocatory[0].fechaAcuerdo;
        }

        // calcula porcentaje
        e.tieneInscripciones = 0;
        e.porcentajeInsHV = 0;
        e.porcentajeTotal = this.progress.value + e.porcentajeInsHV;
        e.porcentaje = e.porcentajeTotal + '%';

        if (this.lstInscripcionesByUsuario.length > 0) {
          this.lstInscripcionesByUsuario.forEach(c => {
            if (c.idConvocatoria === e.id) {
              e.tieneInscripciones = 1;
              e.porcentajeInsHV = 25;
              e.porcentajeTotal = this.progress.value + e.porcentajeInsHV;
              e.porcentaje = e.porcentajeTotal + '%';
            }
          });
        }
      });
    }
    this.dataSource.data = this.lstConvocatory;
  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fileService.downloadFile(id).subscribe(
      res => {
        const blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

  public async mostrarCargos(convocatoria: any) {
    this.idConvocatoria = convocatoria.id;
    if (convocatoria.porcentajeTotal < 75) {
      const msgValidacion = (await this.commonService.getMessageByName(configMsg.MSG_VALIDACION_INS_HV).toPromise() as any).datos;
      this.alertService.message(msgValidacion.valor, TYPES.WARNING);
      return;
    } else {
      this.dataService.serviceData = convocatoria.id;
      this.router.navigate(['convocatorias-aspirante', 'cargos-convocatoria']);
    }

  }

  /* Consulta el cronograma de la convocatoria seleccionada */
  public async openDialogCronograma(element: any) {
    this.lstCronogramasByConvocatoria = (await this.convocatoryServices.getCronogramaByConvocatory(element).toPromise() as any).datos;

    const o = this.lstActivities.find(x => x.actividadConvocatoria === 'Otro');
    this.idOtraActividad = o ? o.id : -1;

    if (this.lstCronogramasByConvocatoria.length > 0) {

      this.lstCronogramasByConvocatoria.forEach(e => {
        this.lstConvocatory.forEach(c => {
          if (e.idConvocatoria === c.id) {
            e.convocatoria = c.nombreConvocatoria;
            return;
          }
        });

        this.lstActivities.forEach(a => {
          if (e.idActividadConvocatoria === a.id) {
            e.actividadaConvocatoria = this.translateField(a, 'actividadConvocatoria', this.lang) + (a.id === this.idOtraActividad ? ' (' + e.otroActividadConvocatoria + ')' : '');
            return;
          }
        });
      });
    }

    this.lstCronogramasByConvocatoria.sort((a: Cronograma, b: Cronograma) => {
      return (a.convocatoria > b.convocatoria ? 1 : -1);
    });
    this.lstCronogramasByConvocatoria = this.lstCronogramasByConvocatoria.filter(x => x.registroActivo === 1);

    const dialogRef1 = this.dialogService.open(DialogCronogramaConComponent, {
      data: this.lstCronogramasByConvocatoria,
      maxWidth: '90%',
      // maxHeight: '90%',
      maxHeight: '650px',
    });

    dialogRef1.addPanelClass(['col-sm-12', 'col-md-6', 'col-lg-6']);
    dialogRef1.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result === 'yes') {
        } else if (result === 'no') {
        }
      }
    });
  }


  private listenEmitterProgressBar() {
    this.emitter.emitterSubscribeCV.subscribe(
      message => {
        if (message.progressBar) {
          this.getDetailPorcentage();
        }
        if (message.showProgressLoading !== undefined) {
          this.showProgressLoading = message.showProgressLoading;
        }
      });
  }

  private getDetailPorcentage() {
    this.commonService.getDetailPorcentageUser(this.user.id).subscribe(
      (r: any) => {
        this.valueProgress = r.porcentajeAvance;

        switch (this.valueProgress) {
          case 0:
            this.progress.valueFake = 0;
            this.progress.value = 0;
            this.progress.title = '0%';
            break;

          case 33:
            this.progress.valueFake = 25;
            this.progress.value = 25;
            this.progress.title = '25%';
            break;

          case 66:
            this.progress.valueFake = 50;
            this.progress.value = 50;
            this.progress.title = '50%';
            break;

          case 100:
            this.progress.valueFake = 75;
            this.progress.value = 75;
            this.progress.title = '75%';
            break;
        }
      }, e => {
        console.log('Error', e);
      }
    );
  }
}
