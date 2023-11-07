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
import { Convocatoria } from '@app//compartido/modelos/convocatoria';
import { Empresa } from '@app/compartido/modelos/empresa';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { ConvocatoriaService } from '@app//core/servicios/convocatoria.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { AspiranteExcluido } from '@app/compartido/modelos/aspirante-excluido';

@Component({
  selector: 'app-exclusion-fraude-cumplimiento',
  templateUrl: './exclusion-fraude-cumplimiento.component.html',
  styleUrls: ['./exclusion-fraude-cumplimiento.component.scss']
})
export class ExclusionFraudeCumplimientoComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['convocatoria', 'numeroDocumento', 'observaciones', 'soporte', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public elementCurrent: any = {};
  public sortedData: any;

  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatoriaAux: Convocatoria[] = [];
  public lstConvocatoria: Convocatoria[] = [];
  public dataConvocatory: Convocatoria;
  public estadoConvocatoria: string;
  public convocatoryCurrent: Convocatoria = null;
  public lstExcluidos: AspiranteExcluido[] = [];

  public showSelectCompany = false;
  public lstEmpresa: Empresa[] = [];

  public matcher: any;

  public submit = false;

  private user = this.commonService.getVar(configMsg.USER);
  public formFilter: FormControl = new FormControl('');


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
    this.dataSource.filterPredicate = (data: AspiranteExcluido, filter: string): boolean => {
      const dataCompare = [data.nombreConvocatoria, data.numeroDocumento, data.observaciones];
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

    this.dataSource.data.sort((a: AspiranteExcluido, b: AspiranteExcluido) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'convocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        case 'numeroDocumento': return this.compare(a.numeroDocumento, b.numeroDocumento, isAsc);
        case 'observaciones': return this.compare(a.observaciones, b.observaciones, isAsc);

        default: return 0;
      }
    });
  }

  public async loadDataByConvocatoria(pConvocatoria: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    //this.lstExcluidos = <AspiranteExcluido[]>(<any>await this.convocatoryServices.getAspiranteExcluidoByConvocatoria(idConvocatoria.value).toPromise()).datos;
    this.f.id.setValue(undefined);
    this.f.id.updateValueAndValidity();
    this.f.numeroDocumento.setValue(null);
    this.f.observaciones.setValue(null);
    this.clearInputFile(this.inputFileView);
    this.elementCurrent = {};

    if (pConvocatoria.value) {
      this.convocatoryCurrent = null;
      this.convocatoryCurrent = (await this.convocatoryServices.getConvocatoriaById(pConvocatoria.value).toPromise() as any).datos as Convocatoria;
      if (!this.f.idEmpresa.value) {
        this.f.idEmpresa.setValue(this.convocatoryCurrent.idEmpresa);
        this.f.idEmpresa.updateValueAndValidity();
      }
    }

    

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

    this.lstExcluidos = (await this.convocatoryServices.getAspiranteExcluidoByConvocatoria(pConvocatoria.value).toPromise() as any).datos as AspiranteExcluido[];
    if (this.lstExcluidos.length > 0) {
      this.lstExcluidos.forEach(e => {

        this.lstConvocatoriaAux.forEach(g => {
          if (e.idConvocatoria === g.id) {
            e.nombreConvocatoria = this.translateField(g, 'nombreConvocatoria', this.lang);
            return;
          }
        });
      });
    }
    this.dataSource.data = this.lstExcluidos;

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

    //this.lstExcluidos = <AspiranteExcluido[]>(<any>await this.convocatoryServices.getTodosAspiranteExcluido().toPromise()).datos;    

    // if (this.lstExcluidos.length > 0) {
    //   this.lstExcluidos.forEach(e => {

    //     this.lstConvocatoria.forEach(g => {
    //       if (e.idConvocatoria === g.id) {
    //         e.nombreConvocatoria = this.translateField(g, 'nombreConvocatoria', this.lang);
    //         return;
    //       }
    //     });
    //   });
    // }
    // this.dataSource.data = this.lstExcluidos;
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
        numeroDocumento: new FormControl('', [Validators.required]),
        observaciones: new FormControl('', [Validators.required]),
        requiredfile: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
      }
    );
  }

  get f() {
    return this.form.controls;
  }


  public async edit(element: AspiranteExcluido) {
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
      numeroDocumento: element.numeroDocumento,
      observaciones: element.observaciones,
    });
  }

  public async addExcluido() {

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

    const obj = this.dataSource.data.find((x: AspiranteExcluido) => this.areEquals(x.numeroDocumento, this.f.numeroDocumento.value) && this.areEquals(x.idConvocatoria, this.f.idConvocatoria.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const res = (<any>await this.convocatoryServices.postAspiranteExcluido(this.f.numeroDocumento.value, this.f.idConvocatoria.value).toPromise()).datos.ExisteUsuario;
    if (res !== true) {
      this.alertService.message(this.ct.MSG_IDENTIDAD_NO_VALIDA, TYPES.WARNING);
      this.submit = false;
      return;
    }

    const newExclusion: AspiranteExcluido = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      idEmpresa: this.f.idEmpresa.value,
      numeroDocumento: this.f.numeroDocumento.value,
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
        NombreSoporte: C.generateNameFile(file.name, newExclusion.idConvocatoria, modulesSoports.ASPIRANTE_EXCLUIDO, documentsType.ASPIRANTE_EXCLUIDO, this.getDateString()),
        Modulo: modulesSoports.INSTRUCTIVOS,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fs.postFile(file, params).toPromise();
      newExclusion.idSoporte = documentFile.id;
    }

    this.convocatoryServices.saveAspiranteExcluido(newExclusion).toPromise()
      .then(ok => {
        this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value });
        this.loadData().then(() => {
          // this.formV.resetForm();
          this.cleanVars();
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

  public delete(element: AspiranteExcluido) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          // this.deleteIsSelected(element.id);
          /* if (this.elementCurrent.id === element.id) {
            // this.formV.resetForm();
            this.cleanVars();
            this.elementCurrent = {};
          } */
          this.convocatoryServices.deleteAspiranteExcluido(element)
            .subscribe(o => {
              this.deleteSoport(element.idSoporte);
              this.loadDataByConvocatoria({ value: element.idConvocatoria });
              this.loadData()
                .then(r => {
                  this.cleanVars();
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
    this.cleanVars();
    this.dataSource.data = [];
    this.dataSource.filter = '';
    this.formFilter.setValue('');
  }

  public cleanVars() {
    this.elementCurrent = {};
    this.f.numeroDocumento.setValue('');
    this.f.requiredfile.setValue('');
    this.f.observaciones.setValue('');
    this.clearInputFile(this.inputFileView);

    this.f.numeroDocumento.updateValueAndValidity();
    this.f.requiredfile.updateValueAndValidity();
    this.f.observaciones.updateValueAndValidity();
  }

  public getDateString() {
    return this.datepipe.transform(new Date(), 'ddMMyyyyHHmmss');
  }

}
