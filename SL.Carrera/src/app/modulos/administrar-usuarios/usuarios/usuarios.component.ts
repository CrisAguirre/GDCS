import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { FormControl, Validators, FormBuilder, NgForm, FormGroup } from '@angular/forms';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { CommonService } from '@app/core/servicios/common.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { User } from '@app/compartido/modelos/user';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { UsuarioRol } from '@app/compartido/modelos/usuario-rol';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['email', 'stateUser', 'dateCreation', 'dateLastSing', 'sizeTryLogin', 'accountSuspended', 'dateSuspended', 'options']

  public form: FormGroup;
  public submit = false;
  public dataSource = new MatTableDataSource<any>([]);
  public elementCurrent: any = {};

  public lstRoles = [];
  public lstStatesUser = [];
  public updateData: User[] = [];

  @ViewChild('formV', { static: false }) formV: NgForm;
  @Input('path') path: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private configService: AdministracionConfiguracionService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.loadForm();
    this.loadData();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstRoles = (<any>await this.commonService.getRolUsuario().toPromise()).datos;
    this.lstStatesUser = this.ct.getStatesUser();

    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.updateData = (<any> await this.commonService.getUsers().toPromise()).datos;
    if (this.updateData.length > 0) {
      this.updateData.forEach(e => {
        // this.lstRoles.forEach(g => {
        //   if (e.idRol === g.id) {
        //     e.nameRol = g.rol;
        //   }
        // });
        e.stateUser = this.ct.getStateUser(e.estadoUsuario);
      });
    }
    this.dataSource.data = this.updateData;
  }

  public loadForm() {
    this.form = this.fb.group({
      id: new FormControl(''),
      email: new FormControl({ value: '', disabled: true }, [Validators.required]),
      stateUser: new FormControl({ value: '', disabled: true }, [Validators.required]),
      idRol: new FormControl({ value: '', disabled: true }, [Validators.required]),
      sizeTryLogin: new FormControl('', [Validators.required]),
      accountSuspended: new FormControl('', [Validators.required]),
    });
  }

  get f() {
    return this.form.controls;
  }

  public async edit(element: User) {
    this.scrollTop();
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    const lstRolesUsuario: UsuarioRol[] = (<any> await this.commonService.getRolesPorUsuario(element.id).toPromise()).datos;
    if (lstRolesUsuario.length > 0) {
      lstRolesUsuario.forEach(e => {
        // if (Number(e.idRol) !== 1 && Number(e.idRol) !== 2) {
        // }
      });
    }

    this.form.patchValue({
      id: element.id,
      email: element.email,
      stateUser: element.estadoUsuario,
      idRol: lstRolesUsuario[0].idRol,
      sizeTryLogin: element.cantidadIntentosLogin,
      accountSuspended: element.cuentaSuspendida,
    });
  }

  public addconfiguration() {
    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    this.submit = true;
    const user: User = {
      id: this.f.id.value ? this.f.id.value : undefined,
      email: this.f.email.value,
      estadoUsuario: this.f.stateUser.value,
      cantidadIntentosLogin: Number(this.f.sizeTryLogin.value),
      cuentaSuspendida: Number(this.f.accountSuspended.value),
    };

    if (user.id) {
      this.configService.saveInfoUsuario(user).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        console.log('Error', e);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
    } else {
      this.configService.saveUser(user).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        console.log('Error', e);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
    }
  }

  public delete(element: User) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.configService.deleteUser(element)
            .subscribe(ok => {
              this.loadData()
                .then(r => {
                  this.alertService.message(this.ct.DELETE_SUCCESSFULL, TYPES.SUCCES);
                });
            }, err => {
              console.log('Error', err);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR);
            });
        }
      });
  }

}
