import { Component, OnInit, Output, ViewChild, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, Sort, } from '@angular/material';
import { EventEmitter } from '@angular/core';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { CustomTranslateService } from '../../../../core/servicios/custom-translate.service';
import { AdministracionConvocatoriaService } from '../../../../core/servicios/administracion-convocatoria.service';
import { TipoAdicional } from '@app/compartido/modelos/tipo-adicional';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service'

@Component({
  selector: 'app-tipo-adicional',
  templateUrl: './tipo-adicional.component.html',
  styleUrls: ['./tipo-adicional.component.scss']
})
export class TipoAdicionalComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'nombre', 'tipoAdicional_En', 'nombreReferencia', 'codigoAlterno', 'options'];
  public lstAditional: TipoAdicional[] = [];
  public lstAditionalType: TipoAdicional[] = [];
  public dataSource = new MatTableDataSource<any>([]);
  public sortedData: any;
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

  ngOnInit(): void {
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

    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    this.lstAditional = <TipoAdicional[]>(<any>await this.convService.getTipoAdicionales().toPromise()).datos;
    this.lstAditionalType = <TipoAdicional[]>(<any>await this.convService.getTipoAdicionalesPorIdReferencia(null).toPromise()).datos;
    if (this.lstAditional.length > 0) {
      this.lstAditional.forEach(e => {
        this.lstAditionalType.forEach(g => {
          if (e.idReferencia === g.id) {
            e.tipoAdicionalReferencia = g.tipoAdicional;
            return;
          }
        });
        e.tipoAdicionalReferencia = e.tipoAdicionalReferencia === undefined ? '' : e.tipoAdicionalReferencia;
      });
    }
    this.dataSource.data = this.lstAditional;
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
        case 'nombreReferencia': return this.compare(a.tipoAdicionalReferencia, b.tipoAdicionalReferencia, isAsc);
        case 'tipoAdicional_En': return this.compare(a.tipoAdicional_En, b.tipoAdicional_En, isAsc);
        case 'codigoAlterno': return this.compare(a.codAlterno, b.codAlterno, isAsc);
        case 'nombre': return this.compare(a.tipoAdicional, b.tipoAdicional, isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        tipoAdicional: new FormControl('', [Validators.required]),
        tipoAdicional_En: new FormControl('', [Validators.required]),
        codAlterno: new FormControl(''),
        idReferencia: new FormControl('')
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.tipoAdicional_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: TipoAdicional) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      tipoAdicional: element.tipoAdicional,
      codAlterno: element.codAlterno,
      tipoAdicional_En: element.tipoAdicional_En,
      idReferencia: element.idReferencia
    });
  }

  public addAditionalType() {


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

    // validar que no se duplique el registro
    // tslint:disable-next-line: max-line-length
    const obj = this.lstAditional.find((x: TipoAdicional) => this.areEquals(x.tipoAdicional, this.f.tipoAdicional.value) && this.areEquals(x.idReferencia, this.f.idReferencia.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newTypePlace: TipoAdicional = {
      id: this.f.id.value ? this.f.id.value : undefined,
      tipoAdicional: this.f.tipoAdicional.value,
      tipoAdicional_En: this.f.tipoAdicional_En.value,
      codAlterno: this.f.codAlterno.value,
      idReferencia: this.f.idReferencia.value === '' ? null : this.f.idReferencia.value
    };
    this.convService.saveTipoAdicional(newTypePlace).toPromise()
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

  public delete(element: TipoAdicional) {

    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }

    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.deleteIsSelected(element.id);
          this.convService.deleteTipoAdicional(element)
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
