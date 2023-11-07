import { TrasladosService } from '@app/core/servicios/traslados.service';
import { TipoTrasladoModel } from '@app/compartido/modelos/tipo-traslado-model';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Constants as C } from '@app/compartido/helpers/constants';

const EstadoTipoTraslado: any[] = [
  { id: 1, valor: '1', label: 'Activo', label_En: 'Active', },
  { id: 2, valor: '0', label: 'Inactivo', label_En: 'Inactive', }
];

@Component({
  selector: 'app-tipo-traslado',
  templateUrl: './tipo-traslado.component.html',
  styleUrls: ['./tipo-traslado.component.scss']
})
export class TipoTrasladoComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstTipoTraslado: TipoTrasladoModel[] = [];
  public estadoTipoTraslado = EstadoTipoTraslado;

  public displayedColumns: string[] = ['codTipoTraslado', 'tipoTraslado', 'tipoTraslado_En', 'estado', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public elementCurrent: any = {};
  public reqCampoIngles: boolean;


  // tslint:disable-next-line: no-output-rename
  @Output('messageEvent') messageEvent = new EventEmitter<MessageEmitter>();
  @Input('path') path: string;
  @ViewChild('formV', { static: false }) formV: NgForm;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private alertService: AlertService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ct: CustomTranslateService,
    private trasladoService: TrasladosService
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

  public async loadData() {
    // tslint:disable-next-line: no-angle-bracket-type-assertion
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    this.lstTipoTraslado = (await this.trasladoService.getTodosTipoTraslados().toPromise() as any).datos as TipoTrasladoModel[];
    this.dataSource.data = this.lstTipoTraslado;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        codigoTraslado: new FormControl('', [Validators.required]),
        tipoTraslado: new FormControl('', [Validators.required]),
        tipoTraslado_En: new FormControl('', [Validators.required]),
        estado: new FormControl('', [Validators.required])
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public saveTipoTraslado() {
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

    const obj = this.dataSource.data.find((x: TipoTrasladoModel) => this.areEquals(x.codAlterno, this.f.codigoTraslado.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }
    this.alertService.loading();
    const newTipoTraslado: TipoTrasladoModel = {
      id: this.f.id.value ? this.f.id.value : undefined,
      tipoTraslado: this.f.tipoTraslado.value,
      tipoTraslado_En: this.f.tipoTraslado_En.value,
      estado: this.f.estado.value,
      codAlterno: this.f.codigoTraslado.value
    };

    this.trasladoService.saveTipoTraslado(newTipoTraslado).toPromise()
      .then(ok => {
        this.loadData().then(() => {
          this.cleanForm();
          this.alertService.message(this.ct.SUCCESS_MSG, TYPES.SUCCES)
            .finally(() => this.submit = false);
        });
      }).catch(e => {
        this.alertService.message(this.ct.ERROR_MSG, TYPES.ERROR)
          .finally(() => this.submit = false);
      });
  }

  public edit(element: TipoTrasladoModel) {
    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();
    this.form.patchValue({
      id: element.id,
      codigoTraslado: element.codAlterno,
      tipoTraslado: element.tipoTraslado,
      tipoTraslado_En: element.tipoTraslado_En,
      estado: element.estado
    });
  }

  public delete(element: TipoTrasladoModel) {
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
          this.trasladoService.deleteTipoTraslado(element)
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
