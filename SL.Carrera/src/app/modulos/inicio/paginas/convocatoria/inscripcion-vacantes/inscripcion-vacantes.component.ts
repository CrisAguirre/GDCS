import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { configMsg, stateConvocatoria, modulesSoports, documentsType } from '../../../../../compartido/helpers/enums';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { FilesService } from '@app/core/servicios/files.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { FileInput, FileValidator } from 'ngx-material-file-input';
import { CommonService } from '@app/core/servicios/common.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app//compartido/modelos/convocatoria';
import { ConvocatoriaService } from '@app//core/servicios/convocatoria.service';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { DiasHabilesVacantes } from '@app/compartido/modelos/Dias-habiles-vacantes';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { DatePipe } from '@angular/common';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';


@Component({
  selector: 'app-inscripcion-vacantes',
  templateUrl: './inscripcion-vacantes.component.html',
  styleUrls: ['./inscripcion-vacantes.component.scss']
})
export class InscripcionVacantesComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['convocatoria', 'fechaIngreso', 'fechaRetiro','soporte', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public elementCurrent: any = {};
  public sortedData: any;

  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatoriaAux: Convocatoria[] = [];
  public lstConvocatoria: Convocatoria[] = [];
  public lstVacantes: DiasHabilesVacantes[] = [];
  public dataConvocatory: Convocatoria;
  public estadoConvocatoria: string;

  public showSelectCompany = false;
  public lstEmpresa: Empresa[] = [];

  public matcher: any;

  public submit = false;

  private user = this.commonService.getVar(configMsg.USER);


  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('removableInput', { static: false }) inputFileView: ElementRef;

  constructor(
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private alertService: AlertService,
    private fb: FormBuilder,
    private fs: FilesService,
    public datepipe: DatePipe,
    private empresaService: EmpresaService,
    private convocatoryServices: ConvocatoriaService,
    private ct: CustomTranslateService
  ) {
    super();
    this.configFile.allowExtensions = commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = C.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
  }

  ngOnInit() {
    this.loadForm();
    this.loadUserData();
    this.loadData();

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: DiasHabilesVacantes, filter: string): boolean => {
      const dataCompare = [data.nombreConvocatoria, this.commonService.getFormatDate(new Date(data.fechaInicio)), this.commonService.getFormatDate(new Date(data.fechaFin)) ];
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

    this.dataSource.data.sort((a: DiasHabilesVacantes, b: DiasHabilesVacantes) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'convocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        case 'fechaIngreso': return this.compare(a.fechaInicio, b.fechaInicio, isAsc);
        case 'fechaRetiro': return this.compare(a.fechaFin, b.fechaFin, isAsc);
        
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
    this.clearInputFile(this.inputFileView);
    this.elementCurrent = {};
    this.lstConvocatoria = (await this.convocatoryServices.getConvocatorias().toPromise() as any).datos as Convocatoria[];
    this.lstVacantes = <DiasHabilesVacantes[]>(<any>await this.convocatoryServices.getObtenerDiasHabilesVacantesPorConvocatoria(pConvocatoria.value).toPromise()).datos;

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

    if (this.lstVacantes.length > 0) {
      this.lstVacantes.forEach(e => {

        this.lstConvocatoria.forEach(g => {
          if (e.idConvocatoria === g.id) {
            e.nombreConvocatoria = this.translateField(g, 'nombreConvocatoria', this.lang);
            return;
          }
        });
      });
    }
    this.dataSource.data = this.lstVacantes;

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    if (this.f.idEmpresa.value) {
      this.lstConvocatoriaAux = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos as Convocatoria[];
    } else {
      this.lstConvocatoriaAux = (await this.convocatoryServices.getConvocatorias().toPromise() as any).datos as Convocatoria[];
    }
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
    this.lstConvocatoriesAll = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.user.value).toPromise() as any).datos as Convocatoria[];
  }

  public async loadEmpresa(empresa: any) {
    this.lstConvocatoriaAux = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(empresa.value).toPromise() as any).datos as Convocatoria[];
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
        requiredfile: [undefined, [FileValidator.maxContentSize(this.configFile.sizeFile)]],
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public async edit(element: DiasHabilesVacantes) {
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    this.elementCurrent = C.cloneObject(element);
    this.clearInputFile(this.inputFileView);
    this.scrollTop();
    this.loadEmpresa({ value: element.idEmpresa });
    if (this.elementCurrent.id && this.elementCurrent.idSoporte) {
      this.elementCurrent.nameTypeFileAux = (<any>await this.fs.getInformationFile(this.elementCurrent.idSoporte).toPromise()).datos.nombreAuxiliar;
      C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
    }
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.idUsuarioModificacion,
      idEmpresa: element.idEmpresa,
      idConvocatoria: element.idConvocatoria,
      initDate: element.fechaInicio,
      endDate: element.fechaFin    
    });
  }

  public async addDiasHabilesVacantes() {
    
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

    if (!this.validateRangeDate(new Date(this.f.initDate.value), new Date(this.f.endDate.value), (this.f.id ? this.f.id.value : undefined))) {
      this.alertService.message(this.ct.MSG_FECHA_INGRESADA_EXISTE, TYPES.ERROR);
      this.submit = false;
      return;
    }

    const newDiasHabiles: DiasHabilesVacantes = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      idEmpresa: this.f.idEmpresa.value,
      fechaInicio: this.f.initDate.value,
      fechaFin: this.f.endDate.value,
      idSoporte: this.elementCurrent.idSoporte
    };

    if (this.f.requiredfile.value) {
      if (this.elementCurrent.idSoporte) {
        try {
          await this.fs.deleteFile(this.elementCurrent.idSoporte).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }

      const file = (<FileInput>this.f.requiredfile.value).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, newDiasHabiles.idConvocatoria, modulesSoports.INSCRIPCION_VACANTES, documentsType.INSCRIPCION_VACANTES, this.getDateString()),
        Modulo: modulesSoports.INSTRUCTIVOS,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fs.postFile(file, params).toPromise();
      newDiasHabiles.idSoporte = documentFile.id;
    }

    this.convocatoryServices.saveDiasHabilesVacantes(newDiasHabiles).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value });
          this.formV.resetForm();
          this.clearInputFile(this.inputFileView);
          this.elementCurrent = {};
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public delete(element: DiasHabilesVacantes) {
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
          if (this.elementCurrent.id === element.id) {
            this.formV.resetForm();
            this.elementCurrent = {};
          }
          this.convocatoryServices.deleteDiasHabilesVacantes(element)
            .subscribe(o => {
              this.deleteSoport(element.idSoporte);
              this.loadData()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              this.alertService.showError(err);
            });
        }
      });
  }

  public deleteFileView() {
    this.elementCurrent.nameTypeFileAux = null;
    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
    this.f.requiredfile.setValue(null);
  }

  public deleteSoport(idSoport) {
    if (idSoport) {
      this.fs.deleteFile(idSoport).toPromise()
        .catch(err => {
          console.log('Error', err);
        });
    }
  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fs.downloadFile(id).subscribe(
      res => {
        let blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

  private deleteIsSelected(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
    this.clearInputFile(this.inputFileView);
    this.dataSource.data = [];
  }

  public getDateString() {
    return this.datepipe.transform(new Date(), 'ddMMyyyyHHmmss');
  }

  public validateRangeDate(initDate: Date, endDate: Date, id?: string): boolean {
    const endDateString = this.commonService.getFormatDate(endDate);
    const initDateString = this.commonService.getFormatDate(initDate);

    if (endDateString === initDateString) {
      return false;
    }
    for (let i = 0; i < this.lstVacantes.length; i++) {
      const e = this.lstVacantes[i];
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
