import { UsuarioRol } from './../../../compartido/modelos/usuario-rol';
import { Component, OnInit, AfterViewChecked, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from 'src/app/compartido/helpers/constants';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { CommonService } from '@app/core/servicios/common.service';
import { PermisosAcciones, statesUser, configMsg } from '@app/compartido/helpers/enums';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { User } from '@app/compartido/modelos/user';
import { LoginService } from '@app/core/servicios/login.service';
import { EmpresaUsuario } from '@app/compartido/modelos/empresa-usuario';
import { RolModel } from '@app/compartido/modelos/rol-model';
import { ok } from 'assert';

@Component({
  selector: 'app-crear-usuarios',
  templateUrl: './crear-usuarios.component.html',
  styleUrls: ['./crear-usuarios.component.scss']
})
export class CrearUsuariosComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstStatesUser = [];
  public lstUsers: User[] = [];
  public lstUsuariosRol: UsuarioRol[] = [];
  public lstEmpresas: Empresa[] = [];
  public lstEmpresasUsuario: EmpresaUsuario[] = [];
  // public lstRolUsuarioEmpresa: RolModel[] = [];
  public lstRolUsuarioPorEmpresa: RolModel[] = [];
  public lstRoles: RolModel[] = [];
  private user = this.commonService.getVar(configMsg.USER);

  public elementCurrent: any = {};
  // public elementCurrent: any = null;
  public revealPassword = true;
  public idEmpresaUsuario: any;
  public idRolUsuario: any;

  public submit: boolean;
  public form: FormGroup;

  public displayedColumns: string[] = ['email', 'estado', 'empresa', 'rol', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public sortedData: any;

  public idEmpresaT = null;
  public company: any;
  public showSelectCompany = false;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @Input('path') path: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private commonService: CommonService,
    private empresaService: EmpresaService,
    public loginService: LoginService,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService
  ) {
    super();
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

  public async loadUserData() {
    this.idEmpresaT = null;
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      this.lstEmpresas = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
    } else {
      this.showSelectCompany = false;
      this.idEmpresaT = this.user.idEmpresa;
      this.f.idEmpresa.setValue(this.user.idEmpresa);
      this.f.idEmpresa.setValidators([]);
      this.f.idEmpresa.updateValueAndValidity();
    }
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
        case 'email': return this.compare(a.email, b.email, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    this.lstUsuariosRol = (await this.commonService.getListarTodosUsuarioRol().toPromise() as any).datos;

    this.lstEmpresasUsuario = (await this.commonService.getListarTodosEmpresaUsuario().toPromise() as any).datos;

    this.idEmpresaT = null;
    if (this.user.idRol !== 1) {
      this.lstUsers = (await this.commonService.getTodosUsuariosAdministrativosByEmpresa(this.f.idEmpresa.value).toPromise() as any).datos;
      this.lstRolUsuarioPorEmpresa = (await this.commonService.getRolesPorEmpresa(this.f.idEmpresa.value).toPromise() as any).datos;
    } else {
      this.lstEmpresas = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
      this.lstUsers = (await this.commonService.getTodosUsuariosAdministrativos().toPromise() as any).datos;
    }

    if (this.lstUsers.length > 0) {
      this.lstUsers.forEach(e => {
        e.stateUser = this.ct.getStateUser(e.estadoUsuario);

        e.usuarioRol = this.lstUsuariosRol.find(x => Number(x.idRol) === e.idRol && x.idEmpresa === e.idEmpresa && x.idUsuario === e.id);
      });
    }
    this.dataSource.data = this.lstUsers;

    // this.lstStatesUser = this.ct.getStatesUser();
    this.lstRoles = (await this.commonService.getRolUsuario().toPromise() as any).datos;

  }

  public loadForm() {
    this.form = this.fb.group({
      id: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(C.PATTERN_EMAIL_CTRL)]),
      /* stateUser: new FormControl(''), */
      idEmpresa: new FormControl(''),
      idRolEmpresa: new FormControl('', [Validators.required])
    });

    this.listenerControls();
  }

  get f() {
    return this.form.controls;
  }

  public async loadRoles(pEmpresa: any) {
    this.form.patchValue({
      idRolEmpresa: ''
    });

    this.lstRolUsuarioPorEmpresa = (await this.commonService.getRolesPorEmpresa(pEmpresa.value).toPromise() as any).datos;
  }

  public async edit(element: User) {
    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();
    this.listenerControls();

    /* Carga Rol Empresa */
    // this.lstRolUsuarioPorEmpresa = (<any>await this.commonService.getRolesPorEmpresa(lstRolesUsuario[0].idEmpresa).toPromise()).datos;
    this.lstRolUsuarioPorEmpresa = (<any>await this.commonService.getRolesPorEmpresa(element.idEmpresa).toPromise()).datos;

    /* Busca UsuarioRol */
    let rolUsuarioActual = null;
    const lstRolesUsuario: UsuarioRol[] = (await this.commonService.getRolesPorUsuario(element.id).toPromise() as any).datos;
    if (lstRolesUsuario.length > 0) {
      rolUsuarioActual = lstRolesUsuario.find(r => Number(r.idRol) === element.idRol && r.idEmpresa === element.idEmpresa);
      if (rolUsuarioActual) {
        this.idRolUsuario = rolUsuarioActual.id;
        // this.idEmpresaUsuario = rolUsuarioActual.idEmpresa;
      }
    }

    /* Busca EmpresaUsuario */
    const lstEmpresaPorUsuario: EmpresaUsuario[] = (<any>await this.commonService.getListarEmpresasPorUsuario(element.id).toPromise()).datos;
    if (lstEmpresaPorUsuario.length > 0) {
      const empresaUsuarioActual = lstEmpresaPorUsuario.find(e => e.idEmpresa === element.idEmpresa && Number(e.idRol) === element.idRol);
      if (empresaUsuarioActual) {
        this.idEmpresaUsuario = empresaUsuarioActual.id;
      }
    }

    this.form.patchValue({
      id: element.id,
      email: element.email,
      // stateUser: element.estadoUsuario,
      idEmpresa: rolUsuarioActual.idEmpresa,
      idRolEmpresa: rolUsuarioActual.idRol
    });
    // this.listenerControls();
  }

  public listenerControls() {
    if (this.user.idRol !== 1) {
      this.f.idEmpresa.setValue(this.user.idEmpresa);
      this.f.idEmpresa.setValidators([]);
      this.f.idEmpresa.updateValueAndValidity();
    }

    this.form.controls.idEmpresa.valueChanges.subscribe(
      r => {
        this.form.controls.idRolEmpresa.setValue('');

      }
    );

    if (this.elementCurrent.id || this.f.id.value) {
      this.f.email.disable();
    } else {
      this.f.email.enable();
    }
    this.f.email.updateValueAndValidity();
  }

  public async save2() {
    /* Valida si el usuario actual tiene permisos para crear y actualizar */
    if (this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    /* Valida si el formulario es valido */
    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    this.alertService.loading();

    /* Objeto para registrar en Usuario */
    const userN = {
      id: undefined,
      email: this.f.email.value,
      estadoUsuario: statesUser.FORCE_CHANGE_PASSWORD,
    };

    /* Objeto para registrar en UsuarioRol */
    const usuarioRolN: UsuarioRol = {
      id: undefined,
      idUsuario: '',
      idRol: this.f.idRolEmpresa.value,
      idEmpresa: this.f.idEmpresa.value
    };

    /* Objeto para registrar en EmpresaUsuario */
    const empresaUsuarioN: EmpresaUsuario = {
      id: undefined,
      idUsuario: '',
      idEmpresa: this.f.idEmpresa.value
    };

    const usuarioExiste = (await this.commonService.getUsuarioPorEmail(this.f.email.value).toPromise() as any).datos;
    if (usuarioExiste.id) {
      const lstRolesUsuario: UsuarioRol[] = (await this.commonService.getRolesPorUsuario(usuarioExiste.id).toPromise() as any).datos;
      const rolUsuarioBuscado = lstRolesUsuario.find(x => Number(x.idRol) === 2 || x.rol === 'usuario');
      if (rolUsuarioBuscado && !this.f.id.value) {
        this.alertService.message(this.ct.USER_EXISTS, TYPES.WARNING);
        this.formV.resetForm();
        this.submit = false;
        return;
      }

      const lstEmpresaByUsuario: EmpresaUsuario[] = (await this.commonService.getListarEmpresasPorUsuario(usuarioExiste.id).toPromise() as any).datos;
      const existeEmpresaUsuario = lstEmpresaByUsuario.find(e => e.idEmpresa === this.f.idEmpresa.value);
      if (existeEmpresaUsuario) {        
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        // this.formV.reset();
        this.submit = false;
        return;
      } else if (this.f.id.value) {
        /* Objeto para registrar en UsuarioRol */
        const usuarioRolEditar: UsuarioRol = {
          id: this.idRolUsuario ? this.idRolUsuario : undefined,
          idUsuario: this.elementCurrent.id,
          idRol: this.f.idRolEmpresa.value,
          idEmpresa: this.f.idEmpresa.value
        };

        /* Objeto para registrar en EmpresaUsuario */
        const empresaUsuarioEditar: EmpresaUsuario = {
          id: this.idEmpresaUsuario ? this.idEmpresaUsuario : undefined,
          idEmpresa: this.f.idEmpresa.value,
          idUsuario: this.elementCurrent.id
        };

        this.commonService.saveUsuarioRol(usuarioRolEditar).toPromise()
          .then(ok => {
            this.commonService.saveEmpresaUsuario(empresaUsuarioEditar).toPromise()
              .then(ok2 => {
                this.loadData().then(() => {
                  this.cleanForm();
                  this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                    .finally(() => this.submit = false);
                });
              }).catch(e => {
                this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                  .finally(() => this.submit = false);
              });
          }).catch(e => {
            this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
              .finally(() => this.submit = false);
          });
      } else {
        userN.id = usuarioExiste.id;
        userN.estadoUsuario = statesUser.FORCE_CHANGE_PASSWORD;

        usuarioRolN.idUsuario = usuarioExiste.id;
        usuarioRolN.idRol = this.f.idRolEmpresa.value;
        usuarioRolN.idEmpresa = this.f.idEmpresa.value;

        empresaUsuarioN.idUsuario = usuarioExiste.id;
        empresaUsuarioN.idEmpresa = this.f.idEmpresa.value;

        this.commonService.saveUsuarioRol(usuarioRolN).toPromise()
          .then(ok1 => {
            this.commonService.saveEmpresaUsuario(empresaUsuarioN).toPromise()
              .then(ok2 => {
                this.loadData().then(() => {
                  this.cleanForm();
                  this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                    .finally(() => this.submit = false);
                });
              }).catch(err => {
                console.log('error', err);
                this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                  .finally(() => this.submit = false);
              });
          }).catch(er => {
            console.log('error', er);
            this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
              .finally(() => this.submit = false);
          });
      }
    } else {
      /* Usuario no existe */
      userN.id = undefined;
      userN.estadoUsuario = statesUser.FORCE_CHANGE_PASSWORD;

      usuarioRolN.idRol = this.f.idRolEmpresa.value;
      usuarioRolN.idEmpresa = this.f.idEmpresa.value;

      empresaUsuarioN.idEmpresa = this.f.idEmpresa.value;

      this.commonService.saveUserAdmin(userN).toPromise()
        .then((record: any) => {
          userN.id = userN.id ? userN.id : record.id;
          usuarioRolN.idUsuario = userN.id;
          empresaUsuarioN.idUsuario = userN.id;
          this.commonService.saveUsuarioRol(usuarioRolN).toPromise()
            .then(ok1 => {
              this.commonService.saveEmpresaUsuario(empresaUsuarioN).toPromise()
                .then(ok2 => {
                  this.loadData().then(() => {
                    this.cleanForm();
                    this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                      .finally(() => this.submit = false);
                  });
                }).catch(err => {
                  console.log('error', err);
                  this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                    .finally(() => this.submit = false);
                });
            }).catch(er => {
              console.log('error', er);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            });
        }).catch(e => {
          console.log('error', e);
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
            .finally(() => this.submit = false);
        });
    }
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

    const obj = this.dataSource.data.find((x: User) => this.areEquals(x.email, this.f.email.value) && x.idRol === Number(this.f.idRolEmpresa.value) && this.areEquals(x.idEmpresa, this.f.idEmpresa.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    /* Objeto para registrar en Usuario */
    const user = {
      id: this.f.id.value ? this.f.id.value : undefined,
      email: this.f.email.value,
      estadoUsuario: statesUser.FORCE_CHANGE_PASSWORD,
      idRol: this.f.idRolEmpresa.value
    };

    /* Objeto para registrar en UsuarioRol */
    const usuarioRol: UsuarioRol = {
      id: this.idRolUsuario ? this.idRolUsuario : undefined,
      idUsuario: '',
      idRol: this.f.idRolEmpresa.value,
      idEmpresa: this.f.idEmpresa.value
    };

    /* Objeto para registrar en EmpresaUsuario */
    const empresaUsuario: EmpresaUsuario = {
      id: this.idEmpresaUsuario ? this.idEmpresaUsuario : undefined,
      idEmpresa: this.f.idEmpresa.value,
      idUsuario: ''
    };

    // this.alertService.loading();
    /* this.loginService.registerUserAdmin(user).toPromise()
      .then((record: any) => {
        user.id = user.id ? user.id : record.id;
        usuarioRol.idUsuario = user.id;
        empresaUsuario.idUsuario = user.id;
        this.commonService.saveUsuarioRol(usuarioRol).toPromise()
          .then(ok => {
            this.commonService.saveEmpresaUsuario(empresaUsuario).toPromise()
              .then(ok2 => {
                this.loadData().then(() => {
                  this.cleanForm();
                  this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                    .finally(() => this.submit = false);
                });
              });
          }).catch(e => {
            this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
              .finally(() => this.submit = false);
          });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      }); */
  }

  public activarUsuario(element: User, updateTo: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }

    this.alertService.comfirmation(this.ct.ACTIVATE_USER, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.commonService.modificarEstadoUsuarioActivo(element.id).toPromise()
            .then(ok => {
              this.loadData().then(() => {
                this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                  .finally(() => this.submit = false);
              });
            }).catch(error => {
              console.log('Error', error);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            });
        }
      });
  }

  public desactivarUsuario(element: User, updateTo: any) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }

    this.alertService.comfirmation(this.ct.DEACTIVATE_USER, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.commonService.modificarEstadoUsuarioInactivo(element.id).toPromise()
            .then(ok => {
              this.loadData().then(() => {
                this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                  .finally(() => this.submit = false);
              });
            }).catch(error => {
              console.log('Error', error);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            });
        }
      });
  }

  public async deletePermisosUsuarioRolEmpresa(element: any) {
    /* Busca UsuarioRol */
    const lstRolesUsuario: UsuarioRol[] = (await this.commonService.getRolesPorUsuario(element.id).toPromise() as any).datos;
    if (lstRolesUsuario.length > 0) {
      const rolUsuarioActual = lstRolesUsuario.find(r => Number(r.idRol) === element.idRol && r.idEmpresa === element.idEmpresa);
      if (rolUsuarioActual) {
        this.idRolUsuario = rolUsuarioActual.id;
        // this.idEmpresaUsuario = rolUsuarioActual.idEmpresa;
      }
    }

    /* Busca EmpresaUsuario */
    const lstEmpresaPorUsuario: EmpresaUsuario[] = (await this.commonService.getListarEmpresasPorUsuario(element.id).toPromise() as any).datos;
    if (lstEmpresaPorUsuario.length > 0) {
      const empresaUsuarioActual = lstEmpresaPorUsuario.find(e => e.idEmpresa === element.idEmpresa && Number(e.idRol) === element.idRol);
      if (empresaUsuarioActual) {
        this.idEmpresaUsuario = empresaUsuarioActual.id;
      }
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.commonService.deleteEmpresaUsuario(this.idEmpresaUsuario).toPromise()
            .then(ok1 => {
              this.commonService.deleteUsuarioRol(this.idRolUsuario).toPromise()
                .then(ok2 => {
                  this.loadData().then(() => {
                    this.cleanForm();
                    this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
                      .finally(() => this.submit = false);
                  });
                }).catch(err => {
                  console.log('error', err);
                  this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                    .finally(() => this.submit = false);
                });
            }).catch(e => {
              console.log('error', e);
              this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
                .finally(() => this.submit = false);
            });
        }
      });
  }

  public verifyActions(element: User) {
    let btnStates = {
      btnEdit: false,
      btnActive: false,
      btnInactive: false,
    };
    switch (element.estadoUsuario) {
      case statesUser.ACTIVE:
        btnStates.btnEdit = true;
        btnStates.btnInactive = true;
        break;

      case statesUser.PENDING_ACTIVATION:
        btnStates.btnActive = true;
        btnStates.btnEdit = true;
        btnStates.btnInactive = true;
        break;

      case statesUser.INACTIVE:
        btnStates.btnActive = true;
        break;

      case statesUser.FORCE_CHANGE_PASSWORD:
        btnStates.btnEdit = true;
        btnStates.btnActive = true;
        btnStates.btnInactive = true;
        break;
    }

    return btnStates;
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
    this.idEmpresaUsuario = null;
    this.idRolUsuario = null;
    this.listenerControls();
  }

  public noSpace(event): void {
    if (event.which === 32) {
      event.preventDefault();
    }
  }
}
