import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { configMsg, stateConvocatoria } from '../../../../../compartido/helpers/enums';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { CommonService } from '@app/core/servicios/common.service';
import { Convocatoria } from '@app//compartido/modelos/convocatoria';
import { ConvocatoriaService } from '@app//core/servicios/convocatoria.service';
import { DiasRecalificacion } from '@app/compartido/modelos/dias-recalificacion';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';

@Component({
  selector: 'app-opciones-recalificacion',
  templateUrl: './opciones-recalificacion.component.html',
  styleUrls: ['./opciones-recalificacion.component.scss']
})
export class OpcionesRecalificacionComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['convocatoria', 'fechaInicial', 'fechaFinal', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;

  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatoriaAux: Convocatoria[] = [];
  public lstConvocatoria: Convocatoria[] = [];
  public dataConvocatory: Convocatoria;
  public estadoConvocatoria: string;

  public elementCurrent: any = {};
  public sortedData: any;

  public lstRecalificacion: DiasRecalificacion[] = [];

  public showSelectCompany = false;
  public lstEmpresa: Empresa[] = [];

  private user = this.commonService.getVar(configMsg.USER);


  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('removableInput', { static: false }) inputFileView: ElementRef;

  constructor(
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private alertService: AlertService,
    private convocatoryServices: ConvocatoriaService,
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private ct: CustomTranslateService,
  ) {
    super();
  }

  ngOnInit() {
    this.loadUserData();
    this.loadForm();
    this.loadData();

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: DiasRecalificacion, filter: string): boolean => {
      const dataCompare = [data.nombreConvocatoria, data.fechaInicio, data.fechaFin];
      return C.filterTable(dataCompare, filter);
    }
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: DiasRecalificacion, b: DiasRecalificacion) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'convocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        case 'fechaInicial': return this.compare(a.fechaInicio, b.fechaInicio, isAsc);
        case 'fechaFinal': return this.compare(a.fechaFin, b.fechaFin, isAsc);

        default: return 0;
      }
    });
  }

  public async loadDataByConvocatoria( pConvocatoria: any){
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.f.initDate.setValue(null);
    this.f.endDate.setValue(null);
    this.elementCurrent = {};
    this.lstRecalificacion = <DiasRecalificacion[]>(<any>await this.convocatoryServices.getObtenerDiasRecalificacionPorConvocatoria(pConvocatoria.value).toPromise()).datos;

    //#region Convocatoria
    this.dataConvocatory = this.lstConvocatoriaAux.find((x: any) => x.id === this.f.idConvocatoria.value);
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.INACTIVO) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_INACTIVA_MSG;
    } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_PUBLICADA_MSG;
    } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.ACTIVO || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.EN_BORRADOR) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_ENCOSTRUCION_MSG;
    } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_CERRADA_MSG;
    } else {
      this.estadoConvocatoria = '';
    }

    if (this.lstRecalificacion.length > 0) {
      this.lstRecalificacion.forEach(e => {
        this.lstConvocatoria.forEach(g => {
          if (e.idConvocatoria === g.id) {
            e.nombreConvocatoria = this.translateField(g, 'nombreConvocatoria', this.lang)
            return;
          }
        });
      });
    }
    this.dataSource.data = this.lstRecalificacion;

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.lstConvocatoria = <Convocatoria[]>(<any>await this.convocatoryServices.getConvocatorias().toPromise()).datos;
  }

  public async loadUserData() {
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      if (!C.validateList(this.lstEmpresa)) {
        this.lstEmpresa = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
      }
    } else {
      this.showSelectCompany = false;
      this.f.idEmpresa.setValue(this.user.idEmpresa);
    }
  }

  public async loadpermisos() {
    this.lstConvocatoriesAll = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.user.value).toPromise()).datos;
  }

  public async loadEmpresa(empresa: any) {
    this.lstConvocatoriaAux = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(empresa.value).toPromise()).datos;
    if (this.lstConvocatoriaAux.length > 0) {
      this.lstConvocatoriaAux.forEach(g => {
        if (g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
          g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
          this.lstConvocatoria.push(g);
        }
      });
    }
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        idEmpresa: new FormControl(''),
        idConvocatoria: new FormControl('', [Validators.required]),
        initDate: new FormControl('', [Validators.required]),
        endDate: new FormControl('', [Validators.required]),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: DiasRecalificacion) {

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    this.scrollTop();
    this.loadEmpresa({ value: element.idEmpresa });
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.idUsuarioModificacion,
      idEmpresa: element.idEmpresa,
      idConvocatoria: element.idConvocatoria,
      initDate: element.fechaInicio,
      endDate: element.fechaFin
    });
  }

  public addDiasRecalificacion() {

    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    // validar las fechas para no duplicar los datos
    if (!this.validateRangeDate(new Date(this.f.initDate.value), new Date(this.f.endDate.value), (this.f.id ? this.f.id.value : undefined)) && this.dataSource.data.find((x: DiasRecalificacion) => this.areEquals(x.idConvocatoria, this.f.idConvocatoria.value))) {
      this.alertService.message(this.ct.FECHAS_INCORRECTAS_CRONOGRAMA, TYPES.ERROR);
      this.submit = false;
      return;
    }
    
    const newDiasRecalificacion: DiasRecalificacion = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      idEmpresa: this.f.idEmpresa.value,
      fechaInicio: this.f.initDate.value,
      fechaFin: this.f.endDate.value,
    };

    this.convocatoryServices.saveDiasRecalificacion(newDiasRecalificacion).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value });
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }


  public delete(element: DiasRecalificacion) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    // validar las fechas para eliminar los datos
    if (!this.validateRangeDateDelete(new Date(element.fechaInicio), new Date(element.fechaFin))) {
      this.alertService.message(this.ct.FECHAS_ELIMANCION, TYPES.ERROR);
      this.submit = false;
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convocatoryServices.deleteDiasRecalificacion(element)
            .subscribe(ok2 => {
              this.loadData()
                .then(r => {
                  this.cleanForm();
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      });
  }

  private deleteIsSelected(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
    this.dataSource.data = [];
  }

  public validateRangeDate(initDate: Date, endDate: Date, id?: string): boolean {
    const endDateString = this.commonService.getFormatDate(endDate);
    const initDateString = this.commonService.getFormatDate(initDate);

    if (endDateString === initDateString) {
      return false;
    }
    for (let i = 0; i < this.lstRecalificacion.length; i++) {
      const e = this.lstRecalificacion[i];
      if ( id && id === e.id) {
        continue;
      }

      if (new Date(e.fechaInicio) < initDate && new Date(e.fechaFin) > initDate) {
        return false;
      }
      if (new Date(e.fechaInicio) < endDate && new Date(e.fechaFin) > endDate) {
        return false;
      }
      if (new Date(e.fechaInicio) > initDate && new Date(e.fechaFin) < endDate) {
        return false;
      }
      if (this.commonService.getFormatDate(new Date(e.fechaInicio)) === endDateString) {
        return false;
      }
    }
    return true;
  }

  public validateRangeDateDelete(initDate: Date, endDate: Date): boolean {
    const currentTime = new Date();

    if ( initDate <= currentTime || endDate < currentTime) {
      return false;
    }

    return true;
  }

}
