import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { CustomTranslateService } from '@app//core/servicios/custom-translate.service';
import { AlertService, TYPES } from '@app//core/servicios/alert.service';
import { ConvocatoriaService } from '@app//core/servicios/convocatoria.service';
import { Convocatoria } from '@app//compartido/modelos/convocatoria';
import { configMsg, stateConvocatoria } from '@app//compartido/helpers/enums';
import { CommonService } from '@app//core/servicios/common.service';
import { TipoPrueba } from '@app/compartido/modelos/tipo-prueba';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { TipoFasePruebaModel } from '@app/compartido/modelos/tipo-fase-prueba-model';
import { TipoFaseModel } from '@app/compartido/modelos/tipo-fase-model';
import { RequisitosConvocatoriaModel } from '@app/compartido/modelos/requisitos-convocatoria-model';
import { LevelStudy } from '@app/compartido/modelos/level-study';
import { User } from '@app/compartido/modelos/user';
import { TituloObtenido } from '@app/compartido/modelos/titulo-obtenido';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-requisitos-convocatoria',
  templateUrl: './requisitos-convocatoria.component.html',
  styleUrls: ['./requisitos-convocatoria.component.scss']
})
export class RequisitosConvocatoriaComponent extends BaseController implements OnInit, AfterViewChecked {


  public lstTable: RequisitosConvocatoriaModel[] = [];
  public lstNacionalidades: any[] = [];
  public lstTituloObtenido: TituloObtenido[] = [];
  private lstRequisitosConvocatoriaAll: RequisitosConvocatoriaModel[] = [];
  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public submit = false;
  private user = this.commonService.getVar(configMsg.USER) as User;
  public elementCurrent: any = {};
  public dropTitulo: IDropdownSettings = {};

