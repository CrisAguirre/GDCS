import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { AlertService } from '@app/core/servicios/alert.service';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Convocatoria } from '@app/compartido/modelos/convocatoria';
import { configMsg, stateConvocatoria } from '@app/compartido/helpers/enums';
import { Observable } from 'rxjs';
import { FormGroup, NgForm, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CommonService } from '@app/core/servicios/common.service';
import { TypeSede } from '@app/compartido/modelos/type-sede';
import { TypeConvocatory } from '@app/compartido/modelos/type-convocatory';
import { TypePlace } from '@app/compartido/modelos/type-place';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { FilesService } from '@app/core/servicios/files.service';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';

@Component({
  selector: 'app-convocatoria-info',
  templateUrl: './convocatoria-info.component.html',
  styleUrls: ['./convocatoria-info.component.scss']
})
export class ConvocatoriaInfoComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstConvocatory: Convocatoria[] = [];
  public convocatoryTemp: any[] = [];
  public lstTypeSede: TypeSede[] = [];
  public lstTypeSedeTemp: TypeSede[] = [];
  public lstTypeConvocatory: TypeConvocatory[] = [];
  public lstTypePlace: TypePlace[] = [];
  public lstTypePlaceString: string[] = [];
  public elementCurrent: any = {};
  public submit = false;
  private user = this.commonService.getVar(configMsg.USER);
  public stateConvocatoria = stateConvocatoria;
  public filteredOptions: Observable<any[]>;
  public matcher: any;

  public form: FormGroup;
  public displayedColumns: string[] = ['nombreConvocatoria', 'numeroConvocatoria', 'nombreTipoConvocatoria', 'nombreTipoSede', 'codigoAcuerdo', 'nombreSoporteAcuerdo'];
  public dataSource = new MatTableDataSource<any>([]);


  public idEmpresaT = null;
  // public company: any;
  public company: FormControl = new FormControl({ value: '', disabled: true });
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];
  public lstConvocatoriasByEmpresa: Convocatoria[] = [];

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private adminConvocatoryService: AdministracionConvocatoriaService,
    private convocatoryServices: ConvocatoriaService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private empresaService: EmpresaService,
    private fService: FilesService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngOnInit() {
    this.alertService.loading();
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

    this.dataSource.filterPredicate = (data: Convocatoria, filter: string): boolean => {
      const dataCompare = [data.nombreConvocatoria, data.numeroConvocatoria, data.nombreTipoConvocatoria, data.nombreTipoSede, data.codigoAcuerdo];
      return C.filterTable(dataCompare, filter);
    };
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    let sortedData: any;
    if (!sort.active || sort.direction === '') {
      sortedData = data;
      return;
    }

    sortedData = data.sort((a: Convocatoria, b: Convocatoria) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'nombreConvocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        case 'numeroConvocatoria': return this.compare(a.numeroConvocatoria, b.numeroConvocatoria, isAsc);
        case 'nombreTipoConvocatoria': return this.compare(a.nombreTipoConvocatoria, b.nombreTipoConvocatoria, isAsc);
        case 'seccional': return this.compare(a.nombreTipoSede, b.nombreTipoSede, isAsc);
        case 'codigoAcuerdo': return this.compare(a.codigoAcuerdo, b.codigoAcuerdo, isAsc);
        case 'nombreSoporteAcuerdo': return this.compare(a.idSoporteAcuerdo, b.idSoporteAcuerdo, isAsc);
        default: return 0;
      }
    });

    if (sort.active === 'nombreConvocatoria') {
      if (sort.direction === 'asc') {
        sortedData = this.lstConvocatory.sort((a, b) => a.nombreConvocatoria.localeCompare(b.nombreConvocatoria));
      } else if (sort.direction === 'desc') {
        sortedData = this.lstConvocatory.sort((a, b) => b.nombreConvocatoria.localeCompare(a.nombreConvocatoria));
      } else {
        sortedData = this.lstConvocatory;
      }
    }
  }

  public async loadUserData() {
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

  public async loadConvocatoryByCompany(pCompany: any) {
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstConvocatoriasByEmpresa = (<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise()).datos;
    this.lstConvocatoriasByEmpresa = this.lstConvocatoriasByEmpresa.filter(c => c.estadoConvocatoria === stateConvocatoria.PUBLICADA || c.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES);
    if (this.lstConvocatoriasByEmpresa.length > 0) {
      this.lstConvocatoriasByEmpresa.forEach(e => {

        this.lstTypeConvocatory.forEach(g => {
          if (e.idTipoConvocatoria === Number(g.id)) {
            // e.nombreTipoConvocatoria = g.tipoConvocatoria;
            e.nombreTipoConvocatoria = this.translateField(g, 'tipoConvocatoria', this.lang);
            return;
          }
        });

        this.lstTypePlace.forEach(g => {
          if (e.idTipoLugar === g.id) {
            e.nombreTipoLugar = this.translateField(g, 'lugar', this.lang);
            return;
          }
        });

        this.lstTypeSede.forEach(g => {
          if (e.idTipoSede === g.id) {
            e.nombreTipoSede = this.translateField(g, 'sede', this.lang);
            return;
          }
        });
      });
    }
    this.dataSource.data = this.lstConvocatoriasByEmpresa;
  }

  public loadForm() {
    // this.company = new FormControl('', [Validators.required]);
  }

  get f() {
    return this.form.controls;
  }

  public async loadData() {
    this.lstTypeConvocatory = (await this.adminConvocatoryService.getTipoConvocatoria().toPromise() as any).datos as TypeConvocatory[];
    this.lstTypeSede = (await this.adminConvocatoryService.getTipoSede().toPromise() as any).datos as TypeSede[];
    this.lstTypePlace = (await this.adminConvocatoryService.getTipoLugar().toPromise() as any).datos as TypePlace[];

    if (this.idEmpresaT && !this.showSelectCompany) {
      this.lstConvocatory = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.idEmpresaT).toPromise() as any).datos as Convocatoria[];
      this.lstConvocatory = this.lstConvocatory.filter(c => c.estadoConvocatoria === stateConvocatoria.PUBLICADA || c.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES);
    } else if (this.company.value) {
      this.lstConvocatory = (await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.company.value).toPromise() as any).datos as Convocatoria[];
      this.lstConvocatory = this.lstConvocatory.filter(c => c.estadoConvocatoria === stateConvocatoria.PUBLICADA || c.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES);
    } else {
      // this.lstConvocatory = (await this.convocatoryServices.getListarConvocatoriasPorEstado(stateConvocatoria.PUBLICADA).toPromise() as any).datos as Convocatoria[];
      this.lstConvocatory = (await this.convocatoryServices.getListarConvocatoriasPublicadas().toPromise() as any).datos as Convocatoria[];
    }

    if (this.lstConvocatory.length > 0) {
      this.lstConvocatory.forEach(e => {

        this.lstTypeConvocatory.forEach(g => {
          if (e.idTipoConvocatoria === Number(g.id)) {
            // e.nombreTipoConvocatoria = g.tipoConvocatoria;
            e.nombreTipoConvocatoria = this.translateField(g, 'tipoConvocatoria', this.lang);
            return;
          }
        });

        this.lstTypePlace.forEach(g => {
          if (e.idTipoLugar === g.id) {
            e.nombreTipoLugar = this.translateField(g, 'lugar', this.lang);
            return;
          }
        });

        this.lstTypeSede.forEach(g => {
          if (e.idTipoSede === g.id) {
            e.nombreTipoSede = this.translateField(g, 'sede', this.lang);
            return;
          }
        });
      });
    }
    this.dataSource.data = this.lstConvocatory;
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
}
