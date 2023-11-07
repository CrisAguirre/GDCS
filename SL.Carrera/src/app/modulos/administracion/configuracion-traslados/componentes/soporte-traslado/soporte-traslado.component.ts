import { SoporteTrasladoModel } from '@app/compartido/modelos/soporte-traslado-model';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource, Sort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { TipoTrasladoModel } from '@app/compartido/modelos/tipo-traslado-model';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { TrasladosService } from '@app/core/servicios/traslados.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { configMsg, documentsType, modulesSoports, PermisosAcciones } from '@app/compartido/helpers/enums';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { FileInput } from 'ngx-material-file-input';
import { FilesService } from '@app/core/servicios/files.service';
import { SoporteModel } from '@app/compartido/modelos/soporte-model';

@Component({
  selector: 'app-soporte-traslado',
  templateUrl: './soporte-traslado.component.html',
  styleUrls: ['./soporte-traslado.component.scss']
})
export class SoporteTrasladoComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstSoporteTrasladoAll: SoporteTrasladoModel[] = [];
  public lstSoporteByTraslado: SoporteTrasladoModel[] = [];
  public lstTipoTraslado: TipoTrasladoModel[] = [];
  public lstSoportesByUsuario: SoporteModel[] = [];

  private user = this.commonService.getVar(configMsg.USER);
  public form: FormGroup;
  public submit = false;
  public elementCurrent: any = {};
  public reqCampoIngles: boolean;
  public matcher: any;
  public sortedData: any;

  public displayedColumns: string[] = ['tipoTraslado', 'nombreSoporteTraslado', 'soporte', 'options'];
  public dataSource = new MatTableDataSource<any>([]);

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private fService: FilesService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private trasladoService: TrasladosService
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    C.sendMessage(true, this.messageEvent);
    this.loadForm();
    this.loadExtensions();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: SoporteTrasladoModel, filter: string): boolean => {
      const dataCompare = [data.tipoTraslado.tipoTraslado, data.nombreSoporte];
      return C.filterTable(dataCompare, filter);
    }
  }

  public sortDataInfo(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: SoporteTrasladoModel, b: SoporteTrasladoModel) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'tipoTraslado': return this.compare(a.tipoTraslado.tipoTraslado, b.tipoTraslado.tipoTraslado, isAsc);
        case 'nombreSoporteTraslado': return this.compare(a.nombreSoporte, b.nombreSoporte, isAsc);
        default: return 0;
      }
    });
  }

  public async loadExtensions() {
    const exten = (await this.commonService.getMessageByName(configMsg.ALLOW_EXTENSIONS_TEMPLATES).toPromise() as any).datos.valor as any;
    this.configFile.allowExtensions = exten;
    this.configFile.sizeFile = C.byteToMb(Number(this.commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.lstSoportesByUsuario = (await this.fService.getSoporteByUsuario(this.user.id).toPromise() as any).datos as SoporteModel[];
    this.lstTipoTraslado = (await this.trasladoService.getTodosTipoTraslados().toPromise() as any).datos as TipoTrasladoModel[];
    this.lstSoporteTrasladoAll = (await this.trasladoService.getTodosSoporteXTraslado().toPromise() as any).datos as SoporteTrasladoModel[];
    if (this.lstSoporteTrasladoAll.length > 0) {
      this.lstSoporteTrasladoAll.forEach(st => {

        this.lstTipoTraslado.forEach(tt => {
          if (st.idTipoTraslado === tt.id) {
            st.tipoTraslado = tt;
            return;
          }
        });

        this.lstSoportesByUsuario.forEach(su => {
          if (su.id === st.idSoporte) {
            st.soporte = su;
            return;
          }
        });
      });
    }
    this.dataSource.data = this.lstSoporteTrasladoAll;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idTipoTraslado: new FormControl('', [Validators.required]),
        idSoporte: new FormControl('', [Validators.required]),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public async saveSoporteTraslado() {
    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      this.f.idSoporte.markAsTouched();
      return;
    }

    this.alertService.loading();
    const newSoporteTraslado: SoporteTrasladoModel = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idTipoTraslado: this.f.idTipoTraslado.value,
      idSoporte: ''
    };

    const tipoTraslado: TipoTrasladoModel = this.lstTipoTraslado.find(tt => tt.id === this.f.idTipoTraslado.value);

    if (this.f.idSoporte.value) {
      if (this.elementCurrent.soporte) {
        try {
          await this.fService.deleteFile(this.elementCurrent.idSoporte).toPromise();
        } catch (e) {
          this.alertService.showError(e);
        }
      }
      const file = (<FileInput>this.f.idSoporte.value).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, tipoTraslado.tipoTraslado, modulesSoports.SOPORTE_TRASLADO, documentsType.SOPORTE, this.commonService.getDateString()),
        Modulo: modulesSoports.CONVOCATORIA,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      }
      const documentFile: any = await this.fService.postFile(file, params).toPromise();
      newSoporteTraslado.idSoporte = documentFile.id;
    }

    this.trasladoService.saveSoporteXTraslado(newSoporteTraslado).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.cleanForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public async edit(element: SoporteTrasladoModel) {
    this.elementCurrent = C.cloneObject(element);
    this.cleanForm();
    this.scrollTop();

    if (this.elementCurrent.idSoporte) {
      try {
        this.elementCurrent.nombreSoporteAcuerdo = (<any> await this.fService.getInformationFile(this.elementCurrent.idSoporte).toPromise()).datos.nombreAuxiliar;
        C.setValidatorFile(false, this.f.idSoporte, this.configFile.sizeFile);
      } catch (err) {
        this.elementCurrent.soporte = null;
        this.alertService.showError(err);
      }
    }

    this.form.patchValue({
      id: element.id,
      idTipoTraslado: element.idTipoTraslado,
      // idSoporte: element.idSoporte
    });
  }

  public delete(element: SoporteTrasladoModel) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
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
          this.trasladoService.deleteSoporteXTraslado(element)
            .subscribe(o => {
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

  private deleteIsSelected(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fService.downloadFile(id).subscribe(
      res => {
        let blob: any = new Blob([res], { type: 'application/msword; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        this.alertService.showError(error);
      }
    );
  }

  public deleteFileView() {
    this.elementCurrent.idSoporte = null;
    C.setValidatorFile(true, this.f.idSoporte, this.configFile.sizeFile);
    this.f.idSoporte.setValue(null);
  }
  
  public cleanForm() { 
    this.formV.resetForm();
    this.elementCurrent = {};
  }
}
