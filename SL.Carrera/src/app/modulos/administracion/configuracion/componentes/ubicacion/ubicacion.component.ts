import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CommonService } from '@app/core/servicios/common.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { Pais } from '@app/compartido/modelos/pais';
import { Departamento } from '@app/compartido/modelos/departamento';
import { Ciudad } from '@app/compartido/modelos/ciudad';
import { forkJoin, Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.component.html',
  styleUrls: ['./ubicacion.component.scss']
})
export class UbicacionComponent extends BaseController implements OnInit, AfterViewChecked {

  //listas principales
  private lstPaisAll: Pais[] = [];
  private lstDepartamentoAll: Departamento[] = [];
  private lstCiudadAll: Ciudad[] = [];
  public submit = false;
  public showAccordeon = false;

  private lstPaisView: Pais[] = [];
  private lstDepartamentoView: Departamento[] = [];


  //pais
  public displayedColumnsPais: string[] = ['id', 'nacionalidad', 'pais', 'options'];
  public dataSourcePais = new MatTableDataSource<Pais>([]);
  public formPais: FormGroup;
  public selectionPais = new SelectionModel<Pais>(false, []);
  @ViewChild('formViewPais', { static: false }) formViewPais: NgForm;
  @ViewChild('sortPais', { static: false }) set sortPais(value: MatSort) {
    this.dataSourcePais.sort = value;
  }
  @ViewChild('paginatorPais', { static: false }) set paginatorPais(value: MatPaginator) {
    this.dataSourcePais.paginator = value;
  }


  //departamento
  public displayedColumnsDepartamento: string[] = ['id', 'departamento', 'idPais', 'options'];
  public dataSourceDepartamento = new MatTableDataSource<Departamento>([]);
  public formDepartamento: FormGroup;
  public selectionDepartamento = new SelectionModel<Departamento>(false, []);
  @ViewChild('formViewDepartamento', { static: false }) formViewDepartamento: NgForm;
  @ViewChild('sortDepartamento', { static: false }) set sortDepartamento(value: MatSort) {
    this.dataSourceDepartamento.sort = value;
  }
  @ViewChild('paginatorDepartamento', { static: false }) set paginatorDepartamento(value: MatPaginator) {
    this.dataSourceDepartamento.paginator = value;
  }

  //ciudad
  public displayedColumnsCiudad: string[] = ['id', 'ciudad', 'codAlterno', 'idDepartamento', 'idPais', 'options'];
  public dataSourceCiudad = new MatTableDataSource<Ciudad>([]);
  public formCiudad: FormGroup;
  public selectionCiudad = new SelectionModel<Ciudad>(false, []);
  @ViewChild('formViewCiudad', { static: false }) formViewCiudad: NgForm;
  @ViewChild('sortCiudad', { static: false }) set sortCiudad(value: MatSort) {
    this.dataSourceCiudad.sort = value;
  }
  @ViewChild('paginatorCiudad', { static: false }) set paginatorCiudad(value: MatPaginator) {
    this.dataSourceCiudad.paginator = value;
  }

