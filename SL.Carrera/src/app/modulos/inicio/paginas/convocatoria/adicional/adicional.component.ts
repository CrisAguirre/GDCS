import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSort, Sort, MatDialog, MatDialogRef } from '@angular/material';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { AdministracionConvocatoriaService } from '../../../../../core/servicios/administracion-convocatoria.service';
import { TipoAdicional } from '@app/compartido/modelos/tipo-adicional';
import { Adicional } from '@app/compartido/modelos/adicional';
import { ConfigAdicional } from '@app/compartido/modelos/configuracion-adicional';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { Constants as C } from '@app/compartido/helpers/constants';
import { configMsg, stateConvocatoria } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';
import { TipoEtapa } from '@app/compartido/modelos/tipo-etapa';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { VariableAppModel } from '@app/compartido/modelos/variable-app-model';

@Component({
  selector: 'app-adicional',
  templateUrl: './adicional.component.html',
  styleUrls: ['./adicional.component.scss']
})
export class AdicionalComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstTable: Adicional[] = [];
  public lstAditional: Adicional[] = [];
  public lstAdicionalByEmpresa: Adicional[] = [];
  public lstAditionalConfig: ConfigAdicional[] = [];
  public lstConvocatory: Convocatoria[] = [];
  // public lstConvocatoryAux: Convocatoria[] = [];
  public lstAditionalType: TipoAdicional[] = [];
  public lstSubAditionalType: TipoAdicional[] = [];
  public lstStepType: TipoEtapa[] = [];

  public sortedData: any;
  public sortedDataInternal: any;
  public showField = false;
  public form: FormGroup;
  public varModificarConvSuperAdmin: VariableAppModel;
  public submit = false;
  public submit2 = false;
  public elementCurrent: any = {};
  private user = this.commonService.getVar(configMsg.USER);

  public convocatoryCurrent: Convocatoria = null;
  public idEmpresaT = null;
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];
  public dataConvocatory: Convocatoria;

  // public company: any;
  //public idTipoExperiencia = '26612f85-2c45-422e-b088-3bf484bde7fd';

  public displayedColumns: string[] = ['convocatoria', 'tipo', 'etapa', 'puntajeMaximo', 'options'];
  public displayedColumns2: string[] = ['subTipo', 'subPuntajeMaximo', 'editar', 'eliminar'];
  public displayedColumnsInfo: string[] = ['subTipo', 'subPuntajeMaximo'];

  public dataSource = new MatTableDataSource<any>([]);
  public dataSourceInternal = new MatTableDataSource<any>([]);
  public dataSourceInfo = new MatTableDataSource<any>([]);
  private dialogRefInfo: MatDialogRef<any, any>;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('matPaginator', { static: true }) paginator: MatPaginator;
  // @ViewChild('matPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChild('matPaginator2', { static: false }) set paginator2(value: MatPaginator) {
    this.dataSourceInternal.paginator = value;
  }
  @ViewChild('TableOneSort', { static: true }) sort: MatSort;
  @ViewChild('TableTwoSort', { static: true }) sort2: MatSort;
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;
  @ViewChild('paginatorDialog', { static: false }) set paginatorDialog(value: MatPaginator) {
    this.dataSourceInfo.paginator = value;
  }

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private convService: ConvocatoriaService,
    private empresaService: EmpresaService,
    private convAdminService: AdministracionConvocatoriaService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private dialogService: MatDialog
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.alertService.loading();
    this.loadForm();
    this.loadUserData();
    this.loadData()
      .finally(() => {
        this.alertService.close();
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSourceInternal.sort = this.sort2;
    this.dataSourceInternal.paginator = this.paginator2;
  }

  public async loadUserData() {
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      if (!C.validateList(this.lstCompanies)) {
        this.lstCompanies = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
      }
    } else {
      this.showSelectCompany = false;
      this.f.idEmpresa.setValue(this.user.idEmpresa);
    }
  }

  public async loadAdicionalByCompany(pCompany: any) {
    this.cleanVars();
    this.lstTable = [];
    if (pCompany && pCompany.value) {
      this.lstAdicionalByEmpresa = (await this.convService.getTodosAdicionalesByEmpresa(pCompany.value).toPromise() as any).datos;
      // this.lstConvocatoryAux = (await this.convService.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise() as any).datos as Convocatoria[];
      this.lstConvocatory = (await this.convService.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise() as any).datos as Convocatoria[];

      if (this.lstConvocatory.length > 0) {
        this.lstConvocatory = this.lstConvocatory.filter(g => g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
          g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
          g.estadoConvocatoria === stateConvocatoria.CERRADA ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES);
      }
      this.lstTable = this.filterAdicionalByEmpresa();
      this.dataSource.data = this.lstTable;
    } else {
      this.dataSource.data = this.lstTable;
    }

    this.setIdTipoEtapa();
  }

  public async loadAdicionalByConvocatoria(pConvocatoria: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.f.id.setValue(undefined);
    this.f.id.updateValueAndValidity();
    this.f.idTipoAdicional.enable();
    this.f.idTipoAdicional.setValue(null);
    this.f.puntajeMaximo.setValue(null);
    this.f.idSubTipoAdicional.setValue(null);
    this.f.subPuntajeMaximo.setValue(null);
    this.f.subId.setValue(null);
    this.elementCurrent = {};
    this.showField = false;

    // this.dataConvocatory = this.lstConvocatoryAux.find((x: any) => x.id === this.f.idConvocatoria.value);
    this.dataConvocatory = this.lstConvocatory.find((x: any) => x.id === this.f.idConvocatoria.value);
    
    if (pConvocatoria.value) {
      // Carga la información de la convocatoria seleccionada
      this.convocatoryCurrent = null;
      this.convocatoryCurrent = (await this.convService.getConvocatoriaById(pConvocatoria.value).toPromise() as any).datos as Convocatoria;

      if (!this.f.idEmpresa.value) {
        this.f.idEmpresa.setValue(this.convocatoryCurrent.idEmpresa);
        this.f.idEmpresa.updateValueAndValidity();
      }
      this.lstTable = [];
      this.lstTable = this.filterAdicionalByConvocatoria();
    } else {
      this.lstTable = [];
    }
    this.dataSource.data = this.lstTable;
    
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idEmpresa: new FormControl(''),
        idConvocatoria: new FormControl('', [Validators.required]),
        idTipoAdicional: new FormControl('', [Validators.required]),
        puntajeMaximo: new FormControl('', [Validators.required, Validators.min(1)]),
        idTipoEtapa: new FormControl('', [Validators.required]),
        idSubTipoAdicional: new FormControl('', [Validators.required]),
        subPuntajeMaximo: new FormControl('', [Validators.min(1)]),
        subId: new FormControl('')
      }
    );

    this.f.idTipoAdicional.valueChanges
      .subscribe(
        async val => {
          if (val && val !== '') {
            this.showField = true;
            this.lstSubAditionalType = (await this.convAdminService.getTipoAdicionalesPorIdReferencia(val).toPromise() as any).datos as TipoAdicional[];
            this.loadDataSourceInternal();
          }
        }
      );
  }

  get f() {
    return this.form.controls;
  }

  public cleanForm() {
    this.formV.resetForm();
    // this.f.name.enable();
    this.cleanVars();
    // this.company.setValue('');
    this.setIdTipoEtapa();
  }

  private cleanVars() {
    this.elementCurrent = {};
    this.f.idTipoAdicional.enable();
    this.showField = false;
    this.lstAditionalConfig = [];
    /* this.lstTable = [];
    this.dataSource.data = []; */
    // this.dataSourceInternal.data = this.lstAditionalConfig;
    this.dataSourceInternal.data = [];

    this.f.id.setValue(undefined);
    this.f.id.updateValueAndValidity();
    this.f.idSubTipoAdicional.setValue('');
    this.f.idSubTipoAdicional.updateValueAndValidity();
    this.f.subPuntajeMaximo.setValue('');
    this.f.subPuntajeMaximo.updateValueAndValidity();
    this.f.puntajeMaximo.setValue('');
    this.f.puntajeMaximo.updateValueAndValidity();
    this.f.idTipoAdicional.setValue('');
    this.f.idTipoAdicional.updateValueAndValidity();
    /* this.f.idConvocatoria.setValue('');
    this.f.idConvocatoria.updateValueAndValidity(); */
  }

  public cleanAll() {
    this.cleanForm();
    this.lstTable = [];
    this.dataSource.data = [];
  }

  public setIdTipoEtapa() {
    // ValidarConfiguracion
    const validateAditionalType = this.commonService.getVar(configMsg.ONLY_CLASIFICATION_ADITIONAL);
    if (validateAditionalType === '1') {
      let encontro = false;
      this.lstStepType.forEach(e => {
        if (e.tipoEtapa.includes('Clasificación')) {
          this.f.idTipoEtapa.setValue(e.id);
          encontro = true;
        }
      });
      if (!encontro) {
        this.commonService.getVarConfig(configMsg.TIPO_ETAPAS).then(v => {
          this.setJson(v);
          this.f.idTipoEtapa.setValue(v.valorObj.clasificacion);     
        });
        
        //this.f.idTipoEtapa.setValue('a347b7b9-ae07-4796-8b53-bb2664567e85');
      }
      this.f.idTipoEtapa.disable();
    }
  }

  //#region Adicional
  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.varModificarConvSuperAdmin = (await this.commonService.getMessageByName(configMsg.MODIFICAR_CONVOCATORIA_SUPERADMIN).toPromise() as any).datos as VariableAppModel;

    this.lstConvocatory = [];
    if (this.f.idEmpresa.value) {
      this.lstConvocatory = (await this.convService.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos as Convocatoria[];
      this.lstAditional = (await this.convService.getTodosAdicionalesByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos as Adicional[];
    } else {
      this.lstConvocatory = (await this.convService.getConvocatorias().toPromise() as any).datos as Convocatoria[];
      this.lstAditional = (await this.convService.getTodosAdicionalesByEmpresa().toPromise() as any).datos as Adicional[];
    }

    // this.lstAditional = (await this.convService.getAdicionales().toPromise() as any).datos as Adicional[];
    this.lstAditionalType = (await this.convAdminService.getTipoAdicionalesPorIdReferencia(null).toPromise() as any).datos as TipoAdicional[];
    this.lstStepType = (await this.convAdminService.getTipoEtapas().toPromise() as any).datos as TipoEtapa[];

    // Ajustes para la tabla de la actividad
    if (this.lstAditional.length > 0) {
      this.lstAditional.forEach(e => {

        // Cargar los tipo adicionales
        this.lstAditionalType.forEach(g => {
          if (e.idTipoAdicional === g.id) {
            // e.tipoAdicional = g.tipoAdicional;
            e.tipoAdicional = this.translateField(g, 'tipoAdicional', this.lang);
            return;
          }
        });

        e.tipoAdicional = e.tipoAdicional === undefined ? '' : e.tipoAdicional;

        // Cargar las convocatorias
        this.lstConvocatory.forEach(g => {
          if (e.idConvocatoria === g.id) {
            e.convocatoria = g.nombreConvocatoria;
            e.mostrarOpciones = (g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
              g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
              g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
              g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) ? true : false;
            return;
          }
        });

        e.mostrarOpciones = e.mostrarOpciones === undefined ? false : e.mostrarOpciones;

        // Cargar los tipo etapas
        this.lstStepType.forEach(g => {
          if (e.idTipoEtapa === g.id) {
            e.tipoEtapa = this.translateField(g, 'tipoEtapa', this.lang);
            return;
          }
        });
        e.tipoEtapa = e.tipoEtapa === undefined ? '' : e.tipoEtapa;
      });
    }

    this.setIdTipoEtapa();
    this.lstTable = this.filterAdicionalByConvocatoria();
    if (this.convocatoryCurrent.id) {
      this.f.idConvocatoria.setValue(this.convocatoryCurrent.id);
      this.f.idEmpresa.setValue(this.convocatoryCurrent.idEmpresa);
      this.lstTable = this.filterAdicionalByConvocatoria();
    } else {
      this.lstTable = [];
    }
    this.dataSource.data = this.lstTable;
  }

  public filterAdicionalByEmpresa = () => {
    const lst = this.lstAditional.filter(x => x.idEmpresa === this.f.idEmpresa.value);
    return lst;
  }

  public filterAdicionalByConvocatoria = () => {
    const lst = this.lstAditional.filter(x => x.idConvocatoria === this.f.idConvocatoria.value);
    return lst;
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'convocatoria': return this.compare(a.convocatoria, b.convocatoria, isAsc);
        case 'tipo': return this.compare(a.tipoAdicional, b.tipoAdicional, isAsc);
        case 'etapa': return this.compare(a.tipoEtapa, b.tipoEtapa, isAsc);
        case 'puntajeMaximo': return this.compare(a.puntajeMaximo, b.puntajeMaximo, isAsc);
        default: return 0;
      }
    });
  }

  public async edit(element: Adicional) {
    // const convocariaAux = this.lstConvocatoryAux.find((x: any) => x.id === element.idConvocatoria);
    const convocariaAux = this.lstConvocatory.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }
    this.scrollTop();
    // this.cleanForm();
    this.elementCurrent = C.cloneObject(element);
    this.showField = true;
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: element.idConvocatoria,
      idEmpresa: element.idEmpresa,
      idTipoAdicional: element.idTipoAdicional,
      puntajeMaximo: element.puntajeMaximo,
      idTipoEtapa: element.idTipoEtapa
    });
    this.f.idTipoAdicional.disable();
    this.lstSubAditionalType = (await this.convAdminService.getTipoAdicionalesPorIdReferencia(element.idTipoAdicional).toPromise() as any).datos as TipoAdicional[];
    this.lstAditionalConfig = (await this.convService.getObtenerConfigAdicionalesPorAdicional(element.id).toPromise() as any).datos as ConfigAdicional[];
    this.loadDataSourceInternal();
  }

  public addAditional() {
    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    //#region Validaciones
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    if (this.dataSourceInternal.data.length > 0) {
      this.f.idSubTipoAdicional.setValue('');
      this.f.idSubTipoAdicional.clearValidators();
      this.f.idSubTipoAdicional.updateValueAndValidity();

      this.f.subPuntajeMaximo.setValue('');
      this.f.subPuntajeMaximo.clearValidators();
      this.f.subPuntajeMaximo.updateValueAndValidity();
    } else {
      this.submit = false;
      return;
    }

    // validar que el registro no se repita
    /* const vAditionalConfig = this.lstAditional.find(
      (x: any) =>
        x.idConvocatoria === this.f.idConvocatoria.value &&
        x.idTipoAdicional === this.f.idTipoAdicional.value &&
        x.idTipoEtapa === this.f.idTipoEtapa.value
    );
    if (vAditionalConfig) {
      if ((this.f.id && vAditionalConfig.id !== this.f.id.value) || !this.f.id) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    } */

    const objTemp = this.lstAditional.find(e => 
      e.idConvocatoria === this.f.idConvocatoria.value && 
      e.idTipoAdicional === this.f.idTipoAdicional.value && 
      e.idTipoEtapa === this.f.idTipoEtapa.value);
    if (objTemp) {
      if ((this.f.id && objTemp.id !== this.f.id.value) || !this.f.id) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newAdicional: Adicional = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      idTipoAdicional: this.f.idTipoAdicional.value,
      puntajeMaximo: Number(this.f.puntajeMaximo.value),
      idTipoEtapa: this.f.idTipoEtapa.value,
      idEmpresa: this.f.idEmpresa.value
    };
    this.alertService.loading();
    this.convService.saveAdicionales(newAdicional).toPromise()
      .then(ok => {
        // Guardar Configuraciones adicionales
        const adicionalSave: any = ok;
        this.lstAditionalConfig.forEach(async e => {
          if (e.idAdicional === undefined) {
            e.idAdicional = adicionalSave.id;
            e.puntajeMaximo = Number(e.puntajeMaximo);
            await this.convService.saveConfigAdicionales(e)
              .toPromise()
              .catch(ex => {
                console.log('error addicion', ex);
              });
          }
        });

        this.loadData().then(() => {
          this.cleanVars();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });

      }).catch(e => {
        console.log('error grande', e);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public delete(element: Adicional) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    const convocariaAux = this.lstConvocatory.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convService.deleteAdicionales(element)
            .subscribe(o => {
              this.loadData()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              console.log(err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      });

  }

  private deleteIsSelected(id) {
    if (this.elementCurrent.id === id) {
      this.cleanForm();
    }
  }

  public async changeAditionalType(event: any) {
    this.showField = true;
    this.lstSubAditionalType = (await this.convAdminService.getTipoAdicionalesPorIdReferencia(event.value).toPromise() as any).datos as TipoAdicional[];
    this.lstAditionalConfig = [];
    this.dataSourceInternal.data = this.lstAditionalConfig;
    this.f.puntajeMaximo.setValue('');
  }
  //#endregion

  //#region ConfigAdicional
  sortDataInternal(sort: Sort) {
    const data = this.dataSourceInternal.data;
    if (!sort.active || sort.direction === '') {
      this.sortedDataInternal = data;
      return;
    }

    this.sortedDataInternal = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'subPuntajeMaximo': return this.compare(a.puntajeMaximo, b.puntajeMaximo, isAsc);
        case 'subTipo': return this.compare(a.tipoAdicional, b.tipoAdicional, isAsc);
        default: return 0;
      }
    });
  }

  private loadDataSourceInternal() {
    if (this.lstAditionalConfig.length > 0) {
      // Cargar los tipo adicionales
      this.lstAditionalConfig.forEach(e => {
        const typeAditional = this.lstSubAditionalType.find(g => g.id === e.idTipoAdicional);
        e.tipoAdicional = typeAditional ? typeAditional.tipoAdicional : '';
      });
    }
    this.setValidatorsAditionalConfig();

    this.dataSourceInternal.data = this.lstAditionalConfig;
  }

  public setValidatorsAditionalConfig() {
    if (this.lstAditionalConfig.length > 0) {
      this.f.idSubTipoAdicional.setValue('');
      this.f.idSubTipoAdicional.clearValidators();
      this.f.subPuntajeMaximo.setValue('');
      this.f.subPuntajeMaximo.clearValidators();
    } else {
      this.f.idSubTipoAdicional.setValidators([Validators.required]);
      this.f.subPuntajeMaximo.setValidators([Validators.required]);
    }
    this.f.idSubTipoAdicional.updateValueAndValidity();
    this.f.subPuntajeMaximo.updateValueAndValidity();
  }

  public addConfigAditional() {
    //#region Validaciones
    // Validar que el formulario se encuentre lleno
    if (!this.form.valid) {
      this.submit2 = false;
      return;
    }

    // Validar campos obligatorios
    if (this.f.idSubTipoAdicional.value === undefined ||
      this.f.idSubTipoAdicional.value === null ||
      this.f.idSubTipoAdicional.value === '' ||
      this.f.subPuntajeMaximo.value === undefined ||
      this.f.subPuntajeMaximo.value === null ||
      this.f.subPuntajeMaximo.value === '') {
      this.alertService.message(this.ct.ERROR_CONFIG_ADITIONAL_DATA, TYPES.WARNING);
      this.submit2 = false;
      return;
    }

    // validar que el puntaja a asignar sea mayor a 0
    if (Number(this.f.subPuntajeMaximo.value) <= 0) {
      this.alertService.message(this.ct.PUNTAJE_MAYOR_A_CERO, TYPES.WARNING);
      this.submit2 = false;
      return;
    }

    // Validar suma
    let sum = this.f.subPuntajeMaximo.value;
    //se comenta la sumatoria
    // this.lstAditionalConfig.forEach(e => {
    //   if (this.f.idSubTipoAdicional.value !== e.idTipoAdicional) {
    //     sum += e.puntajeMaximo;
    //   }
    // });

    //si la suma es mayor al puntaje maximo
    if (sum > this.f.puntajeMaximo.value) {
      this.alertService.message(this.ct.ERROR_SUM_ADITIONAL_DATA, TYPES.WARNING);
      this.submit2 = false;
      return;
    }

    // Validar datos repetidos
    // tslint:disable-next-line: max-line-length
    const vAditionalConfig = this.lstAditionalConfig.find((x: any) => x.idTipoAdicional === this.f.idSubTipoAdicional.value);
    if (vAditionalConfig) {
      if ((this.f.subId && vAditionalConfig.id !== this.f.subId.value) || !this.f.subId) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit2 = false;
        return;
      }
    }
    //#endregion

    const newObj: ConfigAdicional = {
      id: this.f.subId.value ? this.f.subId.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      idTipoAdicional: this.f.idSubTipoAdicional.value,
      puntajeMaximo: Number(this.f.subPuntajeMaximo.value),
      idAdicional: this.f.id.value ? this.f.id.value : undefined
    };

    if (newObj.idAdicional !== undefined) {
      this.convService.saveConfigAdicionales(newObj).toPromise()
        .then(ok => {
        }).catch(ex => {
          console.log(ex);
        });
    }

    const index = this.lstAditionalConfig.indexOf(vAditionalConfig, 0);
    if (index > -1) {
      this.lstAditionalConfig.splice(index, 1);
    }

    this.lstAditionalConfig.push(newObj);
    this.loadDataSourceInternal();
    this.f.idSubTipoAdicional.reset();
    this.f.idSubTipoAdicional.enable();
    this.f.subPuntajeMaximo.reset();
    this.f.subId.reset();
  }

  public deleteConfig(element: ConfigAdicional) {
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          if (element.id) {
            if (this.lstAditionalConfig.length > 0) {
              let iPosition = 0;
              this.lstAditionalConfig.forEach(e => {
                if (e.id === element.id) {
                  this.lstAditionalConfig.splice(iPosition, 1);
                }
                iPosition++;
              });
            }
            this.convService.deleteConfigAdicionales(element)
              .subscribe(o => {
                this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
              }, err => {
                console.log(err);
              });
          } else {
            if (this.lstAditionalConfig.length > 0) {
              let iPosition = 0;
              this.lstAditionalConfig.forEach(e => {
                if (e.idTipoAdicional === element.idTipoAdicional) {
                  this.lstAditionalConfig.splice(iPosition, 1);
                }
                iPosition++;
              });
            }
            this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
          }
          this.dataSourceInternal.data = this.lstAditionalConfig;
        }
      });
  }

  public cleanAditionalConfig() {
    this.f.idSubTipoAdicional.enable();
    this.setValidatorsAditionalConfig();

    this.f.subId.setValue('');
    this.f.subId.updateValueAndValidity();
    this.f.idSubTipoAdicional.setValue('');
    this.f.idSubTipoAdicional.updateValueAndValidity();
    this.f.subPuntajeMaximo.setValue('');
    this.f.subPuntajeMaximo.updateValueAndValidity();
  }

  public async editConfig(element: ConfigAdicional) {
    this.form.patchValue({
      idSubTipoAdicional: element.idTipoAdicional,
      subPuntajeMaximo: element.puntajeMaximo,
      subId: element.id
    });
    this.f.idSubTipoAdicional.disable();
  }
  //#endregion

  public modConvSA(convocatoria: Convocatoria) {
    if (convocatoria.estadoConvocatoria === stateConvocatoria.PUBLICADA || convocatoria.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
      if (this.varModificarConvSuperAdmin.valor === '1' && this.isSuperAdmin(this.user)) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }


  public async seeCombinationsStages(element: Adicional) {
    const lstSubAditionalType = (await this.convAdminService.getTipoAdicionalesPorIdReferencia(element.idTipoAdicional).toPromise() as any).datos as TipoAdicional[];
    const data = (await this.convService.getObtenerConfigAdicionalesPorAdicional(element.id).toPromise() as any).datos as ConfigAdicional[];
    // this.loadDataSourceInternal();
    if (data.length > 0) {
      data.forEach(e => {
        lstSubAditionalType.forEach(g => {
          if (e.idTipoAdicional === g.id) {
            e.tipoAdicional = g.tipoAdicional;
            return;
          }
        });
        e.tipoAdicional = e.tipoAdicional === undefined ? '' : e.tipoAdicional;
      });
    }
    this.dataSourceInfo.data = data;
    this.dialogRefInfo = this.dialogService.open(this.dialogInfo);
    this.dialogRefInfo.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public closeDialogInfo() {
    this.dialogRefInfo.close();
  }
}
