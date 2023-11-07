import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Constants } from '@app/compartido/helpers/constants';
import { configMsg, PermisosAcciones, stateConvocatoria } from '@app/compartido/helpers/enums';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { DeclinacionModel } from '@app/compartido/modelos/declinacion-model';
import { Empresa } from '@app/compartido/modelos/empresa';
import { User } from '@app/compartido/modelos/user';
import { AlertService } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { VacantesService } from '@app/core/servicios/vacantes.service';
import { TYPES } from '@app/core/servicios/alert.service';

@Component({
  selector: 'app-declinar-vacante',
  templateUrl: './declinar-vacante.component.html',
  styleUrls: ['./declinar-vacante.component.scss']
})
export class DeclinarVacanteComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstCompanies: Empresa[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstTable: DeclinacionModel[] = [];
  public lstDeclinacionesByConvocatoria: DeclinacionModel[] = [];

  private user: User = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public form: FormGroup;
  public submit = false;
  public showSelectCompany = false;
  public matcher: any;
  public sortedData: any;
  public dataConvocatory: Convocatoria;

  public dataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['identificacion', 'nombres', 'apellidos', 'correo', 'observaciones'];

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private convService: ConvocatoriaService,
    private empresaService: EmpresaService,
    private vacanteService: VacantesService
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadForm();
    this.loadUserData()
      .then(async res => {
        this.loadData();
      });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const dataCompare = [
        data.id,
        data.documentoUsuario,
        data.nombresUsuario,
        data.apellidosUsuario,
        data.emailUsuario,
        data.observacionesDeclinacion
      ];
      return Constants.filterTable(dataCompare, filter);
    };
  }

  public sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'identificacion': return this.compare(a.documentoUsuario, b.documentoUsuario, isAsc);
        case 'nombres': return this.compare(a.nombresUsuario, b.nombresUsuario, isAsc);
        case 'apellidos': return this.compare(a.apellidosUsuario, b.apellidosUsuario, isAsc);
        case 'correo': return this.compare(a.emailUsuario, b.emailUsuario, isAsc);
        case 'observaciones': return this.compare(a.observacionesDeclinacion, b.observacionesDeclinacion, isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group({
      idEmpresa: new FormControl(''),
      idConvocatoria: new FormControl(''),
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
    }
  }

  public async loadDataByEmpresa(pCompany: any) {
    this.f.idConvocatoria.setValue('');
    this.f.idConvocatoria.updateValueAndValidity();

    this.lstConvocatories = (await this.convService.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise() as any).datos as Convocatoria[];
    // filtrar las convocatorias activas
    this.lstConvocatories = this.lstConvocatories.filter(g =>
      g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
      g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES ||
      g.estadoConvocatoria === stateConvocatoria.CERRADA
    );

    this.lstTable = [];
    this.dataSource.data = this.lstTable;
  }

  public async loadDataByConvocatoria(pConvocatoria: any, validateSize: boolean = false) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.alertService.loading();

    //#region Convocatoria
    this.dataConvocatory = this.lstConvocatories.find((x: any) => x.id === this.f.idConvocatoria.value);

    if (pConvocatoria.value) {
      this.lstTable = (await this.vacanteService.getDeclinacionesByConvocatoria(pConvocatoria.value).toPromise() as any).datos as DeclinacionModel[];

      const convocatoryCurrent = (await this.convService.getConvocatoriaById(pConvocatoria.value).toPromise() as any).datos as Convocatoria;
      if (!this.f.idEmpresa.value) {
        this.f.idEmpresa.setValue(convocatoryCurrent.idEmpresa);
        this.f.idEmpresa.updateValueAndValidity();
      }

    } else {
      this.lstTable = [];
    }
    this.dataSource.data = this.lstTable;
    this.alertService.close();

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    // carga las convocatorias y filtra las activas y publicadas
    this.lstConvocatories = [];
    if (this.f.idEmpresa.value) {
      this.lstConvocatories = ((await this.convService.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos) as Convocatoria[];
    } else {
      this.lstConvocatories = ((await this.convService.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    }

    // filtrar las convocatorias activas
    this.lstConvocatories = this.lstConvocatories.filter(g =>
      g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
      g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
      g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES
    );

    this.lstTable = [];
    this.dataSource.data = this.lstTable;
  }

}
