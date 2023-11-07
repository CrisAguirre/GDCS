import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CommonService } from '@app/core/servicios/common.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { LugarPruebas } from '@app/compartido/modelos/lugar-prueba';
import { ConvocatoriaService } from '../../../../../core/servicios/convocatoria.service';
import { configMsg, stateConvocatoria } from '../../../../../compartido/helpers/enums';
import { Departamento } from '@app/compartido/modelos/departamento';
import { Ciudad } from '@app/compartido/modelos/ciudad';
import { Convocatoria } from '../../../../../compartido/modelos/convocatoria';
import { Empresa } from '@app/compartido/modelos/empresa';
import { EmpresaService } from '@app/core/servicios/empresa.service';
import { VariableAppModel } from '@app/compartido/modelos/variable-app-model';

@Component({
  selector: 'app-presentacion-pruebas',
  templateUrl: './presentacion-pruebas.component.html',
  styleUrls: ['./presentacion-pruebas.component.scss']
})
export class PresentacionPruebasComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'convocatoria', 'departamento', 'municipio', 'sitio', 'direccion', 'salon', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public sortedData: any;
  public elementCurrent: any = {};
  public varModificarConvSuperAdmin: VariableAppModel;

  public lstLugarPruebas: LugarPruebas[] = [];

  public lstDepartamento: Departamento[] = [];
  public lstMunicipio: Ciudad[];
  public lstMunicipioAux: Ciudad[];
  public lstConvocatoria: Convocatoria[] = [];
  public lstConvocatoriaAux: Convocatoria[] = [];
  public lstConvocatoriaAll: Convocatoria[] = [];
  public lstEmpresa: Empresa[] = [];

  public idEmpresaT = null;
  // public company: any;
  public company: FormControl = new FormControl('');
  public showSelectCompany = false;

  public dataConvocatory: Convocatoria;
  public estadoConvocatoria: string;

  private user = this.commonService.getVar(configMsg.USER);

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private alertService: AlertService,
    private convocatoryServices: ConvocatoriaService,
    private empresaService: EmpresaService
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
    this.loadUserData();
    this.loadData().then(() => this.alertService.close());
    this.loadpermisos();

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: LugarPruebas, filter: string): boolean => {
      const dataCompare = [data.nombreConvocatoria, data.nombreDepartamento, data.nombreCiudad, data.sitio, data.direccion, data.aula];
      return C.filterTable(dataCompare, filter);
    }
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: LugarPruebas, b: LugarPruebas) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'convocatoria': return this.compare(a.nombreConvocatoria, b.nombreConvocatoria, isAsc);
        case 'departamento': return this.compare(a.nombreDepartamento, b.nombreDepartamento, isAsc);
        case 'municipio': return this.compare(a.nombreCiudad, b.nombreCiudad, isAsc);
        case 'sitio': return this.compare(a.sitio, b.sitio, isAsc);
        case 'direccion': return this.compare(a.direccion, b.direccion, isAsc);
        case 'salon': return this.compare(a.aula, b.aula, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.varModificarConvSuperAdmin = (await this.commonService.getMessageByName(configMsg.MODIFICAR_CONVOCATORIA_SUPERADMIN).toPromise() as any).datos as VariableAppModel;

    if (this.company.value) {
      this.lstConvocatoria = ((await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.company.value).toPromise() as any).datos) as Convocatoria[];
    } else {
      this.lstConvocatoria = ((await this.convocatoryServices.getConvocatorias().toPromise() as any).datos) as Convocatoria[];
    }
    this.lstConvocatoriaAux = [];
    this.lstConvocatoriaAux = this.lstConvocatoria;
    this.lstMunicipio = (<any>await this.commonService.getCiudades().toPromise()).ciudades;
    this.lstDepartamento = (<any>await this.commonService.getDepartamentos().toPromise()).departamentos;
    
    //this.dataSource.data = this.lstLugarPruebas;
  }

  public async loadUserData() {
    this.showSelectCompany = false;
    if (Number(this.user.idRol) === 1) {
      this.showSelectCompany = true;
      if (!C.validateList(this.lstEmpresa)) {
        this.lstEmpresa = (await this.empresaService.getListarEmpresas().toPromise() as any).datos;
      }
    } else {
      this.showSelectCompany = false;
      this.idEmpresaT = this.user.idEmpresa;
      this.company.setValue(this.user.idEmpresa);
    }
  }

  public async loadpermisos() {
    this.lstConvocatoriaAll = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(this.user.value).toPromise()).datos;
  }

  public async loadEmpresa(empresa: any) {
    this.lstConvocatoriaAux = <Convocatoria[]>(<any>await this.convocatoryServices.getTodosConvocatoriasByEmpresa(empresa.value).toPromise()).datos;
    if (this.lstConvocatoriaAux.length > 0) {
      this.lstConvocatoriaAux.forEach(g => {
        if (g.estadoConvocatoria === stateConvocatoria.ACTIVO ||
          g.estadoConvocatoria === stateConvocatoria.EN_BORRADOR ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA ||
          g.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
          this.lstConvocatoria.push(g);
        }
      });
    }
  }

  public async loadDataByConvocatoria(pConvocatoria: any) {
    this.f.idDepartamento.setValue(null);
    this.f.idCiudad.setValue(null);
    this.f.sitio.setValue(null);
    this.f.direccion.setValue(null);
    this.f.aula.setValue(null);
     this.elementCurrent = {};

    //#region Convocatoria
    this.dataConvocatory = this.lstConvocatoriaAux.find((x: any) => x.id === this.f.idConvocatoria.value);
    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.INACTIVO) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_INACTIVA_MSG;
    } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.PUBLICADA_CON_AJUSTES) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_PUBLICADA_MSG;
    } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.ACTIVO || this.dataConvocatory.estadoConvocatoria === stateConvocatoria.EN_BORRADOR) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_ENCOSTRUCION_MSG;
    } else if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.estadoConvocatoria = this.ct.CONVOCATORIA_CERRADA_MSG;
    } else {
      this.estadoConvocatoria = '';
    }

    this.lstLugarPruebas = <LugarPruebas[]>(<any>await this.convocatoryServices.getObtenerlugarPruebaPorConvocatoria(pConvocatoria.value).toPromise()).datos;

    if (this.lstLugarPruebas.length > 0) {
      this.lstLugarPruebas.forEach(e => {
        this.lstMunicipio.forEach(g => {
          if (e.idCiudad === g.id) {
            e.nombreCiudad = g.ciudad;
            return;
          }
        });

        this.lstDepartamento.forEach(g => {
          if (e.idDepartamento === g.id) {
            e.nombreDepartamento = g.departamento;
            return;
          }
        });

        this.lstConvocatoria.forEach(g => {
          if (e.idConvocatoria === g.id) {
            e.nombreConvocatoria = this.translateField(g, 'nombreConvocatoria', this.lang)
            return;
          }
        });
      });
    }
    this.dataSource.data = this.lstLugarPruebas;

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        idConvocatoria: new FormControl('', [Validators.required]),
        idDepartamento: new FormControl('', [Validators.required]),
        idCiudad: new FormControl('', [Validators.required]),
        sitio: new FormControl('', [Validators.required]),
        direccion: new FormControl('', [Validators.required]),
        aula: new FormControl('')
      }
    );

    // this.company = new FormControl('', [Validators.required]);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: LugarPruebas) {

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }

    var convocariaAux = this.lstConvocatoriaAll.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }
    this.scrollTop();
    this.campoCiudad({value:element.idDepartamento});
    this.loadEmpresa({value:element.idEmpresa});
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.idUsuarioModificacion,
      idConvocatoria: element.idConvocatoria,
      idDepartamento: element.idDepartamento,
      idCiudad: element.idCiudad,
      sitio: element.sitio,
      direccion: element.direccion,
      aula: element.aula
    });
    this.company.setValue(element.idEmpresa);
  }


  public addLugarPublicacion() {

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

    /*const obj = this.dataSource.data.find((x: LugarPruebas) => this.areEquals(x.nombre, this.f.nombre.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }*/

    const newlugarPrueba: LugarPruebas = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idConvocatoria: this.f.idConvocatoria.value,
      idEmpresa: this.idEmpresaT,
      idDepartamento: this.f.idDepartamento.value,
      idCiudad: this.f.idCiudad.value,
      sitio: this.f.sitio.value,
      direccion: this.f.direccion.value,
      aula: this.f.aula.value
    };

    this.convocatoryServices.savelugarPrueba(newlugarPrueba).toPromise()
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

  public delete(element: LugarPruebas) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    if (this.dataConvocatory.estadoConvocatoria === stateConvocatoria.CERRADA) {
      this.alertService.message(this.ct.CONVOCATORIA_CERRADA_MSG, TYPES.WARNING)
      return;
    }
    
    var convocariaAux = this.lstConvocatoriaAll.find((x: any) => x.id === element.idConvocatoria);
    if (!this.modConvSA(convocariaAux)) {
      this.alertService.message(this.ct.INFORMACION_EDITAR_ELIMINAR, TYPES.WARNING);
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convocatoryServices.deletelugarPrueba(element)
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
  public async campoCiudad(idCiudad) {
    this.lstMunicipioAux = (<any>await this.commonService.getCitiesByDepartment(idCiudad.value).toPromise()).ciudades;
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
