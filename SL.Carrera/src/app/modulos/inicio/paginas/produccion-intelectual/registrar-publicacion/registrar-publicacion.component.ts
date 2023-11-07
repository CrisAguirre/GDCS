import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { CommonService } from '@app/core/servicios/common.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { configMsg, stateConvocatoria } from '../../../../../compartido/helpers/enums';
import { ProducionService } from '../../../../../core/servicios/produccion-service';
import { Publicacion } from '@app/compartido/modelos/publicacion';
import { CategoriaPublicacion } from '@app/compartido/modelos/categoria-publicacion';

@Component({
  selector: 'app-registrar-publicacion',
  templateUrl: './registrar-publicacion.component.html',
  styleUrls: ['./registrar-publicacion.component.scss']
})
export class RegistrarPublicacionComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['tipo', 'nombre', 'area', 'editorial', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public sortedData: any;
  public elementCurrent: any = {};
  private user = this.commonService.getVar(configMsg.USER);

  public lstPublicacion: Publicacion[] = [];
  public lstCategoriaPublicacion: CategoriaPublicacion[] = [];

  public showField: any = false;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private ps: ProducionService,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private alertService: AlertService,
  ) { 
    super();
    this.lang = this.ct.getLangDefault().langBd;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.loadForm();
    this.loadData()

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: Publicacion, filter: string): boolean => {
      const dataCompare = [data.nombreCategoria, data.nombre, data.area, data.editorial];
      return C.filterTable(dataCompare , filter);
    }
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: Publicacion, b: Publicacion) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {      
        case 'tipo': return this.compare(a.idCategoria, b.idCategoria, isAsc);
        case 'nombre': return this.compare(a.nombre, b.nombre, isAsc);
        case 'area': return this.compare(a.area, b.area, isAsc);
        case 'editorial': return this.compare(a.editorial, b.editorial, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura])) {
      return;
    }
    this.lstCategoriaPublicacion = <CategoriaPublicacion[]> (<any> await this.commonService.getCategoriaPublicacion().toPromise()).datos;
    this.lstPublicacion = <Publicacion[]> (<any>await this.ps.getPublicacionUsuario(this.user.id).toPromise()).datos;
  
    if (this.lstPublicacion.length > 0) {
      this.lstPublicacion.forEach(e => {
        this.lstCategoriaPublicacion.forEach(g => {
          if (e.idCategoria === g.id) {
            e.nombreCategoria = this.translateField(g, 'nombreCategoria', this.lang)
            return;
          }
        });
      });
    }    
    this.dataSource.data = this.lstPublicacion;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        idUsuarioModificacion: new FormControl(''),
        idCategoria: new FormControl('', [Validators.required]),
        nombre:  new FormControl('', [Validators.required]),
        area:  new FormControl('', [Validators.required]),
        editorial:  new FormControl('', [Validators.required]),
        otraCategoria: new FormControl({ value: '', disabled: true }, [Validators.maxLength(30)]),
      }
    );
    this.listenerControls();
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: Publicacion) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      idUsuarioModificacion: element.idUsuarioModificacion,
      idCategoria: element.idCategoria,
      nombre: element.nombre,
      area: element.area,
      editorial: element.editorial,
      otraCategoria: element.otraCategoria,
    });
    this.listenerControls();
  }

  public listenerControls() {
    this.form.controls.idCategoria.valueChanges.subscribe(
      r => {
        this.form.controls.otraCategoria.setValue('');
        this.form.controls.otraCategoria.disable();
        this.showField = false;
        this.lstCategoriaPublicacion.forEach(e => {
          if (e.nombreCategoria == 'Otro' && e.id === r) {
            this.form.controls.otraCategoria.enable();
            this.showField = true;
            return;
          }
        })
      }
    );
  }

  public addPublicacion() {

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

    const obj = this.dataSource.data.find((x: Publicacion) => this.areEquals(x.nombre, this.f.nombre.value) || this.areEquals(x.editorial, this.f.editorial.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    
    const newPublicacion: Publicacion = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idUsuarioModificacion: this.user.id,
      idCategoria: this.f.idCategoria.value,
      nombre: this.f.nombre.value,
      area: this.f.area.value,
      editorial: this.f.editorial.value,
      otraCategoria: this.f.otraCategoria.value,
    };
    
    this.ps.savePublicacion(newPublicacion).toPromise()
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

  public delete(element: Publicacion) {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Eliminar])) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.ps.deletePublicacion(element)
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

}
