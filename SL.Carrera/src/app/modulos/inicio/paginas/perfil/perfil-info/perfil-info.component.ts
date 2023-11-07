import { Component, OnInit, AfterViewChecked, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { AlertService } from '@app/core/servicios/alert.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { PerfilService } from '@app/core/servicios/perfil.service';
import { CommonService } from '@app/core/servicios/common.service';
import { administracionPerfilService } from '@app/core/servicios/administracion-perfil-service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { configMsg } from '@app/compartido/helpers/enums';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CargoHumano } from '@app/compartido/modelos/cargo-humano';
import { Cargo } from '@app/compartido/modelos/cargo';
import { Constants } from '@app/compartido/helpers/constants';
import { Empresa } from '@app/compartido/modelos/empresa';
import { User } from '@app/compartido/modelos/user';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { Perfil } from '@app/compartido/modelos/perfil';

@Component({
  selector: 'app-perfil-info',
  templateUrl: './perfil-info.component.html',
  styleUrls: ['./perfil-info.component.scss']
})
export class PerfilInfoComponent extends BaseController implements OnInit, AfterViewChecked {

  /* Carga las listas desde el API */
  public lstAllProfiles: any[] = [];
  public lstAllProfileExperiences: any[] = [];
  public lstAllProfileTitles: any[] = [];
  public lstProfileTitleByProfile: any[] = [];
  public lstProfileExperienceByProfile: any[] = [];
  // aún no está el servicio de cargos
  public lstCargos: any[] = [];
  public lstCargosHum: any[] = [];
  public lstGrados: any[] = [];
  public lstTotalGroups: any[] = [];
  public lstGroups: any[] = [];
  public lstSubGroups: any[] = [];
  public lstFunctions: any[] = [];
  public lstPersonalSkills: any[] = [];
  public lstTitles: any[] = [];
  public lstTypeStudy: any[] = [];
  public lstActiveProfiles: any[] = [];
  private vCargos: any;
  private tipoCargo: number;
  private user: User = this.commonService.getVar(configMsg.USER);

  //variables para empresa
  public company: FormControl = new FormControl('');
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];
  public idEmpresa = null;

  public elementCurrent: any = {};

  public displayedColumnsTable: string[] = ['codigoCargo', 'grado', 'cargo'];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild('profilesPaginator', { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('sortProfile', { static: true }) sortProfile: MatSort;

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private fb2: FormBuilder,
    private perfilService: PerfilService,
    private commonService: CommonService,
    private adminPerfilService: administracionPerfilService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private empresaService: EmpresaService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  async ngOnInit() {
    this.alertService.loading();
    // cargar la informacion de empresa
    await this.loadUserData();
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

  public async loadUserData() {
    this.idEmpresa = null;
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      this.lstCompanies = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
    } else {
      this.showSelectCompany = false;
      this.idEmpresa = this.user.idEmpresa;
    }
  }

  public async loadVarCargos() {
    /* Carga la variable para saber que Cargos va a traer */
    this.vCargos = <any>(<any>await this.commonService.getMessageByName(configMsg.OBTENER_CARGOS_HUMANO).toPromise()).datos;
    this.tipoCargo = Number(this.vCargos.valor);
  }


  private async loadCargos() {
    if (this.tipoCargo === 1) {
      this.lstCargosHum = !Constants.validateList(this.lstCargosHum) ? (await this.perfilService.getCargosHumano().toPromise() as any).datos : this.lstCargosHum;
    } else {
      this.lstCargos = [];
      if (this.idEmpresa && !this.showSelectCompany) {
        this.lstCargos = ((await this.perfilService.getCargosTodos(this.idEmpresa).toPromise() as any).datos) as Cargo[];
      } else if (this.company.value) {
        this.lstCargos = ((await this.perfilService.getCargosTodos(this.company.value).toPromise() as any).datos) as Cargo[];
      } else {
        this.lstCargos = ((await this.perfilService.getCargosTodos().toPromise() as any).datos) as Cargo[];
      }
    }
  }

  public async loadList() {

    //se carga la variable de cargos
    this.loadVarCargos().then(() => {
      this.loadCargos();
    });

    /* Carga la variable de Grados para conocer el valor mínimo y máximo y llenar la lista */
    const vGrados = <any>(<any>await this.commonService.getMessageByName(configMsg.GRADOS_CARGO_PERFIL).toPromise()).datos;
    const valorGrados = JSON.parse(vGrados.valor);
    let i = valorGrados.min;
    while (i <= valorGrados.max) {
      const grado = {
        id: '' + i + '',
        value: i
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
    this.lstPersonalSkills = (await this.adminPerfilService.getTipoCompetencia().toPromise() as any).datos;

    /* Carga la lista de títulos académicos */
    this.lstTitles = (await this.commonService.getTitulos().toPromise() as any).datos;

    /* Carga los tipos de estudios adicionales */
    const idCapacitacion = (await this.commonService.getMessageByName(configMsg.ID_PARAMETRO_ADICIONAL_CAPACITACION).toPromise() as any).datos as any;
    this.lstTypeStudy = (await this.perfilService.getTipoAdicionalesPorIdReferencia(idCapacitacion.valor).toPromise() as any).datos;

  }

  private async loadPerfiles(forceLoad: boolean = false) {
    /* Carga la lista de perfiles por empresa */
    if (!Constants.validateList(this.lstAllProfiles) || forceLoad) {
      this.lstAllProfiles = [];
      if (this.idEmpresa && !this.showSelectCompany) {
        this.lstAllProfiles = ((await this.perfilService.getPerfiles(this.idEmpresa).toPromise() as any).datos) as Perfil[];
      } else if (this.company.value) {
        this.lstAllProfiles = ((await this.perfilService.getPerfiles(this.company.value).toPromise() as any).datos) as Perfil[];
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

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    /* Carga la lista de per files */
    await this.loadPerfiles(true);

    this.lstActiveProfiles = [];
    this.dataSource.data = this.lstActiveProfiles;

    if (this.lstAllProfiles.length > 0) {
      this.lstAllProfiles.forEach(e => {

        if (e.idTipoCargoHumano) {
          const cargo: CargoHumano = this.lstCargosHum.find(c => e.idTipoCargoHumano === c.codCargo);
          if (cargo) {
            e.codigoCargo = cargo.codCargo;
            e.cargo = cargo.cargo;
            e.nivelJerarquico = cargo.cargoNivel;
          }
        } else if (e.idTipoCargo) {
          const cargo: Cargo = this.lstCargos.find(c => e.idTipoCargo === c.id);
          if (cargo) {
            e.codigoCargo = cargo.codAlterno;
            e.cargo = cargo.cargo;
            e.nivelJerarquico = cargo.nivelJerarquico;
          }
        }

        this.lstFunctions.forEach(c => {
          if (e.idTipoFuncion === c.id) {
            e.funcion = this.translateField(c, 'funcion', this.lang);
          }
        });

        this.lstPersonalSkills.forEach(c => {
          if (e.idTipoCompetencia === c.id) {
            e.tipoCompetencia = c.competencia;
          }
        });

        this.lstActiveProfiles.push(e);
      });
    }
    this.lstActiveProfiles.sort((a, b) => new Date(b.fechaModificacion).getTime() - new Date(a.fechaModificacion).getTime());
    this.dataSource.data = this.lstActiveProfiles;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sortProfile;
  }

  /**
   * Carga los datos segun la empresa seleccionada
   */
  public async loadDataByCompany(event) {
    this.alertService.loading();
    await this.loadData();
    this.alertService.close();
  }
}
