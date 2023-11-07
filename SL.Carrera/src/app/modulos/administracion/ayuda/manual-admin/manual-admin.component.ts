import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { CommonService } from '@app/core/servicios/common.service';
import { EventEmitter } from '@angular/core';
import { Constants as C } from '@app/compartido/helpers/constants';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { FileInput, FileValidator } from 'ngx-material-file-input';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { Instructivo } from '@app/compartido/modelos/instructivo';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { FilesService } from '@app/core/servicios/files.service';
import { configMsg, modulesSoports, documentsType } from '@app/compartido/helpers/enums';
import { DatePipe } from '@angular/common';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';


@Component({
  selector: 'app-manual-admin',
  templateUrl: './manual-admin.component.html',
  styleUrls: ['./manual-admin.component.scss']
})
export class ManualAdminComponent extends BaseController implements OnInit, AfterViewChecked {


  

  public displayedColumns: string[] = ['id', 'nombreInstructivo', 'nombreInstructivo_En', 'soporte', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public elementCurrent: any = {};

  public lstInstructivo: Instructivo[] = [];
  public matcher: any;
  public reqCampoIngles: boolean;

  private user = this.commonService.getVar(configMsg.USER);

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('removableInput', { static: false }) inputFileView: ElementRef;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private configurationService: AdministracionConfiguracionService,
    private fs: FilesService,
    public datepipe: DatePipe,
  ) { 
    super();

    this.configFile.allowExtensions = commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = C.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
  }

  ngOnInit() {
    C.sendMessage(true, this.messageEvent);
    this.loadForm();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.dataSource.data.sort((a: Instructivo, b: Instructivo) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'nombreInstructivo': return this.compare(a.nombreInstructivo, b.nombreInstructivo, isAsc);
        case 'nombreInstructivo_En': return this.compare(a.nombreInstructivo_En, b.nombreInstructivo_En, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.lstInstructivo = <Instructivo[]> (<any> await this.commonService.getInstructivo().toPromise()).datos;
    this.dataSource.data = this.lstInstructivo;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        nombreInstructivo: new FormControl('', [Validators.required]),
        nombreInstructivo_En: new FormControl('', [Validators.required]),
        requiredfile: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
      }
    );
    this.reqCampoIngles = this.commonService.campoInglesRequerido(this.f.nombreInstructivo_En);
  }

  get f() {
    return this.form.controls;
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

  public async edit(element: Instructivo) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element); 
    this.clearInputFile(this.inputFileView);
    if (this.elementCurrent.id) {
      this.elementCurrent.nameTypeFileAux = (<any> await this.fs.getInformationFile(this.elementCurrent.idSoporte).toPromise()).datos.nombreAuxiliar;
      C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
    }
    this.form.patchValue({
      id: element.id,
      nombreInstructivo: element.nombreInstructivo,
      nombreInstructivo_En: element.nombreInstructivo_En,       
    });
  }

  public async addManual() {

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
      this.f.requiredfile.markAsTouched();
      return;
    }

    const obj = this.dataSource.data.find((x: Instructivo) => this.areEquals(x.nombreInstructivo, this.f.nombreInstructivo.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newInstructivo: Instructivo = {
      id: this.f.id.value ? this.f.id.value : undefined,
      nombreInstructivo: this.f.nombreInstructivo.value,
      nombreInstructivo_En: this.f.nombreInstructivo_En.value,
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
        NombreSoporte: C.generateNameFile(file.name, newInstructivo.nombreInstructivo, modulesSoports.INSTRUCTIVOS, documentsType.INSTRUCTIVOS, this.getDateString()),
        Modulo: modulesSoports.INSTRUCTIVOS,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fs.postFile(file, params).toPromise();
      newInstructivo.idSoporte = documentFile.id;
    }

    this.configurationService.saveInstructivo(newInstructivo).toPromise()
      .then(ok => {
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

  public delete(element: Instructivo) {

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
          this.configurationService.deleteInstructivo(element)
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

  public deleteSoport(idSoport) {
    if (idSoport) {
      this.fs.deleteFile(idSoport).toPromise()
        .catch(err => {
          console.log('Error', err);
        });
    }
  }

  public deleteFileView() {
    this.elementCurrent.nameTypeFileAux = null;
    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
    this.f.requiredfile.setValue(null);
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
