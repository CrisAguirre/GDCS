import { Component, OnInit, ViewChild, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { Discapacidad } from '@app/compartido/modelos/discapacidad';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { Constants as C } from '@app/compartido/helpers/constants';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { CommonService } from '@app/core/servicios/common.service';
import { AdministracionConfiguracionService } from '@app/core/servicios/administracion-configuracion.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';

@Component({
  selector: 'app-tipo-discapacidad-admin',
  templateUrl: './tipo-discapacidad-admin.component.html',
  styleUrls: ['./tipo-discapacidad-admin.component.scss']
})
export class DiscapacidadComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'discapacidad', 'discapacidad_En', 'description', 'esCampoOtro', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public sortedData: any;
  public elementCurrent: any = {};
  public reqCampoIngles: boolean;

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
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
    private configurationService: AdministracionConfiguracionService,
  ) {
    super();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    C.sendMessage(true, this.messageEvent);
    this.loadForm();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: Discapacidad, filter: string): boolean => {
      const dataCompare = [data.discapacidad, data.discapacidad_En, data.descripcion, (data.esCampoOtro == 1 ? this.ct.YES : this.ct.NOT)];
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
        case 'discapacidad': return this.compare(a.discapacidad, b.discapacidad, isAsc);
        case 'discapacidad_En': return this.compare(a.discapacidad_En, b.discapacidad_En, isAsc);
        case 'description': return this.compare(a.description, b.description, isAsc);
        case 'esCampoOtro': return this.compare(a.esCampoOtro, b.esCampoOtro, isAsc);
        default: return 0;
      }
    });
  }


  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.dataSource.data = (<any>await this.commonService.getDiscapacidad().toPromise()).datos;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        discapacidad: new FormControl('', [Validators.required]),
        discapacidad_En: new FormControl('', [Validators.required]),
        description: new FormControl(''),
        esCampoOtro: new FormControl(false),
        lista: new FormControl('')
      }
    );
    this.reqCampoIngles = this.commonService.campoInglesRequerido(this.f.discapacidad_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: Discapacidad) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      discapacidad: element.discapacidad,
      discapacidad_En: element.discapacidad_En,
      description: element.descripcion,
      esCampoOtro: element.esCampoOtro == 1 ? true : false,
    });
  }

  public addDiscapacidad() {

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

    const obj = this.dataSource.data.find((x: Discapacidad) => this.areEquals(x.discapacidad, this.f.discapacidad.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    
    const newDiscapacidad: Discapacidad = {
      id: this.f.id.value ? this.f.id.value : undefined,
      discapacidad: this.f.discapacidad.value,
      discapacidad_En: this.f.discapacidad_En.value,
      descripcion: this.f.description.value,
      esCampoOtro: this.f.esCampoOtro.value ? 1 : 0,
    };
    
    this.configurationService.saveTipoDiscapacidad(newDiscapacidad).toPromise()
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

  public delete(element: Discapacidad) {
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
          this.configurationService.deleteTipoDiscapacidad(element)
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
}

