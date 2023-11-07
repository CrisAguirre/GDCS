import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatDialogRef, Sort } from '@angular/material';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { AlertService, TYPES } from '../../../../../core/servicios/alert.service';
import { ConvocatoriaService } from '../../../../../core/servicios/convocatoria.service';
import { Etapa } from '../../../../../compartido/modelos/etapa';
import { Convocatoria } from '../../../../../compartido/modelos/convocatoria';
import { configMsg, stateConvocatoria } from '../../../../../compartido/helpers/enums';
import { CommonService } from '../../../../../core/servicios/common.service';
import { TipoCalificacion } from '@app/compartido/modelos/tipo-calificacion';
import { TipoPrueba } from '@app/compartido/modelos/tipo-prueba';
import { TipoEtapa } from '@app/compartido/modelos/tipo-etapa';
import { TipoFaseModel } from '@app/compartido/modelos/tipo-fase-model';
//import { TipoSubEtapa } from '@app/compartido/modelos/tipo-sub-etapa';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CombinacionEtapa } from '@app/compartido/modelos/combinacion-etapa';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { TipoFasePruebaModel } from '../../../../../compartido/modelos/tipo-fase-prueba-model';
import { VariableAppModel } from '@app/compartido/modelos/variable-app-model';

@Component({
  selector: 'app-etapas',
  templateUrl: './etapas.component.html',
  styleUrls: ['./etapas.component.scss']
})
export class EtapasComponent extends BaseController implements OnInit, AfterViewChecked {

  public updateData: Etapa[] = [];
  public updateData2: CombinacionEtapa[] = [];
  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstQualification: TipoCalificacion[] = [];
  public lstStages: TipoEtapa[] = [];
  public lstTest: TipoPrueba[] = [];
  private lstTipoPruebaAll: TipoPrueba[] = [];
  public lstTipoPruebaDialog: TipoPrueba[] = [];
  private lstTipoFasesAll: TipoFaseModel[] = [];
  public lstTipoFases: TipoFaseModel[] = [];
  private lstTipoFasePrueba: TipoFasePruebaModel[] = [];
  //public lstSubStagest: TipoSubEtapa[] = [];
  public submit = false;
  private user = this.commonService.getVar(configMsg.USER);
  public idTypeSimple;
  public idEtapaClasificacion;
  public isSimple: any = undefined;
  private dialogRef: MatDialogRef<any, any>;
  public elementCurrent: any = {};
  public elementCurrent2: any = {};

  public varModificarConvSuperAdmin: VariableAppModel;

  public form: FormGroup;
  // tslint:disable-next-line: max-line-length
  public displayedColumns: string[] = ['idConvocatoria', 'idTipoCalificacion', 'idTipoEtapa', 'idTipoFase', 'idTipoPrueba', 'puntajeMinimo', 'options'];
  // tslint:disable-next-line: max-line-length
  // public displayedColumns: string[] = ['idConvocatoria', 'idTipoCalificacion', 'idTipoEtapa', 'idTipoPrueba', 'idTipoSubEtapa', 'valorMinimo', 'valorMaximo', 'puntajeMinimo', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public sortedData: any;

  public form2: FormGroup;
  public displayedColumns2: string[] = ['idTipoPrueba', 'valorMinimo', 'valorMaximo', 'options'];
  public dataSource2 = new MatTableDataSource<any>([]);

  public displayedColumnsInfo: string[] = ['idTipoPrueba', 'valorMinimo', 'valorMaximo'];
  public dataSourceInfo = new MatTableDataSource<any>([]);
  private dialogRefInfo: MatDialogRef<any, any>;