  public form: FormGroup;
  public displayedColumns: string[] = ['idConvocatoria', 'nacionalidad', 'idTitulosAcademicos', 'experiencia', 'edadMax', 'options'];
  public dataSource = new MatTableDataSource<RequisitosConvocatoriaModel>([]);
  public sortedData: any;

  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];
  public dataConvocatory: Convocatoria;
  public estadoConvocatoria: string;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public filterConvocatories = () => {
    return this.lstConvocatoriesAll.filter(x => {
      // if (x.estadoConvocatoria === stateConvocatoria.ACTIVO ||
      //   x.estadoConvocatoria === stateConvocatoria.PUBLICADA) {
      // }
      return true;
    });
  }

  constructor(
    private alertService: AlertService,
    private cs: ConvocatoriaService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private empresaService: EmpresaService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.alertService.loading();
    this.loadForm();
    this.loadUserData().then(() => {
      this.loadData()
        .catch(error => {
          this.alertService.showError(error);
        })
        .finally(() => {
          this.alertService.close();
        });
    });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: RequisitosConvocatoriaModel, filter: string): boolean => {
      const dataCompare = [
        data.convocatoria.nombreConvocatoria,
        data.nacionalidad,
        data.experienciaAnios,
        data.experienciaMeses,
        this.getEdad(data),
        this.getNamesTitulos(data)

      ];
      return C.filterTable(dataCompare, filter);
    };
  }

  public getNamesTitulos(data: RequisitosConvocatoriaModel) {
    let titulos = '';
    if (data.lstTituloAcademicos && data.lstTituloAcademicos.length > 0) {
      data.lstTituloAcademicos.forEach(x => {
        titulos += this.translateField(x, 'titulo', this.lang);
      });
    }
    return titulos;
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

  public async loadDataByEmpresa(pCompany: any) {
    this.lstConvocatoriesAll = (await this.cs.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise() as any).datos as Convocatoria[];
    this.lstConvocatories = this.filterConvocatories();
    this.lstTable = this.lstRequisitosConvocatoriaAll;
    //this.dataSource.data = this.lstTable;
  }

  public loadDataByConvocatoria(pConvocatoria: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.f.nacionalidad.setValue(null);
    this.f.idTitulosAcademicos.setValue(null);
    this.f.experienciaAnios.setValue(null);
    this.f.experienciaMeses.setValue(null);
    this.f.edadMin.setValue(null);
    this.f.edadMax.setValue(null);

    //#region Convocatoria
    this.dataConvocatory = this.lstConvocatoriesAll.find((x: any) => x.id === this.f.idConvocatoria.value);

    this.lstTable = this.lstRequisitosConvocatoriaAll.filter(x => {
      x.convocatoria = this.lstConvocatories.find(z => z.id === x.idConvocatoria);
      if (x.convocatoria) {
        return true;
      }
      return false;
    });
    if (pConvocatoria.value) {
      this.lstTable = this.lstTable.filter(x => x.idConvocatoria === pConvocatoria.value);
    }

    this.dataSource.data = this.lstTable;

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.lstNacionalidades = this.ct.lstNacionalities();

    this.lstTituloObtenido = (await this.commonService.getTitulos().toPromise() as any).datos as TituloObtenido[];
    

    this.dropTitulo = {
      singleSelection: false,
      idField: 'id',
      textField: 'titulo' + this.lang,
      selectAllText: this.ct.SELECT_ALL,
      unSelectAllText: this.ct.UNSELECT,
      itemsShowLimit: 3,
      searchPlaceholderText: this.ct.SEARCH,
      allowSearchFilter: true,
      maxHeight: 140
    };

    //carga las convocatorias y filtra las activas y publicadas
    this.lstConvocatoriesAll = [];
    if (this.f.idEmpresa.value) {
      this.lstConvocatoriesAll = ((await this.cs.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos) as Convocatoria[];
    } else {
      this.lstConvocatoriesAll = ((await this.cs.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    }

    //filtrar las convocatorias activas
    this.lstConvocatories = [];
    this.lstConvocatories = this.filterConvocatories();

    this.lstRequisitosConvocatoriaAll = (await this.cs.getRequisitosConvocatoria().toPromise() as any).datos as RequisitosConvocatoriaModel[];

    this.lstTable = this.lstRequisitosConvocatoriaAll.filter(x => {
      x.convocatoria = this.lstConvocatories.find(z => z.id === x.idConvocatoria);
      if (x.convocatoria) {
        if (x.idTitulosAcademicos) {
          x.lstTituloAcademicos = this.lstTituloObtenido.filter(z => x.idTitulosAcademicos.includes(z.id));
        }
        return true;
      }
      return false;
    });

    //this.dataSource.data = this.lstTable;
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
        case 'idConvocatoria': return this.compare(a.convocatoria.nombreConvocatoria, b.convocatoria.nombreConvocatoria, isAsc);
        case 'nacionalidad': return this.compare(a.nacionalidad, b.nacionalidad, isAsc);
        case 'idTitulosAcademicos': return this.compare(a.idTitulosAcademicos, b.idTitulosAcademicos, isAsc);
        case 'experiencia': return this.compare(a.experienciaMeses, b.experienciaMeses, isAsc);
        case 'edadMax': return this.compare(a.edadMax, b.edadMax, isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        idEmpresa: new FormControl('', [Validators.required]),
        id: new FormControl(''),
        idConvocatoria: new FormControl('', [Validators.required]),
        nacionalidad: new FormControl(''),
        idTitulosAcademicos: new FormControl(''),
        experienciaAnios: new FormControl(''),
        experienciaMeses: new FormControl(''),
        edadMin: new FormControl(''),
        edadMax: new FormControl(''),
      }
    );

  }

  get f() {
    return this.form.controls;
  }

  public async edit(element: RequisitosConvocatoriaModel) {
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    let lstTemp: TituloObtenido[] = [];
    if (element.idTitulosAcademicos) {
      lstTemp = this.lstTituloObtenido.filter(x => {
        return element.idTitulosAcademicos.includes(x.id);
      });
    }

    this.form.patchValue({
      id: element.id,
      idConvocatoria: element.idConvocatoria,
      nacionalidad: element.nacionalidad,
      idTitulosAcademicos: lstTemp,
      experienciaAnios: element.experienciaAnios === 0 ? undefined : element.experienciaAnios,
      experienciaMeses: element.experienciaMeses === 0 ? undefined : element.experienciaMeses,
      edadMin: element.edadMin === 0 ? undefined : element.edadMin,
      edadMax: element.edadMax === 0 ? undefined : element.edadMax,
      idEmpresa: element.idEmpresa,
    });
  }

  public async add() {
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

    const obj = this.lstTable.find((x: RequisitosConvocatoriaModel) =>
      this.areEqualsValues(x.idConvocatoria, this.f.idConvocatoria.value) &&
      this.areEqualsValues(x.idEmpresa, this.f.idEmpresa.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    if (this.f.idTitulosAcademicos.value) {
      const lst: TituloObtenido[] = this.f.idTitulosAcademicos.value;
      this.f.idTitulosAcademicos.setValue(lst.length === 0 ? undefined : lst);
    }

    if (!this.f.nacionalidad.value &&
      !this.f.experienciaAnios.value &&
      !this.f.experienciaMeses.value &&
      !this.f.edadMax.value &&
      !this.f.edadMin.value &&
      !this.f.idTitulosAcademicos.value) {
      this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
      this.submit = false;
      return;
    }

    this.alertService.loading();

    const newItem: RequisitosConvocatoriaModel = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idConvocatoria: this.f.idConvocatoria.value,
      nacionalidad: this.f.nacionalidad.value,
      idTitulosAcademicos: null,
      experienciaAnios: this.f.experienciaAnios.value ? Number(this.f.experienciaAnios.value) : 0,
      experienciaMeses: this.f.experienciaMeses.value ? Number(this.f.experienciaMeses.value) : 0,
      edadMin: this.f.edadMin.value ? Number(this.f.edadMin.value) : 0,
      edadMax: this.f.edadMax.value ? Number(this.f.edadMax.value) : 0,
      idEmpresa: this.f.idEmpresa.value,
      idUsuario: this.user.id,
      idUsuarioModificacion: this.user.id,
    };
    if (this.f.idTitulosAcademicos.value) {
      const titulosSeleccionados: TituloObtenido[] = this.f.idTitulosAcademicos.value;
      let idString;
      titulosSeleccionados.forEach(t => {
        idString = idString ? idString + ',' + t.id : t.id;
      });
      newItem.idTitulosAcademicos = idString;
    }

    this.cs.saveRequisitosConvocatoria(newItem).toPromise()
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
  }

  public delete(element: RequisitosConvocatoriaModel) {
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
          this.cs.deleteRequisitosConvocatoria(element.id)
            .subscribe(ok2 => {
              this.loadData()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
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

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
  }

  public getEdad(element: RequisitosConvocatoriaModel) {
    if (element.edadMin === 0 && element.edadMax === 0) {
      return '';
    } else {
      return element.edadMin + ' - ' + element.edadMax;
    }
  }

  public getExperiencia(element: RequisitosConvocatoriaModel) {
    const expString = '';
    if (element.experienciaAnios > 0) {
      return '';
    } else {
      return element.edadMin + ' - ' + element.edadMax;
    }
  }
}
