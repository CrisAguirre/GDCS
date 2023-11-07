import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, ElementRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { NgForm, FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { TypeSede } from '@app/compartido/modelos/type-sede';
import { TipoCargo } from '@app/compartido/modelos/tipo-cargo';
import { TypePlace } from '@app/compartido/modelos/type-place';
import { TypeConvocatory } from '@app/compartido/modelos/type-convocatory';
import { FileValidator, FileInput } from 'ngx-material-file-input';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg, modulesSoports, documentsType, stateConvocatoria } from '@app/compartido/helpers/enums';
import { Constants as C, Constants } from '@app/compartido/helpers/constants';
import { FilesService } from '@app/core/servicios/files.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { CustomErrorFile } from '@app/compartido/helpers/custom-error-file';
import { Empresa } from '@app/compartido/modelos/empresa';
import { VariableAppModel } from '@app/compartido/modelos/variable-app-model';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { Configuration } from '@app/compartido/modelos/configuration';
// import * as enums from '@app/compartido/helpers/enums';

@Component({
  selector: 'app-convocatoria-admin',
  templateUrl: './convocatoria-admin.component.html',
  styleUrls: ['./convocatoria-admin.component.scss']
})
export class ConvocatoriaAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public convocatory: Convocatoria[] = [];
  public convocatoryTemp: any[] = [];
  public lstTypeSede: TypeSede[] = [];
  public lstTipoCargo: TipoCargo[] = [];
  public lstTypeSedeTemp: TypeSede[] = [];
  public lstTypeConvocatory: TypeConvocatory[] = [];
  public lstTypePlace: TypePlace[] = [];
  public lstTypePlaceString: string[] = [];
  public requiredCorporation = false;
  public elementCurrent: any = {};
  public submit = false;
  private user = this.commonService.getVar(configMsg.USER);
  public stateConvocatoria = stateConvocatoria;
  public filteredOptions: Observable<any[]>;
  public matcher: any;
  public varModificarConvSuperAdmin: VariableAppModel;
  public now = new Date();

  public idEmpresaT = null;
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];
  public lstConvocatoriasByEmpresa: Convocatoria[] = [];

  public configCargosConvAplicaAspirante: Configuration;
  public showFieldCargosAplicaAspirante = false;

  public showFieldInvitacion = false;

  public form: FormGroup;
  // public displayedColumns: string[] = ['nombreConvocatoria', 'numeroConvocatoria', 'nombreTipoConvocatoria', 'nombreTipoSede', 'nombreTipoLugar', 'numeroCargosAplicar', 'codigoAcuerdo', 'nombreSoporteAcuerdo', 'options'];
  //public displayedColumns: string[] = ['id', 'nombreConvocatoria', 'numeroConvocatoria', 'nombreTipoConvocatoria', 'nombreTipoSede', 'nombreTipoCargo', 'codigoAcuerdo', 'nombreSoporteAcuerdo', 'estado', 'options'];
  public displayedColumns: string[] = ['id', 'nombreConvocatoria', 'numeroConvocatoria', 'nombreTipoConvocatoria', 'nombreTipoSede', 'nombreTipoCargo', 'codigoAcuerdo', 'nombreSoporteAcuerdo', 'soporteInscripcion', 'soporteInvitacion', 'estado', 'options'];
  public dataSource = new MatTableDataSource<any>([]);

  public lstModelos = Constants.tipoModelos;

  private idAltasCortes: Configuration;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('inputSoport', { static: false }) inputFileView: ElementRef;
  @ViewChild('inputSoport2', { static: false }) inputFileView2: ElementRef;
  @ViewChild('inputSoport3', { static: false }) inputFileView3: ElementRef;

  public divFormAltasCortes: ElementRef;
  @ViewChild('divFormAltasCortes', { static: false }) set divFormAC(value: ElementRef) {
    if (!this.divFormAltasCortes) {
      value.nativeElement.hidden = true;
    }
    this.divFormAltasCortes = value;
  }

  public divFormSoporte: ElementRef;
  @ViewChild('divFormSoporte', { static: false }) set divFormS(value: ElementRef) {
    if (!this.divFormSoporte) {
      value.nativeElement.hidden = true;
    }
    this.divFormSoporte = value;
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
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    this.alertService.loading();
    this.matcher = new CustomErrorFile(this.configFile.allowExtensions.split(','), this.configFile.sizeFile, this.ct);

    this.loadForm();
    this.loadUserData();
    this.loadData()
      .catch(error => {
        console.log('Error', error);
      })
      .finally(() => {
        this.alertService.close();
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.filteredOptions = this.f.idTipoSede.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value != null ? value.sede : ''),
        map(sede => sede ? this._filter(sede) : this.lstTypeSede.slice())
      );

    this.dataSource.filterPredicate = (data: Convocatoria, filter: string): boolean => {
      const dataCompare = [data.id, data.nombreConvocatoria, data.numeroConvocatoria,
      data.nombreTipoConvocatoria, data.nombreTipoSede, data.nombreTipoCargo, data.codigoAcuerdo,
      (data.estadoConvocatoria === 0 ? this.ct.INACTIVA : (data.estadoConvocatoria === 5 ? this.ct.CERRADA :
        (data.estadoConvocatoria === 3 || data.estadoConvocatoria === 4 ? this.ct.PUBLICADA : this.ct.ACTIVA)))];
      return C.filterTable(dataCompare, filter);
    };



  }


  private _filter(value: any): any[] {
    if (!value || value === '') {
      return this.lstTypeSede;
    }
    const filterValue = value.toLowerCase();
    return this.lstTypeSede.filter(e => e.sede.toLowerCase().includes(filterValue));
    // return this.options.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  public displayFn(element: any): string {
    return element && element.sede ? element.sede : '';
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public async loadUserData() {
    this.idEmpresaT = null;
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      this.lstCompanies = (<any>await this.empresaService.getListarEmpresas().toPromise()).datos;
    } else {
      this.showSelectCompany = false;
      this.idEmpresaT = this.user.idEmpresa;
      this.f.idEmpresa.setValue(this.user.idEmpresa);
      this.f.idEmpresa.setValidators([]);
      this.f.idEmpresa.updateValueAndValidity();
    }
  }

  public async loadConvocatoryByCompany(pCompany: any) {
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstConvocatoriasByEmpresa = (<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise()).datos;
    
    const lstConvocatoryTemp = this.loadDataConvocatory(this.lstConvocatoriasByEmpresa);
    this.dataSource.data = lstConvocatoryTemp;
    // this.dataSource.data = this.lstConvocatoriasByEmpresa;

    /* this.lstTypeSede = (await this.adminConvocatoryService.getTodosTipoSedeByEmpresa(pCompany.value).toPromise() as any).datos; */
  }

  public async loadData() {
    this.varModificarConvSuperAdmin = (await this.commonService.getMessageByName(configMsg.MODIFICAR_CONVOCATORIA_SUPERADMIN).toPromise() as any).datos as VariableAppModel;
    this.lstTypeConvocatory = <TypeConvocatory[]>(<any>await this.adminConvocatoryService.getTipoConvocatoria().toPromise()).datos;
    this.lstTypeSede = <TypeSede[]>(<any>await this.adminConvocatoryService.getTipoSede().toPromise()).datos;
    this.lstTipoCargo = <TipoCargo[]>(<any>await this.adminConvocatoryService.getTipoCargo().toPromise()).datos;
    this.lstTypePlace = <TypePlace[]>(<any>await this.adminConvocatoryService.getTipoLugar().toPromise()).datos;

    this.idAltasCortes = await this.commonService.getVarConfig(configMsg.FUNCIONARIOS_ALTAS_CORTES);
    this.setJson(this.idAltasCortes);

    // traducir la lista, en el case de que sea de buesqueda
    this.lstTypeSede.forEach(x => x.sede = this.translateField(x, 'sede', this.lang));

    this.f.corporation = new FormArray([], [Validators.required]);
    this.lstTypePlace.forEach((o, i) => {
      const control = new FormControl(false);
      (this.f.corporation as FormArray).push(control);
    });

    this.convocatory = [];
    /* if (this.idEmpresaT && !this.showSelectCompany) {
      this.convocatory = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.idEmpresaT).toPromise()).datos;
    } else  */
    if (this.f.idEmpresa.value) {
      this.convocatory = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise()).datos;      
    } else {
      this.convocatory = <Convocatoria[]>(<any>await this.convocatoryServices.getConvocatorias().toPromise()).datos;      
    }

    /* this.dataSource.data = this.convocatory; */
    const lstConvocatoryTemp = this.loadDataConvocatory(this.convocatory);
    this.dataSource.data = lstConvocatoryTemp;

    this.configCargosConvAplicaAspirante = await this.commonService.getVarConfig(configMsg.CARGOS_CONVOCATORIA_APLICA_ASPIRANTE);

    if (Number(this.configCargosConvAplicaAspirante.valor) === 1) {
      this.f.numeroCargosAplicar.setValidators([Validators.required, Validators.maxLength(10)]);
      this.showFieldCargosAplicaAspirante = true;
    } else {
      this.f.numeroCargosAplicar.clearValidators();
      this.f.numeroCargosAplicar.setValue('1');
      this.showFieldCargosAplicaAspirante = false;
    }
    this.f.numeroCargosAplicar.updateValueAndValidity();
  }

  public loadDataConvocatory(lstConvocatory: Convocatoria[]) {
    const lstConvocatoryTemp = lstConvocatory;
    if (lstConvocatoryTemp.length > 0) {
      lstConvocatoryTemp.forEach(e => {
        this.lstTypeConvocatory.forEach(g => {
          if (e.idTipoConvocatoria === Number(g.id)) {
            e.nombreTipoConvocatoria = this.translateField(g, 'tipoConvocatoria', this.lang);
            return;
          }
        });

        this.lstTypeSede.forEach(g => {
          if (e.idTipoSede === g.id) {
            e.nombreTipoSede = this.translateField(g, 'sede', this.lang);
            return;
          }
        });

        this.lstTipoCargo.forEach(g => {
          if (e.idTipoCargo === g.id) {
            e.nombreTipoCargo = this.translateField(g, 'tipoCargo', this.lang);
            return;
          }
        });

        let nombreTipoLugarTemp = [];
        const ids = e.idTipoLugar.split(',');
        ids.forEach(id => {
          this.lstTypePlace.forEach((ee) => {
            if (id === ee.id) {
              nombreTipoLugarTemp.push(ee.tipo);
              return;
            }
          });
        });
        e.nombreTipoLugar = nombreTipoLugarTemp.join(', ');
      });
    }
    return lstConvocatoryTemp;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        estadoConvocatoria: new FormControl(''),
        nombreConvocatoria: new FormControl('', [Validators.required]),
        numeroConvocatoria: new FormControl('', [Validators.required]),
        idTipoConvocatoria: new FormControl('', [Validators.required]),
        idTipoSede: new FormControl('', [Validators.required]),
        idTipoCargo: new FormControl('', [Validators.required]),
        corporation: new FormArray([]),
        idTipoLugar: new FormControl(''),
        // numeroCargosAplicar: new FormControl('', [Validators.required, Validators.maxLength(10)]),
        numeroCargosAplicar: new FormControl(''),
        numeroCargos: new FormControl('', [Validators.required, Validators.maxLength(10)]),
        codigoAcuerdo: new FormControl('', [Validators.required]),
        fechaAcuerdo: new FormControl('', [Validators.required]),
        requiredfile: [undefined, [Validators.required, FileValidator.maxContentSize(this.configFile.sizeFile)]],
        requiredfile2: [undefined, [FileValidator.maxContentSize(this.configFile.sizeFile)]],
        fechaInicial: new FormControl('', [Validators.required]),
        fechaFinal: new FormControl(''),
        idEmpresa: new FormControl('', [Validators.required]),


        nombresServidorRetirado: new FormControl(''),
        apellidosServidorRetirado: new FormControl(''),
        cedulaServidorRetirado: new FormControl(''),
        observacionesServidorRetirado: new FormControl(''),
        requiredfile3: [undefined, [FileValidator.maxContentSize(this.configFile.sizeFile)]],
        tipoModelo: new FormControl('', [Validators.required]),
      }
    );

    this.f.idEmpresa.valueChanges.subscribe(
      value => {
        this.f.idTipoConvocatoria.setValue('');
        this.f.idTipoSede.setValue('');
        this.f.idTipoSede.enable();
      }
    );

  }

  get f() {
    return this.form.controls;
  }

  public eventChekbox(id: string) {
    const index = this.lstTypePlaceString.indexOf(id);
    if (index > -1) {
      this.lstTypePlaceString.splice(index, 1);
      if (this.esIdAltasCortes(id)) {
        this.toggleDivAltasCortes(true);
        this.f.tipoModelo.setValue('');
        this.f.tipoModelo.enable();
        this.f.tipoModelo.updateValueAndValidity();
      }
    } else {
      this.lstTypePlaceString.push(id);
      if (this.esIdAltasCortes(id)) {
        this.toggleDivAltasCortes(false);
        this.f.tipoModelo.disable();
        this.f.tipoModelo.setValue(Constants.MODELO_1);
        this.f.tipoModelo.updateValueAndValidity();
      }
    }
  }

  public checkBxRequired() {
    this.requiredCorporation = this.lstTypePlaceString.length === 0;
    return this.requiredCorporation;
  }

  public async edit(element: Convocatoria) {
    if (!this.modConvSA(element)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }

    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.clearInputFile(this.inputFileView);
    this.clearInputFile(this.inputFileView2);
    this.clearInputFile(this.inputFileView3);

    if (this.elementCurrent.idSoporteAcuerdo) {
      try {
        this.elementCurrent.nombreSoporteAcuerdo = (<any>await this.fService.getInformationFile(this.elementCurrent.idSoporteAcuerdo).toPromise()).datos.nombreAuxiliar;
        C.setValidatorFile(false, this.f.requiredfile, this.configFile.sizeFile);
      } catch (err) {
        this.elementCurrent.soporte = null;
        console.log(err);
      }
    }

    if (this.elementCurrent.idSoporteInstructivoInscripcion) {
      try {
        this.elementCurrent.soporteInscripcion = (<any>await this.fService.getInformationFile(this.elementCurrent.idSoporteInstructivoInscripcion).toPromise()).datos.nombreAuxiliar;
        C.setValidatorFile(false, this.f.requiredfile2, this.configFile.sizeFile);
      } catch (err) {
        this.elementCurrent.soporte = null;
        console.log(err);
      }
    }

    if (this.elementCurrent.idSoporteInvitacionPublica) {
      try {
        this.elementCurrent.soporteInvitacion = (<any>await this.fService.getInformationFile(this.elementCurrent.idSoporteInvitacionPublica).toPromise()).datos.nombreAuxiliar;
        C.setValidatorFile(false, this.f.requiredfile3, this.configFile.sizeFile);
      } catch (err) {
        this.elementCurrent.soporte = null;
        console.log(err);
      }
    }


    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.idUsuarioModificacion,
      nombreConvocatoria: element.nombreConvocatoria,
      numeroConvocatoria: element.numeroConvocatoria,
      idTipoConvocatoria: Number(element.idTipoConvocatoria),
      idTipoSede: element.idTipoSede,
      idTipoCargo: element.idTipoCargo,
      idTipoLugar: '',
      numeroCargosAplicar: Number(element.numeroCargosAplicar),
      numeroCargos: Number(element.numeroCargos),
      codigoAcuerdo: element.codigoAcuerdo,
      fechaAcuerdo: element.fechaAcuerdo,
      estadoConvocatoria: element.estadoConvocatoria,
      fechaInicial: element.fechaInicial,
      fechaFinal: element.fechaFinal,
      idEmpresa: element.idEmpresa,

      nombresServidorRetirado: element.nombresServidorRetirado,
      apellidosServidorRetirado: element.apellidosServidorRetirado,
      cedulaServidorRetirado: element.cedulaServidorRetirado,
      observacionesServidorRetirado: element.observacionesServidorRetirado,

      tipoModelo: element.tipoModelo
    });
    this.f.idEmpresa.setValue(element.idEmpresa);
    this.f.corporation = new FormArray([], [Validators.required]);
    this.f.idTipoConvocatoria.setValue(element.idTipoConvocatoria);

    this.lstTypePlaceString = [];
    const ids = this.elementCurrent.idTipoLugar.split(',');
    this.lstTypePlace.forEach((o) => {
      let encontro = false;
      ids.forEach(id => {
        if (o.id === id) {
          this.lstTypePlaceString.push(id);
          if (this.esIdAltasCortes(id)) {
            this.toggleDivAltasCortes(false);
          }
          encontro = true;
          return;
        }
      });
      const control = new FormControl(encontro);
      (this.f.corporation as FormArray).push(control);
    });

    this.lstTypeSede.forEach(e => {
      if (e.id === element.idTipoSede) {
        this.f.idTipoSede.setValue(e);
        return;
      }
    });
  }

  public async addConvocatory() {
    // this.checkBxRequired()
    if (this.form.valid && !this.requiredCorporation) {
      this.submit = true;
    } else {
      this.submit = false;
      this.f.requiredfile.markAsTouched();
      this.f.requiredfile2.markAsTouched();
      return;
    }

    if (this.idEmpresaT) {
      this.submit = true;
    } else if (this.f.idEmpresa.value) {
      this.idEmpresaT = this.f.idEmpresa.value;
    } else {
      this.submit = false;
      return;
    }


    // validar si se puede modificar la convocatoria
    if (this.f.id.value) {
      const lstConvocatoriesPerfil = ((await this.convocatoryServices.getConvocatoriaPerfilByConvocatoria(this.f.id.value).toPromise() as any).datos) as ConvocatoriaPerfil[];
      if (lstConvocatoriesPerfil.length > 0) {
        this.alertService.message(this.ct.MSG_UPDATE_RECORD_CONSTRAINT, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const idTipoLugar = this.lstTypePlaceString.join(',');
    this.f.idTipoLugar.setValue(idTipoLugar);
    const newRegistry: Convocatoria = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      nombreConvocatoria: this.f.nombreConvocatoria.value,
      numeroConvocatoria: this.f.numeroConvocatoria.value,
      idTipoConvocatoria: Number(this.f.idTipoConvocatoria.value),
      idTipoSede: this.f.idTipoSede.value.id,
      idTipoCargo: this.f.idTipoCargo.value,
      idTipoLugar: this.f.idTipoLugar.value,
      numeroCargosAplicar: this.showFieldCargosAplicaAspirante ? Number(this.f.numeroCargosAplicar.value) : 1,
      numeroCargos: Number(this.f.numeroCargos.value),
      codigoAcuerdo: this.f.codigoAcuerdo.value,
      fechaAcuerdo: this.f.fechaAcuerdo.value,
      estadoConvocatoria: this.f.estadoConvocatoria.value,
      idSoporteAcuerdo: this.elementCurrent.idSoporteAcuerdo,
      idSoporteInstructivoInscripcion: this.elementCurrent.idSoporteInstructivoInscripcion,
      fechaInicial: this.f.fechaInicial.value,
      fechaFinal: this.f.fechaFinal.value ? this.f.fechaFinal.value : null,
      idEmpresa: this.idEmpresaT,


      nombresServidorRetirado: this.f.nombresServidorRetirado.value,
      apellidosServidorRetirado: this.f.apellidosServidorRetirado.value,
      cedulaServidorRetirado: this.f.cedulaServidorRetirado.value,
      observacionesServidorRetirado: this.f.observacionesServidorRetirado.value,
      idSoporteInvitacionPublica: this.elementCurrent.idSoporteInvitacionPublica,
      tipoModelo: Number(this.f.tipoModelo.value),
    };

    if (newRegistry.id === undefined) {
      newRegistry.estadoConvocatoria = stateConvocatoria.EN_BORRADOR;
    }

    if (this.f.requiredfile.value) {
      if (this.elementCurrent.soporte) {
        try {
          await this.fService.deleteFile(this.elementCurrent.idSoporteAcuerdo).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }
      const file = (<FileInput>this.f.requiredfile.value).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.CONVOCATORIA, documentsType.SOPORTE, this.commonService.getDateString()),
        Modulo: modulesSoports.CONVOCATORIA,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      }
      const documentFile: any = await this.fService.postFile(file, params).toPromise();
      newRegistry.idSoporteAcuerdo = documentFile.id;
    }

    if (this.f.requiredfile2.value) {
      if (this.elementCurrent.soporte) {
        try {
          await this.fService.deleteFile(this.elementCurrent.idSoporteInstructivoInscripcion).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }
      const file = (<FileInput>this.f.requiredfile2.value).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.CONVOCATORIA, documentsType.SOPORTE, this.commonService.getDateString()),
        Modulo: modulesSoports.CONVOCATORIA,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      }
      const documentFile: any = await this.fService.postFile(file, params).toPromise();
      newRegistry.idSoporteInstructivoInscripcion = documentFile.id;
    }

    if (this.f.requiredfile3.value) {
      if (this.elementCurrent.soporte) {
        try {
          await this.fService.deleteFile(this.elementCurrent.idSoporteInvitacionPublica).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      }
      const file = (<FileInput>this.f.requiredfile3.value).files[0];
      const params = {
        NombreSoporte: C.generateNameFile(file.name, this.user.numeroDocumento, modulesSoports.CONVOCATORIA, documentsType.SOPORTE, this.commonService.getDateString()),
        Modulo: modulesSoports.CONVOCATORIA,
        NombreAuxiliar: file.name,
        idUsuarioModificacion: this.user.id
      }
      const documentFile: any = await this.fService.postFile(file, params).toPromise();
      newRegistry.idSoporteInvitacionPublica = documentFile.id;
    }

    this.convocatoryServices.saveConvocatoria(newRegistry).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.cleanForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
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

  public deleteFileView2() {
    this.elementCurrent.idSoporteInstructivoInscripcion = null;
    C.setValidatorFile(true, this.f.requiredfile2, this.configFile.sizeFile);
    this.f.requiredfile2.setValue(null);
  }

  public deleteFileView3() {
    this.elementCurrent.idSoporteInvitacionPublica = null;
    C.setValidatorFile(true, this.f.requiredfile3, this.configFile.sizeFile);
    this.f.requiredfile3.setValue(null);
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

  // public delete(element: Convocatoria) {
  //   this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
  //     .then(ok => {
  //       if (ok.value) {
  //         this.alertService.loading();
  //         this.convocatoryServices.deleteConvocatoria(element)
  //           .subscribe(ok => {
  //             if (this.elementCurrent.id == element.id) {
  //               this.cleanForm();
  //             }
  //             this.deleteSoport(element.idSoporteAcuerdo);
  //             this.loadData()
  //               .then(r => {
  //                 this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
  //               });
  //           }, err => {
  //             this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
  //           });
  //       }
  //     });
  // }

  public updateState(element: Convocatoria, updateTo: any) {
    this.alertService.comfirmation(this.ct.UPDATE_CONFIRMATION_CONVOCATORIA, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          element.estadoConvocatoria = updateTo;
          this.convocatoryServices.saveConvocatoria(element).toPromise()
            .then(ok => {
              this.loadData().then(() => {
                if (this.elementCurrent.id == element.id) {
                  this.cleanForm();
                }
                this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                  .finally(() => this.submit = false);
              });
            }).catch(error => {
              console.log('Error', error);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            });
        }
      });
  }

  public deleteSoport(idSoport) {
    if (idSoport) {
      this.fService.deleteFile(idSoport).toPromise()
        .catch(err => {
          console.log('Error', err);
        });
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
    this.lstTypePlaceString = [];
    this.requiredCorporation = false;
    this.clearInputFile(this.inputFileView);
    this.clearInputFile(this.inputFileView2);
    this.clearInputFile(this.inputFileView3);
    C.setValidatorFile(true, this.f.requiredfile, this.configFile.sizeFile);
    C.setValidatorFile(false, this.f.requiredfile2, this.configFile.sizeFile);
    C.setValidatorFile(false, this.f.requiredfile3, this.configFile.sizeFile);
    this.toggleDivAltasCortes(true);
  }

  public verifyActions(element: Convocatoria) {
    let btnStates = {
      btnEdit: false,
      btnActive: false,
      btnInactive: false,
    }
    switch (element.estadoConvocatoria) {
      case stateConvocatoria.ACTIVO:
        btnStates.btnEdit = true;
        btnStates.btnInactive = true;
        break;

      case stateConvocatoria.EN_BORRADOR:
        btnStates.btnActive = true;
        btnStates.btnEdit = true;
        btnStates.btnInactive = true;
        break;

      case stateConvocatoria.INACTIVO:
        btnStates.btnActive = true;
        break;

      case stateConvocatoria.CERRADA:
        break;

      case stateConvocatoria.PUBLICADA:
        btnStates.btnEdit = true;
        break;

      case stateConvocatoria.PUBLICADA_CON_AJUSTES:
        btnStates.btnEdit = true;
        break;
    }

    return btnStates;
  }

  public async getSectionalByConvocatory(event) {
    this.form.patchValue({
      idTipoSede: ''
    });

    if (this.f.idEmpresa.value) {

      if (event.value === 2) {
        this.lstTypeSedeTemp = (await this.adminConvocatoryService.getTodosTipoSedeByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos;
        this.lstTypeSedeTemp = this.lstTypeSedeTemp.filter(c => c.idTipoConvocatoria === event.value);

        if (this.lstTypeSedeTemp.length === 1) {
          this.f.idTipoSede.setValue(this.lstTypeSedeTemp[0]);
          this.f.idTipoSede.disable();
        } else {
          this.f.idTipoSede.setValue('');
          this.f.idTipoSede.enable();
        }
        this.f.idTipoSede.updateValueAndValidity();
      } else {
        this.lstTypeSedeTemp = (await this.adminConvocatoryService.getTodosTipoSedeByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos;
        this.lstTypeSedeTemp = this.lstTypeSede.filter(c => c.idTipoConvocatoria === event.value);

        this.f.idTipoSede.setValue('');
        this.f.idTipoSede.enable();
      }
    } else {
      this.lstTypeSedeTemp = this.lstTypeSede.filter(c => c.idTipoConvocatoria === event.value);
    }
  }

  public modConvSA(convocatoria: Convocatoria) {
    if (convocatoria.estadoConvocatoria == stateConvocatoria.PUBLICADA || convocatoria.estadoConvocatoria == stateConvocatoria.PUBLICADA_CON_AJUSTES) {
      if (this.varModificarConvSuperAdmin.valor === '1' && this.isSuperAdmin(this.user)) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  public getControlsCorporation() {
    if (this.form.get('corporation')) {
      return (this.f.corporation as FormArray).controls;
    }
    return [];
  }

  private esIdAltasCortes(id: string) {
    return id && this.areEqualsIdGuid(id, this.idAltasCortes.valorObj['id_altas_cortes']);
  }

  private toggleDivAltasCortes(hidden: boolean) {
    this.divFormAltasCortes.nativeElement.hidden = hidden;
    this.divFormSoporte.nativeElement.hidden = hidden;
  }
}