  public idEmpresaT = null;
  public company: FormControl = new FormControl('');
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];
  public lstEtapasByEmpresa: Etapa[] = [];
  public dataConvocatory: Convocatoria;

  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild('formV2', { static: false }) formV2: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('dialogReference', { static: true }) dialog: TemplateRef<any>;

  @ViewChild('paginatorDialog2', { static: false }) set paginator2(value: MatPaginator) {
    this.dataSource2.paginator = value;
  }
  @ViewChild('paginatorDialog3', { static: false }) set paginator3(value: MatPaginator) {
    this.dataSourceInfo.paginator = value;
  }

  constructor(
    private alertService: AlertService,
    private cs: ConvocatoriaService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private convService: AdministracionConvocatoriaService,
    private empresaService: EmpresaService,
    private cdRef: ChangeDetectorRef,
    private dialogService: MatDialog
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadUserData();
    this.loadForm();
    this.loadForm2();
    this.loadData();
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: Etapa, filter: string): boolean => {
      const dataCompare = [
        data.nombreConvocatoria,
        data.tipoCalificacion,
        data.tipoEtapa,
        data.tipoFase ? data.tipoFase['nombreFase' + this.lang] : '',
        data.tipoPrueba,
        data.puntajeMaximo];
      return C.filterTable(dataCompare, filter);
    };

  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: Etapa, b: Etapa) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'idConvocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        case 'idTipoCalificacion': return this.compare(a.tipoCalificacion, b.tipoCalificacion, isAsc);
        case 'idTipoEtapa': return this.compare(a.tipoEtapa, b.tipoEtapa, isAsc);
        case 'idTipoFase': return this.compare(a.tipoPrueba, b.tipoPrueba, isAsc);
        case 'idTipoPrueba': return this.compare(a.tipoPrueba, b.tipoPrueba, isAsc);
        case 'valorMinimo': return this.compare(a.valorMinimo, b.valorMinimo, isAsc);
        case 'valorMaximo': return this.compare(a.valorMaximo, b.valorMaximo, isAsc);
        case 'puntajeMinimo': return this.compare(a.puntajeMaximo, b.puntajeMaximo, isAsc);

        default: return 0;
      }
    });



  }

  public async loadUserData() {
    /* this.company = null;
    this.idEmpresaT = null; */
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      this.lstCompanies = (<any>await this.empresaService.getListarEmpresas().toPromise()).datos;
    } else {
      this.showSelectCompany = false;
      this.idEmpresaT = this.user.idEmpresa;
      // this.loadEtapasByEmpresa({value: this.idEmpresaT});
      this.company.setValue(this.user.idEmpresa);
      this.company.setValidators([]);
      this.company.updateValueAndValidity();
    }
  }

  public async loadEtapasByEmpresa(pCompany: any) {
    /* if (this.f.idConvocatoria.value || this.f.idTipoCalificacion.value) {
      this.cleanForm();  
    } */
    
    this.varModificarConvSuperAdmin = (await this.commonService.getMessageByName(configMsg.MODIFICAR_CONVOCATORIA_SUPERADMIN).toPromise() as any).datos as VariableAppModel;
    this.updateData = (<any>await this.cs.getTodosEtapaByEmpresa(pCompany.value).toPromise()).datos;
    this.lstConvocatoriesAll = (await this.cs.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise() as any).datos as Convocatoria[];
    this.lstConvocatories = [];

    this.lstConvocatoriesAll.forEach(x => {
      x.mostrar = false;
      if (x.estadoConvocatoria === stateConvocatoria.ACTIVO ||
        x.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
        x.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
        x.estadoConvocatoria === stateConvocatoria.CERRADA ||
        x.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
        x.mostrar = true;
        this.lstConvocatories.push(x);
      }
    });

    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstQualification = <TipoCalificacion[]>(<any>await this.convService.getTipoCalificaciones().toPromise()).datos;
    this.idTypeSimple = this.lstQualification.find(x => x.tipoCalificacion === 'Simple');
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstStages = <TipoEtapa[]>(<any>await this.convService.getTipoEtapas().toPromise()).datos;
    const o = this.lstStages.find(x => x.tipoEtapa === 'Clasificación');
    this.idEtapaClasificacion = o ? o.id : -1;

    if (this.updateData.length > 0) {
      this.updateData.forEach(e => {

        let data: any = <Convocatoria>this.lstConvocatoriesAll.find(x => e.idConvocatoria === x.id);
        e.nombreConvocatoria = data ? data.nombreConvocatoria : '';
        e.mostrarBtns = data ? data.mostrar : false;

        data = <TipoCalificacion>this.lstQualification.find(x => e.idTipoCalificacion === x.id);
        e.tipoCalificacion = data ? this.translateField(data, 'tipoCalificacion', this.lang) : '';

        data = <TipoEtapa>this.lstStages.find(x => e.idTipoEtapa === x.id);
        e.tipoEtapa = data ? this.translateField(data, 'tipoEtapa', this.lang) : '';

        data = this.lstTipoPruebaAll.find(x => e.idTipoPrueba === x.id) as TipoPrueba;
        e.tipoPrueba = data ? this.translateField(data, 'tipoPrueba', this.lang) : '';

        data = this.lstTipoFasesAll.find(x => e.idTipoFase === x.id) as TipoFaseModel;
        e.tipoFase = data;

      });
    }

    this.f.idConvocatoria.setValue('');
    this.f.idConvocatoria.updateValueAndValidity();

    this.f.idTipoFase.setValue('');
    this.f.idTipoFase.updateValueAndValidity();

    this.f.idTipoPrueba.setValue('');
    this.f.idTipoPrueba.updateValueAndValidity();

    //this.loadDataByConvocatoria({ value: undefined });
  }

  public async loadDataByConvocatoria(pConvocatoria: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.lstConvocatoriesAll = [];

    this.lstTipoPruebaAll = (await this.convService.getTipoPruebas().toPromise() as any).datos as TipoPrueba[];
    this.lstTipoFasesAll = (await this.convService.getTipoFases().toPromise() as any).datos as TipoFaseModel[];
    
    if (pConvocatoria.value) {
      this.lstTipoFasePrueba = (await this.convService.getTipoFasePruebaByIdConvocatoria(pConvocatoria.value).toPromise() as any).datos as TipoFasePruebaModel[];
      this.lstTipoFases = this.lstTipoFasesAll.filter(x => {
        const f = this.lstTipoFasePrueba.find(z => z.idFase === x.id);
        return f ? true : false;
      });
    }

    this.varModificarConvSuperAdmin = (await this.commonService.getMessageByName(configMsg.MODIFICAR_CONVOCATORIA_SUPERADMIN).toPromise() as any).datos as VariableAppModel;
    this.lstConvocatoriesAll = (await this.cs.getTodosConvocatoriasByEmpresa(this.company.value).toPromise() as any).datos as Convocatoria[];
    this.updateData = (await this.cs.getTodosEtapaByEmpresa(this.company.value).toPromise() as any).datos as Etapa[];
    // if (this.company.value) {
    //   this.updateData = (await this.cs.getTodosEtapaByEmpresa(this.company.value).toPromise() as any).datos as Etapa[];
    //   this.lstConvocatoriesAll = (await this.cs.getTodosConvocatoriasByEmpresa(this.company.value).toPromise() as any).datos as Convocatoria[];
    // } else {
    //   this.updateData = (await this.cs.getEtapa().toPromise() as any).datos as Etapa[];
    //   this.lstConvocatoriesAll = (await this.cs.getConvocatorias().toPromise() as any).datos as Convocatoria[];
    // }

    this.lstConvocatories = [];
    this.lstConvocatoriesAll.forEach(x => {
      x.mostrar = false;
      if (x.estadoConvocatoria === stateConvocatoria.ACTIVO ||
        x.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
        x.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
        x.estadoConvocatoria === stateConvocatoria.CERRADA ||
        x.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
        x.mostrar = true;
        this.lstConvocatories.push(x);
      }
    });

    this.lstQualification = (await this.convService.getTipoCalificaciones().toPromise() as any).datos as TipoCalificacion[];
    this.idTypeSimple = this.lstQualification.find(x => x.tipoCalificacion === 'Simple');

    this.lstStages = (await this.convService.getTipoEtapas().toPromise() as any).datos as TipoEtapa[];
    const o = this.lstStages.find(x => x.tipoEtapa === 'Clasificación');
    this.idEtapaClasificacion = o ? o.id : -1;

    this.updateData = (<any>await this.cs.getEtapaByConvocatory(pConvocatoria.value).toPromise()).datos;
    this.dataConvocatory = this.lstConvocatoriesAll.find((x: any) => x.id === this.f.idConvocatoria.value);

    //this.lstSubStagest = <TipoSubEtapa[]>(<any>await this.convService.getTipoSubEtapas().toPromise()).datos;
    if (this.updateData.length > 0) {
      this.updateData.forEach(e => {

        let data: any = this.lstConvocatoriesAll.find(x => e.idConvocatoria === x.id) as Convocatoria;
        e.nombreConvocatoria = data ? data.nombreConvocatoria : '';
        e.mostrarBtns = data ? data.mostrar : false;

        data = this.lstQualification.find(x => e.idTipoCalificacion === x.id) as TipoCalificacion;
        e.tipoCalificacion = data ? this.translateField(data, 'tipoCalificacion', this.lang) : '';

        data = this.lstStages.find(x => e.idTipoEtapa === x.id) as TipoEtapa;
        e.tipoEtapa = data ? this.translateField(data, 'tipoEtapa', this.lang) : '';

        data = this.lstTipoPruebaAll.find(x => e.idTipoPrueba === x.id) as TipoPrueba;
        e.tipoPrueba = data ? this.translateField(data, 'tipoPrueba', this.lang) : '';

        data = this.lstTipoFasesAll.find(x => e.idTipoFase === x.id) as TipoFaseModel;
        e.tipoFase = data;

        //data = <TipoSubEtapa>this.lstSubStagest.find(x => e.idTipoSubEtapa === x.id);
        //e.tipoSubEtapa = data ? data.tipoSubEtapa : '';
        //e.tipoSubEtapa = data ? this.translateField(data, 'tipoSubEtapa', this.lang) : '';

      });
    }

    this.dataSource.data = this.updateData;

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public loadDataByFase(pFase: any) {
    this.lstTest = [];
    if (pFase.value) {
      this.lstTest = this.lstTipoPruebaAll.filter(x => {
        const f = this.lstTipoFasePrueba.find(z => z.idPrueba === x.id && z.idFase === pFase.value);
        return f ? true : false;
      });
    }
  }

  public async loadData() {
    this.lstConvocatoriesAll = (await this.cs.getTodosConvocatoriasByEmpresa(this.company.value).toPromise() as any).datos as Convocatoria[];
    if (this.company && this.company.value) {
      this.updateData = (await this.cs.getTodosEtapaByEmpresa(this.company.value).toPromise() as any).datos as Etapa[];
      // this.lstConvocatoriesAll = <Convocatoria[]>(<any>await this.cs.getTodosConvocatoriasByEmpresa(this.idEmpresaT).toPromise()).datos;
    } else {
      this.updateData = (await this.cs.getEtapa().toPromise() as any).datos as Etapa[];
      // this.lstConvocatoriesAll = <Convocatoria[]>(<any>await this.cs.getConvocatorias().toPromise()).datos;
    }

    this.lstConvocatories = [];

    this.lstConvocatoriesAll.forEach(x => {
      x.mostrar = false;
      if (x.estadoConvocatoria === stateConvocatoria.ACTIVO ||
        x.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
        x.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
        x.estadoConvocatoria === stateConvocatoria.CERRADA ||
        x.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
        x.mostrar = true;
        this.lstConvocatories.push(x);
      }
    });

    this.lstQualification = <TipoCalificacion[]>(<any>await this.convService.getTipoCalificaciones().toPromise()).datos;
    this.idTypeSimple = this.lstQualification.find(x => x.tipoCalificacion === 'Simple');
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstStages = <TipoEtapa[]>(<any>await this.convService.getTipoEtapas().toPromise()).datos;
    const o = this.lstStages.find(x => x.tipoEtapa === 'Clasificación');
    this.idEtapaClasificacion = o ? o.id : -1;

    if (this.updateData.length > 0) {
      this.updateData.forEach(e => {

        let data: any = <Convocatoria>this.lstConvocatoriesAll.find(x => e.idConvocatoria === x.id);
        e.nombreConvocatoria = data ? data.nombreConvocatoria : '';
        e.mostrarBtns = data ? data.mostrar : false;

        data = <TipoCalificacion>this.lstQualification.find(x => e.idTipoCalificacion === x.id);
        e.tipoCalificacion = data ? this.translateField(data, 'tipoCalificacion', this.lang) : '';

        data = <TipoEtapa>this.lstStages.find(x => e.idTipoEtapa === x.id);
        e.tipoEtapa = data ? this.translateField(data, 'tipoEtapa', this.lang) : '';

        data = this.lstTipoPruebaAll.find(x => e.idTipoPrueba === x.id) as TipoPrueba;
        e.tipoPrueba = data ? this.translateField(data, 'tipoPrueba', this.lang) : '';

        data = this.lstTipoFasesAll.find(x => e.idTipoFase === x.id) as TipoFaseModel;
        e.tipoFase = data;

      });
    }
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        idConvocatoria: new FormControl('', [Validators.required]),
        idTipoCalificacion: new FormControl('', [Validators.required]),
        idTipoEtapa: new FormControl('', [Validators.required]),
        idTipoFase: new FormControl(''),
        idTipoPrueba: new FormControl(''),
        // idTipoSubEtapa: new FormControl(''),
        puntajeMinimo: new FormControl('', [Validators.required]),
        valorMinimo: new FormControl(''),
        valorMaximo: new FormControl('')
      }
    );

    this.f.idTipoEtapa.valueChanges.subscribe(val => {
      this.f.puntajeMinimo.clearValidators();
      this.f.idTipoFase.clearValidators();
      if (val === this.idEtapaClasificacion && this.f.idTipoCalificacion.value !== this.idEtapaClasificacion) {
        this.f.puntajeMinimo.setValue('');
        this.f.puntajeMinimo.disable();
        this.f.idTipoFase.setValue('');
        this.f.idTipoFase.disable();
        this.lstTest = this.lstTipoPruebaAll;
      } else {
        this.f.puntajeMinimo.setValidators([Validators.required]);
        this.f.puntajeMinimo.enable();
        this.f.idTipoFase.setValidators([Validators.required]);
        this.f.idTipoFase.enable();
        this.lstTest = [];

      }
      this.f.puntajeMinimo.updateValueAndValidity();
      this.f.idTipoFase.updateValueAndValidity();
    });

    // this.company = new FormControl('', [Validators.required]);
  }

  public loadForm2() {
    this.form2 = this.fb.group(
      {
        id: new FormControl(''),
        idFake: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        idConvocatoria: new FormControl(''),
        idEtapa: new FormControl(''),
        idTipoPrueba: new FormControl('', [Validators.required]),
        //idTipoSubEtapa: new FormControl('', [Validators.required]),
        valorMinimo: new FormControl('', [Validators.required]),
        valorMaximo: new FormControl('', [Validators.required])
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  get f2() {
    return this.form2.controls;
  }

  public async edit(element: Etapa) {

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    var convocariaAux = this.lstConvocatoriesAll.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);

    this.isSimple = this.idTypeSimple.id === String(element.idTipoCalificacion);
    this.updateControlls();
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.id,
      idConvocatoria: element.idConvocatoria,
      idTipoCalificacion: element.idTipoCalificacion,
      idTipoEtapa: element.idTipoEtapa,
      idTipoPrueba: element.idTipoPrueba,
      //idTipoSubEtapa: element.idTipoSubEtapa,
      puntajeMinimo: element.puntajeMaximo,
      valorMinimo: element.valorMinimo,
      valorMaximo: element.valorMaximo,
      idTipoFase: element.idTipoFase
    });

    this.updateData2 = [];
    this.dataSource2.data = this.updateData2;

    if (!this.isSimple) {
      this.updateData2 = <CombinacionEtapa[]>(<any>await this.cs.getCombinacionEtapaByEtapa({ idEtapa: this.f.id.value }).toPromise()).datos;
      this.updateDataForm2();
      this.loadDataByConvocatoria({ value: element.idConvocatoria })
        .then(() => {
          //this.lstTest = this.lstTipoPruebaAll;
          if (element.idTipoFase) {
            this.loadDataByFaseDialog({ value: element.idTipoFase });
          }
        });
    } else {
      this.loadDataByConvocatoria({ value: element.idConvocatoria })
        .then(() => {
          this.lstTest = this.lstTipoPruebaAll;
          if (element.idTipoFase) {
            this.loadDataByFase({ value: element.idTipoFase });
          }
        });
    }

  }

  public async addEtapa() {
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

    const obj = this.updateData.find((x: Etapa) =>
      this.areEqualsValues(x.idConvocatoria, this.f.idConvocatoria.value) &&
      this.areEqualsValues(x.idTipoCalificacion, this.f.idTipoCalificacion.value) &&
      this.areEqualsValues(x.idTipoEtapa, this.f.idTipoEtapa.value) &&
      this.areEqualsValues(x.idTipoPrueba, this.f.idTipoPrueba.value) &&
      this.areEqualsValues(x.idTipoFase, this.f.idTipoFase.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    if (this.idEmpresaT) {
      this.submit = true;
    } else if (this.company.value) {
      this.idEmpresaT = this.company.value;
    } else {
      this.submit = false;
      return;
    }

    this.alertService.loading();




    // if (this.form.valid) {
    //   this.submit = true;
    //   this.updateData.forEach(e => {
    //     if (this.f.id.value !== e.id) {
    //       if (e.idConvocatoria === this.f.idConvocatoria.value &&
    //         e.idTipoCalificacion === this.f.idTipoCalificacion.value &&
    //         e.idTipoEtapa === this.f.idTipoEtapa.value) {
    //         if (this.f.idTipoPrueba.value && this.f.idTipoSubEtapa.value) {
    //           if (e.idTipoPrueba === this.f.idTipoPrueba.value &&
    //             e.idTipoSubEtapa === this.f.idTipoSubEtapa.value) {
    //             this.submit = false;
    //             return;
    //           }
    //         } else {
    //           this.submit = false;
    //           return;
    //         }
    //       }
    //     }
    //   });
    //   if (!this.submit) {
    //     this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
    //     return;
    //   }
    // } else {
    //   this.submit = false;
    //   return;
    // }



    if (this.isSimple) {
      const newEtapa: Etapa = {
        id: this.f.id.value ? this.f.id.value : undefined,
        idUsuarioModificacion: this.user.id,
        idConvocatoria: this.f.idConvocatoria.value,
        idTipoCalificacion: this.f.idTipoCalificacion.value,
        idTipoEtapa: this.f.idTipoEtapa.value,
        idTipoPrueba: this.f.idTipoPrueba.value,
        //idTipoSubEtapa: this.f.idTipoSubEtapa.value,
        puntajeMaximo: Number(this.f.puntajeMinimo.value),
        valorMinimo: Number(this.f.valorMinimo.value),
        valorMaximo: Number(this.f.valorMaximo.value),
        idEmpresa: this.idEmpresaT,
        idTipoFase: this.f.idTipoFase.value ? this.f.idTipoFase.value : null,
      };

      this.cs.saveEtapa(newEtapa).toPromise()
        .then(record => {
          this.loadData().then(() => {
            this.cleanForm();
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
              .finally(() => this.submit = false);
          });
        }).catch(error => {
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
            .finally(() => this.submit = false);
        });
    } else {

      const newEtapa: Etapa = {
        id: this.f.id.value ? this.f.id.value : undefined,
        idUsuarioModificacion: this.user.id,
        idConvocatoria: this.f.idConvocatoria.value,
        idTipoCalificacion: this.f.idTipoCalificacion.value,
        idTipoEtapa: this.f.idTipoEtapa.value,
        idTipoPrueba: null,
        //idTipoSubEtapa: null,
        puntajeMaximo: Number(this.f.puntajeMinimo.value),
        valorMinimo: Number(this.f.valorMinimo.value),
        valorMaximo: Number(this.f.valorMaximo.value),
        idEmpresa: this.idEmpresaT,
        idTipoFase: this.f.idTipoFase.value,
      };

      this.cs.saveEtapa(newEtapa).toPromise()
        .then((record: any) => {
          newEtapa.id = newEtapa.id ? newEtapa.id : record.id;

          this.updateData2.forEach(async x => {
            try {
              x.idEtapa = newEtapa.id;
              x.idConvocatoria = newEtapa.idConvocatoria;
              await this.cs.saveCombinacionEtapa(x).toPromise();
            } catch (e) {
              console.log('Error', e);
            }
          });
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
  }

  public delete(element: Etapa) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    var convocariaAux = this.lstConvocatoriesAll.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.cs.deleteEtapa(element)
            .subscribe(ok2 => {
              this.loadData()
                .then(r => {
                  this.cleanForm();
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      });

  }

  private deleteIsSelected(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.isSimple = undefined;
    this.updateData2 = [];
    this.elementCurrent = {};
    this.elementCurrent2 = {};
    this.updateDataForm2();
    this.dataSource.data = [];
    this.dataSource2.data = [];
  }

  public eventCalification(event) {
    this.isSimple = this.idTypeSimple.id === String(event.value);
    this.updateControlls();
  }

  private updateControlls() {
    // this.f.idTipoEtapa.setValue('');
    this.f.idTipoPrueba.setValue('');
    //this.f.idTipoSubEtapa.setValue('');
    this.f.idTipoFase.setValue('');
    this.f.valorMinimo.setValue('');
    this.f.valorMaximo.setValue('');
    if (this.isSimple) {
      // this.f.idTipoEtapa.setValidators([Validators.required]);
      this.f.idTipoPrueba.setValidators([Validators.required]);
      //this.f.idTipoSubEtapa.setValidators([Validators.required]);
      this.f.idTipoFase.setValidators([Validators.required]);
      this.f.valorMinimo.setValidators([Validators.required]);
      this.f.valorMaximo.setValidators([Validators.required]);
    } else {
      // this.f.idTipoEtapa.clearValidators();
      this.f.idTipoPrueba.clearValidators();
      //this.f.idTipoSubEtapa.clearValidators();
      this.f.idTipoFase.clearValidators();
      this.f.valorMinimo.clearValidators();
      this.f.valorMaximo.clearValidators();
    }
    // this.f.idTipoEtapa.updateValueAndValidity();
    this.f.idTipoPrueba.updateValueAndValidity();
    //this.f.idTipoSubEtapa.updateValueAndValidity();
    this.f.idTipoFase.updateValueAndValidity();
    this.f.valorMinimo.updateValueAndValidity();
    this.f.valorMaximo.updateValueAndValidity();
  }

  openDialog() {
    if (!this.form.valid) {
      this.form.updateValueAndValidity();
    } else if (this.form.valid) {
      this.dialogRef = this.dialogService.open(this.dialog);
      this.dialogRef.disableClose = true;
      this.dialogRef.addPanelClass(['col-sm-12', 'col-md-8']);
      this.dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
          if (result === 'yes') {
          } else if (result === 'no') {
            this.cleanForm2();
          }
        }
      });
    }

  }

  public addForm2() {
    if (this.form2.valid) {
      this.submit = true;

      if (Number(this.f.valorMinimo.value) > Number(this.f2.valorMinimo.value) || Number(this.f.valorMaximo.value) < Number(this.f2.valorMinimo.value)) {
        this.alertService.message(this.ct.ERROR_RANGE, TYPES.WARNING);
        this.submit = false;
      }

      if (Number(this.f.valorMinimo.value) > Number(this.f2.valorMaximo.value) || Number(this.f.valorMaximo.value) < Number(this.f2.valorMaximo.value)) {
        this.alertService.message(this.ct.ERROR_RANGE, TYPES.WARNING);
        this.submit = false;
      }

      if (Number(this.f2.valorMinimo.value) > Number(this.f2.valorMaximo.value) || Number(this.f2.valorMaximo.value) < Number(this.f2.valorMinimo.value)) {
        this.alertService.message(this.ct.ERROR_RANGE, TYPES.WARNING);
        this.submit = false;
      }

      if (!this.submit) {
        return;
      }

      let sum: number = Number(this.f2.valorMaximo.value);
      this.updateData2.forEach(e => {
        if (!this.f2.idFake || Number(this.f2.idFake.value) !== e.idFake) {
          // if (e.idTipoPrueba === this.f2.idTipoPrueba.value &&
          //   e.idTipoSubEtapa === this.f2.idTipoSubEtapa.value) {
          //   this.submit = false;
          //   return;
          // }
          if (e.idTipoPrueba === this.f2.idTipoPrueba.value) {
            this.submit = false;
            return;
          }
        }
        if (Number(this.f2.idFake.value) !== e.idFake) {
          sum += Number(e.valorMaximo);
        }
      });

      if (!this.submit) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        return;
      }

      if (sum > Number(this.f.valorMaximo.value)) {
        this.submit = false;
        this.alertService.message(this.ct.SUM_ETAPA_COMBIN_INCORRECTO, TYPES.WARNING);
        return;
      }

      // Validar puntaje minimo
      // if (this.f.puntajeMinimo.value !== '' && this.f.puntajeMinimo.value !== ' ' &&
      //   this.f.puntajeMinimo.value !== null && this.f.puntajeMinimo.value !== undefined) {
      //   if (Number(this.f2.valorMinimo.value) > Number(this.f.puntajeMinimo.value) ||
      //     Number(this.f2.valorMaximo.value) < Number(this.f.puntajeMinimo.value)) {
      //     this.alertService.message(this.ct.ERROR_RANGE, TYPES.WARNING);
      //     this.submit = false;
      //     return;
      //   }
      // }
    } else {
      this.submit = false;
      return;
    }

    const record: CombinacionEtapa = {
      id: this.f2.id.value ? this.f2.id.value : undefined,
      // idFake: this.elementCurrent2.idFake ? this.elementCurrent2.idFake : new Date().getTime(),
      idFake: this.elementCurrent2.idFake,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f2.idConvocatoria.value,
      idEtapa: this.f2.idEtapa.value,
      idTipoPrueba: this.f2.idTipoPrueba.value,
      //idTipoSubEtapa: this.f2.idTipoSubEtapa.value,
      valorMinimo: Number(this.f2.valorMinimo.value),
      valorMaximo: Number(this.f2.valorMaximo.value)
    };
    if (this.elementCurrent2.idFake) {
      this.updateData2[this.updateData2.findIndex(x => x.idFake === this.elementCurrent2.idFake)] = record;
    } else {
      this.updateData2.push(record);
    }

    this.updateDataForm2();

    this.cleanForm2();
    this.submit = false;
  }

  public cleanForm2() {
    this.dialogRef.close();
    this.formV2.resetForm();
    this.elementCurrent2 = {};
    // this.dataSource2.data = [];
  }

  private updateDataForm2() {
    if (this.updateData2.length > 0) {
      let idFake = new Date().getTime();
      this.updateData2.forEach(e => {
        idFake++;
        // tslint:disable-next-line: no-angle-bracket-type-assertion
        let data: any = <TipoPrueba>this.lstTipoPruebaAll.find(x => e.idTipoPrueba === x.id);
        e.nombreTipoPrueba = data ? data.tipoPrueba : '';

        // tslint:disable-next-line: no-angle-bracket-type-assertion
        //data = <TipoSubEtapa>this.lstSubStagest.find(x => e.idTipoSubEtapa === x.id);
        //e.nombreTipoSubEtapa = data ? data.tipoSubEtapa : '';

        e.idFake = idFake;
      });
    }
    
    this.dataSource2.data = this.updateData2;
  }

  public delete2(element: CombinacionEtapa) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
    
    var convocariaAux = this.lstConvocatoriesAll.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          if (element.id) {
            this.cs.deleteCombinacionEtapa(element)
              .subscribe(ok2 => {
                this.loadData()
                  .then(r => {
                    this.cleanForm2();
                    this.updateData2.splice(this.updateData2.findIndex(x => x.id === element.id), 1);
                    this.updateDataForm2();
                    this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                  });
              }, err => {
                this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
              });
          } else {
            this.updateData2.splice(this.updateData2.findIndex(x => x.idFake === element.idFake), 1);
            this.updateDataForm2();
            this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
          }

        }
      });
  }

  public edit2(element: CombinacionEtapa) {

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    var convocariaAux = this.lstConvocatoriesAll.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }
    this.elementCurrent2 = C.cloneObject(element);

    this.form2.patchValue({
      id: element.id,
      idFake: element.idFake,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: element.idConvocatoria,
      idEtapa: element.idEtapa,
      idTipoPrueba: element.idTipoPrueba,
      //idTipoSubEtapa: element.idTipoSubEtapa,
      valorMinimo: element.valorMinimo,
      valorMaximo: element.valorMaximo,
    });
    this.openDialog();
  }


  public async seeCombinationsStages(element: Etapa) {
    // tslint:disable-next-line: max-line-length no-angle-bracket-type-assertion
    const data: CombinacionEtapa[] = <CombinacionEtapa[]>(<any>await this.cs.getCombinacionEtapaByEtapa({ idEtapa: element.id }).toPromise()).datos;
    if (data.length > 0) {
      data.forEach(e => {
        // tslint:disable-next-line: no-shadowed-variable no-angle-bracket-type-assertion
        let data: any = <TipoPrueba>this.lstTipoPruebaAll.find(x => e.idTipoPrueba === x.id);
        e.nombreTipoPrueba = data ? data.tipoPrueba : '';
        // tslint:disable-next-line: no-angle-bracket-type-assertion
        //data = <TipoSubEtapa>this.lstSubStagest.find(x => e.idTipoSubEtapa === x.id);
        //e.nombreTipoSubEtapa = data ? data.tipoSubEtapa : '';
      });
    }
    this.dataSourceInfo.data = data;
    this.dialogRefInfo = this.dialogService.open(this.dialogInfo);
    // this.dialogRefInfo.disableClose = true;
    this.dialogRefInfo.addPanelClass(['col-sm-12', 'col-md-8']);
  }

  public closeDialogInfo() {
    this.dialogRefInfo.close();
  }

  public loadDataByFaseDialog(pFase: any) {
    this.lstTest = [];
    if (pFase.value) {
      this.lstTipoPruebaDialog = this.lstTipoPruebaAll.filter(x => {
        const f = this.lstTipoFasePrueba.find(z => z.idPrueba === x.id && z.idFase === pFase.value);
        return f ? true : false;
      });
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
}
