import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { Cargo } from '@app/compartido/modelos/cargo';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PerfilService } from '@app/core/servicios/perfil.service';
import { configMsg } from '@app/compartido/helpers/enums';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { TipoCargo } from '@app/compartido/modelos/tipo-cargo';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { Empresa } from '@app/compartido/modelos/empresa';
import { User } from '@app/compartido/modelos/user';
import { EmpresaService } from '@app/core/servicios/empresa.service';

@Component({
  selector: 'app-cargos',
  templateUrl: './cargos.component.html',
  styleUrls: ['./cargos.component.scss']
})

export class CargosComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['cargo', 'codAlterno', 'nivelJerarquico', 'tipoCargo', 'options'];
  public lstCargo: Cargo[] = [];
  public lstTipoCargo: TipoCargo[] = [];
  public dataSource = new MatTableDataSource<any>([]);
  public sortedData: any;
  public form: FormGroup;
  public elementCurrent: any = {};
  public entidadCurrent: any = {};
  private user: User = this.commonService.getVar(configMsg.USER);
  public submit = false;

  public showSelectCompany = false;
  public lstEmpresa: Empresa[] = [];

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private perfilServices: PerfilService,
    private acs: AdministracionConvocatoriaService,
    private empresaService: EmpresaService,
  ) {
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadForm();
    this.loadUserData();
    this.loadData();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  // public async loadUserData() {
  //   this.showSelectCompany = false;
  //   if (Number(this.user.idRol) === 1) {
  //     this.showSelectCompany = true;
  //     this.lstCompanies = (<any>await this.empresaService.getListarEmpresas().toPromise()).datos;
  //   } else {
  //     this.showSelectCompany = false;
  //     this.f.idEmpresa.setValue(this.user.idEmpresa);
  //     this.f.idEmpresa.setValidators([]);
  //     this.f.idEmpresa.updateValueAndValidity();
  //   }
  // }

  public async loadUserData() {
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      if (!C.validateList(this.lstEmpresa)) {
        this.lstEmpresa = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
      }
    } else {
      this.showSelectCompany = false;
      this.f.idEmpresa.setValue(this.user.idEmpresa);
    }
  }

  public async loadEmpresa(){
    this.loadData();
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    //cargar los cargos de empresa
    this.lstCargo = [];
    if (this.f.idEmpresa.value) {
      this.lstCargo = <Cargo[]>(<any>await this.perfilServices.getCargosTodos(this.f.idEmpresa.value).toPromise()).datos;
      // this.lstCargo = this.lstCargo.filter(x => x.idEmpresa === this.f.idEmpresa.value);
    } else {
      this.lstCargo = <Cargo[]>(<any>await this.perfilServices.getCargosTodos().toPromise()).datos;
    }

    this.lstTipoCargo = <TipoCargo[]>(<any>await this.acs.getTipoCargo().toPromise()).datos;
    this.lstCargo.forEach(x => {
      x.tipoCargo = this.lstTipoCargo.find(z => z.id === x.idTipoCargo);
    });
    this.dataSource.data = [];
    this.dataSource.data = this.lstCargo;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        cargo: new FormControl('', [Validators.required]),
        //cargo_En: new FormControl('', [Validators.required]),        
        codAlterno: new FormControl('', [Validators.required]),
        nivelJerarquico: new FormControl('', [Validators.required]),
        idTipoCargo: new FormControl('', [Validators.required]),
        idEmpresa: new FormControl('', [Validators.required]),
      }
    );

    // this.company = new FormControl('', [Validators.required]);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: Cargo) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.idUsuarioModificacion,
      cargo: element.cargo,
      //cargo_En: element.cargo_En, 
      codAlterno: element.codAlterno,
      nivelJerarquico: element.nivelJerarquico,
      idTipoCargo: element.idTipoCargo,
      idEmpresa: element.idEmpresa
    });
  }

  public async addCargo() {
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

    //validar si la empresa esta seleccionada
    if (this.f.idEmpresa.value) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    const obj = this.dataSource.data.find((x: Cargo) =>
      this.areEquals(x.cargo, this.f.cargo.value) &&
      this.areEquals(x.codAlterno, this.f.codAlterno.value) &&
      this.areEquals(x.idEmpresa, this.f.idEmpresa.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newObj: Cargo = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      cargo: this.f.cargo.value,
      cargo_En: null,
      // cargo_En: this.f.cargo_En.value, //se comenta por descicion de jhoana
      codAlterno: this.f.codAlterno.value,
      nivelJerarquico: this.f.nivelJerarquico.value,
      idTipoCargo: this.f.idTipoCargo.value,
      idEmpresa: this.f.idEmpresa.value
    };

    this.perfilServices.saveCargo(newObj).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          // this.formV.resetForm();
          this.cleanFormFields();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(error => {
        console.log('Error', error);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public delete(element: Cargo) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.perfilServices.deleteCargo(element)
            .subscribe(o => {
              this.loadData()
                .then(r => {
                  this.cleanForm();
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              this.alertService.showError(err);
            });
        }
      });
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
    this.dataSource.data = [];
  }

  public cleanFormFields() {
    this.f.id.setValue('');
    this.f.idUsuarioModificacion.setValue('');
    this.f.cargo.setValue('');      
    this.f.codAlterno.setValue('');
    this.f.nivelJerarquico.setValue('');
    this.f.idTipoCargo.setValue('');

    this.f.id.updateValueAndValidity()
    this.f.idUsuarioModificacion.updateValueAndValidity()
    this.f.cargo.updateValueAndValidity()      
    this.f.codAlterno.updateValueAndValidity()
    this.f.nivelJerarquico.updateValueAndValidity()
    this.f.idTipoCargo.updateValueAndValidity()
  }

  private deleteIsSelected(id) {
    if (this.elementCurrent.id === id) {
      this.cleanFormFields();
    }
  }

  public async loadCargosByCompany(event: any) {
    console.log(event);
    this.loadData();
    // if (!event.value) {
    //   this.dataSource.data = [];
    // } else {
    //   this.loadData();
    // }
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
        case 'cargo': return this.compare(a.cargo, b.cargo, isAsc);
        //case 'cargo_En': return this.compare(a.cargo_En, b.cargo_En, isAsc);
        case 'codAlterno': return this.compare(a.codAlterno, b.codAlterno, isAsc);
        case 'nivelJerarquico': return this.compare(a.nivelJerarquico, b.nivelJerarquico, isAsc);
        default: return 0;
      }
    });
  }

  public verifyActions(element: Cargo) {
    const btnStates = {
      btnEdit: true,
      btnDelete: true,
    };

    if (element.idEmpresa !== this.f.idEmpresa.value && this.user.idRol !== 1) {
      btnStates.btnEdit = false;
      btnStates.btnDelete = false;
    } else {
      btnStates.btnEdit = true;
      btnStates.btnDelete = true;
    }
    return btnStates;
  }

}
