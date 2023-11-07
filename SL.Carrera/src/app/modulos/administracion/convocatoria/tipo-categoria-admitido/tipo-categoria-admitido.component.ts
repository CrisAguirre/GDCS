import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort, } from '@angular/material';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { ConvocatoriaService } from '@app/core/servicios/convocatoria.service';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';
import { CategoriaAdmintidoModel } from '@app/compartido/modelos/categoria-admitido-model';

@Component({
  selector: 'app-tipo-categoria-admitido',
  templateUrl: './tipo-categoria-admitido.component.html',
  styleUrls: ['./tipo-categoria-admitido.component.scss']
})
export class TipoCategoriaAdmitidoComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'posicion', 'nombreCategoria', 'nombreCategoria_En', 'options'];
  public lstTable: CategoriaAdmintidoModel[] = [];
  public dataSource = new MatTableDataSource<CategoriaAdmintidoModel>([]);
  public sortedData: any;
  public form: FormGroup;
  public submit = false;
  public elementCurrent: any = {};
  public reqCampoIngles: boolean;

  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;

  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private convService: ConvocatoriaService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private cs: CommonService
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

    this.dataSource.filterPredicate = (data: CategoriaAdmintidoModel, filter: string): boolean => {
      const dataCompare = [
        data.nombreCategoria,
        data.nombreCategoria_En,
        data.posicion];
      return C.filterTable(dataCompare, filter);
    };
  }

  public async loadData() {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    this.lstTable = ((await this.convService.getCategoriaAdmitidos().toPromise() as any).datos) as CategoriaAdmintidoModel[];
    this.lstTable.sort((a, b) => a.posicion - b.posicion);
    this.dataSource.data = this.lstTable;
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'nombreCategoria': return this.compare(a.nombreCategoria, b.nombreCategoria, isAsc);
        case 'nombreCategoria_En': return this.compare(a.nombreCategoria_En, b.nombreCategoria_En, isAsc);
        case 'posicion': return this.compare(a.posicion, b.posicion, isAsc);
        //case 'esOtro': return this.compare(a.esOtro, b.esOtro, isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        nombreCategoria: new FormControl('', [Validators.required]),
        nombreCategoria_En: new FormControl('', [Validators.required]),
        posicion: new FormControl('', [Validators.required]),
        //esOtro: new FormControl(false),
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.nombreCategoria_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: CategoriaAdmintidoModel) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      nombreCategoria: element.nombreCategoria,
      nombreCategoria_En: element.nombreCategoria_En,
      posicion: element.posicion,
      //esOtro: element.esOtro === 1 ? true : false,
    });
  }

  public add() {

    if (this.elementCurrent.id && !this.cs.hasPermissionUserAction([PermisosAcciones.Actualizar], this.path)) {
      return;
    }
    if (!this.elementCurrent.id && !this.cs.hasPermissionUserAction([PermisosAcciones.Crear], this.path)) {
      return;
    }


    if (this.form.valid) {
      this.submit = true;
    } else {
      this.submit = false;
      return;
    }

    const obj = this.lstTable.find((x: CategoriaAdmintidoModel) =>
      this.areEquals(x.nombreCategoria, this.f.nombreCategoria.value)
    );
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    this.alertService.loading();

    const newItem: CategoriaAdmintidoModel = {
      id: this.f.id.value ? this.f.id.value : undefined,
      nombreCategoria: this.f.nombreCategoria.value,
      nombreCategoria_En: this.f.nombreCategoria_En.value,
      posicion: Number(this.f.posicion.value),
      //esOtro: this.f.esOtro.value ? 1 : 0,
      esOtro: 0,
    };

    this.convService.saveCategoriaAdmitido(newItem).toPromise()
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

  public delete(element: CategoriaAdmintidoModel) {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convService.deleteCategoriaAdmitido(element.id)
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
    if (this.elementCurrent.id === id) {
      this.cleanForm();
    }
  }

  public cleanForm() {
    this.formV.resetForm();
    this.elementCurrent = {};
  }
}
