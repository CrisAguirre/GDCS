import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { MatTableDataSource, MatPaginator, MatSort, Sort, MatDialogRef, MatDialog } from '@angular/material';
import { Empresa } from '@app/compartido/modelos/empresa';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg, stateConvocatoria } from '@app/compartido/helpers/enums';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { Convocatoria } from '@app//compartido/modelos/convocatoria';
import { ConvocatoriaService } from '@app//core/servicios/convocatoria.service';
import { Vacantes } from '@app//compartido/modelos/vacantes';
import { Constants as C } from '@app/compartido/helpers/constants';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Pais } from '@app/compartido/modelos/pais';
import { Ciudad } from '@app/compartido/modelos/ciudad';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { TipoCargo } from '@app/compartido/modelos/tipo-cargo';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { CargoHumano } from '@app/compartido/modelos/cargo-humano';
import { Configuration } from '@app/compartido/modelos/configuration';
import { Departamento } from '@app/compartido/modelos/departamento';
import { Despachos } from '@app/compartido/modelos/despachos';
import { forkJoin, Observable } from 'rxjs';

export interface PeriodicElement {
  id: number;
  vacante: string;
  vacante_En: string;
  datos: string;
}

export interface ElementTipoVacante {
  id: number;
  vacante: string;
  vacante_En: string;
  datos: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { id: 1, vacante: 'Vacante nueva para publicar', vacante_En: 'New vacancy to post', datos: 'vacante nueva para publicar' },
  { id: 2, vacante: 'Vacante para publicar por lista agotada o por traslado no acogido o declinado', vacante_En: 'vacancy to publish due to exhausted list or due to transfer not accepted or declined', datos: 'vacante para publicar por lista agotada o por traslado no acogido o declinado' },
  { id: 3, vacante: 'Con lista de aspirantes en trámite', vacante_En: 'With list of applicants pending', datos: 'con lista de aspirantes en trámite' },
  { id: 4, vacante: 'Con traslado en trámite (Proyectado por la seccional)', vacante_En: 'With transfer in process (Projected by the section)', datos: 'con traslado en trámite (proyectado por la seccional)' },
  { id: 5, vacante: 'Con traslado en trámite (Proyectado por el consejo superior)', vacante_En: 'Con traslado en trámite (Proyectado por el consejo superior)', datos: 'con traslado en trámite (proyectado por el consejo superior)' },
  { id: 6, vacante: 'Con proyecto de reordenamiento en trámite', vacante_En: 'With reorganization project in process', datos: 'con proyecto de reordenamiento en trámite' },
  { id: 7, vacante: 'Protección laboral', vacante_En: 'Labor protection', datos: 'protección laboral' }
];

const TipoVacante: ElementTipoVacante[] = [
  { id: 1, vacante: 'Juez', vacante_En: 'Judge', datos: 'juez' },
  { id: 2, vacante: 'Magistrado', vacante_En: 'Magistrate', datos: 'magistrado' },
  { id: 3, vacante: 'Empleado', vacante_En: 'Employee', datos: 'empleado' }
];

