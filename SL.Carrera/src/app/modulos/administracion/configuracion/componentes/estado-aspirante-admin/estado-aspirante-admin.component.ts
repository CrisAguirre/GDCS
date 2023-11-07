import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Constants as C } from '@app/compartido/helpers/constants';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { CommonService } from '@app/core/servicios/common.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { EstadoAspiranteComvocatoria } from '@app/compartido/modelos/estado-aspirante-convocatoria';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable, of } from 'rxjs';
import { DataSource } from '@angular/cdk/collections';

@Component({
  selector: 'app-estado-aspirante-admin',
  templateUrl: './estado-aspirante-admin.component.html',
  styleUrls: ['./estado-aspirante-admin.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class EstadoAspiranteAdminComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'categoria', 'categoria_En', 'descripcion', 'descripcion_En', "options" ];

  public dataSource = new MatTableDataSource<any>([]);

  public form: FormGroup;
  public submit = false;
  public sortedData: any;
  public elementCurrent: any = {};
  public reqCampoIngles: boolean;

  @Input('path') path: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private ct: CustomTranslateService,
    private cdRef: ChangeDetectorRef,
    private configurationService: AdministracionConfiguracionService
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

    this.dataSource.filterPredicate = (data: EstadoAspiranteComvocatoria, filter: string): boolean => {
      const dataCompare = [data.id, data.nombreCategoria, data.nombreCategoria_En, data.descripcion, data.descripcion_En];
      return C.filterTable(dataCompare , filter);
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
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'categoria': return this.compare(a.nombreCategoria, b.nombreCategoria, isAsc);
        case 'categoria_En': return this.compare(a.nombreCategoria_En, b.nombreCategoria_En, isAsc);
        case 'descripcion': return this.compare(a.descripcion, b.descripcion, isAsc);
        case 'descripcion_En': return this.compare(a.descripcion_En, b.descripcion_En, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.dataSource.data = (<any>await this.commonService.getEstadoAspiranteConvocatoria().toPromise()).datos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        nombreCategoria: new FormControl('', [Validators.required]),
        nombreCategoria_En: new FormControl('', [Validators.required]),
        descripcion: new FormControl(''),
        descripcion_En: new FormControl(''),      
      }
    );
    this.reqCampoIngles = this.commonService.campoInglesRequerido(this.f.nombreCategoria_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: EstadoAspiranteComvocatoria) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      nombreCategoria: element.nombreCategoria,
      nombreCategoria_En: element.nombreCategoria_En,
      descripcion: element.descripcion,
      descripcion_En: element.descripcion_En,
    });
  }

  public addAspirante() {

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

    const obj = this.dataSource.data.find((x: EstadoAspiranteComvocatoria) => this.areEquals(x.nombreCategoria, this.f.nombreCategoria.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    
    const newAspirante: EstadoAspiranteComvocatoria = {
      id: this.f.id.value ? this.f.id.value : undefined,
      nombreCategoria: this.f.nombreCategoria.value,
      nombreCategoria_En: this.f.nombreCategoria_En.value,
      descripcion: this.f.descripcion.value,
      descripcion_En: this.f.descripcion_En.value,
    };
    
    this.configurationService.saveEstadoAspiranteConvocatoria(newAspirante).toPromise()
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

  public delete(element: EstadoAspiranteComvocatoria) {

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
          this.configurationService.deleteEstadoAspiranteConvocatoria(element)
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
    if (this.elementCurrent.id == id) {
      this.cleanForm();
    }
  }
  
  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
  }


  connect(): Observable<Element[]> {
    const rows = [];
    this.dataSource.data.forEach(element => rows.push(element, { detailRow: true, element }));
    return of(rows);
  }

  disconnect() { }
  
}




