import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked, ElementRef } from '@angular/core';
import { MatAccordion, MatTableDataSource, MatPaginator, MatSort, Sort, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm, AbstractControl } from '@angular/forms';
import { configMsg, TipoExperienciaPerfil, stateConvocatoria } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { administracionPerfilService } from '@app/core/servicios/administracion-perfil-service';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { startWith, map, distinctUntilChanged } from 'rxjs/operators';
import { TipoAdicional } from '@app/compartido/modelos/tipo-adicional';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { PerfilService } from '@app/core/servicios/perfil.service';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { Perfil } from '@app/compartido/modelos/perfil';
import { PerfilEquivalencia } from '@app/compartido/modelos/perfil-equivalencia';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { PerfilTitulo } from '@app/compartido/modelos/perfil-titulo';
import { TypeConvocatory } from '@app/compartido/modelos/type-convocatory';
import { TypeSede } from '@app/compartido/modelos/type-sede';
import { CargoHumano } from '@app/compartido/modelos/cargo-humano';
import { Cargo } from '@app/compartido/modelos/cargo';
import { DialogSelectCargosComponent } from '@app/compartido/componentes/dialog-select-cargos/dialog-select-cargos.component';
import { TipoCompetencia } from '@app/compartido/modelos/tipo-competencia';
import { GradoCargo } from '@app/compartido/modelos/grado-cargo';
import { PerfilExperiencia } from '@app/compartido/modelos/perfil-experiencia';
import { TituloObtenido } from '@app/compartido/modelos/titulo-obtenido';
import { Constants as C, Constants } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { ActivatedRoute } from '@angular/router';
import { ConvocatoriaPerfil } from '@app/compartido/modelos/convocatoria-perfil-model';
import { User } from '@app/compartido/modelos/user';
import { TypePlace } from '@app/compartido/modelos/type-place';
import { TipoFuncion } from '@app/compartido/modelos/tipo-funcion';
import { TipoGrupo } from '@app/compartido/modelos/tipo-grupo';
import { TipoDependenciaHija } from '@app/compartido/modelos/tipo-dependencia-hija';
import { DataDialogCargos } from '@app/compartido/modelos/data-dialog-cargos';
import { TipoCargo } from '@app/compartido/modelos/tipo-cargo';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { VariableAppModel } from '@app/compartido/modelos/variable-app-model';
import { ReportesService } from '@app/core/servicios/reportes.service';
import { RptGeneralCargosRequisitosModel } from '@app/compartido/modelos/reportes/rpt-general-cargos-requisitos-model';

