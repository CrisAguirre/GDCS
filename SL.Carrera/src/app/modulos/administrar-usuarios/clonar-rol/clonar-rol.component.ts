import { Component, OnInit, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { RolVista } from '@app/compartido/modelos/rol-vista';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Vista } from '@app/compartido/modelos/vista';
import { RolModel } from '@app/compartido/modelos/rol-model';
import { CommonService } from '@app/core/servicios/common.service';
import { configMsg } from '@app/compartido/helpers/enums';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';

@Component({
  selector: 'app-clonar-rol',
  templateUrl: './clonar-rol.component.html',
  styleUrls: ['./clonar-rol.component.scss']
})
export class ClonarRolComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstRolVista: RolVista[] = [];
  public lstVista: Vista[] = [];
  public lstAllRolUsuario: RolModel[] = [];
  public lstRolUsuario: RolModel[] = [];
  public lstEmpresas: Empresa[] = [];
  public showSelectCompany = false;

  private user = this.commonService.getVar(configMsg.USER);

  /* Variables para Clonar rol vista */
  public rolAClonar: any;
  public lstRolUsuario1: RolVista[] = [];
  public lstRolUsuario2: RolVista[] = [];
  public lstRolVistasByRolUsuario: RolVista[] = [];
  public lstRolVistasRolUsuarioNuevo: RolVista[] = [];
  public form2: FormGroup;
  public submit2 = false;
  public idRol1 = null;
  public idRol2 = null;


  @ViewChild('formV2', { static: false }) formV2: NgForm;

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
    if (this.user.idRol === 1) {
      this.showSelectCompany = true;
    } else {
      this.showSelectCompany = false;
    }

    this.loadForm2();
    this.loadData();
  }

  public async loadData() {
    //this.lstAllRolUsuario = (await this.commonService.getRolUsuario().toPromise() as any).datos;
    this.lstEmpresas = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
    /* Valida el Rol de usuario */
    if (this.user.idRol === 1) {
      this.lstRolVista = (await this.commonService.getVistasRolUsuario().toPromise() as any).datos;
      this.lstVista = (await this.commonService.getVistas().toPromise() as any).datos;
    } else {
      this.lstRolUsuario = (await this.commonService.getRolesPorEmpresa(this.user.idEmpresa).toPromise() as any).datos;
      this.lstRolUsuario1 = (await this.commonService.getRolesPorEmpresa(this.user.idEmpresa).toPromise() as any).datos;
      this.lstRolUsuario2 = (await this.commonService.getRolesPorEmpresa(this.user.idEmpresa).toPromise() as any).datos;
      this.lstRolVista = (await this.commonService.getVistasRolByRolUsuario(this.user.idRol).toPromise() as any).datos;
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      const lstTemp = <Vista[]> (<any> await this.commonService.getVistas().toPromise()).datos;
      const lstVistaTemp: Vista[] = [];
      this.lstRolVista.forEach(async x => {
        const obj = lstTemp.find(e => e.id === x.idVista);
        if (obj) {
          lstVistaTemp.push(obj);
        }
      });
      this.lstVista = lstVistaTemp;
    }

    this.lstRolVista.forEach(e => {
      this.lstAllRolUsuario.forEach(g => {
        if (e.idRol === Number(g.id)) {
          e.nombreRol = g.rol;
          e.idEmpresa = g.idEmpresa;
          return;
        }
      });

      this.lstVista.forEach(g => {
        if (e.idVista === g.id) {
          e.nombreVista = g.nombreVista;
          return;
        }
      });

      this.lstEmpresas.forEach(g => {
        if (e.idEmpresa === g.id) {
          e.nombreEmpresa = g.nombreEmpresa;
          return;
        }
      });
    });
  }

  public loadForm2() {
    this.form2 = this.fb.group(
      {
        id: new FormControl(''),
        idRolUsuarioAClonar: new FormControl('', [Validators.required]),
        idRolUsuarioNuevo: new FormControl('', [Validators.required]),
        idEmpresa1: new FormControl('', [Validators.required]),
        idEmpresa2: new FormControl('', [Validators.required]),
      }
    );

    this.listenerControls2();
  }

  get f2() {
    return this.form2.controls;
  }

  public listenerControls2() {
    if (this.user.idRol !== 1) {
      this.f2.idEmpresa1.setValue(this.user.idEmpresa);
      this.f2.idEmpresa1.setValidators([]);
      this.f2.idEmpresa1.updateValueAndValidity();

      this.f2.idEmpresa2.setValue(this.user.idEmpresa);
      this.f2.idEmpresa2.setValidators([]);
      this.f2.idEmpresa2.updateValueAndValidity();
    }
  }

  /* Carga rol vista por rol usuario seleccionado */
  public async loadRolVistaByRolUsuarioClonar(event: any, selectNumber: number) {
    if (selectNumber === 1) {
      this.lstRolVistasByRolUsuario = (await this.commonService.getVistasRolByRolUsuario(event.value).toPromise() as any).datos;
      if (this.lstRolVistasByRolUsuario.length > 0) {
        this.idRol1 = event.value;
      }
    } else if (selectNumber === 2) {
      this.lstRolVistasRolUsuarioNuevo = (await this.commonService.getVistasRolByRolUsuario(event.value).toPromise() as any).datos;
      if (this.lstRolVistasRolUsuarioNuevo.length > 0) {
        this.idRol2 = event.value;
      }
    }
  }

  /* Guardar los roles vista al nuevo rol usuario */
  public saveCloneRolVista() {
    if (this.form2.valid) {
      this.submit2 = true;
    } else {
      this.submit2 = false;
      return;
    }

    if (this.idRol1 === this.idRol2) {
      this.alertService.message(this.ct.DUPLICATE_ROLE, TYPES.WARNING);
      this.submit2 = false;
      return;
    }

    this.alertService.loading();
    const lstRolesVistaTemp = [];
    if (this.lstRolVistasByRolUsuario.length > 0) {
      this.lstRolVistasByRolUsuario.forEach(async e => {
        let idTemp = null;
        if (this.lstRolVistasRolUsuarioNuevo.length > 0) {
          const objTemp = this.lstRolVistasRolUsuarioNuevo.find(x => x.idVista === e.idVista);
          if (objTemp) {
            idTemp = objTemp.id;
          } else {
            idTemp = undefined;
          }
        }
        const newRolVista: RolVista = {
          id: idTemp ? idTemp : undefined,
          permiteCrear: e.permiteCrear,
          permiteLectura: e.permiteLectura,
          permiteActualizar: e.permiteActualizar,
          permiteEliminar: e.permiteEliminar,
          persmisosEspeciales: e.persmisosEspeciales,
          idVista: e.idVista,
          idRol: this.f2.idRolUsuarioNuevo.value,
        };
        lstRolesVistaTemp.push(newRolVista);
        try {
          await this.commonService.saveVistaRolUsuario(newRolVista).toPromise();
        } catch (e) {
          console.log('Error', e);
          this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
            .finally(() => this.submit2 = false);
        }
      });

      this.loadData().then(() => {
        this.formV2.resetForm();
        this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
          .finally(() => this.submit2 = false);
      });
    }
  }

  public async cargarRolesPorEmpresa2(event, selectNumber: number) {
    if (selectNumber === 1) {
      this.lstRolUsuario1 = (await this.commonService.getRolesPorEmpresa(event.value).toPromise() as any).datos;
    } else if (selectNumber === 2) {
      this.lstRolUsuario2 = (await this.commonService.getRolesPorEmpresa(event.value).toPromise() as any).datos;
    }
  }

  public cleanForm2() {
    this.formV2.resetForm();
    this.idRol1 = null;
    this.idRol2 = null;
    this.lstRolUsuario1 = [];
    this.lstRolUsuario2 = [];
  }
}

