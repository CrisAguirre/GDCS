import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { configMsg, stateConvocatoria, modulesSoports, documentsType } from '@app/compartido/helpers/enums';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { FilesService } from '@app/core/servicios/files.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { FileInput, FileValidator } from 'ngx-material-file-input';
import { CommonService } from '@app/core/servicios/common.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { DatePipe } from '@angular/common';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Empresa } from '@app/compartido/modelos/empresa';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { ConvocatoriaService } from '@app//core/servicios/convocatoria.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { ResolucionCF } from '@app/compartido/modelos/resolucion-curso-formacion';
import { Constants } from '@app/compartido/helpers/constants';

@Component({
  selector: 'app-resolucion-curso-formacion',
  templateUrl: './resolucion-curso-formacion.component.html',
  styleUrls: ['./resolucion-curso-formacion.component.scss']
})
export class ResolucionCursoFormacionComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['convocatoria', 'resolucion', 'fechaResolucion', 'fechaRecibido', 'oficio', 'observaciones', 'soporte', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public elementCurrent: any = {};
  public sortedData: any;

  public lstResolucion: ResolucionCF[] = [];

  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatoriaAux: Convocatoria[] = [];
  public lstConvocatoria: Convocatoria[] = [];
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
    private fb: FormBuilder,
    private fs: FilesService,
    private convocatoryServices: ConvocatoriaService,
    private empresaService: EmpresaService,
    public datepipe: DatePipe,
    private alertService: AlertService,
    private ct: CustomTranslateService
  ) {
    super();

    this.configFile.sizeFile = C.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
  }

  ngOnInit() {
    this.loadForm();
    this.loadUserData();
    this.loadData();

    this.commonService.getVarConfig(configMsg.EXTENSIONES_PERMITIDAS_RESOLUCIONES)
      .then(res => {
        this.configFile.allowExtensions = res.valor;
        this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
      });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: ResolucionCF, filter: string): boolean => {
      const dataCompare = [data.nombreConvocatoria, data.resolucion, data.fechaResolucion, data.fechaRecibido, data.oficio, data.observaciones];
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

    this.dataSource.data.sort((a: ResolucionCF, b: ResolucionCF) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'convocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        case 'resolucion': return this.compare(a.resolucion, b.resolucion, isAsc);
        case 'fechaResolucion': return this.compare(a.fechaResolucion, b.fechaResolucion, isAsc);
        case 'fechaRecibido': return this.compare(a.fechaRecibido, b.fechaRecibido, isAsc);
        case 'oficio': return this.compare(a.oficio, b.oficio, isAsc);
        case 'observaciones': return this.compare(a.observaciones, b.observaciones, isAsc);

        default: return 0;
      }
    });
  }

  public async loadDataByConvocatoria(pConvocatoria: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.f.resolucion.setValue(null);
    this.f.fechaResolucion.setValue(null);
    this.f.fechaRecibido.setValue(null);
    this.f.oficio.setValue(null);
    this.f.observaciones.setValue(null);
    this.clearInputFile(this.inputFileView);
    this.elementCurrent = {};

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

    this.lstResolucion = (await this.convocatoryServices.getAResolucionesCFByConvocatoria(pConvocatoria.value).toPromise() as any).datos as ResolucionCF[];
    if (this.lstResolucion.length > 0) {
      this.lstResolucion.forEach(e => {

        this.lstConvocatoriaAux.forEach(g => {
          if (e.idConvocatoria === g.id) {
            e.nombreConvocatoria = this.translateField(g, 'nombreConvocatoria', this.lang);
            return;
          }
        });
      });
    }
    this.dataSource.data = this.lstResolucion;

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    console.log('val', this.f.idEmpresa.value);
    if (this.f.idEmpresa.value) {
      this.lstConvocatoriaAux = (<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos as Convocatoria[];
    } else {
      this.lstConvocatoriaAux = (<any>await this.convocatoryServices.getConvocatorias().toPromise() as any).datos as Convocatoria[];
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
    this.lstConvocatoriesAll = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.user.value).toPromise()).datos;
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
        resolucion: new FormControl('', [Validators.required]),
        fechaResolucion: new FormControl('', [Validators.required]),
        fechaRecibido: new FormControl('', [Validators.required]),
        oficio: new FormControl('', [Validators.required]),
        observaciones: new FormControl(''),
        requiredfile: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public async edit(element: ResolucionCF) {
    if(this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA){
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
      resolucion: element.resolucion,
      fechaResolucion: element.fechaResolucion,
      fechaRecibido: element.fechaRecibido,
      oficio: element.oficio,
      observaciones: element.observaciones,
    });
  }

  public async addResolucionCF() {

    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      this.f.requiredfile.markAsTouched();
      return;
    }


    const obj = this.dataSource.data.find((x: ResolucionCF) => this.areEquals(x.resolucion, this.f.resolucion.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newResolucionCF: ResolucionCF = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      idEmpresa: this.f.idEmpresa.value,
      resolucion: this.f.resolucion.value,
      fechaResolucion: this.f.fechaResolucion.value,
      fechaRecibido: this.f.fechaRecibido.value,
      oficio: this.f.oficio.value,
      observaciones: this.f.observaciones.value,
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
        NombreSoporte: C.generateNameFile(file.name, newResolucionCF.idConvocatoria, modulesSoports.RESOLUCIONCF_SOPORTE, documentsType.RESOLUCIONCF_SOPORTE, this.getDateString()),
        Modulo: modulesSoports.RESOLUCIONCF_SOPORTE,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fs.postFile(file, params).toPromise();
      newResolucionCF.idSoporte = documentFile.id;
    }

    this.convocatoryServices.saveResolucionesCF(newResolucionCF).toPromise()
      .then(ok => {
        this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value });
        this.loadData().then(() => {
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

  public delete(element: ResolucionCF) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    if(this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA){
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)      
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
          this.convocatoryServices.deleteResolucionesCF(element)
            .subscribe(o => {
              this.deleteSoport(element.idSoporte);
              this.loadDataByConvocatoria(element.idConvocatoria);
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
    this.fs.getInformationFile(id)
      .subscribe(
        infoFile => {
          const tipoArchivo = Constants.getMimeType(infoFile);
          this.fs.downloadFile(id).subscribe(
            res => {
              let blob: any = new Blob([res], { type: tipoArchivo.mediaType + '; charset=utf-8', });
              C.viewFile(blob);
            }, error => {
              console.log('Error', error);
            }
          );
        }, error => this.alertService.showError(error)
      )
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
  }

  public getDateString() {
    return this.datepipe.transform(new Date(), 'ddMMyyyyHHmmss');
  }

}
