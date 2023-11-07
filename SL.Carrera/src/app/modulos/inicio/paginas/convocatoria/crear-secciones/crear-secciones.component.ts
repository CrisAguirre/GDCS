import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, ɵConsole } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { CustomTranslateService } from '../../../../../core/servicios/custom-translate.service';
import { AlertService, TYPES } from '../../../../../core/servicios/alert.service';
import { ConvocatoriaService } from '../../../../../core/servicios/convocatoria.service';
import { CommonService } from '../../../../../core/servicios/common.service';
import { Seccion } from '../../../../../compartido/modelos/seccion';
import { Convocatoria } from '../../../../../compartido/modelos/convocatoria';
import { Constants as C } from '@app/compartido/helpers/constants';
import { configMsg, stateConvocatoria } from '../../../../../compartido/helpers/enums';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { VariableAppModel } from '@app/compartido/modelos/variable-app-model';

@Component({
  selector: 'app-crear-secciones',
  templateUrl: './crear-secciones.component.html',
  styleUrls: ['./crear-secciones.component.scss']
})
export class CrearSeccionesComponent extends BaseController implements OnInit, AfterViewChecked {

  public section: Seccion[] = [];
  public lstConvocatory: Convocatoria[] = [];
  public lstConvocatoryAux: Convocatoria[] = [];
  public submit = false;
  private user = this.commonService.getVar(configMsg.USER);

  public form: FormGroup;
  public displayedColumns: string[] = ['titulo', 'nombreConvocatoria', 'options'];
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
    this.lstSeccionByEmpresa = (<any>await this.convocatoryServices.getSeccionByEmpresa(pCompany.value).toPromise()).datos;
    this.lstConvocatoryAux = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(pCompany.value).toPromise()).datos;

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
      });
    }

    this.dataSource.data = this.lstSeccionByEmpresa;
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }

    this.varModificarConvSuperAdmin = (await this.commonService.getMessageByName(configMsg.MODIFICAR_CONVOCATORIA_SUPERADMIN).toPromise() as any).datos as VariableAppModel;
    this.section = [];
    this.lstConvocatoryAux = [];
    if (this.idEmpresaT && !this.showSelectCompany) {
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.section = <Seccion[]>(<any>await this.convocatoryServices.getSeccionByEmpresa(this.idEmpresaT).toPromise()).datos;
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.lstConvocatoryAux = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.idEmpresaT).toPromise()).datos;
    } else if (this.company.value) {
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.section = <Seccion[]>(<any>await this.convocatoryServices.getSeccionByEmpresa(this.company.value).toPromise()).datos;
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.lstConvocatoryAux = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.company.value).toPromise()).datos;
    } else {
      // tslint:disable-next-line: no-angle-bracket-type-assertion
      this.section = <Seccion[]>(<any>await this.convocatoryServices.getTodosSeccion().toPromise()).datos;
      this.section = this.section.filter(x => x.idSeccion === null);
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
    if (this.section.length > 0) {
      this.section.forEach(e => {
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
      });
    }

    this.dataSource.data = this.section;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        idConvocatoria: new FormControl(''),
        titulo: new FormControl(''),
        descripcion: new FormControl(''),
        idSeccion: new FormControl(null),
      }
    );

    this.company = new FormControl('', [Validators.required]);
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
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.id,
      idConvocatoria: element.idConvocatoria,
      titulo: element.titulo,
      descripcion: element.descripcion,
      idSeccion: element.idSeccion,
    });
  }

  public async addSeccion() {
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

    const vSection = this.section.find(
      (x: any) =>
        x.titulo.replace(/\s/g, '').toUpperCase() === this.f.titulo.value.replace(/\s/g, '').toUpperCase() &&
        x.idConvocatoria === this.f.idConvocatoria.value);
    if (vSection) {
      if ((this.f.id && vSection.id !== this.f.id.value) || !this.f.id) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newSeccion: Seccion = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      titulo: this.f.titulo.value,
      descripcion: this.f.descripcion.value,
      idSeccion: this.f.idSeccion.value,
      idEmpresa: this.idEmpresaT
    };

    this.convocatoryServices.saveSeccion(newSeccion).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formV.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(error => {
        console.log('Error', error);
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public delete(element: Seccion) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
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
