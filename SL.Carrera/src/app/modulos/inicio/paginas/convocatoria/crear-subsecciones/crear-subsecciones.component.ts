import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, NgForm, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { AlertService, TYPES } from '../../../../../core/servicios/alert.service';
import { ConvocatoriaService } from '../../../../../core/servicios/convocatoria.service';
import { CommonService } from '../../../../../core/servicios/common.service';
import { configMsg, stateConvocatoria } from '../../../../../compartido/helpers/enums';
import { Convocatoria } from '../../../../../compartido/modelos/convocatoria';
import { Seccion } from '../../../../../compartido/modelos/seccion';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { VariableAppModel } from '@app/compartido/modelos/variable-app-model';

@Component({
  selector: 'app-crear-subsecciones',
  templateUrl: './crear-subsecciones.component.html',
  styleUrls: ['./crear-subsecciones.component.scss']
})
export class CrearSubseccionesComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstSubsection: Seccion[] = [];
  public lstAuxSection: Seccion[] = [];
  public lstConvocatory: Convocatoria[] = [];
  public lstConvocatoryAux: Convocatoria[] = [];
  public lstPrimarySection: Seccion[] = [];
  public submit = false;
  private user = this.commonService.getVar(configMsg.USER);

  public form: FormGroup;
  public displayedColumns: string[] = ['nombreConvocatoria', 'idSeccion', 'titulo', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public elementCurrent: any = {};
  public varModificarConvSuperAdmin: VariableAppModel;

  public idEmpresaT = null;
  public company: any;
  public showSelectCompany = false;
  public lstCompanies: Empresa[] = [];
  public lstSeccionByEmpresa: Seccion[] = [];
  public dataConvocatory: Convocatoria;
  public estadoConvocatoria: string;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private convocatoryServices: ConvocatoriaService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private empresaService: EmpresaService,
  ) {
    super();
    this.loadUserData();
    this.loadForm();
    this.alertService.loading();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadData()
      .catch(error => {
        console.log('Error', error);
      })
      .finally(() => {
        this.alertService.close();
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public async loadUserData() {
    this.company = null;
    this.idEmpresaT = null;
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      this.lstCompanies = (<any>await this.empresaService.getListarEmpresas().toPromise()).datos;
    } else {
      this.showSelectCompany = false;
      this.idEmpresaT = this.user.idEmpresa;
    }
  }

  public async loadSeccionByEmpresa(pCompany: any) {
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstSeccionByEmpresa = (<any>await this.convocatoryServices.getSubSeccionByEmpresa(pCompany.value).toPromise()).datos;
    this.lstConvocatoryAux = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise()).datos;
    this.lstAuxSection = <Seccion[]>(<any>await this.convocatoryServices.getSeccionByEmpresa(pCompany.value).toPromise()).datos;

    this.lstConvocatory = [];
    if (this.lstConvocatoryAux.length > 0) {
      this.lstConvocatoryAux.forEach(g => {
        if (g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
          g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
          this.lstConvocatory.push(g);
        }
      });
    }

    if (this.lstSeccionByEmpresa.length > 0) {
      this.lstSeccionByEmpresa.forEach(e => {
        // Cargar las convocatorias
        this.lstConvocatoryAux.forEach(g => {
          if (e.idConvocatoria === g.id) {
            e.nombreConvocatoria = g.nombreConvocatoria;
            e.mostrarOpciones = (g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
              g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
              g.estadoConvocatoria === stateConvocatoria.PUBLICADA) ? true : false;
            return;
          }
        });
        e.mostrarOpciones = e.mostrarOpciones === undefined ? false : e.mostrarOpciones;

        // Cargar las secciones
        this.lstAuxSection.forEach(g => {
          if (e.idSeccion === g.id) {
            e.nombreSeccion = g.titulo;
            return;
          }
        });
      });
    }

    this.dataSource.data = this.lstSeccionByEmpresa;
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.lstSubsection = [];
    this.lstAuxSection = [];
    this.lstConvocatoryAux = [];
  
    this.varModificarConvSuperAdmin = (await this.commonService.getMessageByName(configMsg.MODIFICAR_CONVOCATORIA_SUPERADMIN).toPromise() as any).datos as VariableAppModel;
    if (this.idEmpresaT && !this.showSelectCompany) {
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.lstSubsection = <Seccion[]>(<any>await this.convocatoryServices.getSubSeccionByEmpresa(this.idEmpresaT).toPromise()).datos;
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.lstAuxSection = <Seccion[]>(<any>await this.convocatoryServices.getSeccionByEmpresa(this.idEmpresaT).toPromise()).datos;
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.lstConvocatoryAux = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.idEmpresaT).toPromise()).datos;
    } else if (this.company.value) {
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.lstSubsection = <Seccion[]>(<any>await this.convocatoryServices.getSubSeccionByEmpresa(this.company.value).toPromise()).datos;
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.lstAuxSection = <Seccion[]>(<any>await this.convocatoryServices.getSeccionByEmpresa(this.company.value).toPromise()).datos;
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.lstConvocatoryAux = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.company.value).toPromise()).datos;
    } else {
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.lstSubsection = <Seccion[]>(<any>await this.convocatoryServices.getTodosSeccion().toPromise()).datos;
      this.lstSubsection = this.lstSubsection.filter(x => x.idSeccion !== null);
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.lstAuxSection = <Seccion[]>(<any>await this.convocatoryServices.getTodosSeccion().toPromise()).datos;
      this.lstAuxSection = this.lstAuxSection.filter(x => x.idSeccion === null);
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.lstConvocatoryAux = <Convocatoria[]>(<any>await this.convocatoryServices.getConvocatorias().toPromise()).datos;
    }

    // Cargar combo de convocatorias
    this.lstConvocatory = [];
    if (this.lstConvocatoryAux.length > 0) {
      this.lstConvocatoryAux.forEach(g => {
        if (g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
          g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
          this.lstConvocatory.push(g);
        }
      });
    }

    // Ajustes para la tabla de la actividad
    if (this.lstSubsection.length > 0) {
      this.lstSubsection.forEach(e => {
        // Cargar las convocatorias
        this.lstConvocatoryAux.forEach(g => {
          if (e.idConvocatoria === g.id) {
            e.nombreConvocatoria = g.nombreConvocatoria;
            e.mostrarOpciones = (g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
              g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
              g.estadoConvocatoria === stateConvocatoria.PUBLICADA) ? true : false;
            return;
          }
        });
        e.mostrarOpciones = e.mostrarOpciones === undefined ? false : e.mostrarOpciones;

        // Cargar las secciones
        this.lstAuxSection.forEach(g => {
          if (e.idSeccion === g.id) {
            e.nombreSeccion = g.titulo;
            return;
          }
        });
      });
    }
    this.dataSource.data = this.lstSubsection;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        idConvocatoria: new FormControl(''),
        titulo: new FormControl(''),
        descripcion: new FormControl(''),
        idSeccion: new FormControl({ value: '', disabled: true }),
      }
    );
    this.company = new FormControl('', [Validators.required]);
    this.listenerControls();
  }

  get f() {
    return this.form.controls;
  }

  public async edit(element: Seccion) {
    var convocariaAux = this.lstConvocatoryAux.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }

    this.elementCurrent = C.cloneObject(element);

    let empresa = null;
    if (this.idEmpresaT) {
      empresa = this.idEmpresaT;
    } else if (this.company.value) {
      empresa = this.company.value;
    } else {
      empresa = '';
    }

    // tslint:disable-next-line: no-angle-bracket-type-assertion
    this.lstPrimarySection = <Seccion[]>(<any>await this.convocatoryServices.getObtenerSeccionesPrincipalesPorConvocatoria(element.idConvocatoria, empresa).toPromise()).datos;
    this.scrollTop();
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.id,
      idConvocatoria: element.idConvocatoria,
      titulo: element.titulo,
      descripcion: element.descripcion,
      idSeccion: element.idSeccion,
    });
    this.listenerControls();
  }


  public listenerControls() {
    this.form.controls.idConvocatoria.valueChanges.subscribe(
      r => {
        this.form.controls.idSeccion.setValue('');
        this.form.controls.idSeccion.disable();
        this.lstConvocatory.forEach(e => {
          if (e.id !== '') {
            this.form.controls.idSeccion.enable();
            return;
          }
        });
      }
    );
  }

  public async addSubSeccion() {
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

    if (this.idEmpresaT) {
      this.submit = true;
    } else if (this.company.value) {
      this.idEmpresaT = this.company.value;
    } else {
      this.submit = false;
      return;
    }

    const vSection = this.lstSubsection.find(
      (x: any) =>
        x.titulo.replace(/\s/g, '').toUpperCase() === this.f.titulo.value.replace(/\s/g, '').toUpperCase() &&
        x.idConvocatoria === this.f.idConvocatoria.value && x.idSeccion === this.f.idSeccion.value);
    if (vSection) {
      if ((this.f.id && vSection.id !== this.f.id.value) || !this.f.id) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    const newSubSeccion: Seccion = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      titulo: this.f.titulo.value,
      descripcion: this.f.descripcion.value,
      idSeccion: this.f.idSeccion.value,
      nombreConvocatoria: '',
      idEmpresa: this.idEmpresaT
    };

    this.convocatoryServices.saveSeccion(newSubSeccion).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
          this.form.controls.idSeccion.disable();
        });
      }).catch(error => {
        console.log('Error', error);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
        this.form.controls.idSeccion.disable();
      });

  }

  public delete(element: Seccion) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    var convocariaAux = this.lstConvocatoryAux.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convocatoryServices.deleteSeccion(element)
            .subscribe(ok2 => {
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

  private deleteIsSelected(id) {
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
  }

  public async changeConvocatory(pConvocatory: any) {
    let empresa = null;
    if (this.idEmpresaT) {
      empresa = this.idEmpresaT;
    } else if (this.company.value) {
      empresa = this.company.value;
    } else {
      empresa = '';
    }

    // tslint:disable-next-line: max-line-length no-angle-bracket-type-assertion
    this.lstPrimarySection = <Seccion[]>(<any>await this.convocatoryServices.getObtenerSeccionesPrincipalesPorConvocatoria(pConvocatory.value, empresa).toPromise()).datos;
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