@Component({
  selector: 'app-registro-vacantes',
  templateUrl: './registro-vacantes.component.html',
  styleUrls: ['./registro-vacantes.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class RegistroVacantesComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['cargo', 'codDespacho', 'despacho', 'distrito', 'municipio', "fecha", 'estado', 'options'];

  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public elementCurrent: any = {};
  public sortedData: any;
  public submit = false;

  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatoriaAux: Convocatoria[] = [];
  public lstConvocatoria: Convocatoria[] = [];
  public dataConvocatory: Convocatoria;
  public estadoConvocatoria: string;

  public lstPais: Pais[] = [];
  public lstDepartamento: Departamento[] = [];
  public lstDepartamentoAux: Departamento[] = [];
  public lstMunicipio: Ciudad[] = [];
  public lstMunicipioAux: Ciudad[] = [];
  public lstMunicipioAux2: Ciudad[] = [];
  public lstDespachos: Despachos[] = [];

  public lstVacantes: Vacantes[] = [];

  public lstPerfilCargo: ConvocatoriaPerfil[] = [];
  public lstTipoCargo: TipoCargo[] = [];
  //public lstCargos: Cargo[] = [];
  public lstCargos: LstCargoModel[] = [];
  public lstCargoHumano: CargoHumano[] = [];
  public vCargos: Configuration;

  public showSelectCompany = false;
  public lstEmpresa: Empresa[] = [];

  public vacante = ELEMENT_DATA;

  public despachoSeleccionado: Despachos;
  public tipoVacante = TipoVacante;

  public idEmpresa: FormControl = new FormControl('');
  public idConvocatoria: FormControl = new FormControl('');

  private user = this.commonService.getVar(configMsg.USER);

  public showCantidadVacantes: boolean = true;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public displayedColumnsDialog: string[] = ['codigoDespacho', 'despacho', 'sede', 'options'];
  public dataSourceDialog = new MatTableDataSource<any>([]);
  private dialogRefInfo: MatDialogRef<any, any>;
  @ViewChild('dialogInfo', { static: true }) dialogInfo: TemplateRef<any>;
  @ViewChild('paginatorDialog', { static: false }) set paginatorDialog(value: MatPaginator) {
    this.dataSourceDialog.paginator = value;
  }

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private empresaService: EmpresaService,
    private convocatoryServices: ConvocatoriaService,
    private alertService: AlertService,
    private acs: AdministracionConvocatoriaService,
    private dialogService: MatDialog
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    this.alertService.loading();
    this.loadForm();
    this.loadUserData();
    this.loadData().then(() => this.alertService.close());


    this.dataSource.filterPredicate = (data: Vacantes, filter: string): boolean => {
      const dataCompare = [data.codigoDespacho, data.despacho, data.distrito, data.nombreMunicipio, this.commonService.getFormatDate(new Date(data.fechaVacante)), data.situacionActualVacante];
      return C.filterTable(dataCompare, filter);
    }

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSourceDialog.filterPredicate = (data: Despachos, filter: string): boolean => {
      ;
      const dataCompare = [data.codigoDespacho, data.despacho, data.sede];
      return C.filterTable(dataCompare, filter);
    };
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: Vacantes, b: Vacantes) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {

        case 'codDespacho': return this.compare(a.codigoDespacho, b.codigoDespacho, isAsc);
        case 'despacho': return this.compare(a.despacho, b.despacho, isAsc);
        case 'distrito': return this.compare(a.distrito, b.distrito, isAsc);
        case 'municipio': return this.compare(a.nombreMunicipio, b.nombreMunicipio, isAsc);
        case 'fecha': return this.compare(a.fechaVacante, b.fechaVacante, isAsc);
        case 'estado': return this.compare(a.situacionActualVacante, b.situacionActualVacante, isAsc);
        default: return 0;
      }
    });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public async loadDataByConvocatoria(pConvocatoria: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    //this.f.numeroDocumento.setValue(null);
    //this.f.observaciones.setValue(null);
    this.elementCurrent = {};
    this.formV.resetForm();
    //this.lstExcluidos = (await this.convocatoryServices.getAspiranteExcluidoByConvocatoria(pConvocatoria.value).toPromise() as any).datos as AspiranteExcluido[];    

    //#region Convocatoria
    // this.dataConvocatory = this.lstConvocatoriaAux.find((x: any) => x.id === this.f.idConvocatoria.value);
    if (this.idEmpresa.value) {
      this.lstConvocatoriaAux = this.lstConvocatoriaAux.filter(co => co.idEmpresa === this.idEmpresa.value);
    }
    this.dataConvocatory = this.lstConvocatoriaAux.find((x: any) => x.id === this.idConvocatoria.value);
    if (this.dataConvocatory) {
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
    }


    this.lstPais = <Pais[]>(await this.commonService.getCountries().toPromise() as any).paises;
    this.lstMunicipio = (<any>await this.commonService.getCiudades().toPromise()).ciudades;
    this.vCargos = await this.commonService.getVarConfig(configMsg.OBTENER_CARGOS_HUMANO);

    this.lstVacantes = (await this.convocatoryServices.getObtenerVacantesPorConvocatoria(pConvocatoria.value).toPromise() as any).datos as Vacantes[];
    if (this.lstVacantes.length > 0) {
      this.lstVacantes.forEach(e => {
        e.situacionActualVacante = e.situacionActualVacante.toLowerCase();
        this.lstMunicipio.forEach(g => {
          if (e.idMunicipio === g.id) {
            e.nombreMunicipio = g.ciudad;
            return;
          }
        });

        if (e.convocatoriaPerfil) {
          e.detallePerfil = JSON.parse(e.convocatoriaPerfil.detallePerfil);
        }


      });
    }
    this.dataSource.data = this.lstVacantes;

    if (this.dataConvocatory && this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    // if (this.f.idEmpresa && this.f.idEmpresa.value) {
    this.lstConvocatoriaAux = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.idEmpresa.value).toPromise() as any).datos as Convocatoria[];
    /* if (this.idEmpresa && this.idEmpresa.value) {
      this.lstConvocatoriaAux = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.idEmpresa.value).toPromise() as any).datos as Convocatoria[];
    } else {
      this.lstConvocatoriaAux = (await this.convocatoryServices.getConvocatorias().toPromise() as any).datos as Convocatoria[];
    } */
    this.lstConvocatoriaAux = this.lstConvocatoriaAux.filter(g =>
      g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
      g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
      g.estadoConvocatoria === stateConvocatoria.CERRADA ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES
    );

    this.lstDespachos = (await this.convocatoryServices.getTodosDespachos().toPromise() as any).datos as Despachos[]; // Consulta los despachos existentes

    /* if (this.f.idConvocatoria.value) {
      this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value });
    } */
  }

  public async loadCargo(convocatoria: any) {
    const idConvocatoria = convocatoria.value;
    this.lstCargos = [];

    this.lstPerfilCargo = <ConvocatoriaPerfil[]>(await this.convocatoryServices.getConvocatoriaPerfilByConvocatoria(idConvocatoria).toPromise() as any).datos;
    this.lstPerfilCargo.forEach(p => {
      let CargoAux = new LstCargoModel();
      CargoAux.id = p.id;

      p.perfil = JSON.parse(p.detallePerfil);

      if (p.perfil.cargoHumanoModel) {
        CargoAux.cargo = p.perfil.cargoHumanoModel.cargo;
        this.lstCargos.push(CargoAux);
      }
      if (p.perfil.cargoModel) {
        CargoAux.cargo = p.perfil.cargoModel.cargo;
        this.lstCargos.push(CargoAux);
      }
    });
  }

  public async loadCargo2(convocatoria: string) {
    const idConvocatoria = convocatoria;
    this.lstCargos = [];

    this.lstPerfilCargo = <ConvocatoriaPerfil[]>(await this.convocatoryServices.getConvocatoriaPerfilByConvocatoria(idConvocatoria).toPromise() as any).datos;
    this.lstPerfilCargo.forEach(p => {
      let CargoAux = new LstCargoModel();
      CargoAux.id = p.id;
      p.perfil = JSON.parse(p.detallePerfil);
      if (p.perfil.cargoHumanoModel) {
        CargoAux.cargo = p.perfil.cargoHumanoModel.cargo;
        this.lstCargos.push(CargoAux);
      }
      if (p.perfil.cargoModel) {
        CargoAux.cargo = p.perfil.cargoModel.cargo;
        this.lstCargos.push(CargoAux);
      }
    });
  }

  public async campoDepartamento(idPais) {
    this.lstDepartamento = <Departamento[]>(await this.commonService.getDepartmentsByCountry(idPais.value).toPromise() as any).departamentos;
  }

  public async campoCiudad(idCiudad) {
    this.lstMunicipioAux = <Ciudad[]>(await this.commonService.getCitiesByDepartment(idCiudad.value).toPromise() as any).ciudades;
  }

  public async campoCiudadAux(idCiudad) {
    let munc1 = (await this.commonService.getCityById(idCiudad.value).toPromise() as any).datos;
    let depar1 = (await this.commonService.getDepartmentById(munc1.idDepartamento).toPromise() as any).datos;
    this.lstDepartamento = (await this.commonService.getDepartmentsByCountry(depar1.idPais).toPromise() as any).departamentos;
    this.lstMunicipioAux = (await this.commonService.getCitiesByDepartment(munc1.idDepartamento).toPromise() as any).ciudades;
    this.f.pais.setValue(depar1.idPais);
    this.f.idDepartamento.setValue(munc1.idDepartamento);
  }

  public async buscarDepartamento(idMunicipio) {
    this.lstDepartamentoAux = <Departamento[]>(await this.commonService.getDepartmentById(idMunicipio.value).toPromise() as any).departamentos;
    if (this.lstVacantes.length > 0) {
      this.lstVacantes.forEach(e => {

        this.lstDepartamentoAux.forEach(g => {
          if (e.idMunicipio === g.id) {
            e.nombreDepartamento = g.departamento;
            return;
          }
        });
      });
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
      this.idEmpresa.setValue(this.user.idEmpresa);
      // this.f.idEmpresa.setValue(this.user.idEmpresa);
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

  public async cargarEmpresaPorConvocatoria(idConvocatoria: string, idConvocatoriaPerfil: string) {
    let conv = (await this.convocatoryServices.getConvocatoriaById(idConvocatoria).toPromise() as any).datos as Convocatoria;
    this.f.idEmpresa.setValue(conv.idEmpresa);
    this.idEmpresa.setValue(conv.idEmpresa);
    this.loadEmpresa(conv.idEmpresa);
    this.loadCargo2(idConvocatoria);
    this.f.perfilCargo.setValue(idConvocatoriaPerfil);

  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        // idConvocatoria: new FormControl('', [Validators.required]),
        // idEmpresa: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        CodDespacho: new FormControl(''),
        // despacho: new FormControl('', [Validators.required]),
        despacho: new FormControl({ value: '', disabled: true }),
        numOrdenDespacho: new FormControl('', [Validators.required]),
        distrito: new FormControl('', [Validators.required]),
        pais: new FormControl('', [Validators.required]),
        idDepartamento: new FormControl('', [Validators.required]),
        idMunicipio: new FormControl('', [Validators.required]),
        vacanteFuncionario: new FormControl('', [Validators.required]),
        cedulaFuncionario: new FormControl('', [Validators.required]),
        fechaVacante: new FormControl(''),
        perfilCargo: new FormControl('', [Validators.required]),
        situacionActualVacante: new FormControl('', [Validators.required]),
        observaciones: new FormControl(''),
        tipoVacante: new FormControl('', [Validators.required]),
        cantidadVacantes: new FormControl(1, [Validators.required])
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public async edit(element: Vacantes) {
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
    this.showCantidadVacantes = false;
    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();

    // this.loadEmpresa({ value: element.idEmpresa });
    // this.cargarEmpresaPorConvocatoria(element.idConvocatoria, element.idConvocatoriaPerfil);
    this.campoCiudadAux({ value: element.idMunicipio });
    this.form.patchValue({
      id: element.id,
      // idConvocatoria: element.idConvocatoria,
      idUsuarioModificacion: element.idUsuarioRegistra,
      CodDespacho: element.codigoDespacho,
      despacho: element.codigoDespacho + ' ' + element.despacho,
      numOrdenDespacho: element.numOrdenDespacho,
      distrito: element.distrito,
      idMunicipio: element.idMunicipio,
      vacanteFuncionario: element.vacanteFuncionario,
      cedulaFuncionario: element.cedulaFuncionario,
      fechaVacante: element.fechaVacante,
      situacionActualVacante: element.situacionActualVacante,
      observaciones: element.observaciones,
      tipoVacante: element.tipoVacante,
      idConvocatoriaPerfil: element.idConvocatoriaPerfil,
      cantidadVacantes: 1,
      idDepartamento: element.nombreDepartamento,
      pais: element.nombePais
    });
    this.idEmpresa.setValue(this.user.idEmpresa);
    this.idConvocatoria.setValue(element.idConvocatoria);

  }

  public async addVacantes() {

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
      this.f.situacionActualVacante.markAsTouched();
      return;
    }

    if (!this.f.despacho || !this.f.despacho.value || !this.despachoSeleccionado) {
      this.alertService.message(this.ct.MSG_SELECCIONE_DESPACHO, TYPES.WARNING);
      this.submit = false;
      return;
    }

    let estadoVacanteAux = ELEMENT_DATA.find(x => x.datos == this.f.situacionActualVacante.value);

    const newVacantes: Vacantes = {
      id: this.f.id.value ? this.f.id.value : undefined,
      // idConvocatoria: this.f.idConvocatoria.value,
      idConvocatoria: this.idConvocatoria.value,
      idUsuarioRegistra: this.user.id,
      /* codigoDespacho: this.f.CodDespacho.value,
      despacho: this.f.despacho.value, */
      codigoDespacho: this.despachoSeleccionado.codigoDespacho,
      despacho: this.despachoSeleccionado.despacho,
      numOrdenDespacho: Number(this.f.numOrdenDespacho.value),
      distrito: this.f.distrito.value,
      idMunicipio: this.f.idMunicipio.value,
      vacanteFuncionario: this.f.vacanteFuncionario.value,
      cedulaFuncionario: this.f.cedulaFuncionario.value,
      fechaVacante: this.f.fechaVacante.value ? this.f.fechaVacante.value : null,
      situacionActualVacante: this.f.situacionActualVacante.value,
      observaciones: this.f.observaciones.value ? this.f.observaciones.value : null,
      estadoVacante: estadoVacanteAux.id,
      idConvocatoriaPerfil: this.f.perfilCargo.value,
      tipoVacante: this.f.tipoVacante.value
    };

    this.alertService.loading();
    const lst: Observable<any>[] = [];
    const nVacantes = Number(this.f.cantidadVacantes.value);

    if (!this.f.id.value) {
      for (let i = 0; i < nVacantes; i++) {
        lst.push(this.convocatoryServices.saveVacante(newVacantes));
      }
      forkJoin(lst).subscribe({
        next: (res: any) => {
          // this.loadDataByConvocatoria({ value: this.f.idConvocatoria.value });
          this.loadDataByConvocatoria({ value: this.idConvocatoria.value });
          this.loadData().then(() => {
            this.formV.resetForm();
            this.showCantidadVacantes = true;
            this.idConvocatoria.setValue(this.dataConvocatory.id);
            this.idConvocatoria.updateValueAndValidity();
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
              .finally(() => this.submit = false);
          });
        }
      });
    } else {
      this.convocatoryServices.saveVacante(newVacantes).toPromise()
        .then(ok => {
          this.loadDataByConvocatoria({ value: this.idConvocatoria.value });
          this.loadData().then(() => {
            this.formV.resetForm();
            this.showCantidadVacantes = true;
            this.idConvocatoria.setValue(this.dataConvocatory.id);
            this.idConvocatoria.updateValueAndValidity();
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
              .finally(() => this.submit = false);
          });
        }).catch(e => {
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
            .finally(() => this.submit = false);
        });
    }

  }

  /*public publicar(element: Vacantes) {
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    //const VacanteAux = this.lstVacantes.find((x: any) => x.id === element.estadoVacante);
    if (element.estadoVacante != 1) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }

    this.alertService.comfirmation(this.ct.CONFIRMAR_PUBLICACION, TYPES.INFO)
      .then(ok => {
        if(ok.value){
          element.estadoVacante= 2;
          this.convocatoryServices.saveModificarEstadoVacantePorId(element).toPromise()
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.VACANTE_PUBLICADA_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
        }
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }*/

  public delete(element: Vacantes) {
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
          this.deleteIsSelected(element.id);
          this.convocatoryServices.deleteVacante(element)
            .subscribe(ok2 => {
              this.loadDataByConvocatoria({ value: this.idConvocatoria.value });
              this.loadData().then(() => {
                this.formV.resetForm();
                this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES)
                  .finally(() => this.submit = false);
              });
              /* this.loadData()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                }); */
            }, err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      });
  }

  public getInfoDespacho() {
    if (this.f.CodDespacho.value) {
      this.alertService.loading();
      this.convocatoryServices.getDespachoByCodigo(this.f.CodDespacho.value).toPromise()
        .then((record: any) => {
          const obj = record.datos;
          this.f.despacho.setValue(obj.despacho);
          this.f.despacho.updateValueAndValidity();
          this.alertService.close();

        })
        .catch(err => {
          this.alertService.message(this.ct.MSG_COD_DESPACHO_NO_EXISTE, TYPES.WARNING)
            .finally(() => this.submit = false);
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
    this.dataSource.data = [];
    /* this.idEmpresa.setValue('');
    this.idEmpresa.updateValueAndValidity(); */
    this.despachoSeleccionado = undefined;
    this.showCantidadVacantes = true;
  }

  public async buscarDespacho() {
    if (this.lstDespachos.length === 0 || !this.lstDespachos) {
      this.lstDespachos = (await this.convocatoryServices.getTodosDespachos().toPromise() as any).datos as Despachos[]; // Consulta los despachos existentes
    }

    this.dataSourceDialog.data = this.lstDespachos;
    this.dialogRefInfo = this.dialogService.open(this.dialogInfo, {
      maxWidth: '90%',
      height: '70%',
    });
    this.dialogRefInfo.addPanelClass(['col-xs-12', 'col-sm-12', 'col-md-8']);
  }

  public closeDialogInfo() {
    this.despachoSeleccionado = undefined;
    this.dataSourceDialog.data = [];
    this.dataSourceDialog.filter = '';
    this.dialogRefInfo.close();
  }

  public selectDespacho(element: Despachos) {
    this.despachoSeleccionado = element;
    const nDespacho = [
      this.despachoSeleccionado.codigoDespacho,
      this.despachoSeleccionado.despacho
    ].join(' ');
    this.f.despacho.setValue(nDespacho);
    this.dataSourceDialog.data = [];
    this.dataSourceDialog.filter = '';
    this.dialogRefInfo.close();
  }

}

export class LstCargoModel {
  id: string;
  cargo: string;
}