  //EVENTOS COMPONENTE
  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;


  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService) {
    super();
  }

  ngOnInit() {
    C.sendMessage(true, this.messageEvent); // aqui le envia al padre que muestre la barra de carga
    this.loadForm();
    this.loadData();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  private loadForm() {
    this.formPais = this.fb.group(
      {
        id: new FormControl(''),
        nacionalidad: new FormControl('', [Validators.required]),
        pais: new FormControl('', [Validators.required]),
      }
    );

    this.formDepartamento = this.fb.group(
      {
        id: new FormControl(''),
        departamento: new FormControl('', [Validators.required]),
        idPais: new FormControl('', [Validators.required]),
      }
    );

    this.formCiudad = this.fb.group(
      {
        id: new FormControl(''),
        idDepartamento: new FormControl('', [Validators.required]),
        codAlterno: new FormControl('', [Validators.required]),
        ciudad: new FormControl('', [Validators.required]),
        idPais: new FormControl('', [Validators.required]),
      }
    );

    this.dataSourcePais.filterPredicate = (data: Pais, filter: string): boolean => {
      const dataCompare = [data.id, data.pais, data.nacionalidad];
      return C.filterTable(dataCompare, filter);
    }

    this.dataSourceDepartamento.filterPredicate = (data: Departamento, filter: string): boolean => {
      const dataCompare = [data.id, this.getPais(data), data.departamento];
      return C.filterTable(dataCompare, filter);
    }

    this.dataSourceCiudad.filterPredicate = (data: Ciudad, filter: string): boolean => {
      const dataCompare = [data.id, this.getPais(data.departamentoModel), this.getDepartamento(data), data.ciudad, data.codAlterno];
      return C.filterTable(dataCompare, filter);
    }

  }

  private async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    const lstHttp: Observable<any>[] = [];

    lstHttp.push(this.commonService.getCountries());
    lstHttp.push(this.commonService.getDepartamentos());
    lstHttp.push(this.commonService.getCiudades());

    forkJoin(lstHttp)
      .subscribe({
        next: (res: any) => {
          this.lstPaisAll = res[0].paises;
          this.lstDepartamentoAll = res[1].departamentos;
          this.lstCiudadAll = res[2].ciudades;

          this.lstDepartamentoAll.forEach(x => {
            const pais = this.lstPaisAll.find(z => z.id === Number(x.idPais))
            x.paisModel = pais;
          });

          this.lstCiudadAll.forEach(c => {
            const departamento = this.lstDepartamentoAll.find(z => z.id === c.idDepartamento)
            c.departamentoModel = departamento;
          });

          this.lstPaisView = Object.assign([], this.lstPaisAll);

          this.dataSourcePais.data = this.lstPaisAll;
          this.dataSourceDepartamento.data = this.lstDepartamentoAll;
          this.dataSourceCiudad.data = this.lstCiudadAll;

          this.showAccordeon = true;

          C.sendMessage(false, this.messageEvent); // enviar evento que termino cargue al componente padre

        },
        error: (error) => this.alertService.showError(error)
      })

  }


  //pais
  get f() {
    return this.formPais.controls;
  }

  public cleanPais() {
    this.formViewPais.resetForm();
    this.selectionPais.clear();
  }

  public addPais() {
    const elementCurrent: any = this.selectionPais.selected.length > 0 ? this.selectionPais.selected[0] : {};
    if (elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.formViewPais.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }
    this.alertService.loading();

    // validar que no se duplique el registro
    const obj = this.lstPaisAll.find((x: Pais) => this.areEquals(x.nacionalidad, this.f.nacionalidad.value) || this.areEquals(x.pais, this.f.pais.value));
    if (obj) {
      if (Number(this.f.id.value) !== obj.id) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    let newPais: Pais = {
      id: this.f.id.value ? this.f.id.value : undefined,
      nacionalidad: this.f.nacionalidad.value,
      pais: this.f.pais.value,
    };

    //limpia los atributos string
    this.cleanJSON(newPais);

    this.commonService.saveCountry(newPais).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formViewPais.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public editPais(element: Pais) {
    this.selectionPais.toggle(element);
    this.scrollTop();
    this.formPais.patchValue({
      id: element.id,
      nacionalidad: element.nacionalidad,
      pais: element.pais,
    });
  }

  public deletePais(element: Pais) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();

          this.commonService.deletePais(element)
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

  sortDataPais(sort: Sort) {
    const data = this.dataSourcePais.data;
    if (!sort.active || sort.direction === '') {
      this.dataSourcePais.data = data;
      return;
    }

    this.dataSourcePais.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'nacionalidad': return this.compare(a.nacionalidad, b.nacionalidad, isAsc);
        case 'pais': return this.compare(a.pais, b.pais, isAsc);
        default: return 0;
      }
    });
  }


  //departamento
  get f2() {
    return this.formDepartamento.controls;
  }

  public cleanDepartamento() {
    this.formViewDepartamento.resetForm();
    this.selectionDepartamento.clear();
  }

  public addDepartamento() {
    const elementCurrent: any = this.selectionDepartamento.selected.length > 0 ? this.selectionDepartamento.selected[0] : {};
    if (elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.formDepartamento.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }
    this.alertService.loading();

    // validar que no se duplique el registro
    const obj = this.lstDepartamentoAll.find((x: Departamento) => this.areEquals(x.departamento, this.f2.departamento.value) && this.areEquals(x.idPais, this.f2.idPais.value));
    if (obj) {
      if (Number(this.f2.id.value) !== obj.id) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    let newElement: Departamento = {
      id: this.f2.id.value ? this.f2.id.value : undefined,
      departamento: this.f2.departamento.value,
      idPais: this.f2.idPais.value,
    };

    //limpia los atributos string
    this.cleanJSON(newElement);

    this.commonService.saveDepartment(newElement).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formViewDepartamento.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public editDepartamento(element: Departamento) {
    this.selectionDepartamento.toggle(element);
    this.scrollTop();
    this.formDepartamento.patchValue({
      id: element.id,
      departamento: element.departamento,
      idPais: element.idPais,
    });
  }

  public deleteDepartamento(element: Departamento) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();

          this.commonService.deleteDepartamento(element)
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

  sortDataDepartamento(sort: Sort) {
    const data = this.dataSourceDepartamento.data;
    if (!sort.active || sort.direction === '') {
      this.dataSourceDepartamento.data = data;
      return;
    }

    this.dataSourceDepartamento.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'departamento': return this.compare(a.departamento, b.departamento, isAsc);
        case 'idPais': return this.compare(this.getPais(a), this.getPais(b), isAsc);
        default: return 0;
      }
    });
  }


  //ciudad
  get f3() {
    return this.formCiudad.controls;
  }

  public cleanCiudad() {
    this.formViewCiudad.resetForm();
    this.selectionCiudad.clear();
    this.lstDepartamentoView = [];
  }

  public addCiudad() {
    const elementCurrent: any = this.selectionCiudad.selected.length > 0 ? this.selectionCiudad.selected[0] : {};
    if (elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!elementCurrent.id && !this.commonService.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }

    if (this.formCiudad.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }
    this.alertService.loading();

    // validar que no se duplique el registro
    const obj = this.lstCiudadAll.find((x: Ciudad) =>
      this.areEquals(x.ciudad, this.f3.ciudad.value) &&
      x.idDepartamento == Number(this.f3.idDepartamento.value) &&
      x.departamentoModel.idPais === this.f3.idPais.value);

    if (obj) {
      if (Number(this.f3.id.value) !== obj.id) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    let newElement: Ciudad = {
      id: this.f3.id.value ? this.f3.id.value : undefined,
      idDepartamento: this.f3.idDepartamento.value,
      ciudad: this.f3.ciudad.value,
      codAlterno: Number(this.f3.codAlterno.value),
    };

    //limpia los atributos string
    this.cleanJSON(newElement);

    this.commonService.saveCity(newElement).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.formViewCiudad.resetForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public editCiudad(element: Ciudad) {
    this.selectionCiudad.toggle(element);
    this.scrollTop();
    this.formCiudad.patchValue({
      id: element.id,
      idDepartamento: element.idDepartamento,
      idPais: element.departamentoModel.idPais,
      ciudad: element.ciudad,
      codAlterno: element.codAlterno,
    });
  }

  public deleteCiudad(element: Ciudad) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();

          this.commonService.deleteCiudad(element)
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

  sortDataCiudad(sort: Sort) {
    const data = this.dataSourceCiudad.data;
    if (!sort.active || sort.direction === '') {
      this.dataSourceCiudad.data = data;
      return;
    }

    this.dataSourceCiudad.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'idDepartamento': return this.compare(this.getDepartamento(a), this.getDepartamento(b), isAsc);
        case 'ciudad': return this.compare(a.ciudad, b.ciudad, isAsc);
        case 'idPais': return this.compare(this.getPais(a.departamentoModel), this.getPais(b.departamentoModel), isAsc);
        default: return 0;
      }
    });
  }

  //metodos
  private getPais(element: Departamento) {
    if (element) {
      if (element.paisModel) {
        return element.paisModel.pais;
      }
    }
    return '';
  }

  private getDepartamento(element: Ciudad) {
    if (element.departamentoModel) {
      return element.departamentoModel.departamento;
    }
    return '';
  }

  public changePais(event: any) {
    if (event.value) {
      this.lstDepartamentoView = this.lstDepartamentoAll.filter(x => x.idPais === event.value);
    } else {
      this.lstDepartamentoView = [];
    }

  }

}
