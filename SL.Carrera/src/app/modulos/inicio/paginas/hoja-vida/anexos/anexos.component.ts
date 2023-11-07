import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, FormControl, Validators } from '@angular/forms';
import { EmitterService } from '@app/core/servicios/emitter.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CurriculumVitaeService } from '@app/core/servicios/cv.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { DatePipe } from '@angular/common';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { configMsg, modulesSoports, documentsType } from '@app/compartido/helpers/enums';
import { Constants as C } from '@app/compartido/helpers/constants';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FileInput, FileValidator } from 'ngx-material-file-input';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { TypeFileAnnexed } from '@app/compartido/modelos/type-file-annexed';
import { Annexed } from '@app/compartido/modelos/annexed';
import { FilesService } from '@app/core/servicios/files.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';


@Component({
  selector: 'app-anexos',
  templateUrl: './anexos.component.html',
  styleUrls: ['./anexos.component.scss']
})
export class AnexosComponent extends BaseController implements OnInit, AfterViewChecked {

  public form: FormGroup;
  // public displayedColumns: string[] = ['nameAux', 'module', 'dateRegister', 'dateUpdate', 'soport', 'options'];
  public displayedColumns: string[] = ['typeFile', 'otherFile', 'soport', 'options'];
  public elementCurrent: any = {};
  public matcher: any;
  public updateData: Annexed[] = [];
  public lstTypeFileAnnexed = [];
  //public updateDataPersonal: DataPersonal;
  private user = this.commonService.getVar(configMsg.USER);
  public dataSource = new MatTableDataSource<any>([]);
  public submit = false;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('removableInput', { static: false }) inputFileView: ElementRef;

  constructor(private fb: FormBuilder,
    private emitter: EmitterService,
    private commonService: CommonService,
    private cvService: CurriculumVitaeService,
    private alertService: AlertService,
    public datepipe: DatePipe,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private fs: FilesService) {
    super();

    this.configFile.allowExtensions = commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = C.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);


    this.loadForm();
    this.loadData().finally(() => this.alertService.close());
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.dataSource.data.sort((a: Annexed, b: Annexed) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'typeFile': return this.compare(a.nameTypeFile, b.nameTypeFile, isAsc);
        case 'otherFile': return this.compare(a.otroArchivo, b.otroArchivo, isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        typeFile: new FormControl('', [Validators.required]),
        otherTypeFile: new FormControl({ value: '', disabled: true }, [Validators.maxLength(30)]),
        requiredfile: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
      }
    );

    this.listenerControls();
  }

  public listenerControls() {
    this.f.typeFile.valueChanges.subscribe(
      r => {
        this.f.otherTypeFile.clearValidators();
        this.f.otherTypeFile.setValidators([Validators.maxLength(30)]);
        this.f.otherTypeFile.setValue('');
        this.f.otherTypeFile.disable();
        this.f.otherTypeFile.updateValueAndValidity();
        this.lstTypeFileAnnexed.forEach(e => {
          if (e.tipoArchivo == 'Otro' && e.id === r) {
            this.f.otherTypeFile.enable();
            this.f.otherTypeFile.clearValidators();
            this.f.otherTypeFile.setValidators([Validators.required, Validators.maxLength(30)]);
            this.f.otherTypeFile.updateValueAndValidity();
            return;
          }
        });

      }
    );
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.lstTypeFileAnnexed = <TypeFileAnnexed[]>(<any>await this.commonService.getTypeFileAnnexed().toPromise()).datos;
    this.updateData = <Annexed[]>(<any>await this.cvService.getAnnexesByUser(this.user.id).toPromise()).datos;
    // this.updateData.sort((a: Annexed, b: Annexed) => {
    //   return C.getTime(new Date(b.fechaModificacion)) - C.getTime(new Date(a.fechaModificacion));
    // });

    if (this.updateData.length > 0) {
      this.updateData.forEach(e => {
        this.lstTypeFileAnnexed.forEach(g => {
          if (e.idTipoArchivo == g.id) {
            //e.nameTypeFile = g.tipoArchivo;
            e.nameTypeFile = this.translateField(g, 'tipoArchivo', this.lang);
          }
        });
      });
    }

    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
    this.dataSource.data = this.updateData;
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

  get f() {
    return this.form.controls;
  }

  // public async addAnnexed(viewInputFile: any) {
  public async addAnnexed() {
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
      this.f.requiredfile.markAsTouched();
      return;
    }

    this.alertService.loading();

    const otherAnnexed = this.lstTypeFileAnnexed.find((x: TypeFileAnnexed) => x.tipoArchivo == 'Otro');

    //validar que no se encuetre el tipo de archivo ya registrado
    if (this.f.typeFile.value !== otherAnnexed.id) {
      this.updateData.forEach(e => {
        if ((this.f.id.value != e.id && this.f.typeFile.value == e.idTipoArchivo)) {
          this.alertService.message("Ya se encuentra registrado ese tipo de archivo", TYPES.WARNING);
          this.submit = false;
          return;
        }
      });
    }


    if (!this.submit) {
      return;
    }

    const newFile: Annexed = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idTipoArchivo: this.f.typeFile.value,
      idSoporte: this.elementCurrent.idSoporte,
      otroArchivo: this.f.otherTypeFile.value
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
        NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.ANEXO, documentsType.SOPORTE, this.commonService.getDateString()),
        Modulo: modulesSoports.ANEXO,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fs.postFile(file, params).toPromise();
      newFile.idSoporte = documentFile.id;
    }

    this.cvService.saveAnnexed(newFile).toPromise()
      .then(res => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.elementCurrent = {};
          this.clearInputFile(this.inputFileView);
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
          this.emitter.emitterCv({ progressBar: true });
        });
      })
      .catch(err => {
        console.log('Error', err);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public async edit(element: Annexed) {
    this.alertService.loading();

    this.scrollTop();
    this.clearInputFile(this.inputFileView);
    this.elementCurrent = C.cloneObject(element);

    if (this.elementCurrent.id) {
      this.elementCurrent.nameTypeFileAux = (<any>await this.fs.getInformationFile(this.elementCurrent.idSoporte).toPromise()).datos.nombreAuxiliar;
      //console.log(this.elementCurrent)
      // this.f.requiredfile.clearValidators();
      // this.f.requiredfile.setValidators([FileValidator.maxContentSize(this.configFile.sizeFile)]);
      // this.f.requiredfile.updateValueAndValidity();
      C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
    }

    this.form.patchValue({
      id: element.id,
      typeFile: element.idTipoArchivo,
      otherTypeFile: element.otroArchivo
    });

    this.alertService.close();

  }

  public delete(element: Annexed) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          if (this.elementCurrent.id == element.id) {
            this.formV.resetForm();
            this.elementCurrent = {};
          }
          this.cvService.deleteAnexo(element.id)
            .subscribe(() => {
              this.deleteSoport(element.idSoporte);
              this.loadData();
              this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                .finally(() => this.submit = false);
            }, err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
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

  private deleteIsSelected(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
    // this.f.requiredfile.clearValidators();
    // this.f.requiredfile.setValidators([Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]);
    // this.f.requiredfile.updateValueAndValidity();
    this.clearInputFile(this.inputFileView);
    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
  }

  public deleteFileView() {
    this.elementCurrent.nameTypeFileAux = null;
    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
    this.f.requiredfile.setValue(null);
  }

}
