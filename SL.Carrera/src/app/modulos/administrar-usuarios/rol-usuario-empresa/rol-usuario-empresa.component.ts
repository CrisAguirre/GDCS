import { RolModel } from './../../../compartido/modelos/rol-model';
import { Component, OnInit, AfterViewChecked, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { NgForm, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator, MatSort, Sort, MatTableDataSource } from '@angular/material';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Constants as C } from '@app/compartido/helpers/constants';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { Empresa } from '@app/compartido/modelos/empresa';

@Component({
  selector: 'app-rol-usuario-empresa',
  templateUrl: './rol-usuario-empresa.component.html',
  styleUrls: ['./rol-usuario-empresa.component.scss']
})
export class RolUsuarioEmpresaComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstEmpresas: Empresa[] = [];
  public lstRolUsuarioEmpresa: RolModel [] = [];
  public elementCurrent: any = {};
  public form: FormGroup;
  public displayedColumns: string[] = ['rol', 'empresa', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public sortedData: any;
  public submit = false;

  @Input('path') path: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private ct: CustomTranslateService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private empresaService: EmpresaService,
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadForm();
    this.loadData();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'rol': return this.compare(a.rol, b.rol, isAsc);
        case 'empresa': return this.compare(a.empresa, b.empresa, isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        rol: new FormControl('', [Validators.required]),
        idEmpresa: new FormControl('')
      }
    );
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstEmpresas = (<any> await this.empresaService.getListarEmpresas().toPromise()).datos;

    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstRolUsuarioEmpresa = (<any> await this.commonService.getRolUsuario().toPromise()).datos;
    if (this.lstRolUsuarioEmpresa.length > 0) {
      this.lstRolUsuarioEmpresa.forEach(e => {
        if (e.idEmpresa) {
          this.lstEmpresas.forEach(c => {
            if (c.id === e.idEmpresa) {
              e.empresa = c.nombreEmpresa;
            }
          });
        }
      });
    }

    this.dataSource.data = this.lstRolUsuarioEmpresa;
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: RolModel) {
    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();
    this.form.patchValue({
      id: element.id,
      rol: element.rol,
      idEmpresa: element.idEmpresa
    });
  }

  public save() {
    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    const obj = this.dataSource.data.find((x: RolModel) => this.areEquals(x.rol, this.f.rol.value) && this.areEquals(x.idEmpresa, this.f.idEmpresa.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    // const tempsObj = this.dataSource.data.find((x: RolModel) => x.rol.toLowerCase().includes(this.f.rol.value) && x.idEmpresa === this.f.idEmpresa.value);

    if (!this.f.idEmpresa.value) {
      this.f.idEmpresa.setValue(null);
    }

    const newRol: RolModel = {
      id: this.f.id.value ? this.f.id.value : undefined,
      rol: this.f.rol.value,
      idEmpresa: this.f.idEmpresa.value
    };

    this.alertService.loading();
    this.commonService.saveRolUsuario(newRol).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public delete(element: RolModel) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          if (this.elementCurrent.id === element.id) {
            this.formV.resetForm();
            this.elementCurrent = {};
          }
          this.commonService.deleteRolUsuario(element)
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

  private deleteIsSelected(id) {
    if (this.elementCurrent.id === id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
  }
}
