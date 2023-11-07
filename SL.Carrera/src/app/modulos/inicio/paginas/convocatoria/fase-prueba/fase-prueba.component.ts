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
import { VariableAppModel } from '@app/compartido/modelos/variable-app-model';

@Component({
  selector: 'app-fase-prueba',
  templateUrl: './fase-prueba.component.html',
  styleUrls: ['./fase-prueba.component.scss']
})
export class FasePruebaComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstTable: TipoFasePruebaModel[] = [];
  public lstTipoFasesPruebaAll: TipoFasePruebaModel[] = [];
  public lstConvocatoriesAll: Convocatoria[] = [];
  public lstConvocatories: Convocatoria[] = [];
  public lstTipoFases: TipoFaseModel[] = [];
  public lstPruebas: TipoPrueba[] = [];
  public submit = false;
  private user = this.commonService.getVar(configMsg.USER);
  public elementCurrent: any = {};
  public varModificarConvSuperAdmin: VariableAppModel;
  public dataConvocatory: Convocatoria;
  public estadoConvocatoria: string;

  public company: FormControl = new FormControl('');

  public form: FormGroup;
  public displayedColumns: string[] = ['idConvocatoria', 'idTipoFase', 'idTipoPrueba', 'options'];
  public dataSource = new MatTableDataSource<TipoFasePruebaModel>([]);
  public sortedData: any;

  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];

  public filterConvocatories = () => {
    const lst = this.lstTipoFasesPruebaAll.filter(x => {
      x.convocatoria = this.lstConvocatories.find(z => z.id === x.idConvocatoria);
      if (x.convocatoria) {
        x.prueba = this.lstPruebas.find(z => z.id === x.idPrueba);
        x.fase = this.lstTipoFases.find(z => z.id === x.idFase);
        return true;
      }
      return false;
    });
    return lst;
  }


  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private cs: ConvocatoriaService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private convService: AdministracionConvocatoriaService,
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
    this.loadForm();
    this.loadUserData().then(() => {
      this.loadData().then(() => this.alertService.close());
    });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: TipoFasePruebaModel, filter: string): boolean => {
      const dataCompare = [
        data.convocatoria.nombreConvocatoria,
        data.prueba['tipoPrueba' + this.lang],
        data.fase['nombreFase' + this.lang]];
      return C.filterTable(dataCompare, filter);
    };
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
      this.company.setValue(this.user.idEmpresa);
      this.company.setValidators([]);
      this.company.updateValueAndValidity();
    }
  }

  public async loadDataByEmpresa(pCompany: any) {
    this.lstConvocatoriesAll = (await this.cs.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise() as any).datos as Convocatoria[];
    this.lstConvocatories = [];

    //filtrar las convocatorias activas
    this.lstConvocatories = [];
    this.lstConvocatories = this.lstConvocatoriesAll;
    // this.lstConvocatories = this.lstConvocatoriesAll.filter(x => {
    //   if (x.estadoConvocatoria === stateConvocatoria.ACTIVO ||
    //     x.estadoConvocatoria === stateConvocatoria.PUBLICADA) {
    //   }
    // });

    this.lstTable = this.filterConvocatories();

    this.loadData();
  }

  public loadDataByConvocatoria(pConvocatoria: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    
    this.lstTable = this.filterConvocatories();
    //#region Convocatoria
    this.dataConvocatory = this.lstConvocatoriesAll.find((x: any) => x.id === this.f.idConvocatoria.value);

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
    this.varModificarConvSuperAdmin = (await this.commonService.getMessageByName(configMsg.MODIFICAR_CONVOCATORIA_SUPERADMIN).toPromise() as any).datos as VariableAppModel;
    this.lstTipoFasesPruebaAll = (await this.convService.getTipoFasePrueba().toPromise() as any).datos as TipoFasePruebaModel[];
    this.lstConvocatoriesAll = [];

    //carga las convocatorias y filtra las activas y publicadas
    this.lstConvocatoriesAll = [];
    this.lstConvocatoriesAll = ((await this.cs.getTodosConvocatoriasByEmpresa(this.company.value).toPromise() as any).datos) as Convocatoria[];
    /* if (this.f.idEmpresa.value) {
      this.lstConvocatoriesAll = ((await this.cs.getTodosConvocatoriasByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos) as Convocatoria[];
    } else {
      this.lstConvocatoriesAll = ((await this.cs.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    } */

    //filtrar las convocatorias activas
    this.lstConvocatories = [];
    this.lstConvocatories = this.lstConvocatoriesAll;

    // this.lstConvocatories = this.lstConvocatoriesAll.filter(x => {
    //   if (x.estadoConvocatoria === stateConvocatoria.ACTIVO ||
    //     x.estadoConvocatoria === stateConvocatoria.PUBLICADA) {
    //   }
    // });

    this.lstPruebas = <TipoPrueba[]>(<any>await this.convService.getTipoPruebas().toPromise()).datos;
    this.lstTipoFases = <TipoFaseModel[]>(<any>await this.convService.getTipoFases().toPromise()).datos;

    this.lstTable = this.lstTipoFasesPruebaAll.filter(x => {
      x.convocatoria = this.lstConvocatories.find(z => z.id === x.idConvocatoria);
      if (x.convocatoria) {
        x.prueba = this.lstPruebas.find(z => z.id === x.idPrueba);
        x.fase = this.lstTipoFases.find(z => z.id === x.idFase);
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
        case 'idTipoPrueba': return this.compare(a.prueba['tipoPrueba' + this.lang], b.prueba['tipoPrueba' + this.lang], isAsc);
        case 'idTipoFase': return this.compare(a.fase['nombreFase' + this.lang], b.fase['nombreFase' + this.lang], isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        idEmpresa: new FormControl(''),
        id: new FormControl(''),
        idConvocatoria: new FormControl('', [Validators.required]),
        idTipoPrueba: new FormControl('', [Validators.required]),
        idTipoFase: new FormControl('', [Validators.required]),
      }
    );

  }

  get f() {
    return this.form.controls;
  }

  public async edit(element: TipoFasePruebaModel) {
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    var convocariaAux = this.lstConvocatoriesAll.find((x: any) => x.id === element.idConvocatoria);
    if(!this.modConvSA(convocariaAux)){
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }
      this.scrollTop();
      this.elementCurrent = C.cloneObject(element);

      this.form.patchValue({
        id: element.id,
        idConvocatoria: element.idConvocatoria,
        idTipoPrueba: element.idPrueba,
        idTipoFase: element.idFase,
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

    const obj = this.lstTable.find((x: TipoFasePruebaModel) =>
      this.areEqualsValues(x.idConvocatoria, this.f.idConvocatoria.value) &&
      this.areEqualsValues(x.idPrueba, this.f.idTipoPrueba.value) &&
      this.areEqualsValues(x.idFase, this.f.idTipoFase.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    this.alertService.loading();

    const newItem: TipoFasePruebaModel = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idConvocatoria: this.f.idConvocatoria.value,
      idPrueba: this.f.idTipoPrueba.value,
      idFase: this.f.idTipoFase.value,
    };

    this.convService.saveTipoFasePrueba(newItem).toPromise()
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

  public delete(element: TipoFasePruebaModel) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
    
    var convocariaAux = this.lstConvocatoriesAll.find((x: any) => x.id === element.idConvocatoria);
    if(!this.modConvSA(convocariaAux)){
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }

      this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
        .then(ok => {
          if (ok.value) {
            this.alertService.loading();
            this.deleteIsSelected(element.id);
            this.convService.deleteTipoFasePrueba(element)
              .subscribe(ok2 => {
                this.loadData()
                  .then(r => {
                    this.cleanForm();
                    this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                  });
              }, err => {
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
    this.elementCurrent = {};
    this.dataSource.data = [];
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
