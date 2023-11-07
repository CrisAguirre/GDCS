import { Component, OnInit, AfterViewChecked, ChangeDetectorRef, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialogRef, MatDialog, Sort } from '@angular/material';
import { FormGroup, FormBuilder, NgForm, FormControl, Validators, FormArray } from '@angular/forms';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { FilesService } from '@app/core/servicios/files.service';
import { configMsg, modulesSoports, documentsType, stateConvocatoria } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Constants as C } from '@app/compartido/helpers/constants';
import { TypeConvocatory } from '@app/compartido/modelos/type-convocatory';
import { AcuerdoConvocatoria } from './../../../../../compartido/modelos/acuerdo-convocatoria';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { TipoAjusteAcuerdo } from '@app/compartido/modelos/tipo-ajuste-acuerdo';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { VariableAppModel } from '@app/compartido/modelos/variable-app-model';


@Component({
  selector: 'app-aclaraciones-modificaciones',
  templateUrl: './aclaraciones-modificaciones.component.html',
  styleUrls: ['./aclaraciones-modificaciones.component.scss']
})
export class AclaracionesModificacionesComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['nombreConvocatoria', 'numeroConvocatoria', 'nombreTipoConvocatoria', 'tipoAjusteAcuerdo', 'codigoAcuerdo', 'fechaAcuerdo', 'nombreSoporteAcuerdo', 'options'];
  public lstConvocatory: Convocatoria[] = [];
  public lstTypeConvocatory: TypeConvocatory[] = [];

  public lstAgreementsConvocatory: AcuerdoConvocatoria[] = [];

  public lstAgreementsTemp: AcuerdoConvocatoria[] = [];
  public lstAgreementsByCompany: AcuerdoConvocatoria[] = [];
  public lstAgreementsType: TipoAjusteAcuerdo[] = [];
  public lstJobsOp: Convocatoria[] = [];
  public dataSource = new MatTableDataSource<any>([]);
  public sortedData: any;
  public form: FormGroup;
  public submit = false;
  private user = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public agreementCurrent: any = {};
  public minDate: Date;
  public matcher: any;

  public idEmpresaT = null;
  public company: FormControl = new FormControl('', [Validators.required]);
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];

  public varModificarConvSuperAdmin: VariableAppModel;

  public displayedColumnsInfo: string[] = ['numeroConvocatoria', 'numeroAcuerdo', 'fechaAcuerdo', 'tipoAjusteAcuerdo', 'vigente', 'soporte'];
  public dataSourceInfo = new MatTableDataSource<any>([]);
  private dialogRefInfo: MatDialogRef<any, any>;

  // tslint:disable-next-line: no-output-rename
  // @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) paginator2: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('inputSoport', { static: false }) inputFileView: ElementRef;
  @ViewChild('paginatorDialog2', { static: false }) set paginatorDialog2(value: MatPaginator) {
    this.dataSourceInfo.paginator = value;
  }
  @ViewChild('sortInfo2', { static: false }) set sortInfo2(value: MatSort) {
    this.dataSourceInfo.sort = value;
  }

  constructor(
    private alertService: AlertService,
    private adminConvocatoryService: AdministracionConvocatoriaService,
    private convocatoryServices: ConvocatoriaService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private empresaService: EmpresaService,
    private fService: FilesService,
    private cdRef: ChangeDetectorRef,
    private dialogService: MatDialog
  ) {
    super();
    this.configFile.allowExtensions = commonService.getVar(configMsg.ALLOW_EXTENSIONS);
    this.configFile.sizeFile = C.byteToMb(Number(commonService.getVar(configMsg.SIZE_FILE)));
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.alertService.loading();
    this.loadUserData();
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
  }

  public sortDataInfo(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSourceInfo.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'numeroConvocatoria': return this.compare(a.numeroConvocatoria, b.numeroConvocatoria, isAsc);
        case 'numeroAcuerdo': return this.compare(a.codigoAcuerdo, b.codigoAcuerdo, isAsc);
        case 'fechaAcuerdo': return this.compare(a.fechaAcuerdo, b.fechaAcuerdo, isAsc);
        case 'tipoAjusteAcuerdo': return this.compare(a.tipoAjusteAcuerdo ? a.tipoAjusteAcuerdo.ajusteAcuerdo : '', b.tipoAjusteAcuerdo ? b.tipoAjusteAcuerdo.ajusteAcuerdo : '', isAsc);
        case 'vigente': return this.compare(a.vigente, b.vigente, isAsc);
        default: return 0;
      }
    });
  }

  public async loadUserData() {
    this.company = null;
    this.idEmpresaT = null;
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      this.lstCompanies = (<any>await this.empresaService.getListarEmpresas().toPromise()).datos;
    } else {
      this.showSelectCompany = false;
      this.idEmpresaT = this.user.idEmpresa;
      this.company.setValue(this.user.idEmpresa);
      this.company.setValidators([]);
      this.company.updateValueAndValidity();
    }
  }

  public async loadAgreementsByCompany(pCompany: any) {
    this.lstAgreementsByCompany = [];
    this.lstAgreementsByCompany = (await this.convocatoryServices.getAcuerdosConvocatoria(pCompany.value).toPromise() as any).datos;
    this.dataSource.data = this.lstAgreementsByCompany;
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.varModificarConvSuperAdmin = (await this.commonService.getMessageByName(configMsg.MODIFICAR_CONVOCATORIA_SUPERADMIN).toPromise() as any).datos as VariableAppModel;
    this.lstAgreementsType = (await this.adminConvocatoryService.getTipoAjusteAcuerdo().toPromise() as any).datos as TipoAjusteAcuerdo[];
    this.lstTypeConvocatory = (await this.adminConvocatoryService.getTipoConvocatoria().toPromise() as any).datos as TypeConvocatory[];

    this.lstConvocatory = [];
    this.lstConvocatory = (await this.convocatoryServices.getConvocatorias().toPromise() as any).datos as Convocatoria[];
    this.lstConvocatory = this.lstConvocatory.filter(c => c.estadoConvocatoria === stateConvocatoria.PUBLICADA || c.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES || c.estadoConvocatoria === stateConvocatoria.CERRADA);
    this.dataSource.data = [];
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        idConvocatoria: new FormControl(''),
        numeroConvocatoria: new FormControl({ value: '', disabled: true }, [Validators.required]),
        nombreConvocatoria: new FormControl({ value: '', disabled: true }, [Validators.required]),
        idTipoConvocatoria: new FormControl({ value: '', disabled: true }, [Validators.required]),
        idTipoAjusteAcuerdo: new FormControl('', [Validators.required]),
        codigoAcuerdo: new FormControl('', [Validators.required]),
        fechaAcuerdo: new FormControl('', [Validators.required]),
        requiredfile: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
        observaciones: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
      }
    );
    this.company = new FormControl('', [Validators.required]);
    this.listenerControls(false);
  }

  get f() {
    return this.form.controls;
  }

  public async addAgreementConvocatory(element: any) {
    var convocariaAux = this.lstConvocatory.find((x: any) => x.id === element.idConvocatoria);
    if (convocariaAux && convocariaAux.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING);
      return;
    }

    this.scrollTop();
    this.cleanForm();
    this.elementCurrent = C.cloneObject(element);
    this.elementCurrent.idSoporteAcuerdo = undefined;

    if (element.lstAcuerdos && element.lstAcuerdos.length > 0) {
      const acuerdoVigente = element.lstAcuerdos.find(a => a.vigente);
      if (acuerdoVigente) {
        this.agreementCurrent = acuerdoVigente;
      } else {
        this.agreementCurrent = null;
      }
    }

    this.loadAgreementsByCompany({ value: element.idEmpresa });
    this.minDate = new Date(element.fechaAcuerdo);
    this.form.patchValue({
      idConvocatoria: element.idConvocatoria,
      idUsuarioModificacion: this.user.id,
      numeroConvocatoria: element.numeroConvocatoria,
      nombreConvocatoria: element.nombreConvocatoria,
      idTipoConvocatoria: element.tipoConvocatoria.tipoConvocatoria,
      company: element.idEmpresa
    });
    this.company.setValue(element.idEmpresa);
    this.company.updateValueAndValidity();
    this.listenerControls(true);
  }

  public listenerControls(value: any) {
    if (value) {
      this.f.idTipoAjusteAcuerdo.enable();
      this.f.codigoAcuerdo.enable();
      this.f.fechaAcuerdo.enable();
      this.f.requiredfile.enable();
      this.f.observaciones.enable();
      C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
    } else {
      this.f.idTipoAjusteAcuerdo.disable();
      this.f.codigoAcuerdo.disable();
      this.f.fechaAcuerdo.disable();
      this.f.requiredfile.setValue(undefined);
      this.f.requiredfile.disable();
      this.f.observaciones.disable();
      // C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
    }
    this.f.idTipoAjusteAcuerdo.updateValueAndValidity();
    this.f.codigoAcuerdo.updateValueAndValidity();
    this.f.fechaAcuerdo.updateValueAndValidity();
    this.f.requiredfile.updateValueAndValidity();
    this.f.observaciones.updateValueAndValidity();
  }

  public async addAgreement() {
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

    if (!this.elementCurrent.id && !this.elementCurrent.idConvocatoria) {
      this.alertService.message(this.ct.MSG_SELECT_AGREEMENT, TYPES.WARNING);
      this.submit = false;
      return;
    }

    if (this.company.value) {
      this.idEmpresaT = this.company.value;
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    this.alertService.loading();
    const newRegistry: AcuerdoConvocatoria = {
      id: undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      idTipoAjusteAcuerdo: this.f.idTipoAjusteAcuerdo.value,
      numeroAcuerdo: this.f.codigoAcuerdo.value,
      fechaAcuerdo: this.f.fechaAcuerdo.value,
      idSoporteAcuerdo: this.elementCurrent.idSoporteAcuerdo,
      observaciones: this.f.observaciones.value,
      vigente: 1,
      idEmpresa: this.company.value
    };

    // Guarda el soporte
    if (this.f.requiredfile.value) {
      const file = (this.f.requiredfile.value as FileInput).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.CONVOCATORIA, documentsType.SOPORTE, this.commonService.getDateString()),
        Modulo: modulesSoports.CONVOCATORIA,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      };
      const documentFile: any = await this.fService.postFile(file, params).toPromise();
      newRegistry.idSoporteAcuerdo = documentFile.id;
    }
    // Guarda el acuerdo
    this.convocatoryServices.saveAcuerdoConvocatoria(newRegistry).toPromise()
      .then(ok => {
        if (this.agreementCurrent) {
          const acuerdoTemp: AcuerdoConvocatoria = {
            id: this.agreementCurrent.idAcuerdo,
            idUsuarioModificacion: this.user.id,
            idConvocatoria: this.elementCurrent.idConvocatoria,
            idTipoAjusteAcuerdo: this.agreementCurrent.tipoAjusteAcuerdo.id,
            numeroAcuerdo: this.agreementCurrent.codigoAcuerdo,
            fechaAcuerdo: this.agreementCurrent.fechaAcuerdo,
            idSoporteAcuerdo: this.agreementCurrent.soporte.id,
            idEmpresa: this.agreementCurrent.idEmpresa,
            vigente: 0
          }

          this.convocatoryServices.saveAcuerdoConvocatoria(acuerdoTemp).toPromise()
            .then(() => {
              
            }).catch(error => {
              console.log('Error', error);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            });
        } 
        this.loadData().then(() => {
          this.loadAgreementsByCompany(this.company).then(() => {
            // this.dataSource.data = this.lstAgreementsByCompany;
            this.cleanForm();
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
              .finally(() => this.submit = false);
          });

        });
      }).catch(error => {
        console.log('Error', error);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });

  }

  public deleteFileView() {
    this.elementCurrent.idSoporteAcuerdo = null;
    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
    this.f.requiredfile.setValue(null);
  }

  public viewFile(id) {
    if (!id) {
      return;
    }
    this.fService.downloadFile(id).subscribe(
      res => {
        let blob: any = new Blob([res], { type: 'application/pdf; charset=utf-8' });
        C.viewFile(blob);
      }, error => {
        console.log('Error', error);
      }
    );
  }

  public async seeAllAgreementsByConvocatory(element: any) {
    this.lstAgreementsType = (await this.adminConvocatoryService.getTipoAjusteAcuerdo().toPromise() as any).datos as TipoAjusteAcuerdo[];
    if (element.lstAcuerdos && element.lstAcuerdos.length > 0) {
      element.lstAcuerdos.sort((a, b) => {
        return (a.vigente < b.vigente ? 1 : -1);
      });
      this.dataSourceInfo.data = element.lstAcuerdos;
    }

    this.dialogRefInfo = this.dialogService.open(this.dialogInfo);
    this.dialogRefInfo.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public closeDialogInfo() {
    this.dialogRefInfo.close();
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
    this.agreementCurrent = {};
    this.submit = false;
    this.minDate = null;
    this.clearInputFile(this.inputFileView);
    C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
    this.f.requiredfile.setValue('');
    this.f.requiredfile.markAsUntouched();
    this.listenerControls(false);
  }

  public modConvSA(convocatoria: Convocatoria) {
    // if (convocatoria.estadoConvocatoria == stateConvocatoria.PUBLICADA || convocatoria.estadoConvocatoria == stateConvocatoria.PUBLICADA_CON_AJUSTES) {
    if (convocatoria.estadoConvocatoria == stateConvocatoria.CERRADA) {
      if (this.varModificarConvSuperAdmin.valor === '1' && this.isSuperAdmin(this.user)) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}
