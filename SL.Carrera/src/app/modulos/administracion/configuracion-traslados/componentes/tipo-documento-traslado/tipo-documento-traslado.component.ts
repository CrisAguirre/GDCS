import { TipoTrasladoModel } from '@app/compartido/modelos/tipo-traslado-model';
import { TipoDocumentoTrasladoModel } from '@app/compartido/modelos/tipo-documento-traslado-model';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource, Sort } from '@angular/material';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CommonService } from '@app/core/servicios/common.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { TrasladosService } from '@app/core/servicios/traslados.service';

@Component({
  selector: 'app-tipo-documento-traslado',
  templateUrl: './tipo-documento-traslado.component.html',
  styleUrls: ['./tipo-documento-traslado.component.scss']
})
export class TipoDocumentoTrasladoComponent extends BaseController implements OnInit, AfterViewChecked {

  public lstTipoDocumentoTraslado: TipoDocumentoTrasladoModel[] = [];
  public lstTipoTraslado: TipoTrasladoModel[] = [];
  public displayedColumns: string[] = ['tipoTraslado', 'tipoDocumento', 'codTipoDocumento', 'esObligatorio', 'options'];
  public dataSource = new MatTableDataSource<any>([]);
  public form: FormGroup;
  public submit = false;
  public elementCurrent: any = {};
  public reqCampoIngles: boolean;
  public sortedData: any;


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
    this.dataSource.filterPredicate = (data: TipoDocumentoTrasladoModel, filter: string): boolean => {
      const dataCompare = [data.tipoTraslado.tipoTraslado, data.tipoDocumento, data.codAlterno, (data.esObligatorio == 1 ? this.ct.YES : this.ct.NOT)];
      return C.filterTable(dataCompare, filter);
    }
  }

  public sortDataInfo(sort: Sort) {
    const data = this.dataSource.data;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.dataSource.data.sort((a: TipoDocumentoTrasladoModel, b: TipoDocumentoTrasladoModel) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'tipoTraslado': return this.compare(a.tipoTraslado.tipoTraslado, b.tipoTraslado.tipoTraslado, isAsc);
        case 'tipoDocumento': return this.compare(a.tipoDocumento, b.tipoDocumento, isAsc);
        case 'codTipoDocumento': return this.compare(a.codAlterno, b.codAlterno, isAsc);
        case 'esObligatorio': return this.compare(a.esObligatorio, b.esObligatorio, isAsc);
        default: return 0;
      }
    });
  }

  public async loadData() {
    if (!this.commonService.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }
    this.lstTipoTraslado = (await this.trasladoService.getTodosTipoTraslados().toPromise() as any).datos as TipoTrasladoModel[];
    this.lstTipoDocumentoTraslado = (await this.trasladoService.getTodosTipoDocumentoTraslado().toPromise() as any).datos as TipoDocumentoTrasladoModel[];

    if (this.lstTipoDocumentoTraslado.length > 0) {
      this.lstTipoDocumentoTraslado.forEach(td => {
        this.lstTipoTraslado.forEach(tt => {
          if (td.idTipoTraslado === tt.id) {
            td.tipoTraslado = tt;
            td.nombreTipoTraslado == td.tipoTraslado.tipoTraslado;
            return;
          }
        });
      });
    }

    this.dataSource.data = this.lstTipoDocumentoTraslado;
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        codigoTipoDocumento: new FormControl(''),
        tipoDocumento: new FormControl('', [Validators.required]),
        idTipoTraslado: new FormControl('', [Validators.required]),
        esObligatorio: new FormControl(false),
      }
    );
  }

  get f() {
    return this.form.controls;
  }

  public saveTipoDocumentoTraslado() {
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

    const obj = this.dataSource.data.find((x: TipoDocumentoTrasladoModel) => this.areEquals(x.codAlterno, this.f.codigoTipoDocumento.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    this.alertService.loading();

    const newTipoDocumentoTraslado: TipoDocumentoTrasladoModel = {
      id: this.f.id.value ? this.f.id.value : undefined,
      idTipoTraslado: this.f.idTipoTraslado.value,
      tipoDocumento: this.f.tipoDocumento.value,
      esObligatorio: this.f.esObligatorio.value ? this.f.esObligatorio.value : false,
      codAlterno: this.f.codigoTipoDocumento.value
    };

    this.trasladoService.saveTipoDocumentoTraslado(newTipoDocumentoTraslado).toPromise()
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

  public edit(element: TipoDocumentoTrasladoModel) {
    this.elementCurrent = C.cloneObject(element);
    this.scrollTop();
    this.form.patchValue({
      id: element.id,
      codigoTipoDocumento: element.codAlterno,
      tipoDocumento: element.tipoDocumento,
      idTipoTraslado: element.idTipoTraslado,
      esObligatorio: element.esObligatorio
    });
  }

  public delete(element: TipoDocumentoTrasladoModel) {
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
          this.trasladoService.deleteTipoDocumentoTraslado(element)
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
