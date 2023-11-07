import { Component, OnInit, Output, ViewChild, EventEmitter, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { TipoAjusteAcuerdo } from '@app/compartido/modelos/tipo-ajuste-acuerdo';
import { MatTableDataSource, MatPaginator, MatSort, Sort } from '@angular/material';
import { FormGroup, NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MessageEmitter } from '@app/compartido/modelos/interfaces';
import { BaseController } from '@app/compartido/helpers/base-controller';
import { AlertService, TYPES } from '@app/core/servicios/alert.service';
import { CustomTranslateService } from '@app/core/servicios/custom-translate.service';
import { Constants as C } from '@app/compartido/helpers/constants';
import { AdministracionConvocatoriaService } from '@app/core/servicios/administracion-convocatoria.service';
import { PermisosAcciones } from '@app/compartido/helpers/enums';
import { CommonService } from '@app/core/servicios/common.service';

@Component({
  selector: 'app-tipo-ajuste-acuerdo',
  templateUrl: './tipo-ajuste-acuerdo.component.html',
  styleUrls: ['./tipo-ajuste-acuerdo.component.scss']
})
export class TipoAjusteAcuerdoComponent extends BaseController implements OnInit, AfterViewChecked {

  public displayedColumns: string[] = ['id', 'ajusteAcuerdo', 'ajusteAcuerdo_En', 'options'];
  public lstAgreements: TipoAjusteAcuerdo[] = [];
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

  ngOnInit() {
    C.sendMessage(true, this.messageEvent); // aqui le envia al padre que muestre la barra de carga
    this.loadForm();
    this.loadData()
      .finally(() => {
        C.sendMessage(false, this.messageEvent); // aqui cuando ya termina le dice que no la uestre con false
      });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public async loadData() {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Lectura], this.path)) {
      return;
    }

    this.lstAgreements = <TipoAjusteAcuerdo[]> (<any> await this.convService.getTipoAjusteAcuerdo().toPromise()).datos;
    this.dataSource.data = this.lstAgreements;
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
        case 'ajusteAcuerdo': return this.compare(a.ajusteAcuerdo, b.ajusteAcuerdo, isAsc);
        case 'ajusteAcuerdo_En': return this.compare(a.ajusteAcuerdo_En, b.ajusteAcuerdo_En, isAsc);
        default: return 0;
      }
    });
  }

  public loadForm() {
    this.form = this.fb.group(
      {
        id: new FormControl(''),
        ajusteAcuerdo: new FormControl('', [Validators.required]),
        ajusteAcuerdo_En: new FormControl('', [Validators.required])
      }
    );
    this.reqCampoIngles = this.cs.campoInglesRequerido(this.f.ajusteAcuerdo_En);
  }

  get f() {
    return this.form.controls;
  }

  public edit(element: TipoAjusteAcuerdo) {
    this.scrollTop();
    this.elementCurrent = C.cloneObject(element);
    this.form.patchValue({
      id: element.id,
      ajusteAcuerdo: element.ajusteAcuerdo,
      ajusteAcuerdo_En: element.ajusteAcuerdo_En
    });
  }

  public addApplicantState() {
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
    const obj = this.lstAgreements.find((x: TipoAjusteAcuerdo) => this.areEquals(x.ajusteAcuerdo, this.f.ajusteAcuerdo.value));
    if (obj) {
      if (this.areEqualsID(this.f.id, obj.id)) {
        this.alertService.message(this.ct.REPEATED_DATA, TYPES.WARNING);
        this.submit = false;
        return;
      }
    }

    const newApplicantState: TipoAjusteAcuerdo = {
      id: this.f.id.value ? this.f.id.value : undefined,
      ajusteAcuerdo: this.f.ajusteAcuerdo.value,
      ajusteAcuerdo_En: this.f.ajusteAcuerdo_En.value
    };

    this.convService.saveTipoAjusteAcuerdo(newApplicantState).toPromise()
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

  public delete(element: TipoAjusteAcuerdo) {
    if (!this.cs.hasPermissionUserAction([PermisosAcciones.Eliminar], this.path)) {
      return;
    }
    this.alertService.comfirmation(this.ct.DELETE_CONFIRMATION, TYPES.INFO)
      .then(ok => {
        if (ok.value) {
          this.alertService.loading();
          this.convService.deleteTipoAjusteAcuerdo(element)
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
