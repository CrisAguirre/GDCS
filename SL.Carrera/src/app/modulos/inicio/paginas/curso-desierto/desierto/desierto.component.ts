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
  selector: 'app-desierto',
  templateUrl: './desierto.component.html',
  styleUrls: ['./desierto.component.scss']
})
export class DesiertoComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['convocatoria', 'fechaIngreso', 'fechaRetiro','soporte', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public elementCurrent: any = {};
  public sortedData: any;

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
    public datepipe: DatePipe,
    private alertService: AlertService,
    private ct: CustomTranslateService
    
  ) {
    super();
   }

  ngOnInit() {
    this.loadForm();
    this.loadData();

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }


  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    
  }


  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
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
    this.elementCurrent = C.cloneObject(element);
    this.clearInputFile(this.inputFileView);
    this.scrollTop();
    if (this.elementCurrent.id && this.elementCurrent.idSoporte) {
      this.elementCurrent.nameTypeFileAux = (<any>await this.fs.getInformationFile(this.elementCurrent.idSoporte).toPromise()).datos.nombreAuxiliar;
      C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
    }
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.idUsuarioModificacion,
      idConvocatoria: element.idConvocatoria,
      initDate: element.fechaInicio,
      endDate: element.fechaFin
    });  
  }

 /* public async addDesierto() {
    
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

    const newDesierto: DiasHabilesVacantes = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
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
        NombreSoporte: C.generateNameFile(file.name, newDesierto.idConvocatoria, modulesSoports.INSCRIPCION_VACANTES, documentsType.INSCRIPCION_VACANTES, this.getDateString()),
        Modulo: modulesSoports.INSTRUCTIVOS,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fs.postFile(file, params).toPromise();
      newDesierto.idSoporte = documentFile.id;
    }

    this.convocatoryServices.saveDiasHabilesVacantes(newDesierto).toPromise()
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
  }*/

  /*public delete(element: DiasHabilesVacantes) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
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
  }*/

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
  }

  public getDateString() {
    return this.datepipe.transform(new Date(), 'ddMMyyyyHHmmss');
  }

}
