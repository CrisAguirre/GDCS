import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort, } from '@angular/material';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '../../../../core/servicios/custom-translate.service';
import { AdministracionConvocatoriaService } from '../../../../core/servicios/administracion-convocatoria.service';
import { TipoCargo } from '@app/compartido/modelos/tipo-cargo';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';

@Component({
  selector: 'app-tipo-cargo',
  templateUrl: './tipo-cargo.component.html',
  styleUrls: ['./tipo-cargo.component.scss']
})
export class TipoCargoComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'tipoCargo', 'tipoCargo_En', 'codAlterno', 'options'];
  public lstCargo: TipoCargo[] = [];
  public dataSource = new MatTableDataSource<any>([]);
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
    private convService: AdministracionConvocatoriaService,
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

  ngOnInit() {
    C.sendMessage(true, this.messageEvent);
    this.loadForm();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent);
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
        case 'tipoCargo': return this.compare(a.tipoCargo, b.tipoCargo, isAsc);
        case 'tipoCargo_En': return this.compare(a.tipoCargo_En, b.tipoCargo_En, isAsc);
        case 'codAlterno': return this.compare(a.codAlterno, b.codAlterno, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    this.lstCargo = <TipoCargo[]>(<any>await this.convService.getTipoCargo().toPromise()).datos;
    this.dataSource.data = this.lstCargo;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        tipoCargo: new FormControl('', [Validators.required]),
        tipoCargo_En: new FormControl('', [Validators.required]),
        codAlterno: new FormControl('')
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.tipoCargo_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: TipoCargo) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      tipoCargo: element.tipoCargo,
      tipoCargo_En: element.tipoCargo_En,
      codAlterno: element.codAlterno
    });
  }

  public addCargo() {

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

    const obj = this.dataSource.data.find((x: TipoCargo) => this.areEquals(x.tipoCargo, this.f.tipoCargo.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newTipoCargo: TipoCargo = {
      id: this.f.id.value ? this.f.id.value : undefined,
      tipoCargo: this.f.tipoCargo.value,
      tipoCargo_En: this.f.tipoCargo_En.value,
      codAlterno: this.f.codAlterno.value
    };

    this.convService.saveTipoCargo(newTipoCargo).toPromise()
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

  public delete(element: TipoCargo) {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convService.deleteTipoCargo(element)
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