@Component({
  selector: 'app-perfil-admin',
  templateUrl: './perfil-admin.component.html',
  styleUrls: ['./perfil-admin.component.scss']
})
export class PerfilAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  //#region Carga las listas desde el API
  public lstAllProfiles: Perfil[] = [];
  public lstProfileTitleByProfile: PerfilTitulo[] = [];
  public lstProfileEquivalenciaByProfile: PerfilEquivalencia[] = [];
  public lstProfileExperienceByProfile: PerfilExperiencia[] = [];
  public lstCargos: Cargo[] = [];
  public lstCargosView: Cargo[] = [];
  public lstCargosHum: CargoHumano[] = [];
  public lstCargosHumView: CargoHumano[] = [];
  public lstGrados: GradoCargo[] = [];
  public lstGradosPC: GradoCargo[] = [];
  public lstTotalGroups: TipoGrupo[] = [];
  public lstGroups: TipoGrupo[] = [];
  public lstSubGroups: TipoGrupo[] = [];
  public lstFunctions: TipoFuncion[] = [];
  public lstTipoCompetencias: TipoCompetencia[] = [];
  public lstTitles: TituloObtenido[] = [];
  public lstTipoAdiconal: TipoAdicional[] = [];
  public lstTypeStudy: TipoAdicional[] = [];
  public lstTipoDependenciaHijas: TipoDependenciaHija[] = [];
  public lstTipoDependenciaHijasAll: TipoDependenciaHija[] = [];

  public lstTitlesTemp: PerfilTitulo[] = [];
  public lstExperiences1: PerfilExperiencia[] = [];
  public lstExperiences2: PerfilExperiencia[] = [];
  public lstExperiences3: PerfilExperiencia[] = [];
  public lstActiveProfiles: Perfil[] = [];
  public lstTitlesTabProfile: any[] = [];
  public lstEquivalenciasTemp: PerfilEquivalencia[] = [];
  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstConvocatoriesPerfil: ConvocatoriaPerfil[] = [];
  public lstTipoCargo: TipoCargo[] = [];
  public lstTipoLugar: TypePlace[] = [];

  public filteredTitles: Observable<any[]>;
  public filteredCargosPC: Observable<any[]>;
  public filteredCargos: Observable<any[]>;
  public filteredTipoDependencia: Observable<any[]>;
  public dataConvocatory: Convocatoria;

  public TipoExperienciaPerfil = TipoExperienciaPerfil;
  private user: User = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public elementCurrentPC: ConvocatoriaPerfil = null;
  public vCargos: any;
  public submit = false;
  public showGroups = false;
  public tipoCargo = 0;

  public isPagePC = false;//es la variable para saber viene de perfil-convocatoria
  public showFormPC = false;
  public showAccordeon = false;
  public title = 'ttl.crearPerfil';
  private dataTemp = {
    idConvocatoria: null,
    convocatoriaSeleccionada: null
  };

  private subscribeAnioExperienciaEx: Subscription;
  private subscribeControlMesEx: Subscription;
  private subscribeAnioExperienciaRela: Subscription;
  private subscribeControlMesRela: Subscription;
  private subscribeAnioExperienciaInt: Subscription;
  private subscribeControlMesInt: Subscription;

  public form: FormGroup;
  public displayedColumnsTable: string[] = ['ID', 'codigoCargo', 'codigoCargoCarrera', 'grado', 'cargo', 'lugar', 'dependenciaLugar', 'options'];
  public dataSource = new MatTableDataSource<any>([]);

  public displayedColumnsTitle: string[] = ['titulo', 'options'];
  public dataSourceTitle = new MatTableDataSource<any>([]);

  public displayedColumnsTablePC: string[] = ['codigoCargo', 'codigoCargoCarrera', 'grado', 'cargo', 'convocatoria', 'lugar', 'dependenciaLugar', 'options'];
  public dataSourcePC = new MatTableDataSource<any>([]);

  public displayedColumnsExperience: string[] = ['area', 'anios', 'options'];
  public dataSourceExperience1 = new MatTableDataSource<any>([]);
  public dataSourceExperience2 = new MatTableDataSource<any>([]);
  public dataSourceExperience3 = new MatTableDataSource<any>([]);

  public displayedColumnsEquivalencia: string[] = ['tipoAdicionalNombre', 'anio', 'options'];
  public dataSourceEquivalencia = new MatTableDataSource<any>([]);

  public anioEquivalencia: FormControl;
  public idTipoEstudioEquivalencia: FormControl;

  public areaExperienciaRelacionada: FormControl;
  public anioExperienciaRel: FormControl;
  public mesExperienciaRel: FormControl;

  public areaExperienciaInterna: FormControl;
  public anioExperienciaInt: FormControl;
  public mesExperienciaInt: FormControl;

  public areaExperienciaExterna: FormControl;
  public anioExperienciaEx: FormControl;
  public mesExperienciaEx: FormControl;

  public idTipoTituloAcademico: FormControl;

  // variables para empresa
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];

  public varModificarConvSuperAdmin: VariableAppModel;
  //#endregion

  //#region viewChilds
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('sortProfile', { static: true }) sortProfile: MatSort;
  @ViewChild('accordionCargo', { static: false }) panelCargo: MatAccordion;
  @ViewChild('accordion', { static: false }) panels: MatAccordion;
  @ViewChild('profilesPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild('titlesPaginator', { static: true }) titlePaginator: MatPaginator;
  @ViewChild('exp1Paginator', { static: true }) exp1Paginator: MatPaginator;
  @ViewChild('exp2Paginator', { static: true }) exp2Paginator: MatPaginator;
  @ViewChild('exp3Paginator', { static: true }) exp3Paginator: MatPaginator;
  @ViewChild('equivalenciaPaginator', { static: true }) equivalenciaPaginator: MatPaginator;

  @ViewChild('divFormPerfil', { static: true }) divFormPerfil: ElementRef;
  @ViewChild('divTablaPerfil', { static: true }) divTablaPerfil: ElementRef;
  @ViewChild('divTablaConvocatoriaPerfil', { static: true }) divTablaConvocatoriaPerfil: ElementRef;
  @ViewChild('divExperienciaRelacionada', { static: true }) divExperienciaRelacionada: ElementRef;
  @ViewChild('divExperienciaInterna', { static: true }) divExperienciaInterna: ElementRef;
  @ViewChild('idTipoTituloAcademicoView', { static: true }) idTipoTituloAcademicoView: ElementRef;
  @ViewChild('divExperienciaExternaView', { static: true }) divExperienciaExternaView: ElementRef;


  @ViewChild('paginatorPC', { static: true }) paginatorPC: MatPaginator;
  @ViewChild('sortPC', { static: true }) sortPC: MatSort;
  //#endregion

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private commonService: CommonService,
    private cs: ConvocatoriaService,
    private acs: AdministracionConvocatoriaService,
    private adminPerfilService: administracionPerfilService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private empresaService: EmpresaService,
    private reporteService: ReportesService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  async ngOnInit() {

    // paginador para perfiles
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sortProfile;

    this.route.data.subscribe(async v => {

      // si la vista viene de convocatoria perfil
      if (v.perfilConvocatoria) {
        // cambiamos el titulo de la vista
        this.title = 'lbl.asignarPerfilConvocatoria';

        // variables para mostrar u ocultar secciones de la vista
        this.isPagePC = true;
        this.showFormPC = this.isPagePC;

        // ocultamos las secciones
        this.divFormPerfil.nativeElement.hidden = true;
        this.divTablaPerfil.nativeElement.hidden = true;

        // cargamos los campos necesarios
        this.loadPerfilConvocatoria();
        this.loadTitlesTab().then(() => {
          this.showAccordeon = false;
        });
      } else {
        this.divTablaConvocatoriaPerfil.nativeElement.hidden = true;
        this.loadPerfilAdmin();
        this.showAccordeon = true;
      }
      this.varModificarConvSuperAdmin = (await this.commonService.getMessageByName(configMsg.MODIFICAR_CONVOCATORIA_SUPERADMIN).toPromise() as any).datos as VariableAppModel;
    });
  }

  get f() {
    return this.form.controls;
  }

  public async loadUserData() {
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      if (!Constants.validateList(this.lstCompanies)) {
        this.lstCompanies = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
      }
    } else {
      this.showSelectCompany = false;
      this.f.idEmpresa.setValue(this.user.idEmpresa);
      this.f.idEmpresa.setValidators([]);
      this.f.idEmpresa.updateValueAndValidity();
    }
  }

  public async loadVarCargos() {
    /* Carga la variable para saber que Cargos va a traer */
    this.vCargos = (await this.commonService.getMessageByName(configMsg.OBTENER_CARGOS_HUMANO).toPromise() as any).datos;
    this.tipoCargo = Number(this.vCargos.valor);
  }

  private async loadCargos() {
    if (this.tipoCargo === 1) {
      this.lstCargosHum = !Constants.validateList(this.lstCargosHum) ? (await this.perfilService.getCargosHumano().toPromise() as any).datos : this.lstCargosHum;
    } else {
      // this.lstCargos = !Constants.validateList(this.lstCargos) ? (await this.perfilService.getCargosTodos().toPromise() as any).datos : this.lstCargos;
      // cargar los cargo locales por empresa o todos
      this.lstCargos = [];
      if (this.f.idEmpresa.value) {
        this.lstCargos = ((await this.perfilService.getCargosTodos(this.f.idEmpresa.value).toPromise() as any).datos) as Cargo[];
      } else {
        this.lstCargos = ((await this.perfilService.getCargosTodos().toPromise() as any).datos) as Cargo[];
      }
    }
  }

  private async loadPerfilConvocatoria() {
    this.alertService.loading();
    this.initForm();
    this.loadFormPC();
    this.loadDataPC()
      .catch(error => {
        console.log('Error', error);
      })
      .finally(() => {
        this.alertService.close();
      });
  }

  private initPaginatorPC() {
    this.dataSourcePC.paginator = this.paginatorPC;
    this.dataSourcePC.sort = this.sortPC;

    this.dataSourcePC.filterPredicate = (data: ConvocatoriaPerfil, filter: string): boolean => {
      const dataCompare = [
        this.tipoCargo == 1 ? data.perfil.cargoHumanoModel.codCargo : data.perfil.cargoModel.codAlterno,
        this.tipoCargo == 1 ? data.perfil.cargoHumanoModel.cargo : data.perfil.cargoModel.cargo,
        data.perfil.idGradoCargo, data.convocatoria.nombreConvocatoria, data.lugar];
      if (data.perfil.tipoLugar) {
        dataCompare.push(this.translateField(data.perfil.tipoLugar, 'lugar', this.lang));
      }
      if (data.perfil.dependenciaHija) {
        dataCompare.push(this.translateField(data.perfil.dependenciaHija, 'nombre', this.lang));
      }
      return C.filterTable(dataCompare, filter);
    };
  }

  private async loadDataPC() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    // carga la lista de tipo cargo y tipo lugar
    this.lstTipoCargo = <TipoCargo[]>(<any>await this.acs.getTipoCargo().toPromise()).datos;
    this.lstTipoLugar = <TypePlace[]>(<any>await this.acs.getTipoLugar().toPromise()).datos;

    // carga las convocatorias y filtra las activas y publicadas
    this.lstConvocatoriesAll = [];
    if (this.f.idEmpresa.value) {
      this.lstConvocatoriesAll = ((await this.cs.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos) as Convocatoria[];
    } else {
      this.lstConvocatoriesAll = ((await this.cs.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    }

    // filtrar las convocatorias activas
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

    // consulta los cargos segun la variable de configuracion
    await this.loadCargos();

    // consulta todos los perfiles
    await this.loadPerfiles();

    // carga las dependencias hijas
    await this.loadDependenciasHijas();

  }

  private loadPerfilAdmin() {
    this.alertService.loading();
    this.loadTitlesTab();
    this.loadForm();
    this.loadList()
      .then(r => {
        this.loadData()
          .catch(error => {
            console.log('Error', error);
          })
          .finally(() => {
            this.alertService.close();
          });
      });
  }

  public sortData(sort: Sort) {
    const data = this.dataSource.data;
    let sortedData: any;
    if (!sort.active || sort.direction === '') {
      sortedData = data;
      return;
    }

    sortedData = data.sort((a: Perfil, b: Perfil) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'codigoCargo': return this.compare(a.codigoCargo, b.codigoCargo, isAsc);
        case 'codigoCargoCarrera': return this.compare(a.codigoAlterno, b.codigoAlterno, isAsc);
        case 'grado': return this.compare(a.grado, b.grado, isAsc);
        case 'cargo': return this.compare(a.cargo, b.cargo, isAsc);
        case 'lugar': return this.compare(a.tipoLugar.lugar, b.tipoLugar.lugar, isAsc);
        case 'dependenciaLugar': return this.compare(a.dependenciaHija ? a.dependenciaHija.nombre : '', b.dependenciaHija ? b.dependenciaHija.nombre : '', isAsc);
        default: return 0;
      }
    });
  }

  private initFilterTitles() {
    this.filteredTitles = this.idTipoTituloAcademico.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value != null ? value.titulo : ''),
        map(titulo => titulo ? this._filterTitle(titulo) : this.lstTitles.slice())
      );

    this.dataSourceTitle.filterPredicate = (data: TituloObtenido, filter: string): boolean => {
      const dataCompare = [data.titulo];
      return C.filterTable(dataCompare, filter);
    };
  }

  private initFilterCargosPC() {
    this.filteredCargosPC = this.f.idCargo.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value != null ? this.tipoCargo === 1 ? value.cargo : (this.translateField(value, 'cargo', this.lang)) : ''),
        map(cargo => cargo ? this._filterCargosPC(cargo) : (this.tipoCargo === 1 ? this.lstCargosHumView.slice() : this.lstCargosView.slice()))
      );
  }

  private initFilterCargos() {
    this.filteredCargos = this.f.codigoCargo.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value != null ? this.tipoCargo === 1 ? value.cargo : (this.translateField(value, 'cargo', this.lang)) : ''),
        map(cargo => cargo ? this._filterCargosPC(cargo) : (this.tipoCargo === 1 ? this.lstCargosHumView.slice() : this.lstCargosView.slice()))
      );
  }

  private _filterTitle(value: any): any[] {
    if (!value || value === '') {
      return this.lstTitles;
    }
    const filterValue = value.toLowerCase();
    return this.lstTitles.filter(e => e.titulo.toLowerCase().includes(filterValue));
  }

  private _filterCargosPC(value: any): any[] {
    if (!value || value === '') {
      return this.tipoCargo === 1 ? this.lstCargosHumView : this.lstCargosView;
    }
    const filterValue = value.toLowerCase();
    if (this.tipoCargo === 1) {
      return this.lstCargosHumView.filter(e => (e.codCargo + ' - ' + e.cargo).toLowerCase().includes(filterValue));
    } else {
      return this.lstCargosView.filter(e => (e.codAlterno + ' - ' + this.translateField(e, 'cargo', this.lang)).toLowerCase().includes(filterValue));
    }

  }

  public displayTitle(pTitle: any): string {
    return pTitle && pTitle.titulo ? pTitle.titulo : '';
  }

  public displayCargosPC(pCargo: any): string {
    // if (this.tipoCargo == 1) {//no se puede llamar esa instancia porque este metodo esta siendo llamado desde una callback
    //   const cargo: CargoHumano = pCargo;
    //   const field = cargo ? cargo.codCargo : '';
    //   // return cargo && cargo.cargo ? cargo.codCargo + ' - ' + cargo.cargo : '';
    //   return field;
    // } else {
    //   const cargo: Cargo = pCargo;
    //   const field = cargo ? cargo.codAlterno : '';
    //   // const field = cargo ? cargo.codAlterno + ' - ' + BaseController.translateField(pCargo, 'cargo', this.lang) : '';
    //   return field ? field : '';
    // }

    const cargoHumano: CargoHumano = pCargo;
    let field = cargoHumano ? cargoHumano.codCargo : '';
    if (!field || field === '') {
      const cargo: Cargo = pCargo;
      field = cargo ? cargo.codAlterno : '';
    }
    return field;

  }

  public displayCargos(pCargo: any): string {
    const cargoHumano: CargoHumano = pCargo;
    let field = cargoHumano ? cargoHumano.codCargo : '';
    if (!field || field === '') {
      const cargo: Cargo = pCargo;
      field = cargo ? cargo.codAlterno : '';
    }
    return field;
  }

  private initFilterTipoDependencia() {
    this.filteredTipoDependencia = this.f.idTipoDependenciaHija.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value != null ? (this.translateField(value, 'nombre', this.lang)) : ''),
        map(tipoDependencia => tipoDependencia ? this._filterTipoDependencia(tipoDependencia) : this.lstTipoDependenciaHijas.slice())
      );
  }

  private _filterTipoDependencia(value: any): any[] {
    if (!value || value === '') {
      return this.lstTipoDependenciaHijas;
    }
    const filterValue = value.toLowerCase();
    return this.lstTipoDependenciaHijas.filter(e => (this.translateField(e, 'nombre', this.lang)).toLowerCase().includes(filterValue));
  }

  public displayTipoDependencia(pTipoDependencia: any): string {
    const tipoDependencia: TipoDependenciaHija = pTipoDependencia;
    return tipoDependencia && tipoDependencia.nombre ? tipoDependencia.nombre : '';
  }

  public showLabelCargo(item: any) {
    if (this.tipoCargo === 1) {
      const cargo: CargoHumano = item;
      return cargo.codCargo + ' - ' + cargo.cargo;
    } else {
      const cargo: Cargo = item;
      return cargo.codAlterno + ' - ' + this.translateField(cargo, 'cargo', this.lang);
    }
  }

  public onBlurCargosPc(option) {
    setTimeout(() => {
      if (!Constants.validateData(this.f.idCargo.value)) {
        return;
      }
      let clean = false;
      if (this.tipoCargo === 1) {
        const cargo: CargoHumano = <CargoHumano>this.f.idCargo.value;
        if (!cargo.codCargo) {
          clean = true;
        }
      } else {
        const cargo: Cargo = <Cargo>this.f.idCargo.value;
        if (!cargo.id) {
          clean = true;
        }
      }

      if (clean) {
        this.cleanFieldsConvocatoriaCargo(false);
        this.f.idCargo.setValue('');
      }
    }, 500);
  }

  public onBlurCargos(option) {
    setTimeout(() => {
      if (!Constants.validateData(this.f.codigoCargo.value)) {
        return;
      }
      let clean = false;
      if (this.tipoCargo === 1) {
        const cargo: CargoHumano = <CargoHumano>this.f.codigoCargo.value;
        if (!cargo.codCargo) {
          clean = true;
        }
      } else {
        const cargo: Cargo = <Cargo>this.f.codigoCargo.value;
        if (!cargo.id) {
          clean = true;
        }
      }
      if (clean) {
        this.f.codigoCargo.setValue('');
        this.f.cargo.setValue('');
        this.f.nivelJerarquico.setValue('');
      }
    }, 500);
  }

  public async loadTitlesTab() {
    const titlesTab = <any>(<any>await this.commonService.getMessageByName(configMsg.TITULOSTABPERFIL).toPromise()).datos;
    const titlesTabProfile = JSON.parse(titlesTab.valor);
    this.lstTitlesTabProfile = titlesTabProfile;
    this.lstTitlesTabProfile.sort((a, b) => a.orden - b.orden);
    // this.showTitlesTab = true;
  }

  public loadFormPC() {
    // crear el form si es null
    if (this.form == null) {
      this.form = this.fb.group({
        init: new FormControl({ value: '', disabled: true }),
      });
    }
    this.form.addControl('idConvocatoria', this.fb.control('', [Validators.required]));
    // this.form.addControl('lugar', this.fb.control('', [Validators.required]));
    // this.form.addControl('idCargo', this.fb.control('', [Validators.required]));
    this.form.addControl('idCargo', this.fb.control({ value: '', disabled: true }));
    this.form.addControl('nombreCargo', this.fb.control({ value: '', disabled: true }));
    this.form.addControl('tipoConvocatoria', this.fb.control({ value: '', disabled: true }));
    this.form.addControl('tipoSede', this.fb.control({ value: '', disabled: true }));
    this.form.addControl('gradoPC', this.fb.control({ value: '', disabled: true }));
    this.form.addControl('numeroConvocatoria', this.fb.control({ value: '', disabled: true }));
    this.form.addControl('fechaAcuerdoConvocatoria', this.fb.control({ value: '', disabled: true }));

    this.loadVarCargos().then(() => {
      this.initFilterCargosPC();
    });
  }

  public setFieldsCargo(event) {
    const option = event.source;
    if (this.tipoCargo === 1) {
      const cargoSelected: CargoHumano = option.value;
      const cargo = this.lstCargosHum.find(e => e.codCargo === cargoSelected.codCargo);
      if (cargo) {
        this.f.cargo.setValue(cargo.cargo);
        this.f.nivelJerarquico.setValue(cargo.cargoNivel);
      }
    } else {
      const cargoSelected: Cargo = option.value;
      const cargo = this.lstCargos.find(e => e.id === cargoSelected.id);
      if (cargo) {
        this.f.cargo.setValue(cargo.cargo);
        this.f.nivelJerarquico.setValue(cargo.nivelJerarquico);
      }
    }
  }

  public loadForm() {

    // si el formulario no existe lo crea
    if (this.form == null) {
      this.initForm();
    }

    // agregar las validaciones a los controles
    this.loadValidatorsForm();

    // agregar los listeners a los controles

    // this.f.codigoCargo.valueChanges.subscribe(
    //   value => {
    //     if (this.tipoCargo === 1) {
    //       const cargo = this.lstCargosHum.find(e => e.codCargo === value);
    //       if (cargo) {
    //         this.f.cargo.setValue(cargo.cargo);
    //         this.f.nivelJerarquico.setValue(cargo.cargoNivel);
    //       }
    //     } else {
    //       const cargo = this.lstCargos.find(e => e.id === value);
    //       if (cargo) {
    //         this.f.cargo.setValue(cargo.cargo);
    //         this.f.nivelJerarquico.setValue(cargo.nivelJerarquico);
    //       }
    //     }
    //   }
    // );

    // this.f.idTipoTituloAcademico.valueChanges.subscribe(
    //   value => {   
    //   }
    // );
    this.f.esGrupo.valueChanges.subscribe(
      value => {

        // bandera para mostrar los  grupos y funcion
        this.showGroups = value;

        // si es perfil convocatoria no debe dejar habilitar
        if (this.isPagePC) {
          return;
        }

        if (value) {
          this.f.idTipoGrupo.enable();
          this.f.idTipoGrupo.setValidators([Validators.required]);

          this.f.idTipoSubGrupo.enable();
          this.f.idTipoSubGrupo.setValidators([Validators.required]);

          this.f.idTipoFuncion.enable();
          this.f.idTipoFuncion.setValidators([Validators.required]);
        } else {
          this.f.idTipoGrupo.disable();
          this.f.idTipoGrupo.setValue('');

          this.f.idTipoSubGrupo.disable();
          this.f.idTipoSubGrupo.setValue('');

          this.f.idTipoFuncion.disable();
          this.f.idTipoFuncion.setValue('');
        }

        this.f.idTipoGrupo.updateValueAndValidity();
        this.f.idTipoSubGrupo.updateValueAndValidity();
        this.f.idTipoFuncion.updateValueAndValidity();
      }
    );
    this.f.esGrupo.setValue(0);

    this.f.otroTipoEstudio.valueChanges.subscribe(
      value => {
        if (value) {
          this.f.nombreTipoEstudioOtro.enable();
          this.f.nombreTipoEstudioOtro.setValidators([Validators.required]);

          this.f.idTipoEstudioAdicional.disable();
          this.f.idTipoEstudioAdicional.setValue('');
          this.f.idTipoEstudioAdicional.clearValidators();

          this.f.nombreEstudioAdicional.disable();
          this.f.nombreEstudioAdicional.setValue('');
          this.f.nombreEstudioAdicional.clearValidators();

        } else {
          this.f.nombreTipoEstudioOtro.disable();
          this.f.nombreTipoEstudioOtro.setValue('');
          this.f.nombreTipoEstudioOtro.clearValidators();

          this.f.idTipoEstudioAdicional.enable();
          this.f.nombreEstudioAdicional.enable();
        }
        this.f.nombreTipoEstudioOtro.updateValueAndValidity();
        this.f.nombreEstudioAdicional.updateValueAndValidity();
        this.f.idTipoEstudioAdicional.updateValueAndValidity();
      }
    );
    this.f.otroTipoEstudio.setValue(false);

    this.f.tieneExperienciaRelacionada.valueChanges.subscribe(
      value => {
        if (value) {
          this.divExperienciaRelacionada.nativeElement.hidden = false;
        } else {
          this.divExperienciaRelacionada.nativeElement.hidden = true;
        }
        this.touchedFields(false, [this.areaExperienciaRelacionada, this.anioExperienciaRel]);
        // this.showExpRel = value;
      }
    );
    this.f.tieneExperienciaRelacionada.setValue(false);

    this.f.tieneTraslado.valueChanges.subscribe(
      value => {
        if (value) {
          this.divExperienciaInterna.nativeElement.hidden = false;

        } else {
          this.divExperienciaInterna.nativeElement.hidden = true;
        }
        this.touchedFields(false, [this.areaExperienciaInterna, this.anioExperienciaInt]);
      }
    );
    this.f.tieneTraslado.setValue(false);

    this.initFilterCargos();
  }

  private initForm() {
    this.form = this.fb.group(
      {
        /* PRIMERA SECCIÓN */
        id: new FormControl(''),
        codigoCargo: new FormControl(''),
        cargo: new FormControl({ value: '', disabled: true }),
        grado: new FormControl(''),
        nivelJerarquico: new FormControl({ value: '', disabled: true }),
        esGrupo: new FormControl(false),
        idTipoGrupo: new FormControl(''),
        idTipoSubGrupo: new FormControl(''),
        idTipoFuncion: new FormControl(''),
        idTipoLugar: new FormControl(''),
        idTipoDependenciaHija: new FormControl(''),
        idEmpresa: new FormControl('', [Validators.required]),
        idTipoCargo: new FormControl(''),
        codigoAlterno: new FormControl(''),

        /* SEGUNDA SECCIÓN */
        mision: new FormControl(''),
        responsabilidades: new FormControl(''),
        idTipoCompetencia: new FormControl(),

        /* TERCERA SECCIÓN */
        idTipoEstudioAdicional: new FormControl(''),
        nombreEstudioAdicional: new FormControl(''),
        otroTipoEstudio: new FormControl(false),
        nombreTipoEstudioOtro: new FormControl(''),
        conocimientos: new FormControl(''),

        /* CUARTA SECCION */
        tieneExperienciaRelacionada: new FormControl(false),
        tieneTraslado: new FormControl(false),

      }
    );

    // titulo academico
    this.idTipoTituloAcademico = new FormControl('');

    // equivalencia
    this.idTipoEstudioEquivalencia = new FormControl('');
    this.anioEquivalencia = new FormControl('');

    // exp externa
    this.areaExperienciaExterna = new FormControl('');
    this.anioExperienciaEx = new FormControl('');
    this.mesExperienciaEx = new FormControl('');
    this.subscribeOrUnsuscribe(TipoExperienciaPerfil.Externa, true);
    // this.subscribeAnioExperienciaEx = this.setValueChangesExp(this.mesExperienciaEx, this.anioExperienciaEx);
    // this.subscribeControlMes = this.setValueChangesExp(this.mesExperienciaEx, this.anioExperienciaEx);

    // this.anioExperienciaEx.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
    //   this.validateAnioMesExperiencia(this.anioExperienciaEx, this.mesExperienciaEx);
    // });

    // this.mesExperienciaEx.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
    //   this.validateAnioMesExperiencia(this.anioExperienciaEx, this.mesExperienciaEx);
    // });

    // exp relacionada
    this.areaExperienciaRelacionada = new FormControl('');
    this.anioExperienciaRel = new FormControl('');
    this.mesExperienciaRel = new FormControl('');
    this.subscribeOrUnsuscribe(TipoExperienciaPerfil.Relacionada, true);
    // this.anioExperienciaRel.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
    //   this.validateAnioMesExperiencia(this.anioExperienciaRel, this.mesExperienciaRel, this.mesExperienciaRel);
    // });
    // this.mesExperienciaRel.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
    //   this.validateAnioMesExperiencia(this.anioExperienciaRel, this.mesExperienciaRel, this.mesExperienciaRel);
    // });

    // exp interna
    this.areaExperienciaInterna = new FormControl('');
    this.anioExperienciaInt = new FormControl('');
    this.mesExperienciaInt = new FormControl('');
    this.subscribeOrUnsuscribe(TipoExperienciaPerfil.Interna, true);
    // this.anioExperienciaInt.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
    //   this.validateAnioMesExperiencia(this.anioExperienciaInt, this.mesExperienciaInt, this.mesExperienciaInt);
    // });
    // this.mesExperienciaInt.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
    //   this.validateAnioMesExperiencia(this.anioExperienciaInt, this.mesExperienciaInt, this.mesExperienciaInt);
    // });

    // carga la informacion de la empresa
    this.loadUserData();
  }

  public setValueChangesExp(control1: FormControl, control2: FormControl, controlMes: FormControl): Subscription {
    const subscribe: Subscription = control1.valueChanges.pipe(distinctUntilChanged()).subscribe(val => {
      this.validateAnioMesExperiencia(control1, control2, controlMes);
    });
    return subscribe;
  }

  public subscribeOrUnsuscribe(exp: number, subscribe: boolean) {
    if (exp === TipoExperienciaPerfil.Externa) {
      if (subscribe) {
        this.subscribeAnioExperienciaEx = this.setValueChangesExp(this.anioExperienciaEx, this.mesExperienciaEx, this.mesExperienciaEx);
        this.subscribeControlMesEx = this.setValueChangesExp(this.mesExperienciaEx, this.anioExperienciaEx, this.mesExperienciaEx);
      } else {
        this.subscribeAnioExperienciaEx.unsubscribe();
        this.subscribeControlMesEx.unsubscribe();
      }
    } else if (exp === TipoExperienciaPerfil.Interna) {
      if (subscribe) {
        this.subscribeAnioExperienciaInt = this.setValueChangesExp(this.anioExperienciaInt, this.mesExperienciaInt, this.mesExperienciaInt);
        this.subscribeControlMesInt = this.setValueChangesExp(this.mesExperienciaInt, this.anioExperienciaInt, this.mesExperienciaInt);
      } else {
        this.subscribeAnioExperienciaInt.unsubscribe();
        this.subscribeControlMesInt.unsubscribe();
      }
    } else if (exp === TipoExperienciaPerfil.Relacionada) {
      if (subscribe) {
        this.subscribeAnioExperienciaRela = this.setValueChangesExp(this.anioExperienciaRel, this.mesExperienciaRel, this.mesExperienciaRel);
        this.subscribeControlMesRela = this.setValueChangesExp(this.mesExperienciaRel, this.anioExperienciaRel, this.mesExperienciaRel);
      } else {
        this.subscribeAnioExperienciaRela.unsubscribe();
        this.subscribeControlMesRela.unsubscribe();
      }
    }

  }

  private validateAnioMesExperiencia(controlAnio: FormControl, controlMes: FormControl, controlMesP: FormControl) {
    if (Constants.validateData(controlAnio.value) == undefined &&
      Constants.validateData(controlMes.value) == undefined) {
      controlAnio.setValidators([Validators.required]);
      controlMes.setValidators([Validators.required]);
    } else if (Constants.validateData(controlAnio.value) != undefined) {
      controlMes.clearValidators();
      controlAnio.setValidators([Validators.required]);
    } else if (Constants.validateData(controlMes.value) != undefined) {
      controlAnio.clearValidators();
      controlMes.setValidators([Validators.required]);
    }
    if (Constants.validateData(controlMesP.value) != undefined && Number(controlMesP.value) > 11) {
      this.alertService.message(this.ct.NUM_MAX_MONTHS, TYPES.WARNING);
      controlMesP.setValue('');
    }
    controlAnio.updateValueAndValidity();
    controlMes.updateValueAndValidity();
    controlMesP.updateValueAndValidity();
  }

  private loadValidatorsForm(required: boolean = true) {

    let validator = [Validators.required];
    if (!required) {
      validator = [];
      // actualizar los campos de experiencia para que no sean requeridos
      this.f.tieneExperienciaRelacionada.setValue(false);
      this.f.tieneTraslado.setValue(false);
    }

    /* PRIMERA SECCIÓN */
    this.f.codigoCargo.setValidators(validator);
    this.f.grado.setValidators(validator);
    this.f.idTipoGrupo.setValidators(validator);
    this.f.idTipoSubGrupo.setValidators(validator);
    this.f.idTipoFuncion.setValidators(validator);
    this.f.idTipoLugar.setValidators(validator);
    this.f.idTipoCargo.setValidators(validator);
    // this.f.idTipoDependenciaHija.setValidators(validator);
    this.f.codigoAlterno.setValidators(validator);

    // actualiza los controles del formulario
    Constants.updateControls(this.form);
  }

  public async loadList() {

    this.loadVarCargos().then(() => {
      this.loadCargos();
    });

    /* Carga la variable de Grados para conocer el valor mínimo y máximo y llenar la lista */
    const vGrados = <any>(<any>await this.commonService.getMessageByName(configMsg.GRADOS_CARGO_PERFIL).toPromise()).datos;
    const valorGrados = JSON.parse(vGrados.valor);
    let i = valorGrados.min;
    while (i <= valorGrados.max) {
      const val = String(i).length === 1 ? '0' + String(i) : String(i);
      const grado: GradoCargo = {
        id: val,
        value: val
      };
      this.lstGrados.push(grado);
      i = i + valorGrados.incremento;
    }

    /* Carga todos los grupos y subgrupos */
    this.lstTotalGroups = (await this.adminPerfilService.getTipoGrupo().toPromise() as any).datos;
    if (this.lstTotalGroups.length > 0) {
      /* Filtra los registros en cada lista: grupos y subgrupos */
      this.lstGroups = this.lstTotalGroups.filter(c => c.esGrupo === 1);
      this.lstSubGroups = this.lstTotalGroups.filter(c => c.esGrupo === 0);
    }

    /* Carga la lista de funciones */
    this.lstFunctions = (await this.adminPerfilService.getTipoFuncion().toPromise() as any).datos;

    /* Carga la lista de competencias */
    this.lstTipoCompetencias = (await this.adminPerfilService.getTipoCompetencia().toPromise() as any).datos;

    /* Carga la lista de títulos académicos */
    this.lstTitles = (await this.commonService.getTitulos().toPromise() as any).datos;
    // traducir la lista, en el case de que sea de busqueda
    this.lstTitles.forEach(x => x.titulo = this.translateField(x, 'titulo', this.lang));

    /* Carga los tipos de estudios adicionales */
    const idCapacitacion = (await this.commonService.getMessageByName(configMsg.ID_PARAMETRO_ADICIONAL_CAPACITACION).toPromise() as any).datos as any;
    this.lstTypeStudy = (await this.perfilService.getTipoAdicionalesPorIdReferencia(idCapacitacion.valor).toPromise() as any).datos;

    // se carga los tipos lugar
    this.lstTipoLugar = <TypePlace[]>(<any>await this.acs.getTipoLugar().toPromise()).datos;

    // carga las dependencias hijas
    await this.loadDependenciasHijas();

    // setear el filtro para titulo academico
    this.initFilterTitles();

    // setear el filtro para las dependencias hija
    this.initFilterTipoDependencia();

    // carga la lista de tipo cargo y tipo lugar
    this.lstTipoCargo = <TipoCargo[]>(<any>await this.acs.getTipoCargo().toPromise()).datos;

  }

  private async loadPerfiles(forceLoad: boolean = false) {
    /* Carga la lista de perfiles por empresa */
    if (!Constants.validateList(this.lstAllProfiles) || forceLoad) {
      // this.lstAllProfiles = ((await this.perfilService.getPerfiles().toPromise() as any).datos) as Perfil[];
      this.lstAllProfiles = [];
      if (this.f.idEmpresa.value) {
        this.lstAllProfiles = ((await this.perfilService.getPerfiles(this.f.idEmpresa.value).toPromise() as any).datos) as Perfil[];
      } else {
        this.lstAllProfiles = ((await this.perfilService.getPerfiles().toPromise() as any).datos) as Perfil[];
      }

      // filtrar los perfiles por cargo y que esten activos
      if (this.lstAllProfiles.length > 0) {
        if (this.tipoCargo === 1) {
          this.lstAllProfiles = this.lstAllProfiles.filter(x => x.idTipoCargoHumano != null && x.activo === 1);
        } else {
          this.lstAllProfiles = this.lstAllProfiles.filter(x => x.idTipoCargo != null && x.activo === 1);
        }

      }
    }
  }

  private async loadDependenciasHijas() {
    /* Carga la lista de dependencia hijas */
    if (!Constants.validateList(this.lstTipoDependenciaHijasAll)) {
      this.lstTipoDependenciaHijasAll = (await this.acs.getTipoDependenciaHija().toPromise() as any).datos;
    }
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    // cargar los perfiles
    await this.loadPerfiles(true);
    // limpiar los perfiles de la tabla
    this.lstActiveProfiles = [];
    this.dataSource.data = this.lstActiveProfiles;

    // buscar el cargo , grado, funcion y competencia de cada perfil
    if (this.lstAllProfiles.length > 0) {

      this.lstAllProfiles.forEach(e => {

        if (e.idTipoCargoHumano) {
          const cargo: CargoHumano = this.lstCargosHum.find(c => e.idTipoCargoHumano === c.codCargo);
          if (cargo) {
            e.codigoCargo = cargo.codCargo;
            e.cargo = cargo.cargo;
            e.nivelJerarquico = cargo.cargoNivel;
          }
        }

        if (e.idTipoCargo) {
          const cargo: Cargo = this.lstCargos.find(c => e.idTipoCargo === c.id);
          if (cargo) {
            e.codigoCargo = cargo.codAlterno;
            e.cargo = cargo.cargo;
            e.nivelJerarquico = cargo.nivelJerarquico;
          }
        }

        const gradoTemp = this.lstGrados.find(c => e.idGradoCargo === c.id);
        e.grado = gradoTemp ? gradoTemp.value : '';

        const funcionTemp = this.lstFunctions.find(c => e.idTipoFuncion === c.id);
        e.funcion = funcionTemp ? this.translateField(funcionTemp, 'funcion', this.lang) : '';

        const competenciaTemp = this.lstTipoCompetencias.find(c => e.idTipoCompetencia === c.id);
        e.tipoCompetencia = competenciaTemp ? competenciaTemp.competencia : '';

        const lugarTemp = this.lstTipoLugar.find(l => l.id === e.idTipoLugar);
        e.tipoLugar = lugarTemp;

        if (e.idTipoDependenciaHija) {
          const dependenciaLugarTemp = this.lstTipoDependenciaHijasAll.find(l => l.id === e.idTipoDependenciaHija);
          e.dependenciaHija = dependenciaLugarTemp;
        }

        this.lstActiveProfiles.push(e);

      });
    }

    // this.lstActiveProfiles.sort((a, b) => new Date(b.fechaModificacion).getTime() - new Date(a.fechaModificacion).getTime());
    this.dataSource.data = this.lstActiveProfiles;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sortProfile;
    this.dataSource.filterPredicate = (data: Perfil, filter: string): boolean => {
      const dataCompare = [data.codigoCargo, data.grado, data.cargo, data.codigoAlterno];
      if (data.tipoLugar) {
        dataCompare.push(this.translateField(data.tipoLugar, 'lugar', this.lang));
      }
      if (data.dependenciaHija) {
        dataCompare.push(this.translateField(data.dependenciaHija, 'nombre', this.lang));
      }
      return Constants.filterTable(dataCompare, filter);
    };
  }

  public async edit(element: Perfil) {
    console.log('ele', element);
    this.alertService.loading();
    this.cleanForm();
    this.f.codigoCargo.disable();
    this.f.grado.disable();
    this.f.codigoCargo.updateValueAndValidity();
    this.f.grado.updateValueAndValidity();

    this.elementCurrent = C.cloneObject(element);

    this.lstProfileTitleByProfile = (await this.perfilService.getPerfilTituloByPerfil({ idPerfil: element.id }).toPromise() as any).datos;
    this.setTitulosPerfil();

    this.lstProfileEquivalenciaByProfile = (await this.perfilService.getPerfilEquivalenciaByPerfil({ idPerfil: element.id }).toPromise() as any).datos;
    this.setEquivalenciasPerfil();

    this.lstProfileExperienceByProfile = (await this.perfilService.getPerfilExperienciaByPerfil({ idPerfil: element.id }).toPromise() as any).datos;
    this.setExperienciasPerfil();

    this.setTipoGrupo(element);

    if (element.tipoEstudioAdicionalOtro) {
      element.otroTipoEstudioAdicional = 1;
      this.f.otroTipoEstudio.setValue(element.otroTipoEstudioAdicional);
    } else {
      this.f.otroTipoEstudio.setValue(0);
    }

    // buscamos el cargo
    let cargoTemp: any;
    let tipoCargoTemp: TipoCargo;
    if (element.idTipoCargoHumano) {
      cargoTemp = this.lstCargosHum.find(x => x.codCargo === element.idTipoCargoHumano);
      tipoCargoTemp = this.lstTipoCargo.find(x => x.codAlterno === cargoTemp.codCargoTipo);
    } else if (element.idTipoCargo) {
      cargoTemp = this.lstCargos.find(x => x.id === element.idTipoCargo);
      tipoCargoTemp = this.lstTipoCargo.find(x => x.id === cargoTemp.idTipoCargo);
    }

    // seteamos el form
    this.form.patchValue({
      id: element.id,
      codigoCargo: cargoTemp,
      cargo: element.cargo,
      grado: element.idGradoCargo,
      nivelJerarquico: element.nivelJerarquico,
      esGrupo: element.esGrupo === 1 ? true : false,
      idTipoGrupo: element.idTipoGrupo,
      idTipoSubGrupo: element.idTipoSubGrupo,
      idTipoFuncion: element.idTipoFuncion,
      idTipoLugar: element.idTipoLugar,
      idEmpresa: element.idEmpresa,
      idTipoCargo: tipoCargoTemp ? tipoCargoTemp.id : '',
      codigoAlterno: element.codigoAlterno,

      /* SEGUNDA SECCIÓN */
      mision: element.mision,
      responsabilidades: element.responsabilidades,
      idTipoCompetencia: element.idTipoCompetencia,

      /* TERCERA SECCIÓN */
      idTipoEstudioAdicional: element.idTipoEstudioAdicional,
      nombreEstudioAdicional: element.nombreEstudioAdicional,
      otroTipoEstudio: element.otroTipoEstudioAdicional,
      nombreTipoEstudioOtro: element.tipoEstudioAdicionalOtro,
      conocimientos: element.conocimientosHabilidades,

    });

    // buscamos la dependencia hija
    // const tipoDependenciaHija: TipoDependenciaHija = <TipoDependenciaHija>(await <any>this.acs.getTipoDependenciaHijaById(element.idTipoDependenciaHija).toPromise()).datos;
    const tipoDependenciaHija: TipoDependenciaHija = this.lstTipoDependenciaHijasAll.find(x => x.id === element.idTipoDependenciaHija);
    if (tipoDependenciaHija) {
      this.cargarTiposDependenciaHijas({ value: tipoDependenciaHija.idLugar });
      this.f.idTipoDependenciaHija.setValue(tipoDependenciaHija);
    }

    // seteamos el cargo al form
    this.f.codigoCargo.setValue(cargoTemp);
    setTimeout(() => {
      this.scrollTop();
    }, 500);

    this.alertService.close();
  }

  public addTitle() {
    this.submit = true;

    // se valida que el campo este lleno
    const controllsTemp: AbstractControl[] = [];
    if (!this.idTipoTituloAcademico.value) {
      controllsTemp.push(this.idTipoTituloAcademico);
    }
    if (controllsTemp.length > 0) {
      this.clearAndSetValidatorRequired(true, controllsTemp);
      this.touchedFields(true, controllsTemp);
      this.submit = false;
      return;
    }


    // if (!this.validFields([this.idTipoTituloAcademico])) {
    //   this.touchedFields(true, [this.idTipoTituloAcademico]);
    //   this.submit = false;
    //   return;
    // }

    if (this.idTipoTituloAcademico.value !== '') {

      const tituloObtenido: TituloObtenido = this.idTipoTituloAcademico.value;
      const find = this.lstTitlesTemp.find(x => this.areEquals(tituloObtenido.id, x.idTipoTituloAcademico));
      if (find) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }

      const titulo: PerfilTitulo = {
        idPerfil: '',
        titulo: this.translateField(tituloObtenido, 'titulo', this.lang),
        idUsuarioModificacion: this.user.id,
        idTipoTituloAcademico: tituloObtenido.id,
      };

      this.lstTitlesTemp.push(titulo);
      this.dataSourceTitle.data = this.lstTitlesTemp;
      this.dataSourceTitle.paginator = this.titlePaginator;

      // limpiar el campos
      this.clearAndSetValidatorRequired(false, [this.idTipoTituloAcademico]);
      this.touchedFields(false, [this.idTipoTituloAcademico]);

      Constants.getFormValidationErrors(this.form);
    }
    this.submit = false;
  }

  public deleteTitle(element: PerfilTitulo) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    const index = this.lstTitlesTemp.indexOf(element);
    this.lstTitlesTemp.splice(index, 1);
    this.dataSourceTitle.data = this.lstTitlesTemp;
    this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);

    this.touchedFields(false, [this.idTipoTituloAcademico]);
    this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);

    if (element.id && !this.isPagePC) {
      this.perfilService.deletePerfilTitulo(element.id)
        .toPromise()
        .catch((error) => this.alertService.showError(error))
        .finally(() => { this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES); })
    } else {
      this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
    }
  }

  public addEquivalencia() {
    this.submit = true;

    if (!this.idTipoEstudioEquivalencia.value || !this.anioEquivalencia.value) {
      this.clearAndSetValidatorRequired(true, [this.idTipoEstudioEquivalencia, this.anioEquivalencia]);
      this.touchedFields(true, [this.idTipoEstudioEquivalencia, this.anioEquivalencia]);
      this.submit = false;
      return;
    }

    if (!this.idTipoEstudioEquivalencia.valid ||
      !this.anioEquivalencia.valid) {
      this.touchedFields(true, [this.idTipoEstudioEquivalencia, this.anioEquivalencia]);
      this.submit = false;
      return;
    }

    if (this.idTipoEstudioEquivalencia.value !== '' && this.anioEquivalencia.value !== '') {
      const equivalencia: PerfilEquivalencia = {
        idPerfil: '',
        idTipoAdicional: this.idTipoEstudioEquivalencia.value,
        idUsuarioModificacion: this.user.id,
        anio: Number(this.anioEquivalencia.value)
      };

      const find = this.lstEquivalenciasTemp.find(x => this.areEquals(x.idTipoAdicional, equivalencia.idTipoAdicional));
      if (find) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }

      equivalencia.tipoAdicionalNombre = this.translateField(this.lstTypeStudy.find(x => x.id == equivalencia.idTipoAdicional), 'tipoAdicional', this.lang);
      this.lstEquivalenciasTemp.push(equivalencia);
      this.dataSourceEquivalencia.data = this.lstEquivalenciasTemp;
      this.dataSourceEquivalencia.paginator = this.equivalenciaPaginator;

      // limpiar los campos de equivalencias
      this.clearAndSetValidatorRequired(false, [this.idTipoEstudioEquivalencia, this.anioEquivalencia]);
      this.touchedFields(false, [this.idTipoEstudioEquivalencia, this.anioEquivalencia]);

    }
    this.submit = false;
  }

  public deleteEquivalencia(element: PerfilEquivalencia) {

    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }
    const index = this.lstEquivalenciasTemp.indexOf(element);
    this.lstEquivalenciasTemp.splice(index, 1);
    this.dataSourceEquivalencia.data = this.lstEquivalenciasTemp;
    this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
  }

  /* Agrega Experiencia a la lista */
  public addExperience(value: any) {
    this.submit = true;

    const profileExperience: PerfilExperiencia = {
      idPerfil: '',
      area: '',
      anios: null,
      meses: null,
      permiteTraslado: 0,
      tipoExperiencia: 0,
      idUsuarioModificacion: this.user.id
    };

    /* Experiencia Externa */
    if (value === TipoExperienciaPerfil.Externa) {

      const controllsTemp: AbstractControl[] = [];
      if (!this.areaExperienciaExterna.value) {
        controllsTemp.push(this.areaExperienciaExterna);
      }
      if (!this.anioExperienciaEx.value && !this.mesExperienciaEx.value) {
        controllsTemp.push(this.anioExperienciaEx);
        controllsTemp.push(this.mesExperienciaEx);
      }
      if (controllsTemp.length > 0) {
        this.clearAndSetValidatorRequired(true, controllsTemp);
        this.touchedFields(true, controllsTemp);
        this.submit = false;
        return;
      }

      // if (!this.validFields([this.areaExperienciaExterna, this.anioExperienciaEx, this.mesExperienciaEx])) {
      //   this.touchedFields(true, [this.areaExperienciaExterna, this.anioExperienciaEx, this.mesExperienciaEx]);
      //   this.submit = false;
      //   return;
      // }

      // if (this.areaExperienciaExterna.value !== '' && this.anioExperienciaEx.value !== '') {
      const vSubStage = this.lstExperiences1.find(
        (x: any) => this.areEquals(x.area, this.areaExperienciaExterna.value)
        // x.area.replace(/\s/g, '').toUpperCase() === this.areaExperienciaExterna.value.replace(/\s/g, '').toUpperCase()
      );
      if (vSubStage) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
      profileExperience.area = this.areaExperienciaExterna.value;
      profileExperience.anios = Number(this.anioExperienciaEx.value);
      profileExperience.meses = Number(this.mesExperienciaEx.value);
      profileExperience.tipoExperiencia = TipoExperienciaPerfil.Externa;
      this.lstExperiences1.push(profileExperience);
      this.dataSourceExperience1.data = this.lstExperiences1;
      this.dataSourceExperience1.paginator = this.exp1Paginator;
      this.dataSourceExperience1.sort = this.sort;

      // truco para que no entre en el valuechanges
      this.subscribeOrUnsuscribe(TipoExperienciaPerfil.Externa, false);
      this.clearAndSetValidatorRequired(false, [this.areaExperienciaExterna, this.anioExperienciaEx, this.mesExperienciaEx]);
      this.touchedFields(false, [this.areaExperienciaExterna, this.anioExperienciaEx, this.mesExperienciaEx], false);
      this.subscribeOrUnsuscribe(TipoExperienciaPerfil.Externa, true);
    }

    /* Experiencia Relacionada */
    else if (value === TipoExperienciaPerfil.Relacionada) {

      const controllsTemp: AbstractControl[] = [];
      if (!this.areaExperienciaRelacionada.value) {
        controllsTemp.push(this.areaExperienciaRelacionada);
      }
      if (!this.anioExperienciaRel.value && !this.mesExperienciaRel.value) {
        controllsTemp.push(this.anioExperienciaRel);
        controllsTemp.push(this.mesExperienciaRel);
      }
      if (controllsTemp.length > 0) {
        this.clearAndSetValidatorRequired(true, controllsTemp);
        this.touchedFields(true, controllsTemp);
        this.submit = false;
        return;
      }

      // if (!this.validFields([this.areaExperienciaRelacionada, this.anioExperienciaRel, this.mesExperienciaRel])) {
      //   this.touchedFields(true, [this.areaExperienciaRelacionada, this.anioExperienciaRel, this.mesExperienciaRel]);
      //   this.submit = false;
      //   return;
      // }

      // if (this.areaExperienciaRelacionada.value !== '' && this.anioExperienciaRel.value !== '') {
      const vSubStage = this.lstExperiences2.find(
        (x: any) => this.areEquals(x.area, this.areaExperienciaRelacionada.value)
        // x.area.replace(/\s/g, '').toUpperCase() === this.areaExperienciaRelacionada.value.replace(/\s/g, '').toUpperCase()
      );
      if (vSubStage) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
      profileExperience.area = this.areaExperienciaRelacionada.value;
      profileExperience.anios = Number(this.anioExperienciaRel.value);
      profileExperience.meses = Number(this.mesExperienciaRel.value);
      profileExperience.tipoExperiencia = TipoExperienciaPerfil.Relacionada;
      this.lstExperiences2.push(profileExperience);
      this.dataSourceExperience2.data = this.lstExperiences2;
      this.dataSourceExperience2.paginator = this.exp2Paginator;
      this.dataSourceExperience2.sort = this.sort;

      //truco para que no entre en el valuechanges
      this.subscribeOrUnsuscribe(TipoExperienciaPerfil.Relacionada, false);
      this.clearAndSetValidatorRequired(false, [this.areaExperienciaRelacionada, this.anioExperienciaRel, this.mesExperienciaRel]);
      this.touchedFields(false, [this.areaExperienciaRelacionada, this.anioExperienciaRel, this.mesExperienciaRel]);
      this.subscribeOrUnsuscribe(TipoExperienciaPerfil.Relacionada, true);
    }

    /* Experiencia Interna */
    else if (value === TipoExperienciaPerfil.Interna) {

      const controllsTemp: AbstractControl[] = [];
      if (!this.areaExperienciaInterna.value) {
        controllsTemp.push(this.areaExperienciaInterna);
      }
      if (!this.anioExperienciaInt.value && !this.mesExperienciaInt.value) {
        controllsTemp.push(this.anioExperienciaInt);
        controllsTemp.push(this.mesExperienciaInt);
      }
      if (controllsTemp.length > 0) {
        this.clearAndSetValidatorRequired(true, controllsTemp);
        this.touchedFields(true, controllsTemp);
        this.submit = false;
        return;
      }

      // if (!this.validFields([this.areaExperienciaInterna, this.anioExperienciaInt, this.mesExperienciaInt])) {
      //   this.touchedFields(true, [this.areaExperienciaInterna, this.anioExperienciaInt, this.mesExperienciaInt]);
      //   this.submit = false;
      //   return;
      // }

      //if (this.areaExperienciaInterna.value !== '') {
      const vSubStage = this.lstExperiences3.find(
        (x: any) => this.areEquals(x.area, this.areaExperienciaInterna.value)
        //x.area.replace(/\s/g, '').toUpperCase() === this.areaExperienciaInterna.value.replace(/\s/g, '').toUpperCase()
      );
      if (vSubStage) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
      profileExperience.area = this.areaExperienciaInterna.value;
      profileExperience.anios = Number(this.anioExperienciaInt.value);
      profileExperience.meses = Number(this.mesExperienciaInt.value);
      profileExperience.permiteTraslado = Number(1);
      profileExperience.tipoExperiencia = TipoExperienciaPerfil.Interna;
      this.lstExperiences3.push(profileExperience);
      this.dataSourceExperience3.data = this.lstExperiences3;
      this.dataSourceExperience3.paginator = this.exp3Paginator;
      this.dataSourceExperience3.sort = this.sort;

      this.subscribeOrUnsuscribe(TipoExperienciaPerfil.Interna, false);
      this.clearAndSetValidatorRequired(false, [this.areaExperienciaInterna, this.anioExperienciaInt, this.mesExperienciaInt]);
      this.touchedFields(false, [this.areaExperienciaInterna, this.anioExperienciaInt, this.mesExperienciaInt]);
      this.subscribeOrUnsuscribe(TipoExperienciaPerfil.Interna, true);
    }

    this.submit = false;
  }

  public deleteExperience(element: PerfilExperiencia, value: any) {
    /* Eliminar Experiencia Externa */
    if (value === TipoExperienciaPerfil.Externa) {
      const index = this.lstExperiences1.indexOf(element);
      this.lstExperiences1.splice(index, 1);
      this.dataSourceExperience1.data = this.lstExperiences1;
      this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
      this.touchedFields(false, [this.areaExperienciaExterna, this.anioExperienciaEx, this.mesExperienciaEx]);
    }

    /* Eliminar Experiencia Relacionada */
    if (value === TipoExperienciaPerfil.Relacionada) {
      const index = this.lstExperiences2.indexOf(element);
      this.lstExperiences2.splice(index, 1);
      this.dataSourceExperience2.data = this.lstExperiences2;
      this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
      this.touchedFields(false, [this.areaExperienciaRelacionada, this.anioExperienciaRel, this.mesExperienciaRel]);
    }

    /* Eliminar Experiencia Interna */
    if (value === TipoExperienciaPerfil.Interna) {
      const index = this.lstExperiences3.indexOf(element);
      this.lstExperiences3.splice(index, 1);
      this.dataSourceExperience3.data = this.lstExperiences3;
      this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
      this.touchedFields(false, [this.areaExperienciaInterna, this.anioExperienciaInt, this.mesExperienciaInt]);
    }

    //eliminar el perfil experiencia de la base de datos
    if (element.id && !this.isPagePC) {
      this.perfilService.deletePerfilExperiencia(element.id)
        .toPromise()
        .catch((error) => this.alertService.showError(error))
        .finally(() => { this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES); });
    } else {
      this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
    }

  }

  /* Guarda el perfil, títulos académicos y experiencias */
  public async saveProfile() {

    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    //validar el formulario
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    //validar que  no se encuentre repetido el cargo
    const cargoSelect: Cargo = this.f.codigoCargo.value;
    const objTemp = this.lstActiveProfiles.find(e => e.idTipoCargo === cargoSelect.id && e.idGradoCargo === this.f.grado.value);
    if (objTemp) {
      if ((this.f.id && objTemp.id !== this.f.id.value) || !this.f.id) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    //se limpia los requeridos
    this.clearAndSetValidatorRequired(false, [this.idTipoTituloAcademico,
    this.anioExperienciaEx,
    this.mesExperienciaEx,
    this.anioExperienciaRel,
    this.mesExperienciaRel,
    this.anioExperienciaInt,
    this.mesExperienciaInt]);

    //validar que el perfil tenga por lo menos un titulo
    if (!Constants.validateList(this.lstTitlesTemp)) {
      this.alertService.message(this.ct.MSG_TITULO_ACADEMICO_REQUERIDO, TYPES.WARNING).finally(() => {
        this.panels.openAll();
        setTimeout(() => {
          this.scrollToView(this.idTipoTituloAcademicoView);
          //se valida que el campo este lleno
          const controllsTemp: AbstractControl[] = [];
          if (!this.idTipoTituloAcademico.value) {
            controllsTemp.push(this.idTipoTituloAcademico);
          }
          if (controllsTemp.length > 0) {
            this.clearAndSetValidatorRequired(true, controllsTemp);
            this.touchedFields(true, controllsTemp);
          }
        }, 500);
      });
      this.submit = false;
      return;
    }

    //validar que el perfil tenga por lo menos una experiencia externa
    if (!Constants.validateList(this.lstExperiences1)) {
      this.alertService.message(this.ct.MSG_EXPERIENCIA_EXTERNA_REQUERIDO, TYPES.WARNING).finally(() => {
        this.panels.openAll();
        setTimeout(() => {
          this.scrollToView(this.divExperienciaExternaView);
          //se valida que el campo este lleno
          const controllsTemp: AbstractControl[] = [];
          if (!this.areaExperienciaExterna.value) {
            controllsTemp.push(this.areaExperienciaExterna);
          }
          if (!this.anioExperienciaEx.value && !this.mesExperienciaEx.value) {
            controllsTemp.push(this.anioExperienciaEx);
            controllsTemp.push(this.mesExperienciaEx);
          }
          if (controllsTemp.length > 0) {
            this.clearAndSetValidatorRequired(true, controllsTemp);
            this.touchedFields(true, controllsTemp);
            this.submit = false;
            return;
          }
        }, 500);
      });
      this.submit = false;
      return;
    }

    if (!this.f.otroTipoEstudio.value) {
      this.f.nombreTipoEstudioOtro.setValue(null);
    } else {
      this.f.idTipoEstudioAdicional.setValue(null);
      this.f.nombreEstudioAdicional.setValue(null);
    }

    if (!this.f.esGrupo.value) {
      this.f.idTipoGrupo.setValue(null);
      this.f.idTipoSubGrupo.setValue(null);
    }

    if (this.f.tieneExperienciaRelacionada.value) {
      this.touchedFields(false, [this.areaExperienciaRelacionada, this.anioExperienciaRel]);
    }

    if (!this.f.tieneTraslado.value) {
      this.touchedFields(false, [this.areaExperienciaInterna, this.anioExperienciaInt]);
    }

    const newProfile: Perfil = {
      // id: undefined,
      idUsuario: this.user.id,
      idGradoCargo: String(this.f.grado.value),
      idTipoGrupo: this.f.idTipoGrupo.value,
      idTipoSubGrupo: this.f.idTipoSubGrupo.value,
      idTipoFuncion: Constants.validateData(this.f.idTipoFuncion.value) != undefined ? this.f.idTipoFuncion.value : null,
      idTipoCompetencia: this.f.idTipoCompetencia.value ? this.f.idTipoCompetencia.value : null,
      idTipoEstudioAdicional: this.f.idTipoEstudioAdicional.value ? this.f.idTipoEstudioAdicional.value : null,
      nombreEstudioAdicional: this.f.nombreEstudioAdicional.value,
      tipoEstudioAdicionalOtro: this.f.nombreTipoEstudioOtro.value,
      mision: this.f.mision.value,
      responsabilidades: this.f.responsabilidades.value,
      conocimientosHabilidades: this.f.conocimientos.value,
      esGrupo: this.f.esGrupo.value ? 1 : 0,
      activo: 1,
      idTipoDependenciaHija: !this.f.idTipoDependenciaHija.value ? null : this.f.idTipoDependenciaHija.value.id,
      idTipoLugar: this.f.idTipoLugar.value,
      idEmpresa: this.f.idEmpresa.value,
      codigoAlterno: this.f.codigoAlterno.value,
    };

    //seteamos el valor del cargo seleccionado
    if (this.tipoCargo == 1) {
      const cargo: CargoHumano = this.f.codigoCargo.value;
      newProfile.idTipoCargoHumano = cargo.codCargo;
      newProfile.idTipoCargo = null;
    } else {
      const cargo: Cargo = this.f.codigoCargo.value;
      newProfile.idTipoCargo = cargo.id;
      newProfile.idTipoCargoHumano = null;
    }

    this.alertService.loading();
    if (!this.f.id || this.elementCurrent.id !== undefined) {
      this.perfilService.inactivarPerfil(this.elementCurrent.id).subscribe();
    }
    this.perfilService.savePerfil(newProfile).toPromise()
      .then((record: any) => {
        newProfile.id = newProfile.id ? newProfile.id : record.id;
        this.saveProfileTitle(newProfile.id);
        this.saveProfileEquivalencia(newProfile.id);
        this.saveProfileExperience(newProfile.id);
        if (this.showSelectCompany) {
          this.f.idEmpresa.setValue('');
        }
        this.loadData()
          .then(() => {
            this.updateControllersForm();
            this.cleanForm();
            this.panels.closeAll();
            this.panelCargo.closeAll();
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
              .finally(() => this.submit = false);
          });
      }).catch(error => {
        this.alertService.showError(error)
          .finally(() => this.submit = false);
      });
  }

  public saveProfileTitle(newProfile: any) {
    if (this.lstTitlesTemp.length > 0) {
      this.lstTitlesTemp.forEach(async g => {
        const profileTitle: PerfilTitulo = {
          idPerfil: newProfile,
          idTipoTituloAcademico: g.idTipoTituloAcademico,
          idUsuarioModificacion: this.user.id
        };

        try {
          await this.perfilService.savePerfilTitulo(profileTitle).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      });
    }
  }

  public saveProfileEquivalencia(pIdPerfil: any) {
    if (this.lstEquivalenciasTemp.length > 0) {
      this.lstEquivalenciasTemp.forEach(async g => {
        const equivalencia: PerfilEquivalencia = {
          idPerfil: pIdPerfil,
          idTipoAdicional: g.idTipoAdicional,
          idUsuarioModificacion: g.idUsuarioModificacion,
          anio: g.anio
        };

        try {
          await this.perfilService.savePerfilEquivalencia(equivalencia).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      });
    }
  }

  public async saveProfileExperience(newProfile: any) {
    if (this.lstExperiences1.length > 0) {
      this.lstExperiences1.forEach(async x => {
        try {
          x.idPerfil = newProfile;
          await this.perfilService.savePerfilExperiencia(x).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      });
    }
    if (this.lstExperiences2.length > 0) {
      this.lstExperiences2.forEach(async x => {
        try {
          x.idPerfil = newProfile;
          await this.perfilService.savePerfilExperiencia(x).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      });
    }
    if (this.lstExperiences3.length > 0) {
      this.lstExperiences3.forEach(async x => {
        try {
          x.idPerfil = newProfile;
          await this.perfilService.savePerfilExperiencia(x).toPromise();
        } catch (e) {
          console.log('Error', e);
        }
      });
    }
  }

  public desactivarPerfil(element: Perfil) {
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.perfilService.inactivarPerfil(element.id)
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

  public updateControllersForm() {
    for (const key in this.form.controls) {
      this.form.get(key).updateValueAndValidity();
    }
  }

  public cleanForm() {
    this.f.codigoCargo.enable();
    this.f.grado.enable();
    this.f.esGrupo.enable();
    this.f.idTipoFuncion.enable();
    this.elementCurrent = {};
    this.submit = false;
    this.showGroups = false;
    this.dataSourceTitle.data = [];
    this.lstTitlesTemp = [];
    this.lstExperiences1 = [];
    this.lstExperiences2 = [];
    this.lstExperiences3 = [];
    this.dataSourceExperience1 = new MatTableDataSource<any>([]);
    this.dataSourceExperience2 = new MatTableDataSource<any>([]);
    this.dataSourceExperience3 = new MatTableDataSource<any>([]);

    //limpiar datos y tabla equivalencia
    this.dataSourceEquivalencia.data = [];
    this.lstEquivalenciasTemp = [];


    this.clearAndSetValidatorRequired(false, [this.idTipoTituloAcademico, this.anioExperienciaEx, this.mesExperienciaEx]);
    this.touchedFields(false, [this.idTipoTituloAcademico, this.anioExperienciaEx, this.mesExperienciaEx]);
    this.touchedFields(false, [this.idTipoEstudioEquivalencia, this.anioEquivalencia]);

    this.panels.closeAll();

    this.formV.resetForm();
  }

  private cleanFieldsConvocatoriaCargo(eventoConvocatoria: boolean) {
    //limpiar el formulario
    this.showAccordeon = false;
    this.elementCurrent = {};
    this.elementCurrentPC = null;
    this.f.gradoPC.setValue('');
    this.f.nombreCargo.setValue('');
    this.lstGradosPC = [];
    this.panels.closeAll();
    this.panelCargo.closeAll();

    if (eventoConvocatoria) {
      //this.f.lugar.setValue('');
      this.f.idCargo.setValue('');
    }

    this.loadValidatorsForm(false);//limpiar las validaciones a los controles del formulario perfil
  }

  public async loadFieldsCargo(event) {
    const option = event.source;
    this.alertService.loading();

    //limpiar el formulario
    this.cleanFieldsConvocatoriaCargo(false);

    let lstPerfil: Perfil[] = [];
    let idCargo: string = null;
    let cargoSelect: any = null;

    //validar si el cargo es de humano
    if (this.tipoCargo == 1) {
      const cargoSelected: CargoHumano = option.value;
      cargoSelect = <CargoHumano>this.lstCargosHum.find(c => c.codCargo === cargoSelected.codCargo);
      idCargo = cargoSelect.codCargo;
      //consultar el perfil que tiene el cargo
      lstPerfil = (await this.perfilService.getPerfilByCargoHumano(idCargo).toPromise() as any).datos;
    } else {
      const cargoSelected: Cargo = option.value;
      cargoSelect = <Cargo>this.lstCargos.find(c => c.id === cargoSelected.id);
      idCargo = cargoSelect.id;
      //consultar el perfil que tiene el cargo
      lstPerfil = (await this.perfilService.getPerfilByCargo(idCargo).toPromise() as any).datos;
    }

    //filtramos los perfiles unicamente que estan activos
    lstPerfil = lstPerfil.filter(x => x.activo == 1);

    //si no tiene perfil mostrar mensaje de error
    if (!lstPerfil || lstPerfil.length == 0) {
      this.alertService.message('El cargo no tiene perfil creado', TYPES.WARNING);
      this.f.idCargo.setValue('');
      return;
    } else {

      //filtramos los grados que tiene el cargo en perfiles
      lstPerfil.forEach(p => {
        const grado = {
          id: p.idGradoCargo,
          value: p.idGradoCargo
        };
        if (p.activo == 1) {
          this.lstGradosPC.push(grado);
        }
      });

      this.f.nombreCargo.setValue(this.translateField(cargoSelect, 'cargo', this.lang));
    }

    this.alertService.close();
  }

  public async loadFieldsConvocatory(event) {
    if (!event.value) {
      return;
    }
    this.alertService.loading();

    //se guarda en temporal la convocatoria seleccionada
    this.dataTemp.idConvocatoria = event.value;
    this.dataConvocatory = this.lstConvocatories.find((x: any) => x.id === this.f.idConvocatoria.value);

    //limpiamos el formulario y seteamos el valor de la convocatoria seleccionada y el id de la empresa
    this.form.reset();
    this.f.idConvocatoria.setValue(this.dataTemp.idConvocatoria);

    //buscar la convocatoria seleccionada y las relaciones con los otros modelos
    const convoSelect: Convocatoria = this.lstConvocatories.find(c => c.id === this.dataTemp.idConvocatoria);
    this.f.numeroConvocatoria.setValue(convoSelect.numeroConvocatoria);
    this.f.fechaAcuerdoConvocatoria.setValue(convoSelect.fechaAcuerdo);
    const tipoConvo: TypeConvocatory = (<any>await this.acs.getTipoConvocatoriaById(convoSelect.idTipoConvocatoria).toPromise()).datos;
    this.f.tipoConvocatoria.setValue(this.translateField(tipoConvo, 'tipoConvocatoria', this.lang));
    const tipoSede: TypeSede = (<any>await this.acs.getTipoSedeById(convoSelect.idTipoSede).toPromise()).datos;
    this.f.tipoSede.setValue(this.translateField(tipoSede, 'sede', this.lang));
    const tipoCargo: TipoCargo = this.lstTipoCargo.find(x => x.id === convoSelect.idTipoCargo);
    const lstTipoLugarTemp: TypePlace[] = [];
    const idsTipoLugar = convoSelect.idTipoLugar.split(',');
    this.lstTipoLugar.forEach((x) => {
      const find = idsTipoLugar.find(id => id == x.id);
      if (find) {
        lstTipoLugarTemp.push(x)
      }
    });

    //seteamos el id de la empresa
    this.f.idEmpresa.setValue(convoSelect.idEmpresa);

    //guardar la referencia de la convocatoria
    convoSelect.tipoCargo = tipoCargo;
    convoSelect.lstTipoLugar = lstTipoLugarTemp;
    convoSelect.tipoSede = tipoSede;
    convoSelect.tipoConvocatoria = tipoConvo;
    this.dataTemp.convocatoriaSeleccionada = convoSelect;

    //carga las convocatoria perfiles de la convocatoria seleccionada y filtra las del tipocargo seleccionado por variables
    this.lstConvocatoriesPerfil = ((await this.cs.getConvocatoriaPerfilByConvocatoria(convoSelect.id).toPromise() as any).datos) as ConvocatoriaPerfil[];

    const lstTem: ConvocatoriaPerfil[] = [];
    this.lstConvocatoriesPerfil.forEach(p => {
      p.perfil = JSON.parse(p.detallePerfil);
      if (this.tipoCargo == 1) {
        if (p.perfil.cargoHumanoModel) {
          lstTem.push(p);
        }
      } else {
        if (p.perfil.cargoModel) {
          lstTem.push(p);
        }
      }
      p.convocatoria = this.lstConvocatoriesAll.find(x => x.id === p.idConvocatoria);

      const lugarTemp = this.lstTipoLugar.find(l => l.id === p.perfil.idTipoLugar);
      p.perfil.tipoLugar = lugarTemp;

      if (p.perfil.idTipoDependenciaHija) {
        const dependenciaLugarTemp = this.lstTipoDependenciaHijasAll.find(l => l.id === p.perfil.idTipoDependenciaHija);
        p.perfil.dependenciaHija = dependenciaLugarTemp;
      }

    });
    this.lstConvocatoriesPerfil = lstTem;

    //seteamos el listado a la lsta de la tabla
    this.dataSourcePC.data = [];
    this.dataSourcePC.data = this.lstConvocatoriesPerfil;

    //inicializar el paginador y el ordenador de la tabla perfil convocatoria
    this.initPaginatorPC();

    //limpiar el formulario
    this.cleanFieldsConvocatoriaCargo(true);

    //desactivamos convocatoria, cargo y grado de cargo del form perfil convocatoria
    this.enabledOrDisabledControlls(false, [this.f.idConvocatoria, this.f.idCargo, this.f.gradoPC]);

    this.alertService.close();

    if(this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA){
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)      
      return;
    }
  }

  public async saveProfileConvocatory() {
    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar])) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear])) {
      return;
    }

    const conv = this.lstConvocatoriesAll.find(x => x.id === this.elementCurrentPC.idConvocatoria);
    if (!this.modConvSA(conv)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    //validar la empresa
    if (this.f.idEmpresa.value) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    //se limpia los requeridos
    this.clearAndSetValidatorRequired(false, [this.idTipoTituloAcademico,
    this.anioExperienciaEx,
    this.mesExperienciaEx,
    this.anioExperienciaRel,
    this.mesExperienciaRel,
    this.anioExperienciaInt,
    this.mesExperienciaInt]);

    //validar que el perfil tenga por lo menos un titulo
    if (!Constants.validateList(this.lstTitlesTemp)) {
      this.alertService.message(this.ct.MSG_TITULO_ACADEMICO_REQUERIDO, TYPES.WARNING).finally(() => {
        this.panels.openAll();
        setTimeout(() => {
          this.scrollToView(this.idTipoTituloAcademicoView);
          //se valida que el campo este lleno
          const controllsTemp: AbstractControl[] = [];
          if (!this.idTipoTituloAcademico.value) {
            controllsTemp.push(this.idTipoTituloAcademico);
          }
          if (controllsTemp.length > 0) {
            this.clearAndSetValidatorRequired(true, controllsTemp);
            this.touchedFields(true, controllsTemp);
          }
        }, 500);
      });
      this.submit = false;
      return;
    }

    //validar que el perfil tenga por lo menos una experiencia externa
    if (!Constants.validateList(this.lstExperiences1)) {
      this.alertService.message(this.ct.MSG_EXPERIENCIA_EXTERNA_REQUERIDO, TYPES.WARNING).finally(() => {
        this.panels.openAll();
        setTimeout(() => {
          this.scrollToView(this.divExperienciaExternaView);
          //se valida que el campo este lleno
          const controllsTemp: AbstractControl[] = [];
          if (!this.areaExperienciaExterna.value) {
            controllsTemp.push(this.areaExperienciaExterna);
          }
          if (!this.anioExperienciaEx.value && !this.mesExperienciaEx.value) {
            controllsTemp.push(this.anioExperienciaEx);
            controllsTemp.push(this.mesExperienciaEx);
          }
          if (controllsTemp.length > 0) {
            this.clearAndSetValidatorRequired(true, controllsTemp);
            this.touchedFields(true, controllsTemp);
            this.submit = false;
            return;
          }
        }, 500);
      });
      this.submit = false;
      return;
    }

    this.alertService.loading();


    //validamos si se lo va a editar
    if (this.elementCurrentPC && this.elementCurrentPC.id) {

      if (!this.f.otroTipoEstudio.value) {
        this.f.nombreTipoEstudioOtro.setValue(null);
      } else {
        this.f.idTipoEstudioAdicional.setValue(null);
        this.f.nombreEstudioAdicional.setValue(null);
      }

      if (!this.f.esGrupo.value) {
        this.f.idTipoGrupo.setValue(null);
        this.f.idTipoSubGrupo.setValue(null);
      }

      if (this.f.tieneExperienciaRelacionada.value) {
        this.touchedFields(false, [this.areaExperienciaRelacionada, this.anioExperienciaRel]);
      }

      if (!this.f.tieneTraslado.value) {
        this.touchedFields(false, [this.areaExperienciaInterna, this.anioExperienciaInt]);
      }

      const idPerfil = this.elementCurrentPC.idPerfil;
      const perfil: Perfil = {
        id: idPerfil,
        idUsuario: this.user.id,
        idGradoCargo: this.f.grado.value,
        idTipoGrupo: this.f.idTipoGrupo.value,
        idTipoSubGrupo: this.f.idTipoSubGrupo.value,
        idTipoFuncion: this.f.idTipoFuncion.value,
        idTipoCompetencia: this.f.idTipoCompetencia.value ? this.f.idTipoCompetencia.value : null,
        idTipoEstudioAdicional: this.f.idTipoEstudioAdicional.value ? this.f.idTipoEstudioAdicional.value : null,
        nombreEstudioAdicional: this.f.nombreEstudioAdicional.value,
        tipoEstudioAdicionalOtro: this.f.nombreTipoEstudioOtro.value,
        mision: this.f.mision.value,
        responsabilidades: this.f.responsabilidades.value,
        conocimientosHabilidades: this.f.conocimientos.value,
        esGrupo: this.f.esGrupo.value ? 1 : 0,
        activo: 1,
        idTipoDependenciaHija: this.f.idTipoDependenciaHija.value ? this.f.idTipoDependenciaHija.value.id : null,
        idTipoLugar: this.f.idTipoLugar.value,
        idEmpresa: this.f.idEmpresa.value,
        codigoAlterno: this.f.codigoAlterno.value,
      };

      // seteamos el valor del cargo seleccionado
      if (this.tipoCargo === 1) {
        const cargo: CargoHumano = this.f.codigoCargo.value;
        perfil.idTipoCargoHumano = cargo.codCargo;
        perfil.cargoHumanoModel = this.lstCargosHum.find(x => x.codCargo === perfil.idTipoCargoHumano);
        perfil.idTipoCargo = null;
      } else {
        const cargo: Cargo = this.f.codigoCargo.value;
        perfil.idTipoCargo = cargo.id;
        perfil.cargoModel = this.lstCargos.find(x => x.id === perfil.idTipoCargo);
        perfil.idTipoCargoHumano = null;
      }

      //armar la lista de titulos
      if (this.lstTitlesTemp.length > 0) {
        const lstTemp: PerfilTitulo[] = [];
        this.lstTitlesTemp.forEach(async g => {
          const profileTitle: PerfilTitulo = {
            idPerfil: idPerfil,
            idTipoTituloAcademico: g.idTipoTituloAcademico,
            idUsuarioModificacion: this.user.id
          };
          lstTemp.push(profileTitle);
        });
        this.lstTitlesTemp = lstTemp;
      }

      //armar la lista de experiencias
      if (this.lstExperiences1.length > 0) {
        this.lstExperiences1.forEach(x => x.idPerfil = idPerfil);
      }
      if (this.lstExperiences2.length > 0) {
        this.lstExperiences2.forEach(x => x.idPerfil = idPerfil);
      }
      if (this.lstExperiences3.length > 0) {
        this.lstExperiences3.forEach(x => x.idPerfil = idPerfil);
      }

      // seteamos la lista de titulos
      perfil.lstPerfilTitulo = this.lstTitlesTemp;

      // seteamos la lista de equivalencias
      perfil.lstPerfilEquivalencia = this.lstEquivalenciasTemp;

      // seteamos la lista de experiencias
      perfil.lstPerfilExperiencia = [];
      perfil.lstPerfilExperiencia = [...this.lstExperiences1, ...this.lstExperiences2, ...this.lstExperiences3];

      // crear el objeto para actualizar
      const newItem: ConvocatoriaPerfil = {
        id: this.elementCurrentPC.id,
        idUsuario: this.user.id,
        detallePerfil: JSON.stringify(perfil),
        idPerfil: perfil.id,
        // lugar: this.f.lugar.value,
        lugar: '',
        idConvocatoria: this.f.idConvocatoria.value,
      };

      //gaurdar el perfil
      this.cs.saveConvocatoriaPerfil(newItem).toPromise()
        .then((record: any) => {
          this.loadFieldsConvocatory({ value: this.dataTemp.idConvocatoria })
            .then(() => {
              this.panels.closeAll();
              this.panelCargo.closeAll();
              this.cleanListTablesFormPerfil();
              this.divFormPerfil.nativeElement.hidden = true;
              this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                .finally(() => this.submit = false);
            });
        }).catch(error => {
          this.alertService.showError(error)
            .finally(() => this.submit = false);
        });

    } else {
      //validamos si se lo va a editar o crear

      //consultamos el perfil del cargo seleccionado
      let perfil: Perfil = null;
      let lstPerfil: Perfil[];
      if (this.tipoCargo == 1) {
        const cargo: CargoHumano = this.f.idCargo.value;
        lstPerfil = (await this.perfilService.getPerfilByCargoHumano(cargo.codCargo).toPromise() as any).datos;
      } else {
        const cargo: Cargo = this.f.idCargo.value;
        lstPerfil = (await this.perfilService.getPerfilByCargo(cargo.id).toPromise() as any).datos;
      }

      //buscamos el perfil por el grado seleccionado
      perfil = lstPerfil.find(x => x.idGradoCargo == this.f.gradoPC.value);
      if (perfil == null) {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
        return;
      }

      //validar que el nuevo registro no se encuentre repetido
      const obj = this.lstConvocatoriesPerfil.find((x: ConvocatoriaPerfil) => this.areEquals(x.idPerfil, perfil.id));
      if (obj) {
        if (this.areEqualsID(this.f.id, obj.id)) {
          this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
          this.submit = false;
          return;
        }
      }

      //se guarda el listado de experiencia y titulo 
      const lstPerfilExperiencia = (await this.perfilService.getPerfilExperienciaByPerfil({ idPerfil: perfil.id }).toPromise() as any).datos;
      const lstPerfilTitulo = (await this.perfilService.getPerfilTituloByPerfil({ idPerfil: perfil.id }).toPromise() as any).datos;
      const lstPerfilEquivalencia = (await this.perfilService.getPerfilEquivalenciaByPerfil({ idPerfil: perfil.id }).toPromise() as any).datos;
      perfil.lstPerfilExperiencia = lstPerfilExperiencia;
      perfil.lstPerfilTitulo = lstPerfilTitulo;
      perfil.lstPerfilEquivalencia = lstPerfilEquivalencia;

      //se guarda el cargo
      if (perfil.idTipoCargo) {
        perfil.cargoModel = this.lstCargos.find(x => x.id == perfil.idTipoCargo);
      }
      if (perfil.idTipoCargoHumano) {
        perfil.cargoHumanoModel = this.lstCargosHum.find(x => x.codCargo == perfil.idTipoCargoHumano);
      }

      //crear el objeto para guardar
      const newItem: ConvocatoriaPerfil = {
        id: undefined,
        idUsuario: this.user.id,
        detallePerfil: JSON.stringify(perfil),
        idPerfil: perfil.id,
        lugar: this.f.lugar.value,
        idConvocatoria: this.f.idConvocatoria.value,
      };

      //guardar el objeto
      this.cs.saveConvocatoriaPerfil(newItem).toPromise()
        .then((record: any) => {
          this.loadFieldsConvocatory({ value: this.dataTemp.idConvocatoria })
            .then(() => {
              this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                .finally(() => this.submit = false);
            });
        }).catch(error => {
          this.alertService.showError(error)
            .finally(() => this.submit = false);
        });
    }

  }

  private cleanListTablesFormPerfil() {
    this.lstTitlesTemp = [];
    this.lstExperiences1 = [];
    this.lstExperiences2 = [];
    this.lstExperiences3 = [];
    this.lstEquivalenciasTemp = [];
  }

  public cleanFormPC() {
    this.cleanForm();
    this.enabledOrDisabledControlls(true, [this.f.idConvocatoria]);
    this.lstConvocatoriesPerfil = [];
    this.lstGradosPC = [];
    this.dataSourcePC.data = this.lstConvocatoriesPerfil;
    this.showAccordeon = false;
    this.panels.closeAll();
    this.panelCargo.closeAll();
    this.cleanListTablesFormPerfil();
    this.formV.resetForm();

    //ocultar el acordeon de perfil
    this.divFormPerfil.nativeElement.hidden = true;
  }

  private setTitulosPerfil() {
    this.lstTitlesTemp = [];
    if (Constants.validateList(this.lstProfileTitleByProfile)) {
      this.lstProfileTitleByProfile.forEach(e => {
        const tempTitle = this.lstTitles.find(r => r.id === e.idTipoTituloAcademico);
        e.titulo = tempTitle ? tempTitle.titulo : e.titulo;
        this.lstTitlesTemp.push(e);
      });
    }
    this.dataSourceTitle.data = this.lstTitlesTemp;
    this.dataSourceTitle.paginator = this.titlePaginator;
  }

  private setEquivalenciasPerfil() {
    this.lstEquivalenciasTemp = [];
    if (Constants.validateList(this.lstProfileEquivalenciaByProfile)) {
      this.lstProfileEquivalenciaByProfile.forEach(e => {
        const tempTitle = this.lstTypeStudy.find(r => r.id === e.idTipoAdicional);
        e.tipoAdicionalNombre = tempTitle ? tempTitle.tipoAdicional : e.tipoAdicionalNombre;
        this.lstEquivalenciasTemp.push(e);
      });
    }
    this.dataSourceEquivalencia.data = this.lstEquivalenciasTemp;
    this.dataSourceEquivalencia.paginator = this.equivalenciaPaginator;
  }

  private setExperienciasPerfil() {
    this.lstExperiences1 = [];
    this.lstExperiences2 = [];
    this.lstExperiences3 = [];
    if (Constants.validateList(this.lstProfileExperienceByProfile)) {
      this.lstProfileExperienceByProfile.forEach(c => {
        if (c.tipoExperiencia === TipoExperienciaPerfil.Externa) {
          this.lstExperiences1.push(c);
        }
        if (c.tipoExperiencia === TipoExperienciaPerfil.Relacionada) {
          this.lstExperiences2.push(c);
        }
        if (c.tipoExperiencia === TipoExperienciaPerfil.Interna) {
          this.lstExperiences3.push(c);
        }
      });
    }
    if (this.lstExperiences1.length > 0) {
      this.touchedFields(false, [this.areaExperienciaExterna, this.anioExperienciaEx, this.mesExperienciaEx]);
    }

    if (this.lstExperiences2.length > 0) {
      this.f.tieneExperienciaRelacionada.setValue(1);
    } else {
      this.f.tieneExperienciaRelacionada.setValue(0);
    }

    if (this.lstExperiences3.length > 0) {
      this.f.tieneTraslado.setValue(1);
    } else {
      this.f.tieneTraslado.setValue(0);
    }

    this.dataSourceExperience1.data = this.lstExperiences1;
    this.dataSourceExperience2.data = this.lstExperiences2;
    this.dataSourceExperience3.data = this.lstExperiences3;
  }

  private setTipoGrupo(element: Perfil) {
    if (element.esGrupo) {
      this.f.idTipoGrupo.setValue(element.idTipoGrupo);
      this.f.idTipoSubGrupo.setValue(element.idTipoSubGrupo);
    } else {
      this.f.idTipoGrupo.setValue(null);
      this.f.idTipoSubGrupo.setValue(null);
    }
  }

  public async editPC(elementPC: ConvocatoriaPerfil) {
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
    this.alertService.loading();
    this.loadList()
      .then(async (res: any) => {

        // se limpia las validaciones para estos campos
        this.clearAndSetValidatorRequired(false, [this.idTipoTituloAcademico,
        this.anioExperienciaEx,
        this.mesExperienciaEx,
        this.anioExperienciaRel,
        this.mesExperienciaRel,
        this.anioExperienciaInt,
        this.mesExperienciaInt]);
        this.touchedFields(false, [this.idTipoTituloAcademico, this.anioExperienciaEx, this.mesExperienciaEx]);
        this.touchedFields(false, [this.idTipoEstudioEquivalencia, this.anioEquivalencia]);

        //cerramos el panel y limpiamos las listas de las tablas
        this.panels.closeAll();
        this.panelCargo.closeAll();
        this.cleanListTablesFormPerfil();

        //cargamos los objetos en memoria
        const element: Perfil = elementPC.perfil;
        this.elementCurrent = C.cloneObject(element);
        this.elementCurrentPC = elementPC;

        //cargamos el formulario de perfil
        this.loadForm();

        //desactivamos convocatoria, cargo y grado de cargo del form perfil convocatoria
        this.enabledOrDisabledControlls(false, [this.f.idConvocatoria, this.f.idCargo, this.f.gradoPC]);

        //seteamos los datos del acordeon de titulos
        this.lstProfileTitleByProfile = element.lstPerfilTitulo;
        this.setTitulosPerfil();

        //seteamos los datos del acordeon de equivalencia
        this.lstProfileEquivalenciaByProfile = element.lstPerfilEquivalencia;;
        this.setEquivalenciasPerfil();

        //seteamos los datos del acordeon de experiencia
        this.lstProfileExperienceByProfile = element.lstPerfilExperiencia
        this.setExperienciasPerfil();

        //validamos si es grupo
        this.setTipoGrupo(element);

        //se desactiva los controles necesarios
        this.enabledOrDisabledControlls(false,
          [this.f.codigoCargo,
          this.f.grado,
          this.f.idTipoLugar,
          this.f.idTipoDependenciaHija,
          this.f.esGrupo,
          this.f.idTipoGrupo,
          this.f.idTipoSubGrupo,
          this.f.idTipoFuncion,
          this.f.idTipoCargo,
          this.f.codigoAlterno]);

        //validamos si tiene tipo estudio otro
        if (element.tipoEstudioAdicionalOtro) {
          element.otroTipoEstudioAdicional = 1;
          this.f.otroTipoEstudio.setValue(element.otroTipoEstudioAdicional);
        } else {
          this.f.otroTipoEstudio.setValue(0);
        }

        //se agrega al listado de grados
        this.lstGradosPC = [];
        this.lstGradosPC.push({
          id: element.idGradoCargo,
          value: element.idGradoCargo
        });

        //buscamos el tipo cargo
        let tipoCargoTemp: TipoCargo;
        if (element.idTipoCargoHumano) {
          const cargoTemp = element.cargoHumanoModel;
          tipoCargoTemp = this.lstTipoCargo.find(x => x.codAlterno === cargoTemp.codCargoTipo);
        } else if (element.idTipoCargo) {
          const cargoTemp = element.cargoModel;
          tipoCargoTemp = this.lstTipoCargo.find(x => x.id === cargoTemp.idTipoCargo);
        }

        //cargar formulario perfil
        this.form.patchValue({
          id: element.id,
          codigoCargo: element.idTipoCargo == null ? element.cargoHumanoModel : element.cargoModel,
          cargo: element.idTipoCargo == null ? element.cargoHumanoModel.cargo : this.translateField(element.cargoModel, 'cargo', this.lang),
          grado: element.idGradoCargo,
          nivelJerarquico: element.idTipoCargo == null ? element.cargoHumanoModel.cargoNivel : element.cargoModel.nivelJerarquico,
          esGrupo: element.esGrupo,
          idTipoGrupo: element.idTipoGrupo,
          idTipoSubGrupo: element.idTipoSubGrupo,
          idTipoFuncion: element.idTipoFuncion,
          idTipoLugar: element.idTipoLugar,
          //idEmpresa: element.idEmpresa,
          idTipoCargo: tipoCargoTemp.id,
          codigoAlterno: element.codigoAlterno,

          /* SEGUNDA SECCIÓN */
          mision: element.mision,
          responsabilidades: element.responsabilidades,
          idTipoCompetencia: element.idTipoCompetencia,

          /* TERCERA SECCIÓN */
          idTipoEstudioAdicional: element.idTipoEstudioAdicional,
          nombreEstudioAdicional: element.nombreEstudioAdicional,
          otroTipoEstudio: element.otroTipoEstudioAdicional,
          nombreTipoEstudioOtro: element.tipoEstudioAdicionalOtro,
          conocimientos: element.conocimientosHabilidades,
        });

        //cargar formulario convocatoria
        this.form.patchValue({
          lugar: elementPC.lugar,
          idCargo: element.idTipoCargo == null ? element.cargoHumanoModel : element.cargoModel,
          nombreCargo: this.translateField(element.cargoModel == null ? element.cargoHumanoModel : element.cargoModel, 'cargo', this.lang),
          gradoPC: element.idGradoCargo,
        });

        //buscamos la dependencia hija
        const tipoDependenciaHija: TipoDependenciaHija = this.lstTipoDependenciaHijasAll.find(x => x.id === element.idTipoDependenciaHija);
        if (tipoDependenciaHija) {
          this.cargarTiposDependenciaHijas({ value: tipoDependenciaHija.idLugar });
          this.f.idTipoDependenciaHija.setValue(tipoDependenciaHija);
        }

        //mostrar el acordeon de perfil
        this.divFormPerfil.nativeElement.hidden = false;

        //habilitar el acordeon
        this.showAccordeon = true;

        //cerrar el loader y subir el scroll
        setTimeout(() => {
          this.scrollTop();
        }, 500);

        this.alertService.close();
      })
      .catch(err => {
        this.alertService.showError(err);
      });

  }

  public deletePC(element: ConvocatoriaPerfil) {

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    const conv = this.lstConvocatoriesAll.find(x => x.id === element.idConvocatoria);
    if (!this.modConvSA(conv)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.cs.deleteConvocatoriaPerfil(element.id)
            .subscribe(o => {
              this.loadFieldsConvocatory({ value: this.dataTemp.idConvocatoria })
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              this.alertService.showError(err);
            });
        }
      });
  }

  public sortDataPC(sort: Sort) {
    const data = this.dataSourcePC.data;
    let sortedData: any;
    if (!sort.active || sort.direction === '') {
      sortedData = data;
      return;
    }

    sortedData = data.sort((a: ConvocatoriaPerfil, b: ConvocatoriaPerfil) => {
      const isAsc = sort.direction === 'asc';
      const codigoCargoA = this.tipoCargo == 1 ? a.perfil.cargoHumanoModel.codCargo : a.perfil.cargoModel.codAlterno;
      const codigoCargoB = this.tipoCargo == 1 ? b.perfil.cargoHumanoModel.codCargo : b.perfil.cargoModel.codAlterno;
      const nombreCargoA = this.tipoCargo == 1 ? a.perfil.cargoHumanoModel.cargo : this.translateField(a.perfil.cargoModel, 'cargo', this.lang);
      const nombreCargobB = this.tipoCargo == 1 ? a.perfil.cargoHumanoModel.codCargo : a.perfil.cargoModel.codAlterno;
      switch (sort.active) {
        case 'codigoCargo': return this.compare(codigoCargoA, codigoCargoB, isAsc);
        case 'cargo': return this.compare(nombreCargoA, nombreCargobB, isAsc);
        case 'grado': return this.compare(a.perfil.idGradoCargo, b.perfil.idGradoCargo, isAsc);
        case 'convocatoria': return this.compare(a.convocatoria.nombreConvocatoria, b.convocatoria.nombreConvocatoria, isAsc);
        case 'lugar': return this.compare(a.perfil.tipoLugar.lugar, b.perfil.tipoLugar.lugar, isAsc);
        case 'dependenciaLugar': return this.compare(a.perfil.dependenciaHija ? a.perfil.dependenciaHija.nombre : '', b.perfil.dependenciaHija ? b.perfil.dependenciaHija.nombre : '', isAsc);
        default: return 0;
      }
    });
  }

  public validateListTitles() {
    if (Constants.validateList(this.lstTitlesTabProfile)) {
      return true;
    }
    return false;
  }

  private touchedFields(touched: boolean, controls: AbstractControl[], emmitEvent?: boolean) {
    if (touched) {
      controls.forEach(x => {
        x.markAsTouched();
        x.updateValueAndValidity();
      });
    } else {
      controls.forEach(x => {
        x.markAsUntouched();
        // x.setValue('', { emitEvent: false, emitModelToViewChange: true, emitViewToModelChange: false });
        x.setValue('', { emitEvent: emmitEvent });
        x.updateValueAndValidity();
      });
    }
  }

  private enabledOrDisabledControlls(enabled: boolean, controls: AbstractControl[]) {
    if (enabled) {
      controls.forEach(x => {
        x.enable();
        x.updateValueAndValidity();
      });
    } else {
      controls.forEach(x => {
        x.disable();
        x.updateValueAndValidity();
      });
    }
  }

  private validFields(controls: FormControl[]) {
    let valid = true;
    controls.forEach(x => {
      if (!x.valid) {
        valid = false;
      }
    });
    return valid;
  }

  public async cargarTiposDependenciaHijas(event: any) {
    // this.lstTipoDependenciaHijas = <TipoDependenciaHija[]>(<any>await this.acs.getTipoDependenciaHijaPorIdLugar(event.value).toPromise()).datos;
    if (event.value) {
      this.lstTipoDependenciaHijas = this.lstTipoDependenciaHijasAll.filter(x => x.idLugar === event.value);
    } else {
      this.lstTipoDependenciaHijas = [];
    }
    this.f.idTipoDependenciaHija.setValue('');
    this.f.idTipoDependenciaHija.markAsTouched();
    this.f.idTipoDependenciaHija.updateValueAndValidity();
  }

  public clearAndSetValidatorRequired(validator: boolean, controls: AbstractControl[]) {
    if (validator) {
      controls.forEach(x => {
        x.setValidators([Validators.required]);
        x.updateValueAndValidity();
      });
    } else {
      controls.forEach(x => {
        x.setValidators([]);
        x.updateValueAndValidity();
      });
    }
  }

  /**
   * Carga los datos segun la empresa seleccionada
   */
  public async loadDataByCompany(event) {
    this.alertService.loading();
    if (!this.isPagePC) {
      this.filtrarCargoPorTipoCargo(null);
      this.f.idTipoCargo.setValue('');
      this.f.codigoCargo.setValue('');
      this.f.cargo.setValue('');
      this.f.nivelJerarquico.setValue('');
      await this.loadData();
    } else {
      this.enabledOrDisabledControlls(true, [this.f.idConvocatoria]);
      this.lstConvocatoriesPerfil = [];
      this.lstGradosPC = [];
      this.dataSourcePC.data = this.lstConvocatoriesPerfil;
      this.showAccordeon = false;
      this.panels.closeAll();
      this.panelCargo.closeAll();
      this.cleanListTablesFormPerfil();
      this.f.idConvocatoria.setValue('');
      await this.loadDataPC();
    }
    this.alertService.close();
  }

  public loadTipoCargo(event) {
    this.alertService.loading();
    this.filtrarCargoPorTipoCargo(event.value);
    this.f.codigoCargo.setValue('');
    this.f.cargo.setValue('');
    this.f.nivelJerarquico.setValue('');
    this.alertService.close();
  }

  public filtrarCargoPorTipoCargo(idTipoCargo: string) {
    if (idTipoCargo) {
      const tipoCargo = this.lstTipoCargo.find(t => t.id === idTipoCargo);
      if (this.tipoCargo === 1) {
        if (tipoCargo.tipoCargo === 'Todos') {
          this.lstCargosHumView = this.lstCargosHum;
        } else {
          this.lstCargosHumView = this.lstCargosHum.filter(c => c.codCargoTipo === tipoCargo.codAlterno);
        }
      } else {
        if (tipoCargo.tipoCargo === 'Todos') {
          this.lstCargosView = this.lstCargos;
        } else {
          this.lstCargosView = this.lstCargos.filter(c => c.idTipoCargo === idTipoCargo);
        }
      }
    } else {
      this.lstCargosHumView = [];
      this.lstCargosView = [];
    }
  }

  public async openDialogCargos() {
    const conv: Convocatoria = this.dataTemp.convocatoriaSeleccionada;
    let lstPerfilesTemp: Perfil[] = [];
    let lstPerfilesSelectedTemp: Perfil[] = [];

    let dataSend: DataDialogCargos;

    if (Constants.validateList(this.lstCargosHum)) {
      lstPerfilesTemp = this.lstAllProfiles.filter(x => {
        const cargoTemp = this.lstCargosHum.find(z => {
          if (z.codCargoEmpresa !== '' && z.codCargoEmpresa === x.idTipoCargoHumano) {
            x.idTipoCargoHumano = z.codCargoEmpresa;
            z.codCargoGlobal = z.codCargoEmpresa;
            z.cargoGlobal = z.cargoEmpresa;
            return true;
          } else if (z.codCargo !== '' && z.codCargo === x.idTipoCargoHumano) {
            x.idTipoCargoHumano = z.codCargo;
            z.codCargoGlobal = z.codCargo;
            z.cargoGlobal = z.cargo;
            return true;
          }
        });

        if (cargoTemp && (cargoTemp.codCargoTipo === conv.tipoCargo.codAlterno || conv.tipoCargo.codAlterno === null)) {
          // se busca el tipoDependenciaHija
          const tipoDependenciaTemp = this.lstTipoDependenciaHijasAll.find(z => z.id === x.idTipoDependenciaHija);
          // se busca el tipoLugar del pergfil
          const tipoLugarTemp = this.lstTipoLugar.find(z => z.id === x.idTipoLugar);
          if (tipoLugarTemp) {
            // se compara si la convocatoria contiene ese tipoLugar
            const tipoLugarConvTemp = conv.lstTipoLugar.find(z => z.id === tipoLugarTemp.id);
            if (tipoLugarConvTemp) {
              x.cargoHumanoModel = cargoTemp;
              x.tipoLugar = tipoLugarTemp;
              x.dependenciaHija = tipoDependenciaTemp;
              return true;
            }
          }
        }
      });

      // se busca los perfiles que ya estan guardados en el perfil convocatoria
      lstPerfilesSelectedTemp = lstPerfilesTemp.filter(x => {
        const find = this.lstConvocatoriesPerfil.find(z => z.perfil.idTipoCargo === x.idTipoCargo && z.perfil.idGradoCargo === x.idGradoCargo);
        if (find) {
          return true;
        }
      });

      //datos a enviar al dialogo
      dataSend = {
        cargoHumano: true,
        lstPerfiles: lstPerfilesTemp,
        lstPerfilesSelected: lstPerfilesSelectedTemp,
      };

    } else if (Constants.validateList(this.lstCargos)) {
      lstPerfilesTemp = this.lstAllProfiles.filter(x => {
        const cargoTemp = this.lstCargos.find(z => z.id === x.idTipoCargo);
        if (cargoTemp && (cargoTemp.idTipoCargo === conv.idTipoCargo)) {
          //if (cargoTemp && (cargoTemp.idTipoCargo === conv.idTipoCargo || conv.idTipoCargo === '03')) {
          // se busca el tipoDependenciaHija
          const tipoDependenciaTemp = this.lstTipoDependenciaHijasAll.find(z => z.id === x.idTipoDependenciaHija);
          // se busca el tipoLugar del pergfil
          const tipoLugarTemp = this.lstTipoLugar.find(z => z.id === x.idTipoLugar);
          if (tipoLugarTemp) {
            // se compara si la convocatoria contiene ese tipoLugar
            const tipoLugarConvTemp = conv.lstTipoLugar.find(z => z.id === tipoLugarTemp.id);
            if (tipoLugarConvTemp) {
              x.cargoModel = cargoTemp;
              x.tipoLugar = tipoLugarTemp;
              x.dependenciaHija = tipoDependenciaTemp;
              return true;
            }
          }
        }
      });

      // se busca los perfiles que ya estan guardados en el perfil convocatoria
      lstPerfilesSelectedTemp = lstPerfilesTemp.filter(x => {
        const find = this.lstConvocatoriesPerfil.find(z => z.perfil.idTipoCargo === x.idTipoCargo && z.perfil.idGradoCargo === x.idGradoCargo);
        if (find) {
          return true;
        }
      });

      //datos a enviar al dialogo
      dataSend = {
        cargoHumano: false,
        lstPerfiles: lstPerfilesTemp,
        lstPerfilesSelected: lstPerfilesSelectedTemp,
      };
    }
    // abrir el dialo
    const dialogRef = this.dialog.open(DialogSelectCargosComponent, {
      data: dataSend,
      disableClose: true,
      maxWidth: '90%',
      maxHeight: '90%',
      panelClass: 'col-sm-12',
    });

    //escuchar el cierre del dialogo
    dialogRef.afterClosed().subscribe(async (result: DataDialogCargos) => {
      if (result) {
        this.alertService.loading();
        // quita los cargos que ya se encuentran guardados en el perfil convocatoria
        const lstPerfilesSave = result.resultDataSelected.filter(x => {
          if (!result.cargoHumano) {
            const find = this.lstConvocatoriesPerfil.find(z => z.perfil.idTipoCargo === x.idTipoCargo && z.perfil.idGradoCargo === x.idGradoCargo);
            if (!find) {
              return true;
            }
          } else {
            const find = this.lstConvocatoriesPerfil.find(z => z.perfil.idTipoCargoHumano === x.idTipoCargoHumano && z.perfil.idGradoCargo === x.idGradoCargo);
            if (!find) {
              return true;
            }
          }

        });

        //eliminar perfiles no seleccionados
        const lstPerfilesDelete = this.lstConvocatoriesPerfil.filter(x => {
          if (!result.cargoHumano) {
            const find = result.resultDataSelected.find(z => x.perfil.idTipoCargo === z.idTipoCargo && x.perfil.idGradoCargo === z.idGradoCargo);
            if (!find) {
              return true;
            }
          } else {
            const find = result.resultDataSelected.find(z => x.perfil.idTipoCargoHumano === z.idTipoCargoHumano && x.perfil.idGradoCargo === z.idGradoCargo);
            if (!find) {
              return true;
            }
          }

        });


        // consultar todas las experiencias, titulos y equivalencias
        const lstPerfilExperienciaAll = <PerfilExperiencia[]>(await this.perfilService.getPerfilExperiencia().toPromise() as any).datos;
        const lstPerfilTituloAll = <PerfilTitulo[]>(await this.perfilService.getPerfilTitulo().toPromise() as any).datos;
        const lstPerfilEquivalenciaAll = <PerfilEquivalencia[]>(await this.perfilService.getPerfilEquivalencia().toPromise() as any).datos;

        // recorrer los perfiles elegidos para armarlos y guardarlos
        lstPerfilesSave.forEach(async perfil => {
          // se filtra el listado de experiencia, titulo y equivalencias
          const lstPerfilExperiencia = lstPerfilExperienciaAll.filter(exp => exp.idPerfil === perfil.id);
          const lstPerfilTitulo = lstPerfilTituloAll.filter(exp => exp.idPerfil === perfil.id);
          const lstPerfilEquivalencia = lstPerfilEquivalenciaAll.filter(exp => exp.idPerfil === perfil.id);

          perfil.lstPerfilExperiencia = lstPerfilExperiencia;
          perfil.lstPerfilTitulo = lstPerfilTitulo;
          perfil.lstPerfilEquivalencia = lstPerfilEquivalencia;

          //crear el objeto para guardar
          const newItem: ConvocatoriaPerfil = {
            id: undefined,
            idUsuario: this.user.id,
            detallePerfil: JSON.stringify(perfil),
            idPerfil: perfil.id,
            lugar: '',
            idConvocatoria: conv.id,
          };

          //guardar el objeto
          await this.cs.saveConvocatoriaPerfil(newItem).toPromise()
            .then(() => { })
            .catch(error => {
              this.alertService.showError(error);
            });

        });

        // eliminar los perfiles no seleccionados
        lstPerfilesDelete.forEach(async perfil => {
          await this.cs.deleteConvocatoriaPerfil(perfil.id).toPromise()
            .then(() => { })
            .catch(error => {
              this.alertService.showError(error);
            });
        });

        //
        this.loadFieldsConvocatory({ value: this.dataTemp.idConvocatoria })
          .then(() => {
            this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
              .finally(() => this.submit = false);
          });
      }

    });
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

  public reporteGeneralCargosYRequisitos(idConv: string) {
    this.alertService.loading();
    this.submit = true;
    const ds = [];
    const paramsReport: RptGeneralCargosRequisitosModel = {
      idConvocatoria: idConv,
      language: this.lang,
      reportTitle: 'RptGeneralCargosYRequisitos',
      reportType: 'EXCELOPENXML',
      rptFileName: 'RptGeneralCargosYRequisitos.rdlc',
      exportExtension: 'EXCELOPENXML',
      dataSets: ds,
    };
    this.reporteService.getGeneralCargosYRequisitos(paramsReport)
      .toPromise()
      .then((resReporte: Blob) => {
        this.downloadBlob(resReporte, 'RptGeneralCargosYRequisitos');
        this.alertService.close();
        this.submit = false;
      })
      .catch(erro => {
        this.alertService.showError(erro);
        this.submit = false;
      });
  }
}

